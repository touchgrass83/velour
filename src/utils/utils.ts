let apps: boolean[] = [];
let appCallBacks: any[] = [];

for (let i = 0; i < 7; i++) {
  apps.push(false);
}

export function timedScrollIntoViewX(
  container: HTMLElement,
  element: HTMLElement,
  duration = 500
) {
  const startX = container.scrollLeft;
  const startTime = performance.now();

  const targetX = element.offsetLeft;

  function animate(time: number) {
    const elapsed = time - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // easeInOutQuad
    const ease =
      progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

    container.scrollLeft = startX + (targetX - startX) * ease;

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }

  requestAnimationFrame(animate);
}

export function notifyApp(app: number, enabled: boolean) {
  const event = { app: app, enabled: enabled };

  appCallBacks.forEach((callBack) => callBack(event));
}

export function subscribeToApp(callback: any) {
  appCallBacks.push(callback);
}

export function unsubscribeFromApp(callback: any) {
  appCallBacks.filter((cb: any) => cb !== callback);
}

export function appEnabled(app: number): boolean | null {
  app--;
  if (app < 0 || app > apps.length - 1) return null;
  return apps[app];
}

export function enableApp(app: number) {
  app--;
  if (app < 0 || app > apps.length - 1) return;
  apps[app] = true;

  notifyApp(app + 1, true);
}

export function disableApp(app: number) {
  app--;
  if (app < 0 || app > apps.length - 1) return;
  apps[app] = false;

  notifyApp(app + 1, false);
}

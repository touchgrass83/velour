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

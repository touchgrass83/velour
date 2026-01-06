import { useState, useEffect, useRef } from "react";
import { useSpring, animated, useTransition, to } from "@react-spring/web";
import { createUseGesture, dragAction, pinchAction } from "@use-gesture/react";

import {
  disableApp,
  subscribeToApp,
  unsubscribeFromApp,
} from "../../utils/utils";

import "/src/styles/music.css";

const useGesture = createUseGesture([dragAction, pinchAction]);

export default function MusicApp() {
  const [appEnabled, setAppEnabled] = useState(false);
  useEffect(() => {
    const callback = (e: any) => {
      if (e.app == 1) {
        setAppEnabled(e.enabled);
      }
    };

    subscribeToApp(callback);

    return () => {
      unsubscribeFromApp(callback);
    };
  }, []);

  useEffect(() => {
    const handler = (e: Event) => e.preventDefault();
    document.addEventListener("gesturestart", handler);
    document.addEventListener("gesturechange", handler);
    document.addEventListener("gestureend", handler);
    return () => {
      document.removeEventListener("gesturestart", handler);
      document.removeEventListener("gesturechange", handler);
      document.removeEventListener("gestureend", handler);
    };
  }, []);

  const transitions = useTransition(appEnabled, {
    from: { opacity: 0, scale: 0.5, y: window.innerHeight },
    enter: { opacity: 1, scale: 1, y: 0 },
    leave: { opacity: 0, scale: 0.5, y: window.innerHeight },
    config: { tension: 160, friction: 26 },
  });

  const [style, api] = useSpring(() => ({
    x: 0,
    y: 0,
    zoom: 1.5,
  }));
  const ref = useRef<HTMLDivElement>(null);

  useGesture(
    {
      onDrag: ({ pinching, cancel, offset: [x, y] }) => {
        if (pinching) return cancel();
        api.start({ x, y });
      },
      onPinch: ({
        origin: [ox, oy],
        first,
        movement: [ms],
        offset: [s],
        memo,
      }) => {
        if (first) {
          const { width, height, x, y } = ref.current!.getBoundingClientRect();
          const tx = ox - (x + width / 2);
          const ty = oy - (y + height / 2);
          memo = [style.x.get(), style.y.get(), tx, ty];
        }

        const x = memo[0] - (ms - 1) * memo[2];
        const y = memo[1] - (ms - 1) * memo[3];
        api.start({ zoom: s, x, y });
        return memo;
      },
    },
    {
      target: ref,
      drag: { from: () => [style.x.get(), style.y.get()] },
      pinch: { scaleBounds: { min: 0.75, max: 1.5 }, rubberband: true },
    }
  );

  return transitions(
    (transitionStyles, item) =>
      item && (
        <animated.div
          className="music-app-container"
          ref={ref}
          style={{
            x: style.x,
            y: to([style.y, transitionStyles.y], (y, ty) => y + ty),
            scale: to([transitionStyles.scale, style.zoom], (s, z) => s * z),
            opacity: transitionStyles.opacity,
            touchAction: "none",
          }}
        >
          <div className="top-bar">
            <span className="app-title">Music App</span>
            <div className="app-controls-container">
              <div
                className="circle"
                style={{ backgroundColor: "#15ff006b" }}
              ></div>
              <div
                className="circle"
                style={{ backgroundColor: "#ffee008f" }}
              ></div>
              <div
                className="circle control-exit"
                style={{ backgroundColor: "#ff1e0088" }}
                onClick={() => disableApp(1)}
              ></div>
            </div>
          </div>
        </animated.div>
      )
  );
}

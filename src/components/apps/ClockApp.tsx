import { useState, useEffect, useRef } from "react";
import { useSpring, animated, useTransition, to } from "@react-spring/web";
import { createUseGesture, dragAction, pinchAction } from "@use-gesture/react";

import {
  disableApp,
  subscribeToApp,
  unsubscribeFromApp,
} from "../../utils/utils";

import "/src/styles/clock.css";

const useGesture = createUseGesture([dragAction, pinchAction]);

export default function ClockApp() {
  const [appEnabled, setAppEnabled] = useState(false);
  const topbarRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const callback = (e: any) => {
      if (e.app == 7) {
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
  const animatedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (appEnabled) {
    }
  }, [appEnabled]);

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
          const { width, height, x, y } =
            animatedRef.current!.getBoundingClientRect();
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
      target: animatedRef,
      drag: { from: () => [style.x.get(), style.y.get()] },
      pinch: { scaleBounds: { min: 1, max: 2.5 }, rubberband: true },
    }
  );

  return transitions(
    (transitionStyles, item) =>
      item && (
        <animated.div
          className="clock-app-container"
          ref={animatedRef}
          style={{
            x: style.x,
            y: to([style.y, transitionStyles.y], (y, ty) => y + ty),
            scale: to([transitionStyles.scale, style.zoom], (s, z) => s * z),
            opacity: transitionStyles.opacity,
            touchAction: "none",
          }}
        >
          <div
            ref={topbarRef}
            className="top-bar"
            style={{ visibility: "visible" }}
          >
            <div className="app-controls-container">
              <div
                className="circle"
                style={{ backgroundColor: "#15ff006b" }}
              ></div>
              <div
                className="circle"
                style={{ backgroundColor: "#ffee008f" }}
                onClick={() => disableApp(7)}
              ></div>
              <div
                className="circle control-exit"
                style={{ backgroundColor: "#ff1e0088" }}
                onClick={() => disableApp(7)}
              ></div>
            </div>
          </div>
          <div
            style={{
              visibility: "visible",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <h1 className="clock">
              {new Date().toLocaleTimeString("en-GB", {
                timeZone: "Asia/Kolkata",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </h1>
            <p className="clock-sub">
              {new Date().getDate()}/{new Date().getMonth() + 1}/
              {new Date().getFullYear()}
            </p>
          </div>
        </animated.div>
      )
  );
}

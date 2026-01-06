import { useDrag } from "@use-gesture/react";
import { useSpring, animated } from "@react-spring/web";
import { useRef } from "react";
import { enableApp } from "../utils/utils";

const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), max);

export default function NavBar() {
  const navBtnRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  const ITEMS = [
    <i className="fa-solid fa-xmark" style={{ color: "#e44529" }}></i>,
    <i className="fa-solid fa-compact-disc"></i>,
    "C",
    "D",
    "E",
    "F",
    "G",
    <i className="fa-solid fa-clock"></i>,
  ];

  const [{ y, opacity, rotate }, api] = useSpring(() => ({
    y: 0,
    opacity: 1,
    rotate: 0,
  }));

  const navBind = useDrag(({ down, movement: [_mx, my] }) => {
    my = clamp(my / 3, -80, 0);
    const progress = Math.abs(my) / 80;
    if (down) navRef.current?.classList.add("active");

    api.start({
      y: down ? my : 0,
      opacity: down ? 1 - progress : 1,
      rotate:
        my < 0 || down
          ? Math.trunc(
              ((_mx / ((3 * window.innerWidth) / 8)) * 180) /
                (360 / ITEMS.length)
            ) *
            (360 / ITEMS.length)
          : 0,
      immediate: down,
    });

    if (!down)
      setTimeout(() => {
        api.start({
          y: 0,
          opacity: 1,
          rotate: 0,
          onRest: ({ finished }) => {
            if (finished) navRef.current?.classList.remove("active");
          },
        });
      }, 150);

    navBtnRef.current?.classList.toggle("active", down);

    if (!down && rotate.get() != 0) {
      const VAL =
        rotate.get() < 0
          ? 0
          : ITEMS.length * (Math.trunc(rotate.get() / 360) + 1);
      handleNavItemClick(
        (-rotate.get() / (360 / ITEMS.length) + VAL) % ITEMS.length
      );
    }
  });

  const handleNavItemClick = (item: number) => {
    enableApp(item);
  };

  return (
    <animated.div
      {...navBind()}
      className="nav-btn-container"
      style={{
        y,
        touchAction: "none",
      }}
    >
      <animated.div ref={navBtnRef} className="nav-btn" style={{ opacity }} />

      <svg
        className="triangle"
        width="70"
        height="120"
        viewBox="0 0 140 120"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="
              M 10 16
              Q 70 -5 130 16
              L 105 110
              Q 80 100 35 110
              Z"
          stroke="white"
          strokeWidth="5"
          strokeLinejoin="round"
          fill="#00000083"
        />
      </svg>

      <animated.div ref={navRef} className="nav" style={{ rotate }}>
        <div className="nav-items-container">
          {ITEMS.map((item, index) => (
            <div
              key={index}
              className="nav-items"
              style={{
                transform: `
      rotate(${(360 / ITEMS.length) * index}deg)
      translateY(-150px)
      rotate(${-(360 / ITEMS.length) * index}deg)
    `,
              }}
            >
              <div
                style={{
                  transform: `rotate(${(360 / ITEMS.length) * index}deg)`,
                }}
              >
                {item}
              </div>
            </div>
          ))}
        </div>
      </animated.div>
    </animated.div>
  );
}

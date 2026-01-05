import { useDrag } from "@use-gesture/react";
import { useSpring, animated } from "@react-spring/web";
import { useRef } from "react";

export default function NavBar() {
  const navBtnRef = useRef<HTMLDivElement>(null);
  const [{ x, y }, api] = useSpring(() => ({ x: 0, y: 0 }));

  const navBind = useDrag(({ down, movement: [_mx, my] }) => {
    my = my < -144 ? -48 : my / 3;
    my = my > 0 ? 0 : my;
    api.start({ x: 0, y: down ? my : 0, immediate: down });

    if (down) {
      navBtnRef.current!.classList.add("active");
    } else {
      navBtnRef.current!.classList.remove("active");
    }
  });

  return (
    <animated.div
      className="nav-btn-container"
      {...navBind()}
      style={{ x, y, touchAction: "none" }}
    >
      <div ref={navBtnRef} className="nav-btn"></div>
    </animated.div>
  );
}

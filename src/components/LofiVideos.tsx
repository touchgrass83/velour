import { useEffect, useRef } from "react";
import { useDrag } from "@use-gesture/react";
import { animated } from "@react-spring/web";
import { setCanFullscreen } from "./FullScreen";
import { timedScrollIntoViewX } from "../utils/utils";

export default function LofiVideos() {
  const videosContainerRef = useRef<HTMLDivElement>(null);
  const videoBtnsRef = [
    useRef<HTMLButtonElement>(null),
    useRef<HTMLButtonElement>(null),
  ];

  let canSwipe = true;

  let lofiVideoRefs = [
    useRef<HTMLVideoElement>(null),
    useRef<HTMLVideoElement>(null),
    useRef<HTMLVideoElement>(null),
    useRef<HTMLVideoElement>(null),
    useRef<HTMLVideoElement>(null),
  ];

  const lofiVideos: string[] = [];

  for (let i = 0; i < lofiVideoRefs.length; i++) {
    lofiVideos.push(`/assets/videos/lofi-0${i + 1}.mp4`);
  }

  if (!localStorage.getItem("lofi-video-index") == null)
    localStorage.setItem(
      "lofi-video-index",
      JSON.stringify(
        lofiVideos.length % 2 == 0
          ? lofiVideos.length / 2
          : (lofiVideos.length + 1) / 2
      )
    );

  const swipeBind = useDrag(
    ({ last, movement: [mx, my], velocity: [vx, vy] }) => {
      if (!last) return;

      const absX = Math.abs(mx);
      const absY = Math.abs(my);

      const isSwipe = Math.max(absX, absY) > 60 || Math.max(vx, vy) > 0.3;
      if (!isSwipe) return;

      if (absX > absY) {
        handleVideoChange(mx > 0 ? -1 : 1);
      }
    },
    {
      pointer: { touch: true },
    }
  );

  const handleVideoChange = (operation: number) => {
    if (!canSwipe) return;

    disableBtns();

    let currentVideo = JSON.parse(
      localStorage.getItem("lofi-video-index") ??
        (lofiVideos.length % 2 == 0
          ? `${lofiVideos.length / 2}`
          : `${(lofiVideos.length + 1) / 2}`)
    );

    lofiVideoRefs[currentVideo].current?.pause();
    lofiVideoRefs[currentVideo].current!.style.scale = "0.95";

    switch (operation) {
      case 1:
        if (currentVideo == lofiVideoRefs.length - 1) {
          currentVideo = 0;
          break;
        }
        currentVideo++;
        break;
      case -1:
        if (currentVideo == 0) {
          currentVideo = lofiVideoRefs.length - 1;
          break;
        }
        currentVideo--;
        break;
    }

    lofiVideoRefs[currentVideo].current?.play();

    timedScrollIntoViewX(
      videosContainerRef.current!,
      lofiVideoRefs[currentVideo].current!,
      500
    );

    localStorage.setItem("lofi-video-index", JSON.stringify(currentVideo));

    setTimeout(() => {
      enableBtns();
      lofiVideoRefs[currentVideo].current!.style.scale = "1";
    }, 500);
  };

  const disableBtns = () => {
    canSwipe = false;
    setCanFullscreen(false);
  };

  const enableBtns = () => {
    canSwipe = true;
    setCanFullscreen(true);

    document.body.style.pointerEvents = "";
  };

  useEffect(() => {
    let currentVideo = JSON.parse(
      localStorage.getItem("lofi-video-index") ??
        (lofiVideos.length % 2 == 0
          ? `${lofiVideos.length / 2}`
          : `${(lofiVideos.length + 1) / 2}`)
    );

    lofiVideoRefs[currentVideo].current?.play();
    lofiVideoRefs[currentVideo].current!.style.scale = "1";
    videosContainerRef.current!.scrollLeft = currentVideo * window.innerWidth;
  }, []);

  return (
    <>
      <animated.div
        ref={videosContainerRef}
        className="videos-container"
        {...swipeBind()}
        style={{ touchAction: "none" }}
      >
        {lofiVideos.map((videoUrl: string, index: number) => (
          <div key={index} className="video-container">
            <video
              ref={lofiVideoRefs[index]}
              muted
              loop
              style={{ scale: 0.95 }}
            >
              <source src={videoUrl} type="video/mp4" />
            </video>
          </div>
        ))}
      </animated.div>

      <div className="video-btn-container">
        <button
          ref={videoBtnsRef[0]}
          className="previous-btn"
          onClick={() => {
            videoBtnsRef[0].current!.classList.add("active");
            setTimeout(() => {
              videoBtnsRef[0].current!.classList.remove("active");
            }, 500);
            handleVideoChange(-1);
          }}
        >
          <i className="fa-solid fa-angle-left"></i>
        </button>
        <button
          ref={videoBtnsRef[1]}
          className="next-btn"
          onClick={() => {
            videoBtnsRef[1].current!.classList.add("active");
            setTimeout(() => {
              videoBtnsRef[1].current!.classList.remove("active");
            }, 500);
            handleVideoChange(1);
          }}
        >
          <i className="fa-solid fa-angle-right"></i>
        </button>
      </div>
    </>
  );
}

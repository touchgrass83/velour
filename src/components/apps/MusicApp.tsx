import { useState, useEffect, useRef, useMemo } from "react";
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
  const [appEnabled, setAppEnabled] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const musicLineRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];
  const pauseBtn = useRef<HTMLElement>(null);
  const playBtn = useRef<HTMLElement>(null);

  const musicList: (object & Record<"name", string> & Record<"url", string>)[] =
    [
      { name: "Windowlight", url: "/assets/music/music-01/" },
      { name: "Still Sunset", url: "/assets/music/music-02/" },
      { name: "City Breathing", url: "/assets/music/music-03/" },
      { name: "Quiet Skyline", url: "/assets/music/music-04/" },
      { name: "Firework Silence", url: "/assets/music/music-05/" },
    ];

  if (!localStorage.getItem("lofi-audio-index") == null)
    localStorage.setItem(
      "lofi-audio-index",
      JSON.stringify(
        musicList.length % 2 == 0
          ? musicList.length / 2
          : (musicList.length + 1) / 2
      )
    );

  let musicIndex = JSON.parse(localStorage.getItem("lofi-audio-index") ?? "0");

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

  const animatedRef = useRef<HTMLDivElement>(null);

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
      pinch: { scaleBounds: { min: 0.75, max: 1.5 }, rubberband: true },
    }
  );

  const handleMusicChange = (operation: number) => {
    const wasPlaying = !audioRef.current?.paused;
    audioRef.current?.pause();

    switch (operation) {
      case 1:
        if (musicIndex == musicList.length - 1) {
          musicIndex = 0;
          break;
        }
        musicIndex++;
        break;
      case -1:
        if (musicIndex == 0) {
          musicIndex = musicList.length - 1;
          break;
        }
        musicIndex--;
        break;
    }

    imageRef.current!.src = musicList[musicIndex].url + "lofi.jpg";
    audioRef.current!.src = musicList[musicIndex].url + "lofi.mp3";
    titleRef.current!.innerText = musicList[musicIndex].name;
    audioRef.current!.volume = 0.4;
    if (wasPlaying) audioRef.current?.play();

    localStorage.setItem("lofi-audio-index", JSON.stringify(musicIndex));
  };

  const musicLines = useMemo(
    () =>
      Array.from({ length: 6 }).map(() => ({
        duration: (Math.random() * 1.5 + 1.5).toFixed(2),
        delay: Math.random().toFixed(2),
      })),
    []
  );

  useEffect(() => {
    const unlock = async () => {
      audioRef.current!.src = musicList[musicIndex].url + "lofi.mp3";
      audioRef.current!.volume = 0.4;
      audioRef.current?.play();

      window.removeEventListener("click", unlock);
      window.removeEventListener("touchend", unlock);
      window.removeEventListener("keydown", unlock);
    };

    window.addEventListener("click", unlock);
    window.addEventListener("touchend", unlock);
    window.addEventListener("keydown", unlock);

    return () => {
      window.removeEventListener("click", unlock);
      window.removeEventListener("touchend", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  return (
    <>
      <audio ref={audioRef} loop>
        <source />
      </audio>
      {transitions(
        (transitionStyles, item) =>
          item && (
            <animated.div
              className="music-app-container"
              ref={animatedRef}
              style={{
                x: style.x,
                y: to([style.y, transitionStyles.y], (y, ty) => y + ty),
                scale: to(
                  [transitionStyles.scale, style.zoom],
                  (s, z) => s * z
                ),
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
                    onClick={() => disableApp(1)}
                  ></div>
                  <div
                    className="circle control-exit"
                    style={{ backgroundColor: "#ff1e0088" }}
                    onClick={() => disableApp(1)}
                  ></div>
                </div>
              </div>
              <div className="app-content-container">
                <img
                  ref={imageRef}
                  className="app-music-thumbnail"
                  src={musicList[musicIndex].url + "lofi.jpg"}
                  draggable="false"
                />

                <div className="music-lines-container">
                  {musicLines.map((line, i) => (
                    <div
                      key={i}
                      ref={musicLineRefs[i]}
                      className="music-line"
                      style={{
                        animation: `${line.duration}s linear ${line.delay}s infinite alternate random-size`,
                      }}
                    />
                  ))}
                </div>

                <span ref={titleRef} className="music-title">
                  {musicList[musicIndex].name}
                </span>
                <div className="music-controls-container">
                  <i
                    className="fa-solid fa-backward"
                    onClick={() => handleMusicChange(-1)}
                  ></i>
                  <i
                    ref={pauseBtn}
                    className="fa-solid fa-pause"
                    onClick={() => {
                      audioRef.current?.pause();
                      pauseBtn.current!.style.display = "none";
                      playBtn.current!.style.display = "flex";

                      for (let i = 0; i < musicLineRefs.length; i++) {
                        musicLineRefs[i].current!.style.animationPlayState =
                          "paused";
                      }
                    }}
                  ></i>
                  <i
                    ref={playBtn}
                    className="fa-solid fa-play"
                    style={{ display: "none" }}
                    onClick={() => {
                      audioRef.current?.play();
                      pauseBtn.current!.style.display = "flex";
                      playBtn.current!.style.display = "none";

                      for (let i = 0; i < musicLineRefs.length; i++) {
                        musicLineRefs[i].current!.style.animationPlayState = "";
                      }
                    }}
                  ></i>
                  <i
                    className="fa-solid fa-forward"
                    onClick={() => handleMusicChange(1)}
                  ></i>
                </div>
              </div>
            </animated.div>
          )
      )}
    </>
  );
}

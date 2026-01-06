import { FullScreen, useFullScreenHandle } from "react-full-screen";
import "/src/styles/home.css";

import NavBar from "../components/NavBar";
import LofiVideos from "../components/LofiVideos";
import FullScreenBtn from "../components/FullScreen";
import MusicApp from "../components/apps/MusicApp";
import ClockApp from "../components/apps/ClockApp";

export default function HomePage() {
  const fullscreenHandle = useFullScreenHandle();

  return (
    <FullScreen handle={fullscreenHandle}>
      <div className="content-container">
        <LofiVideos />

        <FullScreenBtn fullscreenHandle={fullscreenHandle} />

        <NavBar />

        <MusicApp />
        <ClockApp />
      </div>
    </FullScreen>
  );
}

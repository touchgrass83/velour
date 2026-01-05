import { FullScreen, useFullScreenHandle } from "react-full-screen";
import "/src/styles/home.css";

import NavBar from "../components/NavBar";
import LofiVideos from "../components/LofiVideos";
import FullScreenBtn from "../components/FullScreen";

export default function HomePage() {
  const fullscreenHandle = useFullScreenHandle();

  return (
    <FullScreen handle={fullscreenHandle}>
      <div className="content-container">
        <LofiVideos />

        <FullScreenBtn fullscreenHandle={fullscreenHandle} />

        <NavBar />
      </div>
    </FullScreen>
  );
}

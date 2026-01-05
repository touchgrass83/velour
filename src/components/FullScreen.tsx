let canFullscreen = true;

const setCanFullscreen = (value: boolean) => {
  canFullscreen = value;
};

export { setCanFullscreen };

export default function FullScreenBtn(props: any) {
  const handleFullScreen = () => {
    if (!canFullscreen) return;

    if (!document.fullscreenElement) {
      props.fullscreenHandle.enter();
    } else {
      props.fullscreenHandle.exit();
    }
  };

  return (
    <button className="fullscreen-btn" onClick={handleFullScreen}>
      {!document.fullscreenElement ? (
        <i className="fa-solid fa-expand"></i>
      ) : (
        <i className="fa-solid fa-compress"></i>
      )}
    </button>
  );
}

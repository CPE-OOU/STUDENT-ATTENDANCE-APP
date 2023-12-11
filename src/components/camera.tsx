import React, { useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
// import jsQR from "jsqr";
//
const videoConstraints = {
  width: 540,
  facingMode: 'environment',
};

const Camera = () => {
  const webcamRef = useRef(null);
  const [url, setUrl] = React.useState(null);

  const capturePhoto = React.useCallback(async () => {
    // const imageSrc = webcamRef.current.getScreenshot();
    // setUrl(imageSrc);
  }, [webcamRef]);

  const captureAndSend = () => {
    if (webcamRef.current) {
      const img = webcamRef.current.getScreenshot();
      console.log(img);
    }
  };

  // Capture and send face data every 5 minutes
  // setInterval(captureAndSend, 5 * 1000);

  const onUserMedia = (e) => {
    console.log(e);
  };

  return (
    <>
      <Webcam
        ref={webcamRef}
        audio={true}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
        onUserMedia={onUserMedia}
      />
      <button onClick={capturePhoto}>Capture</button>
      <button onClick={() => setUrl(null)}>Refresh</button>
      {url && (
        <div>
          <img src={url} alt="Screenshot" />
        </div>
      )}
    </>
  );
};

export default Camera;

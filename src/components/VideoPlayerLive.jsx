import React, { useEffect } from 'react';

const VideoPlayerLive = ({ stream, isLocal = false, title }) => {
  const videoRef = React.useRef();

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        console.log("Vidéo chargée");
        videoRef.current.play();
      };
    }
  }, [stream]);

  return (
    <div className="video-container">
      {title && <h3>{title}</h3>}
      <video
  ref={videoRef}
  autoPlay
  playsInline
  muted   // <== forcé à `true`
  controls
  className="remote-video"
/>

      {!stream && (
        <div className="video-placeholder">
          <div className="spinner"></div>
          <p>Connexion en cours...</p>
        </div>
      )}
    </div>
  );
};

export default VideoPlayerLive;
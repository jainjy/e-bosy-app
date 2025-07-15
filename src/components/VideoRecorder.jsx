import React, { useRef, useState } from "react";

export default function VideoRecorder() {
  const videoPreviewRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const drawIntervalRef = useRef(null);

  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [duration, setDuration] = useState(0);

  const timerRef = useRef(null);
  const audioTrackRef = useRef(null);
  const currentVideoTrackRef = useRef(null);
  const sourceStreamRef = useRef(null);
  const canvasStreamRef = useRef(null);

  const startDrawing = (videoElement) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    drawIntervalRef.current = setInterval(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    }, 1000 / 30); // 30 FPS
  };

  const startRecording = async () => {
    const cameraStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 30, max: 60 },
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100,
      },
    });

    const videoTrack = cameraStream.getVideoTracks()[0];
    const audioTrack = cameraStream.getAudioTracks()[0];

    audioTrackRef.current = audioTrack;
    currentVideoTrackRef.current = videoTrack;
    sourceStreamRef.current = cameraStream;

    const videoElement = videoPreviewRef.current;
    videoElement.srcObject = new MediaStream([videoTrack]);
    await videoElement.play();

    startDrawing(videoElement);

    const canvasStream = canvasRef.current.captureStream(60); // High FPS if supported
    if (audioTrack) {
      canvasStream.addTrack(audioTrack);
    }
    canvasStreamRef.current = canvasStream;

    const mediaRecorder = new MediaRecorder(canvasStream, {
      mimeType: "video/webm;codecs=vp9,opus",
      videoBitsPerSecond: 5_000_000, // 5 Mbps
    });

    const chunks = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      setRecordedBlob(blob);
    };

    mediaRecorder.start();
    mediaRecorderRef.current = mediaRecorder;
    setRecording(true);
    setDuration(0);

    timerRef.current = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
  };

  const switchToScreen = async () => {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: { frameRate: 30 },
    });

    const screenTrack = screenStream.getVideoTracks()[0];
    currentVideoTrackRef.current = screenTrack;

    screenTrack.onended = () => {
      switchToCamera();
    };

    videoPreviewRef.current.srcObject = new MediaStream([screenTrack]);
    await videoPreviewRef.current.play();
  };

  const switchToCamera = async () => {
    const camStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 30, max: 60 },
      },
    });

    const camTrack = camStream.getVideoTracks()[0];
    currentVideoTrackRef.current = camTrack;

    videoPreviewRef.current.srcObject = new MediaStream([camTrack]);
    await videoPreviewRef.current.play();
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    sourceStreamRef.current?.getTracks().forEach((track) => track.stop());
    canvasStreamRef.current?.getTracks().forEach((track) => track.stop());
    clearInterval(drawIntervalRef.current);
    clearInterval(timerRef.current);
    setRecording(false);
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">🎥 Enregistreur vidéo combiné HD</h1>

      <video
        ref={videoPreviewRef}
        className="border w-full max-w-3xl"
        muted
        autoPlay
        playsInline
      />

      <canvas ref={canvasRef} className="hidden" width={1280} height={720}></canvas>

      <div className="space-y-2">
        {!recording ? (
          <button
            onClick={startRecording}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            ▶️ Démarrer l’enregistrement
          </button>
        ) : (
          <div className="space-x-2">
            <button
              onClick={switchToCamera}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              🎥 Caméra
            </button>
            <button
              onClick={switchToScreen}
              className="px-4 py-2 bg-yellow-500 text-black rounded"
            >
              🖥️ Écran
            </button>
            <button
              onClick={stopRecording}
              className="px-4 py-2 bg-red-600 text-white rounded"
            >
              ⏹️ Stop
            </button>
            <span className="inline-block ml-4 text-sm text-gray-700">
              ⏱️ {duration}s
            </span>
          </div>
        )}
      </div>

      {recordedBlob && (
        <div className="mt-6 space-y-2">
          <h2 className="text-lg font-semibold">🎬 Vidéo finale :</h2>
          <video
            src={URL.createObjectURL(recordedBlob)}
            controls
            className="border w-full max-w-3xl"
          />
          <a
            href={URL.createObjectURL(recordedBlob)}
            download="enregistrement_combine.webm"
            className="inline-block mt-2 px-4 py-2 bg-purple-600 text-white rounded"
          >
            📥 Télécharger la vidéo
          </a>
        </div>
      )}
    </div>
  );
}

import { useEffect } from 'react';

const JitsiRoom = ({ roomName }) => {
  useEffect(() => {
    const domain = 'meet.jit.si';

    const options = {
      roomName: roomName || 'eBoSyTestRoom_' + Math.floor(Math.random() * 10000),
      width: '100%',
      height: '100%',
      parentNode: document.getElementById('jitsi-container'),
      configOverwrite: {
        startWithAudioMuted: true,
        startWithVideoMuted: false,
        disableDeepLinking: true,
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        SHOW_BRAND_WATERMARK: false,
      },
    };

    const api = new window.JitsiMeetExternalAPI(domain, options);

    return () => api.dispose();
  }, [roomName]);

  return <div id="jitsi-container" style={{ height: '100vh', width: '100%' }} />;
};

export default JitsiRoom;

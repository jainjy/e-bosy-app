// import { useState } from 'react';
// import { JitsiMeeting } from '@jitsi/react-sdk';

import JitsiRoom from "../components/JitsiRoom";

function Conference() {

  return     <div className="App">
  <JitsiRoom roomName="eBoSyReactLiveRoom" />
</div>
}
//   const [roomName, setRoomName] = useState('');
//   const [userName, setUserName] = useState('');
//   const [joined, setJoined] = useState(false);

//   const handleJoin = () => {
//     if (roomName && userName) setJoined(true);
//   };

//   return (
//     <div style={{ fontFamily: 'Arial', padding: '20px' }}>
//       {!joined ? (
//         <div>
//           <h1>Test Jitsi</h1>
//           <div style={{ marginBottom: '10px' }}>
//             <input
//               type="text"
//               placeholder="Votre nom"
//               value={userName}
//               onChange={(e) => setUserName(e.target.value)}
//               style={{ padding: '8px', width: '300px' }}
//             />
//           </div>
//           <div style={{ marginBottom: '10px' }}>
//             <input
//               type="text"
//               placeholder="Nom de la salle"
//               value={roomName}
//               onChange={(e) => setRoomName(e.target.value)}
//               style={{ padding: '8px', width: '300px' }}
//             />
//           </div>
//           <button
//             onClick={handleJoin}
//             style={{
//               padding: '10px 20px',
//               backgroundColor: '#2b73b7',
//               color: 'white',
//               border: 'none',
//               cursor: 'pointer'
//             }}
//           >
//             Rejoindre
//           </button>
//         </div>
//       ) : (
//         <div style={{ height: '100vh', width: '100%' }}>
//           <JitsiMeeting
//             roomName={roomName}
//             userInfo={{
//               displayName: userName
//             }}
//             configOverwrite={{
//               startWithAudioMuted: true,
//               disableModeratorIndicator: true
//             }}
//             getIFrameRef={(iframeRef) => {
//               iframeRef.style.height = '100%';
//               iframeRef.style.width = '100%';
//             }}
//           />
//         </div>
//       )}
//     </div>
//   );
// }

export default Conference;

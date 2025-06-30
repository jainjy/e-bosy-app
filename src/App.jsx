import React, { useState } from 'react';
import TeacherPage from './pages/TeacherPage';
import StudentPage from './pages/StudentPage';
import "./test.css"
const App = () => {
    const [roomId, setRoomId] = useState('');
    const [userId, setUserId] = useState('');
    const [userType, setUserType] = useState('teacher');
    const [sessionStarted, setSessionStarted] = useState(false);
    const [error, setError] = useState('');

    const validateInputs = () => {
        if (!roomId.trim()) {
            setError("Veuillez entrer un ID de salle valide");
            return false;
        }
        if (!userId.trim()) {
            setError("Veuillez entrer votre ID utilisateur");
            return false;
        }
        setError('');
        return true;
    };

    const startSession = () => {
        if (validateInputs()) {
            setSessionStarted(true);
        }
    };

    if (sessionStarted) {
        return userType === 'teacher' ? 
            <TeacherPage roomId={roomId} userId={userId} /> : 
            <StudentPage roomId={roomId} userId={userId} />;
    }

    return (
        <div className="app-container">
            <div className="session-setup">
                <h1>Configuration de la vidéoconférence</h1>
                
                {error && <div className="error-message">{error}</div>}
                
                <div className="input-group">
                    <label>ID de la salle:</label>
                    <input
                        type="text"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        placeholder="Ex: MATHS-101"
                        required
                    />
                </div>
                
                <div className="input-group">
                    <label>Votre ID:</label>
                    <input
                        type="text"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        placeholder="Ex: PRO123 ou ETU456"
                        required
                    />
                </div>
                
                <div className="input-group">
                    <label>Rôle:</label>
                    <select 
                        value={userType} 
                        onChange={(e) => setUserType(e.target.value)}
                    >
                        <option value="teacher">Professeur</option>
                        <option value="student">Étudiant</option>
                    </select>
                </div>
                
                <button 
                    className="start-button" 
                    onClick={startSession}
                    disabled={!roomId || !userId}
                >
                    Commencer la session
                </button>
            </div>
        </div>
    );
};

export default App;
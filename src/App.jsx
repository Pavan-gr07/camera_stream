import React, { useState } from 'react';
import './App.css';

export const SERVER_URL = 'http://localhost:5000'; // fixed server URL

// UID passed as env variable
const uid = import.meta.env.VITE_UID

console.log(uid, "uiuiuiu")

function App() {
  const [streamUrl] = useState(`${SERVER_URL}/camera/${uid}`);

  return (
    <div>
      <img
        src={streamUrl}
        alt="Live Camera Feed"
        style={{ width: '640px', height: '480px' }}
        onError={(e) => console.log('Stream error:', e)}
      />
    </div>
  );
}

export default App;

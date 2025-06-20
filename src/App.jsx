
import React from 'react'
import { useState } from 'react'
import './App.css'

export const SERVER_URL = 'http://localhost:5000';
function App() {
  const [streamUrl] = useState(`${SERVER_URL}/camera/${"192.168.100.56"}`);

  return (
    <>
      <div>
        <img
          src={streamUrl}
          alt="Live Camera Feed"
          style={{ width: '640px', height: '480px' }}
          onError={(e) => console.log('Stream error:', e)}
        />
      </div>
    </>
  )
}

export default App


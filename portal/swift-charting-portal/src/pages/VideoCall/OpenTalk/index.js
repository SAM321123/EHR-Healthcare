import React, { useState } from 'react';
import WaitingRoom from './WaitingRoom';

const App = () => {
  const [deviceReady, setDeviceReady] = useState(false);

  const handleDeviceReady = (isReady) => {
    setDeviceReady(isReady);
  };

  // Replace these with your actual API Key, Session ID and Token
  const apiKey = 'YOUR_API_KEY';
  const sessionId = 'YOUR_SESSION_ID';
  const token = 'YOUR_TOKEN';

  return (
    <div>
      <h1>Waiting Room</h1>
      {deviceReady ? (
        <p>Devices are ready. You can now join the main session.</p>
      ) : (
        <WaitingRoom
          apiKey={apiKey}
          sessionId={sessionId}
          token={token}
          onDeviceReady={handleDeviceReady}
        />
      )}
    </div>
  );
};

export default App;
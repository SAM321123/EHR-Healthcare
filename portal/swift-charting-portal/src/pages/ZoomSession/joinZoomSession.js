import uitoolkit from '@zoom/videosdk-ui-toolkit'; // Use the UI Toolkit
import '@zoom/videosdk-ui-toolkit/dist/videosdk-ui-toolkit.css'; // Import the UI Toolkit styles
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const JoinZoomSession = ({sessionToken,sessionId,userName}={}) => {
  const navigate = useNavigate(); // Use navigate for redirection

  useEffect(() => {
    const sessionContainer = document.getElementById('sessionContainer');

    // Check if sessionData is available
    if (sessionId && sessionToken && sessionContainer) {
      const config = {
        videoSDKJWT: sessionToken, // Use the session token for JWT
        sessionName: sessionId, // Use the session ID for the session name
        userName: userName, // Replace with your desired user name
        features: ['video', 'audio', 'settings', 'users', 'chat', 'share'], // Enable desired features
        options: { init: {}, audio: {}, video: {}, share: {} }, // Additional options
      };

      // Join the Zoom session
      uitoolkit.joinSession(sessionContainer, config);
      uitoolkit.onSessionClosed(sessionClosed); // Handle session closed event
    }
    return () => {
      uitoolkit.closeSession(sessionContainer);
      console.log("Session closed");
    };
  }, [sessionId, sessionToken]);

  const sessionClosed = () => {
    const sessionContainer = document.getElementById('sessionContainer');
    if (sessionContainer) {
      uitoolkit.closeSession(sessionContainer); // Close the session
      navigate(-1)
    }
  };

  return (
    <div>
      <div id="sessionContainer" />
    </div>
  );
};

export default JoinZoomSession;

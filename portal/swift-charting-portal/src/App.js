import { useCallback, useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// routes
import Router from './routes';
// theme
import ThemeProvider from './theme';
// components
import { ChatContentProvider } from './context/chatContext';
import { StyledChart } from './components/chart';
import { ScrollToTop } from './components/scroll-to-top';
import Events from './lib/events';
import SnackBar from './components/SnackBar';
import { UI_ROUTES } from './lib/routeConstants';

import './app.css';
import NotificationProvider from './notification/notification';
// import NotificationProvider from './notification/notification';
// ----------------------------------------------------------------------

export default function App() {
  const [snackbarData, setSnackbarData] = useState({});

  const hideSnackbar = useCallback(() => {
    setSnackbarData((current) => ({ type: current.type }));
  }, []);

  const showSnackbar = useCallback((data) => {
    setSnackbarData({
      message: data.message,
      type: data.severity,
    });
  }, []);

  const onLogout = useCallback(() => {
    localStorage.clear();
    const currentPath = window.location.pathname;
  
  // List of public routes that should NOT redirect to login
  const isPublicRoute = 
    currentPath.indexOf(UI_ROUTES.login) !== -1 || 
    currentPath.indexOf(UI_ROUTES.formLink) !== -1 ||
    currentPath.indexOf(UI_ROUTES.patientSharedForms) !== -1;

  if (!isPublicRoute) {
      if (window.location.pathname !== '/') {
        window.location = `${UI_ROUTES.login}?redirectionURL=${window.location.pathname}`;
      } else {
        window.location = UI_ROUTES.login;
      }
    }
  }, []);

  useEffect(() => {
    Events.on('showSnackbar', 'snackbar', showSnackbar);
  }, [showSnackbar]);

  useEffect(() => {
    Events.on('logout', 'logout', onLogout);
  }, [onLogout]);

  // This useEffect hook sets up an event listener for incoming messages from a service worker.
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.route) {
          // Navigate to the new route using window.location.href
          window.location.href = event.data.route;
        }
      });
    }
  }, []);

  return (
    <HelmetProvider>
      <BrowserRouter>
        <DndProvider backend={HTML5Backend}>
          <ChatContentProvider>
            <NotificationProvider>
              <ThemeProvider>
                <ScrollToTop />
                <SnackBar
                  type={snackbarData.type}
                  message={snackbarData.message}
                  hideSnackbar={hideSnackbar}
                />
                <StyledChart />
                <Router />
              </ThemeProvider>
            </NotificationProvider>
          </ChatContentProvider>
        </DndProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

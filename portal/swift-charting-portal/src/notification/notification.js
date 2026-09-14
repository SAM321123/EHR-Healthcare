import { useCallback, useContext, useEffect, useMemo } from 'react';
import { onMessage, isSupported, getToken } from 'firebase/messaging';
import { useLocation, useNavigate } from 'react-router-dom';

import useAuthUser from 'src/hooks/useAuthUser';
import { ChatContext } from 'src/context/chatContext';
import useCRUD from 'src/hooks/useCRUD';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import { CREATE_DEVICE_TOKEN } from 'src/store/types';
import { getUserRole, onNotificationClick, showSnackbar } from 'src/lib/utils';
import { notificationTypeToPathMapping } from 'src/lib/constants';
import { messaging } from '../firebase';
import useLoggedInUser from 'src/hooks/useLoggedInUser';

export const pushToken = {};

const NotificationProvider = ({ children }) => {
  const { subscribedNotificationChannel, selectedMember } =
    useContext(ChatContext) || {};
  const { pathname } = useLocation();
  // const [userInfo] = useAuthUser();
  const userInfo = useLoggedInUser();
  const isPatient = getUserRole()==='patient';

  const navigate = useNavigate();

  const [, , , createDevice] = useCRUD({
    id: CREATE_DEVICE_TOKEN,
    url: API_URL.userDevice,
    type: REQUEST_METHOD.post,
  });

  const isChatScreen = useMemo(() => pathname.includes('Chat'), [pathname]);

  const showNotification = useCallback(
    ({ data }, parsedPatient) => {
      const { uri = '' } = data || {};
      const id = parsedPatient?.id || '';

      const notificationTitle = data?.title;
      const notificationOptions = {
        body: data?.body,
        icon: data?.icon,
      };

      const notificationShow = new Notification(
        notificationTitle,
        notificationOptions
      );

      notificationShow.onclick = (event) => {
        event.preventDefault();
        if (uri === 'Chat') {
          navigate(`${uri}/${id}`);
        }
      };
    },
    [navigate]
  );

  const showServerNotification = useCallback(
    (payload) => {
      const { data = {},notification } = payload || {};
      const notificationTitle = notification?.title;
      const notificationOptions = {
        body: notification?.body,
        icon: data?.icon,
      };

      const notificationShow = new Notification(
        notificationTitle,
        notificationOptions
      );

      notificationShow.onclick = (event) => {
        event.preventDefault();

        const handleOnClick = onNotificationClick[notificationTypeToPathMapping[data?.type]];
        
        handleOnClick?.(data?.appointmentId, navigate,isPatient);
      };
    },
    [navigate]
  );

  const onMessageReceived = useCallback(
    (payload) => {
      const { data } = payload || {};
      const { patient = '', channel, type = '' } = data || {};
      let parsedPatient = {};
      if (patient) {
        parsedPatient = JSON.parse(patient);
      }
      const notificationToBeShow = isPatient
        ? !isChatScreen
        : !(parsedPatient?.id === selectedMember?.id);

      if (channel === subscribedNotificationChannel && notificationToBeShow) {
        showNotification(payload, parsedPatient);
      } else if (type) {
        showServerNotification(payload);
      }
    },
    [
      isPatient,
      isChatScreen,
      selectedMember,
      subscribedNotificationChannel,
      showNotification,
      showServerNotification,
    ]
  );

  const getFcmToken = useCallback(async () => {
    try {
      const token = await getToken(messaging, {
        vapidKey: `BOmn66iiKe9enLbmtoexnNKHUeHhf4bBhgSNGW0W8pg5z-FHASEKwRCxal2IimTByR_SAdDyxXZ0ihavBNyjA9g` ||process.env.REACT_APP_VAPID_API_KEY,
      });
      return token;
    } catch (e) {
      console.log("🚀 ~ file: notification.js:104 ~ getFcmToken ~ e:Failed to get FCM token", e)
      showSnackbar({
        message: 'Failed to get FCM token',
        severity: 'error',
      });
    }
    return null;
  }, []);

  const registerFcmToken = useCallback((fcmToken) => {
    if (fcmToken) {
      createDevice({
        data: {
          device: fcmToken,
          type: 'web',
        },
      });
    }
    pushToken.device = fcmToken;
  }, []);

  const generateAndSaveFcmToken = useCallback(async () => {
    if (userInfo) {
      const fcmToken = await getFcmToken();
      registerFcmToken(fcmToken);
    }
  }, [userInfo]);

  useEffect(() => {
    isSupported().then((supported) => {
      if (supported && 'Notification' in window) {
        if (Notification.permission === 'granted' && userInfo) {
          generateAndSaveFcmToken();
        } else {
          Notification.requestPermission()
            .then((permission) => {
              if (permission === 'granted') {
                generateAndSaveFcmToken();
              }
            })
            .catch(() => {
              showSnackbar({
                message: 'Error requesting notification permission:',
                severity: 'error',
              });
            });
        }
      }
    });
  }, [userInfo]);

  useEffect(() => {
    isSupported()
      .then((supported) => {
        if (supported) {
          onMessage(messaging, (payload) => {
            onMessageReceived(payload, userInfo);
          });
        }
      })
      .catch((error) => {
        showSnackbar({
          message: error.message,
          severity: 'error',
        });
      });
  }, [onMessageReceived]);

  return children;
};

export default NotificationProvider;

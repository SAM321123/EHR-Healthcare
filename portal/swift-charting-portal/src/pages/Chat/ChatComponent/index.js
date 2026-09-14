/* eslint-disable no-param-reassign */
import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  useContext,
} from 'react';
import { useParams } from 'react-router-dom';
import isEmpty from 'lodash/isEmpty';
import { createStyles, makeStyles } from '@mui/styles';

import Box from 'src/components/Box';
import Typography from 'src/components/Typography';
import useAuthUser from 'src/hooks/useAuthUser';
import { showSnackbar, getUserRole } from 'src/lib/utils';
import usePatientDetail from 'src/hooks/usePatientDetail';
import useCRUD from 'src/hooks/useCRUD';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import { ChatContext } from 'src/context/chatContext';
import { GET_CHAT_TEMPLATE } from 'src/store/types';
import Loader from 'src/components/Loader';
import Events from 'src/lib/events';
import ChatHeader from './chatHeader';
import ChatBody from './chatBody';
import lockMessage from '../../../assets/images/lockMessage.png';
import ChatFooter from './chatFooter';
import useLoggedInUser from 'src/hooks/useLoggedInUser';

const useStyles = makeStyles(() =>
  createStyles({
    chatContainer: {
      display: 'flex',
      height: '100%',
      flexDirection: 'column',
      margin: '0px',
      padding: '22px',
      overflow: 'hidden',
      backgroundColor: 'white',
    },
  })
);

const Chat = ({ color }) => {
  const classes = useStyles();
  const [chatData, setChatData] = useState([]);
  const [typeChat, setTypeChat] = useState('');
  const [startTime, setStartTime] = useState(0);
  const [isNewMessage, setIsNewMessage] = useState(false);
  const [allDataFetched, setallDataFetched] = useState(false);
  const [loading, setLoading] = useState(false);
  // const [loginData] = useAuthUser();
  const loginData = useLoggedInUser();
  const scrollAreaRef = useRef(null);
  const { id: patientId } = useParams();
  const { selectedMember, channels, notificationChannel, pubnub } =
    useContext(ChatContext);

  const [templateList, , templateListLoading, callTemplate, clearTemplate] =
    useCRUD({
      id: GET_CHAT_TEMPLATE,
      url: API_URL.chatTemplate,
      type: REQUEST_METHOD.get,
    });

  const { results } = templateList || [];

  const [patientData, patientLoading, getPatient] = usePatientDetail({
    patientId,
  });

  const { firstName = '', lastName = '' } = patientData || {};
  const initial = `${firstName?.[0]?.toLocaleUpperCase()}${lastName?.[0]?.toLocaleUpperCase()}`;
  const { user, name, id, role, practice } = loginData || {};
  const userRole = getUserRole();
  const isPatient = role?.includes('patient');

  // 'chatListenerData' contains a function to handle new messages and update memberships in the specified PubNub channel.
  const chatListenerData = useMemo(
    () => ({
      message: (message) => {
        setChatData((prev) => [...prev, message.message[0]]);
      },
    }),
    []
  );

  const addListenerAndSubscripition = useCallback(() => {
    pubnub.addListener(chatListenerData);
    pubnub.subscribe({ channels });
  }, [channels]);

  // 'loadEarlierMessages' function fetches earlier messages from the specified PubNub channel.
  const loadEarlierMessages = useCallback(() => {
    if (allDataFetched) {
      return;
    }
    setIsNewMessage(false);
    setLoading(true);
    pubnub.history(
      { channel: channels, count: 10, start: startTime },
      (__, res) => {
        const { messages = [], startTimeToken: latestTime } = res || {};
        const newMessage = [];
        messages.forEach((element, index) => {
          newMessage[index] = element?.entry?.[0];
        });

        if (newMessage.length && latestTime && startTime !== latestTime) {
          setChatData((Data) => [...newMessage, ...Data]);
          setStartTime(latestTime);
        } else {
          setallDataFetched(true);
        }
        setLoading(false);
      }
    );
  }, [allDataFetched, channels, pubnub, startTime]);

  // 'sendOnNotificationChannel' function publishes a new message notification on the specified PubNub channel.
  const sendOnNotificationChannel = useCallback(
    (messages) => {
      const payload = {
        room: notificationChannel,
        pn_gcm: {
          data: {
            uri: 'Chat',
            userId: id,
            patient: isPatient ? loginData : selectedMember,
            sender: id,
            senderRole: userRole,
            channel: notificationChannel,
            title: `New Message from ${messages[0]?.senderName}`,
            body: messages[0]?.fileName || messages[0]?.text,
            sound: 'default',
          },
        },
        patient: isPatient ? loginData : selectedMember,
        sender: id,
        senderRole: userRole,
      };

      pubnub.publish({
        message: payload,
        channel: notificationChannel,
      });
    },
    [
      id,
      isPatient,
      loginData,
      notificationChannel,
      pubnub,
      selectedMember,
      userRole,
    ]
  );

  // 'chatHistoryListener' function adds a listener, subscribes to a channel, and fetches the latest messages from the specified PubNub channel.
  const chatHistoryListener = useCallback(() => {
    if (!channels) {
      return;
    }
    addListenerAndSubscripition();
    setIsNewMessage(true);
    pubnub.history({ channel: channels, count: 10 }, async (_, res) => {
      const { messages = [], startTimeToken: latestTime } = res || {};
      const newMessage = [];
      messages?.forEach?.((element, index) => {
        newMessage[index] = element?.entry[0];
      });
      if (newMessage?.length) {
        const fullList = [...newMessage];
        setChatData(fullList);
      }

      setStartTime(latestTime);
    });
  }, [addListenerAndSubscripition, channels, pubnub]);

  // 'onSend' function handles the sending of messages, updates the chat state, and triggers a 'sendChatHistory' event.
  const onSend = useCallback(
    (messages = []) => {
      if (messages.length === 0) return;
      pubnub
        .publish({
          channel: channels,
          message: [messages[0]],
        })
        .then(async () => {
          sendOnNotificationChannel([messages[0]]);
          setTypeChat('');
          const payloadData = {
            patient: isPatient ? id : patientId,
            sender: id,
            senderRole: userRole,
            chatContent: messages[0]?.text,
            seen: false,
            channel: channels[0],
          };
          Events.trigger('sendChatHistory', payloadData);
        })
        .catch((error) => {
          showSnackbar({
            message: error,
            severity: 'error',
          });
        });
    },
    [
      channels,
      pubnub,
      userRole,
      patientId,
      id,
      isPatient,
      sendOnNotificationChannel,
    ]
  );

  const clearChatHistory = () => {
    setChatData([]); // Clear chat data
    pubnub.unsubscribe({ channels: [channels] }); // Unsubscribe from current channel
  };

  useEffect(() => {
    clearChatHistory();
    if (!isEmpty(loginData)) {
      chatHistoryListener();
    }
    return () => {
      pubnub.removeListener(chatListenerData);
      pubnub.unsubscribe({ channels: [channels] });
    };
  }, [channels, loginData]);

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (isNewMessage && scrollArea) {
      scrollArea.scrollTop = scrollArea?.scrollHeight;
      return;
    }
    const containerHeight = scrollArea?.clientHeight;
    if (containerHeight) {
      scrollArea.scrollTop = containerHeight;
    }
  }, [chatData, isNewMessage]);

  useEffect(() => {
    if (patientId) {
      getPatient();
    }
  }, [patientId]);

  useEffect(() => {
    pubnub.objects
      .getMemberships({
        include: {
          customFields: true,
        },
      })
      .then(() => {});
  }, [chatData]);

  useEffect(() => {
    if (isPatient ? id : patientId)
      Events.trigger('updateChatStatus', {
        patientId: isPatient ? id : patientId,
        channels,
      });
  }, [channels, id, isPatient, patientId]);

  if (patientLoading) {
    return <Loader loading type="circular" />;
  }

  return (
    <Box className={classes.chatContainer}>
      {isPatient || patientId ? (
        <>
          <ChatHeader
            color={color}
            isPatient={isPatient}
            initial={initial}
            firstName={firstName}
            lastName={lastName}
            status="Online"
            practice={practice}
            id={id}
            callTemplate={callTemplate}
            results={results}
            templateList={templateList}
            setTypeChat={setTypeChat}
            clearTemplate={clearTemplate}
            templateListLoading={templateListLoading}
          />
          <ChatBody
            scrollAreaRef={scrollAreaRef}
            loading={loading}
            startTime={startTime}
            loadEarlierMessages={loadEarlierMessages}
            chatData={chatData}
            user={user}
            isPatient={isPatient}
            patientId={patientId}
            practice={practice}
            id={id}
          />
          <ChatFooter
            typeChat={typeChat}
            isPatient={isPatient}
            callTemplate={callTemplate}
            setTypeChat={setTypeChat}
            user={user}
            practice={practice}
            name={name}
            onSend={onSend}
            setIsNewMessage={setIsNewMessage}
            templateListLoading={templateListLoading}
            clearTemplate={clearTemplate}
            templateList={templateList}
            results={results}
            loginData={loginData}
            patientData={patientData}
            id={id}
          />
        </>
      ) : (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <img src={lockMessage} width="100px" alt="" />
          <Typography
            sx={{ mt: '29px', fontSize: '27px', fontWeight: '500  ' }}
          >
            Secure Messaging
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Chat;

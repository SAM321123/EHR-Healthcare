import AddIcon from '@mui/icons-material/Add';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { Box, IconButton, List, Typography } from '@mui/material';
import isEmpty from 'lodash/isEmpty';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { API_URL, REQUEST_METHOD, SOCKET_URL } from 'src/api/constants';
import FilterComponents from 'src/components/FilterComponents';
import Loader from 'src/components/Loader';
import ModalComponent from 'src/components/modal';
import { ChatContext } from 'src/context/chatContext';
import useAuthUser from 'src/hooks/useAuthUser';
import useCRUD from 'src/hooks/useCRUD';
import { roleTypes } from 'src/lib/constants';
import { decrypt, encrypt } from 'src/lib/encryption';
import { UI_ROUTES } from 'src/lib/routeConstants';
import { getFullName } from 'src/lib/utils';
import { CHAT_MESSAGES, DELETE_CHAT_MESSAGES_DATA } from 'src/store/types';
import palette from 'src/theme/palette';
import NewChatForm from './NewChat';
import './chatMessage.scss';
import PersonTile from './personTile';
import RightSideMessageArea from './rightMesageArea';

const socket = io(SOCKET_URL, {
  path: '/socket/messages', // Custom endpoint path
});

function Message() {
  return <Chat />;
}

const Chat = () => {
  const [loginData] = useAuthUser();
  const [showPatientModel, setShowPatientModel] = useState(false);
  const { role, userId } = loginData || {};

  const isPatient = role === roleTypes.patient;

  const { response, loading, filters, handleFilters, handleOnFetchDataList,  
    currentChatId,
    currentChatToId,
    currentChatHead,
    setCurrentChatHead,
    currentChatHeadProfile,
    setCurrentChatHeadProfile,
    currentChatHeadLastActivity,
    setCurrentChatHeadLastActivity,
    currentChatChannel,
    page,
    setPage,
    loadChat,
    NewChatWindow,
  } =
    useContext(ChatContext);
  let { chatId } = useParams();
  if (chatId) {
    chatId = decrypt(chatId);
  }
  // const [currentChatId, setCurrentChatId] = useState(chatId ? chatId : null);
  const [clearChatId, setClearChatId] = useState(chatId ? chatId : null);
  const messageContainerRef = useRef(null); // To capture the scroll container
  const isFetchingMoreMessages = useRef(false); // To prevent multiple fetches at once
  // const [page, setPage] = useState(10); // Pagination state

  const shouldFetchData = Boolean(currentChatId);

  const [
    messagesResponse,
    ,
    messagesLoading,
    messagesHandleOnFetchDataList,
    clearMessageData,
  ] = useCRUD({
    id: `${CHAT_MESSAGES}-${currentChatId}`,
    url: `${API_URL.chats}/${currentChatId}?page=1&limit=${page}`,
    type: REQUEST_METHOD.get,
    filters: { chatId: currentChatId },
    subscribeSocket: true,
  });

  const [, , , callMarkReadAPI] = useCRUD({
    id: 'MARK_CHAT_DATA_READ',
    url: `${API_URL.chats}/mark-chat-read`,
    type: REQUEST_METHOD.post,
  });

  // Load more messages when user scrolls up
  const loadMoreMessages = async () => {
    if (page < messagesResponse?.totalResults) {
      isFetchingMoreMessages.current = true;
      setPage((prevPage) => prevPage + 10); // Increment page to load older messages
      await messagesHandleOnFetchDataList();
      isFetchingMoreMessages.current = false;
    }
  };

  // Detect when the user scrolls to the top
  const handleScroll = () => {
    if (messageContainerRef.current) {
      const { scrollTop } = messageContainerRef.current;
      if (scrollTop === 0 && !isFetchingMoreMessages.current) {
        loadMoreMessages(); // Fetch older messages
      }
    }
  };

  const [deleteResponse, , , callClearChatDeleteAPI, clearData] = useCRUD({
    id: DELETE_CHAT_MESSAGES_DATA,
    url: API_URL.chats,
    type: REQUEST_METHOD.update,
  });
  // const [currentChatToId, setCurrentChatToId] = useState(null);
  // const [currentChatHead, setCurrentChatHead] = useState(null);
  // const [currentChatHeadLastActivity, setCurrentChatHeadLastActivity] =
    // useState(null);

  // const [currentChatHeadProfile, setCurrentChatHeadProfile] = useState(null);
  // const [currentChatChannel, setCurrentChatChannel] = useState(null);
  const [showClearChatModel, setShowClearChatModel] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]); // To store files
  // const [loadChat, setLoadChat] = useState(false); // To store files

  useEffect(() => {
    if (response?.results && currentChatToId) {
      const findRecord = response?.results?.find(
        (item) =>
          (item.senderId === userId && currentChatToId === item.receiverId) ||
          (item.receiverId === userId && currentChatToId === item.senderId)
      );
      if (!isEmpty(findRecord)) {
        setCurrentChatHead(
          findRecord.senderId === userId
            ? getFullName(
                findRecord?.Receiver?.staff || findRecord?.Receiver?.patient
              )
            : getFullName(
                findRecord?.Sender?.staff || findRecord?.Sender?.patient
              )
        );
        setCurrentChatHeadLastActivity(
          findRecord.senderId === userId
            ? findRecord?.Receiver?.staff?.user?.lastActivity ||
                findRecord?.Receiver?.patient?.user?.lastActivity
            : findRecord?.Sender?.staff?.user?.lastActivity ||
                findRecord?.Sender?.patient?.user?.lastActivity
        );
        setCurrentChatHeadProfile(
          findRecord.senderId === userId
            ? findRecord?.Receiver?.staff?.file?.file ||
                findRecord?.Receiver?.patient?.file?.file
            : findRecord?.Sender?.staff?.file?.file ||
                findRecord?.Sender?.patient?.file?.file
        );
      }
    }
  }, [response, currentChatToId]);

  const [socketMessages, setsocketMessages] = useState([]);
  const navigate = useNavigate();
  const roomId = currentChatChannel;
  // Effect to trigger fetch when currentChatId changes
  useEffect(() => {
    if (currentChatId && !currentChatToId) {
      navigate(
        generatePath(
          role === roleTypes.patient
            ? UI_ROUTES.patientMssages
            : UI_ROUTES.messages
        )
      );
    } else if (currentChatId) {
      messagesHandleOnFetchDataList(); // Fetch messages when the chatId changes
      setsocketMessages([]);
      setUploadedFiles([]);
      callMarkReadAPI({ data: { receiverId: userId } }, `/${currentChatId}`);
    }
  }, [currentChatId, role, messagesHandleOnFetchDataList, userId]);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles((prevFiles) => [...prevFiles, ...files]);
  };
  const handleRemoveFile = (fileIndex) => {
    setUploadedFiles((prevFiles) =>
      prevFiles.filter((_, index) => index !== fileIndex)
    );
  };
  // Join the room when the component mounts
  useEffect(() => {
    if (roomId) {
      socket.emit('joinRoom', { room: roomId });
      // Handle incoming messages
      const handleRoomMessage = ({ room, msg, userId: senderId, sentAt }) => {
        // Ensure the message is from the same room
        if (room === roomId) {
          // setsocketMessages((prevMessages) => [...prevMessages, { msg, senderId,sentAt }]);
          callMarkReadAPI(
            { data: { receiverId: userId } },
            `/${currentChatId}`
          );
        }
      };

      socket.on('roomMessage', handleRoomMessage);

      // Cleanup on component unmount
      return () => {
        socket.off('roomMessage', handleRoomMessage);
        socket.emit('leaveRoom', { room: roomId });
      };
    }
  }, [currentChatId, roomId]);

  // useEffect(() => {
  //   // Check if messagesResponse is defined and has at least one element
  //   if (messagesResponse?.results?.length > 0 && roomId) {
  //     setCurrentChatToId(messagesResponse?.results[0]?.senderId===userId ? messagesResponse?.results[0]?.receiverId : messagesResponse?.results[0]?.senderId);
  //     setCurrentChatHead(messagesResponse?.results[0]?.senderId===userId ? messagesResponse?.results[0]?.ReceiverInfo?.firstName : messagesResponse?.results[0]?.SenderInfo?.firstName);

  //   }
  // }, [messagesResponse, currentChatId, userId, roomId]); // Run this effect when messagesResponse or userId changes

  const handleCreatMessageModalVisibility = () => {
    setShowPatientModel(true);
  };
  const closeMessageModel = () => {
    setShowPatientModel(false);
  };
  const handleClearChatModalVisibility = () => {
    setShowClearChatModel(true);
    handleMenuClose(false);
  };

  const deleteChatMessages = useCallback(() => {
    if (clearChatId) {
      callClearChatDeleteAPI({ isDeleted: true }, `/${clearChatId}`);
    }
    setShowClearChatModel((pre) => !pre);
    if (clearChatId === currentChatId) {
      messagesHandleOnFetchDataList();
      setsocketMessages([]);
    }
  }, [
    callClearChatDeleteAPI,
    clearChatId,
    currentChatId,
    messagesHandleOnFetchDataList,
  ]);

  const clearChatDialogActions = useMemo(
    () => [
      {
        title: 'Cancel',
        action: () => setShowClearChatModel((current) => !current),
        actionStyle: { color: palette.common.black, padding: '8px' },
        variant: 'secondary',
      },
      {
        title: 'Clear Chat',
        action: deleteChatMessages,
        actionStyle: { color: palette.primary.darker, padding: '8px' },
        variant: 'secondary',
      },
    ],
    [deleteChatMessages]
  );

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuClick = (event, chatId) => {
    setAnchorEl(event.currentTarget);
    setClearChatId(chatId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // const NewChatWindow = (
  //   chatId,
  //   channelId,
  //   receiverId,
  //   chatHead,
  //   chatHeadProfileUrl,
  //   lastActivity
  // ) => {
  //   setCurrentChatId(chatId);
  //   setCurrentChatToId(receiverId);
  //   setCurrentChatHead(chatHead);
  //   setCurrentChatHeadProfile(chatHeadProfileUrl);
  //   setCurrentChatHeadLastActivity(lastActivity);
  //   setCurrentChatChannel(channelId);
  //   setPage(10);
  //   setLoadChat(true);
  //   socket.emit('joinRoom', { room: currentChatChannel });
  //   navigate(
  //     generatePath(
  //       isPatient ? UI_ROUTES.singlePatientChat : UI_ROUTES.singleChat,
  //       {
  //         chatId: encrypt(String(chatId)),
  //       }
  //     )
  //   );
  // };

  const FilterCollectionHeader = FilterComponents({
    rightComponents: [
      {
        type: 'search',
        filterProps: {
          placeholder: 'Search by Name',
        },
        name: 'searchText',
      },
    ],
  });

  return (
    <Box
      loading={loading}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: '#F6F8FB',
        padding: '20px',
        borderRadius: '20px',
      }}
    >
      {/* Main Content */}
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        {/* Left Side - Chat Threads */}
        <Box
          sx={{
            minWidth: '340px',
            border: '1px solid #ddd',
            borderRadius: '20px',
            backgroundColor: '#fff',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Search Bar and Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '15px 15px 0px',
            }}
          >
            <Typography
              variant="h6"
              sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}
            >
              Messages{' '}
              <ChatBubbleOutlineIcon sx={{ fontSize: 20, marginLeft: '8px' }} />
            </Typography>
            <IconButton
              sx={{
                backgroundColor: '#F6F8FB',
                borderRadius: '8px',
                padding: '8px',
              }}
            >
              <AddIcon
                sx={{ color: '#5A67D8' }}
                onClick={handleCreatMessageModalVisibility}
              />
            </IconButton>
            {showPatientModel && (
              <ModalComponent
                open={showPatientModel}
                header={{
                  title: `Start Chat`,
                  closeIconAction: closeMessageModel,
                }}
                containerStyle={{ width: '40%' }}
              >
                <NewChatForm
                  onClose={closeMessageModel}
                  handleOnFetchDataList={handleOnFetchDataList}
                  messagesHandleOnFetchDataList={messagesHandleOnFetchDataList}
                  NewChatWindow={NewChatWindow}
                />
              </ModalComponent>
            )}
          </Box>
          <Box sx={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
            <FilterCollectionHeader
              onFilterChange={handleFilters}
              filters={filters}
            />
          </Box>
          <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
            <List>
              {loading ? (
                // Render the Loader component while the data is being fetched
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '20px',
                  }}
                >
                  <Loader type="circular" loading={loading} />
                </Box>
              ) : // Render the chat items once the data has been fetched
              response?.results?.length > 0 ? (
                response?.results?.map((item, rowIndex) => {
                  return (
                    <PersonTile
                      key={rowIndex}
                      item={item}
                      userId={userId}
                      NewChatWindow={NewChatWindow}
                      currentChatId={currentChatId}
                      chatId={chatId}
                    />
                  );
                })
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '20px',
                  }}
                >
                  <Typography>No Chats Found!</Typography>
                </Box>
              )}
            </List>
          </Box>
        </Box>

        {/* Right Side - Chat Window */}
        <RightSideMessageArea
          currentChatHead={currentChatHead}
          currentChatHeadProfile={currentChatHeadProfile}
          currentChatHeadLastActivity={currentChatHeadLastActivity}
          currentChatToId={currentChatToId}
          currentChatId={currentChatId}
          handleMenuClick={handleMenuClick}
          anchorEl={anchorEl}
          socket={socket}
          roomId={roomId}
          handleMenuClose={handleMenuClose}
          messagesLoading={messagesLoading}
          messagesResponse={messagesResponse}
          userId={userId}
          dialogActions={clearChatDialogActions}
          showClearChatModel={showClearChatModel}
          handleClearChatModalVisibility={handleClearChatModalVisibility}
          clearChatId={clearChatId}
          socketMessages={socketMessages}
          handleFileUpload={handleFileUpload}
          uploadedFiles={uploadedFiles}
          handleRemoveFile={handleRemoveFile}
          messageContainerRef={messageContainerRef}
          handleScroll={handleScroll}
          loadChat={loadChat}
        />
      </Box>
    </Box>
  );
};

export default Message;

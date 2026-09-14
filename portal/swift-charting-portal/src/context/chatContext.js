/* eslint-disable no-nested-ternary */
/* eslint-disable no-param-reassign */
import {
  createContext,
  useEffect,
  useState,
} from 'react';

import { API_URL, REQUEST_METHOD, SOCKET_URL } from 'src/api/constants';
import useAuthUser from 'src/hooks/useAuthUser';
import useLoggedInUser from 'src/hooks/useLoggedInUser';
import useQuery from 'src/hooks/useQuery';
import {
  USER_CHAT_LIST
} from 'src/store/types';
import { useNavigate, generatePath } from "react-router-dom";
import { UI_ROUTES } from 'src/lib/routeConstants';
import { encrypt } from 'src/lib/encryption';
import { io } from 'socket.io-client';
import { roleTypes } from 'src/lib/constants';

const socket = io(SOCKET_URL, {
  path: '/socket/messages', // Custom endpoint path
});

export const ChatContext = createContext();
export const ChatContentProvider = ({ children }) => {

  const [currentChatId, setCurrentChatId] = useState(null);
  const [currentChatToId, setCurrentChatToId] = useState(null);
  const [currentChatHead, setCurrentChatHead] = useState(null);
  const [currentChatHeadProfile, setCurrentChatHeadProfile] = useState(null);
  const [currentChatHeadLastActivity, setCurrentChatHeadLastActivity] =
    useState(null);
  const [currentChatChannel, setCurrentChatChannel] = useState(null);
  const [page, setPage] = useState(10);
  const [loadChat, setLoadChat] = useState(false);

  const navigate = useNavigate();
  const user = useLoggedInUser();

  const isPatient = user?.role === roleTypes.patient;

  const NewChatWindow = (
    chatId,
    channelId,
    receiverId,
    chatHead,
    chatHeadProfileUrl,
    lastActivity
  ) => {
    setCurrentChatId(chatId);
    setCurrentChatToId(receiverId);
    setCurrentChatHead(chatHead);
    setCurrentChatHeadProfile(chatHeadProfileUrl);
    setCurrentChatHeadLastActivity(lastActivity);
    setCurrentChatChannel(channelId);

    setPage(10);
    setLoadChat(true);

    socket.emit("joinRoom", { room: channelId });

    navigate(
      generatePath(
        isPatient ? UI_ROUTES.singlePatientChat : UI_ROUTES.singleChat,
        {
          chatId: encrypt(String(chatId)),
        }
    )
    );
  };
  // const [user] = useAuthUser();
const [
  response,
  loading,
  chatPage,
  rowsPerPage,
  handlePageChange,
  filters,
  handleFilters,
  sort,
  handleSort,
  handleOnFetchDataList,
] = useQuery({
  listId: USER_CHAT_LIST,
  url: API_URL.chats,
  type: REQUEST_METHOD.get,
  subscribeSocket: true,
  fetchInitial:false,
});

useEffect(()=>{
  if(user){
    handleOnFetchDataList()
  }
},[user]);

  return <ChatContext.Provider value={{response,
    loading,
    chatPage,
    rowsPerPage,
    handlePageChange,
    filters,
    handleFilters,
    sort,
    handleSort,
    handleOnFetchDataList,
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
  }}>{children}</ChatContext.Provider>;
};

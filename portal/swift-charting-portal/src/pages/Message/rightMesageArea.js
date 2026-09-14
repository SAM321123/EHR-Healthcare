import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import { Avatar, Box, IconButton, Menu, MenuItem, TextField, Typography } from '@mui/material';
import EmojiPicker from 'emoji-picker-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import AlertDialog from 'src/components/AlertDialog';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import Loader from 'src/components/Loader';
import useAuthUser from 'src/hooks/useAuthUser';
import useCRUD from 'src/hooks/useCRUD';
import { getImageUrl } from 'src/lib/utils';
import { formatDate } from 'src/utils/formatTime';

const RightSideMessageArea = ({
  currentChatHead = '',
  currentChatHeadProfile='',
  currentChatHeadLastActivity,
  currentChatToId,
  currentChatId,
  handleMenuClick,
  anchorEl,
  socket,
  roomId,
  handleMenuClose,
  messagesLoading,
  messagesResponse = '',
  userId = '',
  dialogActions,
  showClearChatModel,
  handleClearChatModalVisibility,
  socketMessages,
  messageContainerRef,
  handleScroll,
  loadChat,
  setLoadChat,
  ...rest
}) => {
  const [loginData] = useAuthUser();
    const {file:currentUserProfile} = loginData || {}

    const [message, setMessage] = useState('');
    const [lastActivity, setLastActivity] = useState(null);

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isFetchingMoreMessages, setIsFetchingMoreMessages] = useState(false);
    const messagesEndRef = useRef(null);

    const [sendResponse, , sendLoading, callChatSendAPI,clearSendResponse] = useCRUD({
        id: 'SEND_CHAT_DATA',
        url: `${API_URL.chats}/${currentChatId}`, 
        type: REQUEST_METHOD.post,
    });

    console.log("🚀 ~ timer ~ currentChatHeadLastActivity:", currentChatHeadLastActivity,lastActivity)
    useEffect(()=>{
        setLastActivity(formatDate(currentChatHeadLastActivity));
        const timer = setInterval(()=>{
            setLastActivity(formatDate(currentChatHeadLastActivity));
        },1000*60)
        return ()=>{
            if(timer) clearInterval(timer)
        }
    },[currentChatHeadLastActivity])

    const handleSendClick = useCallback(() => {
        if (message.trim() && currentChatToId && roomId) {
            try {
                callChatSendAPI({
                    data: {
                        senderId: userId,
                        receiverId: currentChatToId,
                        message,
                        chatId: currentChatId,
                    },
                });
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                // socket.emit('sendMessage', { room: roomId, msg: message, userId, sentAt: new Date() });
                // setMessage('');
            } catch (error) {
                console.error('Failed to send message:', error);
            }
        }
    }, [message, currentChatToId, callChatSendAPI, userId, currentChatId, socket, roomId]);

     useEffect(() => {
        if (sendResponse && message) {
            try {
                socket.emit('sendMessage', { room: roomId, msg: message, userId, sentAt: new Date() });
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                setMessage('');
            } catch (error) {
                console.error('Failed to send message:', error);
            }
            clearSendResponse(true)
        }

    }, [message, currentChatToId, sendResponse, userId, currentChatId, socket, roomId]);


    const fetchOlderMessages = async () => {
        const currentScrollHeight = messageContainerRef.current.scrollHeight;
        
        setIsFetchingMoreMessages(true);
        // Simulate fetching older messages from API
        // await fetchMoreMessages(); // Call your actual API here
        setIsFetchingMoreMessages(false);
        
        // After fetching, calculate the new scroll position to keep scroller at the top
        const newScrollHeight = messageContainerRef.current.scrollHeight;
        messageContainerRef.current.scrollTop = newScrollHeight - currentScrollHeight;
        // messageContainerRef.current?.scrollIntoView({ behavior: 'smooth' });

    };

    const handleScrollWithLoading = (e) => {
        handleScroll(e);
        if (e.target.scrollTop === 0) {
            fetchOlderMessages();
        }
    };


    return (
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#fff', borderRadius: '20px', marginLeft: '15px' }}>
            
            {/* Chat window header */}
          <Box sx={{ borderBottom: '1px solid #ddd', padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {currentChatHead ? <Avatar src={getImageUrl(currentChatHeadProfile)} sx={{ marginRight: '10px' }} />: ''}
              <Box>
                <Typography variant="h6">{currentChatHead}</Typography>
                <Typography variant="body2" color="textSecondary">{currentChatHead ? lastActivity: ''}</Typography>
              </Box>
            </Box>
            <Box>
                    {/* {currentChatHead ? ( 
                      <IconButton onClick={(e) => {
                  e.stopPropagation(); // Prevents triggering ListItem's onClick
                  handleMenuClick(e,currentChatId);
                }}>
                        <MoreVertIcon />
                      </IconButton>
                    ) : ''} */}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                {/* <MenuItem onClick={handleMenuClose}>
                  <VisibilityIcon sx={{ marginRight: '10px' }} /> View Profile
                </MenuItem> */}
                <MenuItem onClick={handleClearChatModalVisibility}>
                  <DeleteOutlineIcon sx={{ marginRight: '10px' }} /> Clear Chat
                </MenuItem>
                {/* <MenuItem onClick={handleMenuClose}>
                  <PushPinIcon sx={{ marginRight: '10px' }} /> Pin
                </MenuItem> */}
              </Menu>
            </Box>
          </Box>
          <AlertDialog
          open={showClearChatModel}
          content="This chat will be empty but will remain in your chat list."
          actions={dialogActions}
        />
          

            {/* Chat messages area */}
            <Box
                sx={{ flexGrow: 1, overflowY: 'auto', padding: '20px', position: 'relative' }}
                ref={messageContainerRef}
                onScroll={handleScrollWithLoading}
                id="messagesContainer"
            >
                 
                {/* Loading Spinner for New Chat */}
                {messagesLoading ? (
                    <Box sx={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Loader type="circular" loading={messagesLoading} />
                    </Box>
                ) : null}

                {/* Loading Spinner at Top for Older Messages */}
                {isFetchingMoreMessages && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                        <Loader type="circular" loading={isFetchingMoreMessages} />
                    </Box>
                )}
                {/* This invisible div will always scroll into view
                <div ref={messageContainerRef} /> */}
                {roomId && (messagesResponse?.results?.length > 0 || socketMessages?.length > 0) ? (
                    <>
                        {/* Render fetched messages */}
                        {messagesResponse?.results?.slice().reverse().map((data, rowIndex) => {
                            const isSentByUser = userId === data?.senderId;
                            return (
                                <Box key={`message-${rowIndex}`} sx={{ marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: isSentByUser ? 'flex-end' : 'flex-start' }}>
                                    {!isSentByUser && <Avatar src={getImageUrl(currentChatHeadProfile)} sx={{ marginRight: '10px' }} />}
                                    <Box sx={{ textAlign: isSentByUser ? 'right' : 'left' ,maxWidth:'60%'}}>
                                        <Typography variant="body2" sx={{ backgroundColor: isSentByUser ? '#D1F3FF' : '#F6F8FB', padding: '10px', borderRadius: '10px' }}>
                                            {data?.messageText}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            {formatDate(data?.createdAt)}
                                        </Typography>
                                    </Box>
                                    {isSentByUser && <Avatar src={getImageUrl(currentUserProfile?.file)} sx={{ marginLeft: '10px' }} />}
                                </Box>
                            );
                        })}

                        {/* Render socket messages */}
                        {socketMessages?.map((data, rowIndex) => {
                            const isSentByUser = userId === data?.senderId;
                            return (
                                <Box key={`socket-${rowIndex}`} sx={{ marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: isSentByUser ? 'flex-end' : 'flex-start' }}>
                                    {!isSentByUser && <Avatar src={getImageUrl(currentChatHeadProfile)} sx={{ marginRight: '10px' }} />}
                                    <Box sx={{ textAlign: isSentByUser ? 'right' : 'left' }}>
                                        <Typography variant="body2" sx={{ backgroundColor: isSentByUser ? '#D1F3FF' : '#F6F8FB', padding: '10px', borderRadius: '10px' }}>
                                            {data?.msg}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            {formatDate(data?.sentAt)}
                                        </Typography>
                                    </Box>
                                    {isSentByUser && <Avatar src={getImageUrl(currentUserProfile?.file)} sx={{ marginLeft: '10px' }} />}
                                </Box>
                            );
                        })}
                    </>
                ) : (
                    <Typography sx={{ textAlign: 'center', height: '300px', lineHeight: '200px', fontWeight: 'bold' }}>
                        No messages.
                    </Typography>
                )}
                
                {/* This invisible div will always scroll into view */}
                <div ref={messagesEndRef} />
            </Box>

            {/* Message input area */}
            <Box sx={{ display: 'flex', alignItems: 'center', padding: '10px', borderTop: '1px solid #ddd', position: 'relative' }}>
                {currentChatToId && roomId ? (
                    <>
                        <TextField
                            fullWidth
                            placeholder="Aa"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => (e.key === 'Enter' && !sendLoading) ? handleSendClick():null}
                            sx={{ marginX: '10px', backgroundColor: '#F7FAFC', borderRadius: '25px' }}
                        />
                        <IconButton sx={{ color: '#A0AEC0' }} onClick={() => setShowEmojiPicker(prev => !prev)}>
                            <EmojiEmotionsIcon />
                        </IconButton>

                        {showEmojiPicker && (
                            <Box sx={{ position: 'absolute', bottom: '50px', right: '100px' }}>
                                <EmojiPicker onEmojiClick={(emojiObject) => setMessage(prev => prev + emojiObject.emoji)} />
                            </Box>
                        )}
                        <LoadingButton label={'Send'} loading={sendLoading} variant="contained" color="primary" sx={{ marginLeft: '10px' }}  onClick={handleSendClick}/>
                    </>
                ) : (
                    <Typography variant="body2" color="textSecondary" sx={{ padding: '10px' }}>
                        Please select a chat to start messaging
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

export default RightSideMessageArea;
 
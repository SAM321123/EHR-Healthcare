import { Avatar, Badge, Box, ListItem, ListItemAvatar, ListItemText } from '@mui/material'
import { useEffect, useState } from 'react'
import Typography from 'src/components/Typography'
import { getDateDiff, getFullName, getImageUrl } from 'src/lib/utils'
import { trimText } from 'src/utils/formatNumber'
import { chatFormatDate } from 'src/utils/formatTime'

const PersonTile = ({item,userId,NewChatWindow,currentChatId,chatId}) => {
    const [isActive,setIsActive ]= useState(false);

    const unReadMessage = item?.UnreadMessages?.filter(_item=>_item.receiverId===userId)?.length;

    useEffect(()=>{
            const lastActivity = item.senderId===userId? item?.Receiver?.staff?.user?.lastActivity ||item?.Receiver?.patient?.user?.lastActivity : item?.Sender?.staff?.user?.lastActivity ||item?.Sender?.patient?.user?.lastActivity;
            const timer = setInterval(()=>{
                const diff= getDateDiff(lastActivity,new Date(),{unit:'minutes'});
                if(diff<1){
                    setIsActive(true)
                }else{
                    setIsActive(false);
                }
            },1000)
        return ()=>{
            if(timer) clearInterval(timer)
        }    
    },[item?.Receiver?.patient?.user?.lastActivity, item?.Receiver?.staff?.user?.lastActivity, item?.Sender?.patient?.user?.lastActivity, item?.Sender?.staff?.user?.lastActivity, item.lastActivity, item.senderId, userId])

  return (
    <ListItem
        onClick={() =>
          userId === item?.senderId
            ? NewChatWindow(
                item?.id,
                item?.channelId,
                item?.receiverId,
                getFullName(item?.Receiver?.staff ||item?.Receiver?.patient),
                item?.Receiver?.staff?.file?.file ||item?.Receiver?.patient?.file?.file,
                item?.Receiver?.staff?.user?.lastActivity ||item?.Receiver?.patient?.user?.lastActivity,
              )
            : NewChatWindow(
                item?.id,
                item?.channelId,
                item?.senderId,
                getFullName(item?.Sender?.staff ||item?.Sender?.patient),
                item?.Sender?.staff?.file?.file ||item?.Sender?.patient?.file?.file,
                item?.Sender?.staff?.user?.lastActivity ||item?.Sender?.patient?.user?.lastActivity 


              )
        }
        className={`chatItem ${currentChatId==item?.id ? 'active' : ''}`}
      >
        <ListItemAvatar>
        <Box sx={{ position: 'relative', display: 'inline-block' }}>
            <Avatar 
              src={userId === item?.senderId
                ? getImageUrl(item?.Receiver?.staff?.file?.file ||item?.Receiver?.patient?.file?.file )
                : getImageUrl(item?.Sender?.staff?.file?.file ||item?.Sender?.patient?.file?.file ) 
              } 
            />
            {isActive && (
              <Box 
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: 10,
                  height: 10,
                  backgroundColor: 'green',
                  borderRadius: '50%',
                  border: '2px solid white', // Border to give the dot a clean look
                }}
              />
            )}
          </Box>
        </ListItemAvatar>
        <ListItemText
          primary={
            trimText(userId === item?.senderId
              ?getFullName(item?.Receiver?.staff ||item?.Receiver?.patient)
              :getFullName(item?.Sender?.staff ||item?.Sender?.patient))
          }
          secondary={trimText(item?.Messages?.[0]?.messageText || '', 25)}
          />
        <Box
          sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}
        >
          <Typography variant="caption" color="textSecondary">
          {item?.Messages?.[0]?.createdAt ? chatFormatDate(item?.Messages?.[0]?.createdAt || new Date()) : ''}

          </Typography>
          {(!!unReadMessage && (chatId !=item.id))&& <Box>
            <Badge badgeContent={unReadMessage} color={"primary"} />
          </Box>}
        </Box>
      </ListItem>
  )
}

export default PersonTile
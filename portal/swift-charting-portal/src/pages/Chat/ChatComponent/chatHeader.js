import React, { useCallback, useState, useContext } from 'react';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import Popover from '@mui/material/Popover';
import isEmpty from 'lodash/isEmpty';

import Box from 'src/components/Box';
import SearchInput from 'src/components/SearchInput';
import Typography from 'src/components/Typography';
import palette from 'src/theme/palette';
import Events from 'src/lib/events';
import { ChatContext } from 'src/context/chatContext';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import Loader from 'src/components/Loader';

const ChatHeader = ({
  color = '',
  isPatient = false,
  initial = '',
  firstName,
  lastName,
  practice = {},
  id = '',
  callTemplate = () => {},
  results,
  setTypeChat,
  templateListLoading = true,
  clearTemplate = () => {},
  templateList = {},
}) => {
  const [anchorElFirst, setAnchorElFirst] = useState(null);
  const openFirst = Boolean(anchorElFirst);
  const {
    historyList,
    selectedMember,
    onlineUsers,
    closeChatChannelResponseLoading,
  } = useContext(ChatContext);

  const isUserOnline = isPatient
    ? onlineUsers?.[practice?.id]
    : onlineUsers?.[selectedMember?.id];
  const name = practice?.name || '';
  const hostpitalInitial = name?.[0] || '';

  const handleClick = useCallback(
    (event) => {
      if (!isPatient) {
        callTemplate();
        setAnchorElFirst(event.currentTarget);
      }
    },
    [isPatient]
  );

  const handleClose = useCallback(() => {
    setAnchorElFirst(null);
    setTimeout(() => {
      clearTemplate(true);
    }, 1000);
  }, []);

  const handleChange = useCallback(
    (data) => {
      if (data && !isPatient) {
        callTemplate({ searchText: data });
      } else if (!isPatient) {
        callTemplate();
      }
    },
    [isPatient]
  );

  const handleMarkClosed = useCallback(() => {
    Events.trigger('closeChat');
  }, []);

  const handleClickListItem = useCallback((template) => {
    setTypeChat((pre) => `${pre} ${template?.template || ''}`);
    setAnchorElFirst(null);
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        border: '1px solid var(--accent-blue, #EAF0F7)',
        padding: '5px 12px',
        marginBottom: '5px',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box
          sx={{
            backgroundColor: color || 'var(--secondary-2, #9F47E3)',
            width: '45px',
            height: '45px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '22.5px',
          }}
        >
          <Typography
            style={{
              color: '#FFF',
              fontSize: '18px',
              fontStyle: 'normal',
              fontWeight: '400',
            }}
          >
            {!isPatient ? initial : hostpitalInitial}
          </Typography>
        </Box>
        <Box sx={{ paddingLeft: '20px', overflow: 'hidden' }}>
          <Typography
            sx={{ whiteSpace: 'noWrap', textTransform: 'capitalize' }}
          >
            {!isPatient ? `${firstName} ${lastName}` : `${practice?.name}`}
          </Typography>
          <Box sx={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <img
              src={
                isUserOnline
                  ? 'assets/icons/dot.svg'
                  : 'assets/icons/greyDot.svg'
              }
              alt="detail"
            />
            <Typography
              style={{
                color: isUserOnline ? '#5BD447' : palette.text.disabled,
                fontSize: '14px',
                fontStyle: 'normal',
                fontWeight: '300',
              }}
            >
              {isUserOnline ? 'Online' : 'Offline'}
            </Typography>
          </Box>
        </Box>
      </Box>
      {!isPatient ? (
        <Box
          sx={{
            display: 'flex',
            marginLeft: 'auto',
            gap: '24px',
            paddingLeft: '10px',
            alignItems: 'center',
          }}
        >
          {!historyList[selectedMember?.id]?.isClosed &&
          !historyList[selectedMember?.id]?.isAddedFromSearch &&
          historyList[selectedMember?.id] ? (
            <LoadingButton
              label="Close"
              onClick={handleMarkClosed}
              loading={closeChatChannelResponseLoading}
              sx={{ padding: 1, fontSize: '12px' }}
            />
          ) : null}

          <Box onClick={handleClick}>
            <img
              src="assets/icons/detail.svg"
              alt="detail"
              width={40}
              style={{ cursor: 'pointer' }}
            />
          </Box>

          <Popover
            id={id}
            open={openFirst}
            anchorEl={anchorElFirst}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                overflow: 'hidden',
                flexDirection: 'column',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  p: '9px',
                }}
              >
                <SearchInput
                  placeholder="Search Template"
                  name="searchText"
                  onChange={handleChange}
                  height="36px"
                />
              </Box>
              {!!results?.length && (
                <List
                  sx={{
                    width: '250px',
                    maxHeight: '300px',
                    overflow: 'auto',
                    flexGrow: 1,
                  }}
                >
                  {results?.map((template, index) => (
                    <>
                      <ListItem
                        key={template?.id}
                        disablePadding
                        onClick={() => handleClickListItem(template)}
                      >
                        <ListItemButton>
                          <Typography
                            sx={{
                              fontSize: '12px',
                              padding: '5px',
                              color: palette.grey[700],
                            }}
                          >
                            {template?.template}
                          </Typography>
                        </ListItemButton>
                      </ListItem>
                      {index + 1 !== results?.length ? (
                        <Divider variant="inset" sx={{ ml: 0 }} />
                      ) : null}
                    </>
                  ))}
                </List>
              )}

              {!templateListLoading &&
                !isEmpty(templateList) &&
                !results?.length && (
                  <Typography
                    sx={{
                      p: '40px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    No result found!
                  </Typography>
                )}
              {templateListLoading && (
                <Loader
                  type="circular"
                  loading={templateListLoading}
                  size={25}
                />
              )}
            </Box>
          </Popover>
        </Box>
      ) : null}
    </Box>
  );
};

export default ChatHeader;

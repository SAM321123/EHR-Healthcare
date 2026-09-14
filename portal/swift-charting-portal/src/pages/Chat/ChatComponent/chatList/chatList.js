/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
import React, { useEffect, useState, useCallback, useContext } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';
import isEmpty from 'lodash/isEmpty';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import Divider from '@mui/material/Divider';

import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import Box from 'src/components/Box';
import palette from 'src/theme/palette';
import { PATIENT_LIST } from 'src/store/types';
import { roleTypes } from 'src/lib/constants';
import useCRUD from 'src/hooks/useCRUD';
import Typography from 'src/components/Typography';
import { getUserRole } from 'src/lib/utils';
import WiredAutoComplete from 'src/wiredComponent/AutoComplete';
import CustomButton from 'src/components/CustomButton';
import { UI_ROUTES } from 'src/lib/routeConstants';
import { ChatContext } from 'src/context/chatContext';
import Events from 'src/lib/events';
import Loader from 'src/components/Loader';
import Chat from '..';

const ChatHistoryList = ({
  historyList = {},
  getRandomColor = () => {},
  closedChatList,
  handleChatUserChange = () => {},
  selectedMember,
}) => (
  <List sx={{ pt: 0 }}>
    {Object.entries(historyList)?.map((item, index) => {
      const [key, value] = item;
      const { patient = {}, seen, senderRole = '', isClosed } = value || {};
      const initial = `${patient?.firstName?.[0]?.toLocaleUpperCase()}${patient?.lastName?.[0]?.toLocaleUpperCase()}`;
      const color = getRandomColor(index);
      const notSeen =
        seen === false &&
        senderRole.toLocaleLowerCase() ===
          roleTypes.patient.toLocaleLowerCase();
      if (isClosed === closedChatList) {
        return null;
      }
      return (
        <>
          <ListItem
            key={patient?.id}
            disablePadding
            sx={{ maxWidth: '350px' }}
            onClick={() => handleChatUserChange(key, value)}
          >
            <ListItemButton
              sx={{ p: '10px 0px' }}
              selected={patient?.id === selectedMember?.id}
            >
              <Box
                sx={{
                  backgroundColor: color,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: `calc(50% + 3px)`,
                  mr: '5px',
                }}
              >
                <Typography
                  style={{
                    color: '#FFF',
                    fontSize: '16px',
                    fontStyle: 'normal',
                    fontWeight: '400',
                    padding: '8px',
                    minWidth: '40px',
                    textAlign: 'center',
                  }}
                >
                  {initial}
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontSize: '14px',
                  fontWeight: notSeen ? 'bold' : '',
                  maxWidth: '118px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {patient?.name}
              </Typography>
              {notSeen && (
                <Typography
                  sx={{
                    fontSize: '24px',
                    pl: 2,
                    fontWeight: 'bold',
                    color: '#c90606',
                  }}
                >
                  •
                </Typography>
              )}
            </ListItemButton>
          </ListItem>
          <Divider variant="inset" sx={{ ml: 0 }} />
        </>
      );
    })}
  </List>
);

const ToggleButton = ({
  label,
  leftRounded,
  rightRounded,
  isActive,
  handleToggleChange,
  ...restProps
}) => (
  <CustomButton
    label={label}
    size="small"
    onClick={handleToggleChange}
    variant={isActive ? 'secondary' : 'primary'}
    sx={{
      border: isActive ? `1px solid  ${palette.grey[300]}` : null,
      fontSize: '12px',
      borderTopLeftRadius: !leftRounded ? '5px' : 0,
      borderBottomLeftRadius: !leftRounded ? '5px' : 0,
      borderTopRightRadius: !rightRounded ? '5px' : 0,
      borderBottomRightRadius: !rightRounded ? '5px' : 0,
      borderRadius: 0,
    }}
    {...restProps}
  />
);

const ChatList = () => {
  const navigate = useNavigate();

  const {
    historyList,
    setHistoryList,
    selectedMember,
    setSelectedMember,
    closedChatList,
    setClosedChatList,
    scrollRef,
    getChannelHistoryListLoading,
  } = useContext(ChatContext);

  const [inputValue, setInputValue] = useState('');
  const userRole = getUserRole();

  const [, , , callApi] = useCRUD({
    id: PATIENT_LIST,
    url: API_URL.getPatients,
    type: REQUEST_METHOD.get,
  });

  const getRandomColor = (index) => {
    const hue = (index * 137.508) % 360; // Using the "golden angle" for color variation
    const saturation = 90; // You can adjust this value as needed
    const lightness = 50; // You can adjust this value as needed

    // Convert HSL to RGB
    const h = hue / 360;
    const s = saturation / 100;
    const l = lightness / 100;

    const hueToRgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const r = Math.round(hueToRgb(p, q, h + 1 / 3) * 255);
    const g = Math.round(hueToRgb(p, q, h) * 255);
    const b = Math.round(hueToRgb(p, q, h - 1 / 3) * 255);

    return `rgb(${r}, ${g}, ${b})`;
  };

  const navigateTo = (data) => {
    navigate(
      generatePath(UI_ROUTES.userChat, {
        id: data?.id,
      })
    );
  };
  const handleChange = useCallback((data) => {
    if (!isEmpty(data) && typeof data === 'object') {
      setInputValue(data);
      Events.trigger('filterList', data);
      navigateTo(data);
    }
  }, []);

  useEffect(() => {
    if (userRole !== roleTypes.patient) {
      callApi();
    }
    return () => {
      setSelectedMember({});
    };
  }, []);

  // eslint-disable-next-line no-unused-vars
  const handleChatUserChange = useCallback((key, value) => {
    setInputValue('');
    navigateTo({ id: key });
  }, []);

  const handleToggleChange = useCallback(() => {
    setClosedChatList((pre) => !pre);
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        backgroundColor: 'white',
        padding: '5px 10px',
        overflow: 'hidden',
        borderRadius: '10px',
        height: '100%',
      }}
    >
      {userRole !== roleTypes.patient && (
        <Box
          sx={{
            display: 'flex',
            width: '21%',
            minWidth: '183px',
            flexDirection: 'column',
            borderRight: `2px solid ${palette.grey[300]}`,
            pr: '8px',
          }}
        >
          <WiredAutoComplete
            url={API_URL.getPatients}
            label=""
            value={inputValue}
            placeholder="Search Patient "
            size="small"
            labelAccessor="name"
            valueAccessor="id"
            onChange={handleChange}
            freeSolo
            sx={{ mb: 1 }}
          />

          <Box sx={{ display: 'flex', mb: 1 }}>
            <ToggleButton
              label="Active"
              rightRounded
              isActive={!closedChatList}
              handleToggleChange={handleToggleChange}
              style={{ width: '100%' }}
            />
            <ToggleButton
              label="Closed"
              leftRounded
              isActive={closedChatList}
              handleToggleChange={handleToggleChange}
              style={{ width: '100%' }}
            />
          </Box>

          <div
            ref={scrollRef}
            style={{
              overflow: 'auto',
            }}
          >
            <ChatHistoryList
              closedChatList={closedChatList}
              historyList={historyList}
              handleChatUserChange={handleChatUserChange}
              getRandomColor={getRandomColor}
              selectedMember={selectedMember}
            />
            {getChannelHistoryListLoading && (
              <Loader
                type="circular"
                loading={getChannelHistoryListLoading}
                size={25}
              />
            )}
          </div>
        </Box>
      )}

      <Box sx={{ width: userRole === roleTypes.patient ? '100%' : '80%' }}>
        <Chat
          selectedMember={selectedMember}
          historyList={historyList}
          setHistoryList={setHistoryList}
        />
      </Box>
    </Box>
  );
};

export default ChatList;

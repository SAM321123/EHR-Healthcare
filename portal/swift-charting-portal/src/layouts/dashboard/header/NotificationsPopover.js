import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
// import { noCase } from 'change-case';
// @mui
import {
  Box,
  List,
  Badge,
  Avatar,
  Tooltip,
  Divider,
  Popover,
  Typography,
  IconButton,
  ListItemText,
  ListItemAvatar,
  ListItemButton,
} from '@mui/material';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import useCRUD from 'src/hooks/useCRUD';
import { notificationTypeToPathMapping, roleTypes } from 'src/lib/constants';
import InfiniteScrollListWrapper from 'src/components/List/InfiniteList';
import { getUserRole, onNotificationClick } from 'src/lib/utils';
// utils
import { isEmpty } from 'lodash';
import { fToNow } from '../../../utils/formatTime';
// components
import { Iconify } from '../../../components/iconify';
import bellBedge from 'src/assets/images/bellBadge.png'

const NotificationsList = ({
  data = [],
  handleClose = () => {},
  updateNotification = () => {},
}) => (
  isEmpty(data)?  <Typography padding= '20px' fontSize= '14px'>No notifcations </Typography>:
    <List disablePadding>
      {data.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          handleClose={handleClose}
          updateNotification={updateNotification}
        />
      ))}
    </List>
  );

export default function NotificationsPopover() {
  const [{ results: totalUnRead = [] } = {}, , , getUnreadNotificationCount] =
    useCRUD({
      id: 'unread-notifications-count',
      url: `${API_URL.notification}/getUnreadNotification`,
      type: REQUEST_METHOD.get,
      subscribeSocket: true,
    });

  const [updateResponse, , , updateNotification] = useCRUD({
    id: 'update-notification',
    url: `${API_URL.notification}`,
    type: REQUEST_METHOD.update,
  });

  useEffect(() => {
    getUnreadNotificationCount();
  }, [updateResponse]);

  const [open, setOpen] = useState(null);

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
  };

  const handleMarkAllAsRead = () => {
    updateNotification({}, `/markAllNotificationsRead`);
  };

  return (
    <>
      <IconButton
        color={open ? 'primary' : 'default'}
        onClick={handleOpen}
        sx={{ width: 40, height: 40 }}
      >
        <Badge badgeContent={totalUnRead?.length} color="error">
        <img src={bellBedge} width="21.83px" height="24px" alt="bell"/>
        </Badge>
      </IconButton>

      {open ? (
        <Popover
          open={Boolean(open)}
          anchorEl={open}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{
            sx: {
              mt: 1.5,
              ml: 0.75,
              width: 360,
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', py: 2, px: 2.5 }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle1">Notifications</Typography>
              {totalUnRead?.length > 0 && (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  You have {totalUnRead?.length} unread messages
                </Typography>
              )}
            </Box>

            {totalUnRead?.length > 0 && (
              <Tooltip title=" Mark all as read">
                <IconButton color="primary" onClick={handleMarkAllAsRead}>
                  <Iconify icon="eva:done-all-fill" />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          <Divider sx={{ borderStyle: 'dashed' }} />
          <InfiniteScrollListWrapper
            id="notifications-data"
            url={API_URL.notification}
            type={REQUEST_METHOD.get}
            totalUnRead={totalUnRead?.length}
            handleClose={handleClose}
            updateNotification={updateNotification}
            component={NotificationsList}
            subscribeSocket
          />
          {/* <Divider sx={{ borderStyle: 'dashed' }} />

        <Box sx={{ p: 1 }}>
          <CustomButton
            variant="secondary"
            fullWidth
            disableRipple
            label=" View All"
            sx={{
              color: palette.primary.main,
              fontWeight: 700,
            }}
          />
        </Box> */}
        </Popover>
      ) : null}
    </>
  );
}

// ----------------------------------------------------------------------

function renderContent(notification) {
  const title = (
    <Typography variant="subtitle2">
      {notification.title}
      <Typography
        component="span"
        variant="body2"
        sx={{ color: 'text.secondary' }}
      >
        &nbsp; {notification.message}
      </Typography>
    </Typography>
  );

  if (notification.type === 'order_placed') {
    return {
      avatar: (
        <img
          alt={notification.title}
          src="/assets/icons/ic_notification_package.svg"
        />
      ),
      title,
    };
  }
  if (notification.type === 'order_shipped') {
    return {
      avatar: (
        <img
          alt={notification.title}
          src="/assets/icons/ic_notification_shipping.svg"
        />
      ),
      title,
    };
  }
  if (notification.type === 'mail') {
    return {
      avatar: (
        <img
          alt={notification.title}
          src="/assets/icons/ic_notification_mail.svg"
        />
      ),
      title,
    };
  }
  if (notification.type === 'chat_message') {
    return {
      avatar: (
        <img
          alt={notification.title}
          src="/assets/icons/ic_notification_chat.svg"
        />
      ),
      title,
    };
  }
  return {
    avatar: notification.avatar ? (
      <img alt={notification.title} src={notification.avatar} />
    ) : null,
    title,
  };
}

// ----------------------------------------------------------------------
const NotificationItem = ({
  notification,
  handleClose = () => {},
  updateNotification = () => {},
}) => {
  const navigate = useNavigate();
  const { avatar, title } = renderContent(notification);
  const isPatient = getUserRole()===roleTypes.patient;

  return (
    <ListItemButton
      sx={{
        py: 1.5,
        px: 2.5,
        mt: '1px',
        ...(notification.isRead && {
          bgcolor: 'action.selected',
        }),
      }}
      onClick={() => {
        const handleOnClick =
          onNotificationClick[
            notificationTypeToPathMapping[notification?.type]
          ];
        handleOnClick?.(notification?.data, navigate,isPatient);
        if (!notification?.isRead) {
          updateNotification({data:notification?.data}, `/${notification?.id}`);
        }
        handleClose();
      }}
    >
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: 'background.neutral' }}>{avatar}</Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={title}
        secondary={
          <Typography
            variant="caption"
            sx={{
              mt: 0.5,
              display: 'flex',
              alignItems: 'center',
              color: 'text.disabled',
            }}
          >
            <Iconify
              icon="eva:clock-outline"
              sx={{ mr: 0.5, width: 16, height: 16 }}
            />
            {fToNow(notification.createdAt)}
          </Typography>
        }
      />
    </ListItemButton>
  );
};

NotificationItem.defaultProps = {
  notification: {
    createdAt: new Date(),
    id: '',
    isRead: false,
    title: '',
    message: '',
    type: '',
    avatar: null,
  },
};

NotificationItem.propTypes = {
  notification: PropTypes.shape({
    createdAt: PropTypes.instanceOf(Date),
    id: PropTypes.string,
    isRead: PropTypes.bool,
    title: PropTypes.string,
    message: PropTypes.string,
    type: PropTypes.string,
    avatar: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  }),
};

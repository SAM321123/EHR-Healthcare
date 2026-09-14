import capitalize from 'lodash/capitalize';
import Close from '@mui/icons-material/Close';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';

import FabButton from 'src/components/FabButton';
import Typography from 'src/components/Typography';
import { roleTypes } from 'src/lib/constants';

const Participants = ({
  participants = [],
  containerStyle = {},
  setShowSendInvite = () => {},
  setShowParticipants = () => {},
  participantProfilePics = {},
  userRole = '',
}) => (
  <div id="participantsContainer" style={{ ...containerStyle }}>
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            color: '#303030',
            fontFamily: 'Poppins',
            fontSize: 18,
            fontStyle: 'normal',
            fontWeight: 500,
            lineHeight: 'normal',
          }}
        >
          Participants
        </div>
        {userRole !== roleTypes.patient ? (
          <div style={{ paddingLeft: 8 }}>
            <FabButton
              key="addPaticipant"
              onClick={() => setShowSendInvite(true)}
              style={{ height: 26, width: 26, margin: 0, minHeight: 24 }}
              iconWidth={20}
            />
          </div>
        ) : null}
      </div>
      <IconButton
        style={{
          backgroundColor: '#337AB7',
          color: '#FFF',
          borderRadius: 4,
          fontSize: '0.8rem',
          height: 24,
          width: 24,
        }}
        onClick={() => setShowParticipants(false)}
      >
        <Close
          style={{
            height: 24,
            width: 24,
          }}
        />
      </IconButton>
    </div>
    <div
      style={{
        border: '1px solid rgb(218,220,224)',
        borderRadius: 8,
        padding: 10,
        marginTop: 10,
        height: '70%',
        overflow: 'auto',
      }}
    >
      <div
        style={{
          color: '#303030',
          fontFamily: 'Poppins',
          fontSize: 16,
          fontStyle: 'normal',
          fontWeight: 500,
          lineHeight: 'normal',
        }}
      >
        In Meeting
      </div>
      <List
        sx={{
          width: '100%',
          maxWidth: 360,
          bgcolor: 'background.paper',
        }}
      >
        {participants.map((participant, index) => {
          let { data } = participant?.connection || {};
          data = JSON.parse(data);
          const { userId = '', fullName = '', role = '' } = data || {};
          return (
            <>
              <ListItem
                alignItems="flex-start"
                key={`${userId}_${role}`}
                sx={{ pl: 0 }}
              >
                <ListItemAvatar>
                  <Avatar
                    alt={fullName}
                    src={participantProfilePics[`${userId}_${role}`]}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={fullName}
                  secondary={
                    <Typography
                      sx={{ display: 'inline' }}
                      component="span"
                      variant="body2"
                      color="text.secondary"
                    >
                      ({capitalize(role)})
                    </Typography>
                  }
                />
              </ListItem>
              {index + 1 !== participants?.length ? (
                <Divider variant="inset" component="li" />
              ) : null}
            </>
          );
        })}
      </List>
    </div>
  </div>
);

export default Participants;

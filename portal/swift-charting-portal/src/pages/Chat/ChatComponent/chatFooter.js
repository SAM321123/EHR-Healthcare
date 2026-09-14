import React, { useCallback, useMemo, useRef, useState } from 'react';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import Popover from '@mui/material/Popover';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import debounce from 'lodash/debounce';

import Box from 'src/components/Box';
import {
  bytesToMB,
  getFileType,
  showSnackbar,
  uploadImage,
} from 'src/lib/utils';
import Typography from 'src/components/Typography';
import palette from 'src/theme/palette';
import Loader from 'src/components/Loader';
import { fileInfo } from 'src/lib/constants';

const useStyles = makeStyles(() =>
  createStyles({
    customTextField: {
      backgroundColor: '#EAF0F7',
      borderRadius: '50px',
      '& .MuiInputBase-root': {
        fontSize: '14px',
      },
      '& .MuiOutlinedInput-root': {
        '& fieldset': {
          borderRadius: '50px',
          border: 'none',
        },
      },
    },
  })
);

const ChatFooter = ({
  typeChat,
  isPatient = false,
  callTemplate = () => {},
  setTypeChat,
  user = '',
  practice = {},
  onSend = () => {},
  setIsNewMessage,
  templateListLoading = true,
  clearTemplate = () => {},
  templateList = {},
  results,
  loginData = {},
  patientData = {},
  id
}) => {
  const classes = useStyles();
  const [popoverPosition, setPopoverPosition] = useState({});
  const [anchorElSecond, setAnchorElSecond] = useState(null);
  const [fileLoading, setFileLoading] = useState(false);
  const inputRef = useRef(null);
  const inputFile = useRef(null);
  const openSecond = Boolean(anchorElSecond);
  const { name, firstName, lastName, role } = loginData || {};

  const onSearch = useCallback(
    (searchValue, target) => {
      const match = searchValue.match(/@(\w+)$/);
      if (match && match?.[1]?.length) {
        const data = { searchText: match?.[1] };
        callTemplate(data);
        setAnchorElSecond(target);
      }
    },
    [callTemplate]
  );

  const debounceValidation = useMemo(
    () => debounce(onSearch, 1000),
    [onSearch]
  );

  const handleInputChange = useCallback(
    (event) => {
      const target = event.currentTarget;
      const { value } = event.target;
      const clientRect = inputRef.current.getBoundingClientRect();
      const rectLeftValue = clientRect?.x;
      const rectTopValue = clientRect?.y;
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const font = '14px';
      context.font = font;
      const width = context?.measureText(value).width;
      const formattedWidth = Math.ceil(width);
      const left = formattedWidth + rectLeftValue;
      const top = rectTopValue;
      setPopoverPosition({ top, left });
      if (!isPatient) {
        debounceValidation(value, target);
      }
      setTypeChat(event.target.value);
    },
    [isPatient]
  );

  const handleFile = () => {
    inputFile.current.click();
  };

  const handleFileChange = useCallback(
    async (file) => {
      const isGreaterSize = bytesToMB(file.size) > 20;
      if (isGreaterSize) {
        showSnackbar({
          message: 'File size exceeds 20MB',
          severity: 'error',
        });
        return;
      }

      if (file) {
        setFileLoading(true);
        const uploadResponse = await uploadImage(file, {}, true);
        setFileLoading(false);
        setIsNewMessage(true);
        const payload = {
          fileName: uploadResponse.name,
          fileType: uploadResponse.mimetype,
          fileUrl: uploadResponse.file,
          thumbnail: uploadResponse.thumbnail,
          user: isPatient ? user : practice?.id,
          senderName: name || `${firstName} ${lastName}`,
          id: Date.now(),
          createdOn: Date.now(),
          messageType: getFileType(uploadResponse),
        };
        onSend([payload]);
      }
    },
    [isPatient, user, practice?.id, name, firstName, lastName, onSend]
  );

  const sendMessage = useCallback(() => {
    setIsNewMessage(true);
    onSend([
      {
        text: typeChat?.trim(),
        user: isPatient ? user : practice?.id,
        senderName: name || `${firstName} ${lastName}`,
        createdOn: Date.now(),
        _id: Date.now(),
      },
    ]);
  }, [name, typeChat, user, firstName, lastName, isPatient, practice, role]);

  const handleClose = useCallback(() => {
    clearTemplate(true);
    setAnchorElSecond(null);
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (typeChat) {
          sendMessage();
        }
      }
    },
    [typeChat]
  );

  const handleClickListItem = useCallback((template) => {
    setTypeChat(
      (pre) => `${pre.replace(/@\w+$/, '')} ${template?.template || ''}`
    );
    setAnchorElSecond(null);
    clearTemplate(true);
  }, []);

  return (
    <>
      {!isPatient && !templateListLoading && templateList?.results?.length ? (
        <Popover
          open={openSecond}
          anchorEl={anchorElSecond}
          anchorReference="anchorPosition"
          anchorPosition={popoverPosition}
          onMouseDown={(event) => event.preventDefault()} // Prevent the mousedown event from causing the input to lose focus
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          <List>
            {results?.map((template, index) => (
              <>
                <ListItem
                  key={template?.id}
                  disablePadding
                  sx={{ maxWidth: '350px' }}
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
        </Popover>
      ) : null}
      <TextField
        id="outlined-multiline-flexible"
        multiline
        maxRows={4}
        className={classes.customTextField}
        value={typeChat}
        onChange={handleInputChange}
        placeholder="Type message..."
        ref={inputRef}
        onKeyDown={handleKeyDown}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Box
                sx={{
                  cursor: 'pointer',
                }}
                onClick={handleFile}
              >
                <img src="assets/icons/upload.svg" alt="upload" />
                <input
                  hidden
                  accept="image/*, application/pdf"
                  multiple
                  type="file"
                  onChange={(e) => {
                    const fileData = e.target.files[0];
                    if(fileData){

                    fileData.fileInfo = isPatient?{type: fileInfo.CHAT, patient:id  }:{type: fileInfo.CHAT, patient:patientData?.id  };
                    }
                    // eslint-disable-next-line no-unused-expressions
                    fileData && handleFileChange(fileData);
                  }}
                  ref={inputFile}
                />
              </Box>
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment>
              <Box
                sx={{
                  cursor: 'pointer',
                }}
                id="send"
                onClick={() => {
                  // eslint-disable-next-line no-unused-expressions
                  typeChat && sendMessage();
                }}
              >
                <img src="assets/icons/send.svg" alt="send" />
              </Box>
            </InputAdornment>
          ),
        }}
      />
      {fileLoading && <Loader loading={fileLoading} />}
    </>
  );
};

export default ChatFooter;

/* eslint-disable no-nested-ternary */
import React, { useCallback, useState } from 'react';
import Link from '@mui/material/Link';
import CloseIcon from '@mui/icons-material/Close';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

import Box from 'src/components/Box';
import Loader from 'src/components/Loader';
import Typography from 'src/components/Typography';
import Modal from 'src/components/modal';
import {
  convertWithTimezone,
  downloadFile,
  downloadPdf,
  getImageUrl,
  showSnackbar,
  time12hr,
} from 'src/lib/utils';
import palette from 'src/theme/palette';

const PdfComponent = ({ file, patientData, id, isPatient }) =>
   (
    <Box sx={{ display: 'flex', gap: '5px' }}>
      <PictureAsPdfIcon
        style={{
          color: 'red',
        }}
      />
      <Typography
        sx={{
          fontSize: '16px',
          overflow: 'hidden',
          maxWidth: '200px',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}
      >
        {file?.fileName}
      </Typography>
      <FileDownloadIcon
        style={{
          color: palette.primary.main,
          marginLeft: '5px',
          cursor: 'pointer',
        }}
        onClick={() => {
          if (isPatient)
            downloadPdf(
              getImageUrl(`${id}/${file?.fileName}`, { isPatientFile: true }),
              file?.fileName
            );
          else
            downloadPdf(
              getImageUrl(`${patientData}/${file?.fileName}`, {
                isPatientFile: true,
              }),
              file?.fileName
            );
        }}
      />
    </Box>
  );

const ChatBody = ({
  scrollAreaRef,
  loading,
  startTime,
  loadEarlierMessages = () => {},
  chatData,
  user = '',
  isPatient,
  practice,
  patientId,
  id,
}) => {
  const [imagePreview, showImagePreview] = useState(false);

  const handleScroll = useCallback(() => {
    const element = scrollAreaRef?.current;

    if (element) {
      const { scrollTop } = element;
      if (scrollTop <= 10 && startTime) {
        loadEarlierMessages();
      }
    }
  }, [scrollAreaRef, startTime]);

  const HeaderComponent = useCallback(
    (file) => (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingLeft: 2,
          paddingRight: 2,
        }}
      >
        <Box
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          onClick={() => {
            showSnackbar({
              message: 'Downloading...',
              severity: 'success',
            });
            if (isPatient) {
              downloadFile(
                { fileUrl: file?.fileUrl, patient: id },
                `${id}/${file?.name}`
              );
            } else
              downloadFile(
                { fileUrl: file?.fileUrl, patient: patientId },
                `${patientId}/${file?.name}`
              );
          }}
        >
          <Link
            sx={{
              fontSize: '16px',
              overflow: 'hidden',
              maxWidth: '200px',
              textOverflow: 'ellipsis',
            }}
          >
            {file?.name}
          </Link>
          <FileDownloadIcon
            size="small"
            style={{
              fontSize: '16px',
              color: palette.primary.main,
              marginLeft: '5px',
            }}
          />
        </Box>
        <CloseIcon
          size="small"
          style={{
            cursor: 'pointer',
            fontSize: '16px',
            marginLeft: '10px',
          }}
          onClick={() => {
            showImagePreview(false);
          }}
        />
      </Box>
    ),
    []
  );

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        paddingRight: '20px',
        flexDirection: 'column',
      }}
      ref={scrollAreaRef}
      onScroll={handleScroll}
    >
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Loader type="circular" size={15} loading={loading} />
        </Box>
      )}
      {chatData?.map?.((message, index) => {
        const currUser = message?.user === (isPatient ? user : practice?.id);
        const isChatClosed = message?.isChatClosed;
        const msgTime = convertWithTimezone(message?.createdOn);
        const time = time12hr(msgTime);

        if (!message) return;
        const url = isPatient
          ? getImageUrl(`${id}/${message?.fileName}`, { isPatientFile: true })
          : getImageUrl(`${patientId}/${message?.fileName}`, {
              isPatientFile: true,
            });
        const thumbnail = isPatient
          ? getImageUrl(`Thumbnail/${id}/${message?.fileName}`, {
              isPatientFile: true,
            })
          : getImageUrl(`Thumbnail/${patientId}/${message?.fileName}`, {
              isPatientFile: true,
            });
        const isPdf = message?.fileType === 'application/pdf';
        // eslint-disable-next-line consistent-return
        return (
          <Box
            key={index}
            sx={{
              maxWidth: 'max-content',
              width: isChatClosed ? '380px' : '304px',
              background: isChatClosed
                ? palette.grey[200]
                : !currUser
                ? 'rgba(27, 27, 27, 0.03)'
                : 'var(--accent-blue, #EAF0F7)',
              padding: isChatClosed ? '11px' : !thumbnail ? '14px' : '7px',
              paddingBottom: thumbnail && '2px',
              marginBottom: '6px',
              borderRadius: isChatClosed
                ? '50px'
                : !currUser
                ? '2px 10px 10px 10px'
                : '10px 10px 10px 2px',
              wordWrap: 'break-word',

              color: isChatClosed ? palette.grey[700] : '#303030',
              fontWeight: '400',
              alignSelf: isChatClosed
                ? 'center'
                : !currUser
                ? 'flex-start'
                : 'flex-end',
              marginTop: index === 0 && 'auto',
              textAlign: isChatClosed && 'center',
            }}
          >
            {!isChatClosed ? (
              <Box sx={{ display: 'flex' }}>
                <Typography
                  sx={{
                    fontWeight: '600',
                    fontSize: '13px',
                    textTransform: 'capitalize',
                    maxWidth: '230px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {message?.senderName}
                </Typography>
              </Box>
            ) : null}

            {!message?.fileType ? (
              <Box
                sx={{
                  fontSize: isChatClosed ? '12px' : '13px',
                  letterSpacing: '-0.14px',
                  fontStyle: isChatClosed ? 'italic' : '',
                }}
              >
                {message?.text}
              </Box>
            ) : !isPdf ? (
              <>
                {imagePreview?.show && (
                  <Modal
                    open={imagePreview?.show}
                    headerComponent={() => HeaderComponent(imagePreview)}
                    onClose={() => showImagePreview(false)}
                  >
                    <Box sx={{ pl: 2, pr: 2, pt: 1 }}>
                      <img src={imagePreview?.url} alt="img" />
                    </Box>
                  </Modal>
                )}
                <Box
                  onClick={() =>
                    showImagePreview({
                      show: true,
                      url,
                      name: message?.fileName,
                      fileUrl: message?.fileUrl,
                    })
                  }
                >
                  <Box
                    style={{
                      cursor: 'pointer',
                      paddingBottom: '4px',
                      paddingTop: '5px  ',
                      height: '170px',
                    }}
                  >
                    <img
                      src={thumbnail}
                      alt="img"
                      style={{
                        objectFit: 'contain',
                        height: '100%',
                      }}
                    />
                  </Box>
                </Box>
              </>
            ) : (
              <PdfComponent
                file={message}
                patientData={patientId}
                id={id}
                isPatient={isPatient}
              />
            )}
            {!isChatClosed ? (
              <Box
                sx={{
                  fontSize: '11px',
                  textAlign: 'right',
                  pl: '38px',
                }}
              >
                {time}
              </Box>
            ) : null}
          </Box>
        );
      })}
    </div>
  );
};

export default ChatBody;

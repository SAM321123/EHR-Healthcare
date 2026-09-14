import React, { useCallback } from 'react';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';

import Box from 'src/components/Box';
import Container from 'src/components/Container';
import CustomButton from 'src/components/CustomButton';
import Typography from 'src/components/Typography';
import palette from 'src/theme/palette';
import { copyWidgetLink } from 'src/lib/utils';
import { UI_ROUTES } from 'src/lib/routeConstants';
import useAuthUser from 'src/hooks/useAuthUser';

const BookingWidget = (props) => {
  const { serviceId } = props;
  const [userData] = useAuthUser();
  const practiceId = userData?.practice?.id;
  const url = `${window.location.origin}/${
    UI_ROUTES.bookings
  }?practiceId=${practiceId}${serviceId ? `&serviceId=${serviceId}` : ``}`;

  const onCopy = useCallback(() => {
    copyWidgetLink(url);
  }, [url]);

  return (
    <Container
      sx={{
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `0px 0px 6px rgba(0, 0, 0, 0.15)`,
        backgroundColor: palette.background.paper,
      }}
    >
      <Box
        sx={{
          backgroundColor: palette.background.paper,
        }}
      >
        <Box sx={{ p: 4 }}>
          <Typography sx={{ fontWeight: '600', mb: 1, fontSize: '15px' }}>
            Your website doesn&apos;t allow custom javascript? Use a button
            instead
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              alt="Make an Online Appointment"
            >
              <img
                src="/assets/images/booknow.png"
                alt=""
                width="120px"
                height="35px"
                style={{
                  objectFit: 'cover',
                  marginBottom: '15px',
                }}
              />
            </a>

            <Typography sx={{ mb: 2, fontSize: '14px' }}>
              Copy and Paste the code below in the html view of your website
              editor:
            </Typography>
            <Box
              style={{
                width: '100%',
                fontSize: '13px',
                wordBreak: 'break-all',
                backgroundColor: '#eeeeee',
                padding: '9px',
                borderRadius: '3px',
                color: '#555555',
                border: '1px solid #ccc',
                borderColor: '#cccccc !important',
                marginBottom: '27px',
              }}
            >
              {`<a href=${url} target="_blank" alt="Make an Online Appointment" rel="noreferrer"><img height="50" width="162s" style="object-fit:cover" src="${window.location.origin}/assets/images/booknow.png"/></a>`}
            </Box>
          </Box>
          <Box>
            <Typography sx={{ fontWeight: '600', mb: 1, fontSize: '15px' }}>
              Don&apos;t have website?
            </Typography>
            <Divider />
            <Typography sx={{ fontSize: '14px', mb: 1, mt: 3 }}>
              You can use the link below as your personal booking page. Send it
              to your clients and/or put it on other websites.
            </Typography>
            <Link
              sx={{ fontSize: '12px', wordBreak: 'break-all' }}
              href={url}
              target="_blank"
            >
              {url}
            </Link>
          </Box>
          <CustomButton
            sx={{ mt: 3, fontSize: '12px', p: 2 }}
            size="small"
            variant="outlined"
            onClick={onCopy}
          >
            Copy Link
          </CustomButton>
        </Box>
      </Box>
    </Container>
  );
};

export default BookingWidget;

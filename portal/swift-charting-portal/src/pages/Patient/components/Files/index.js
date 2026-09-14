import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import FolderIcon from '@mui/icons-material/Folder';

import Container from 'src/components/Container';
import BackIcon from 'src/assets/images/svg/back.svg';
import Box from 'src/components/Box';
import Typography from 'src/components/Typography';
import { formTypeName, formTypes } from 'src/lib/constants';
import palette from 'src/theme/palette';
import OpenDucuments from './OpenDocuments';
import { GridItem } from './GridItem';

function PatientFiles() {
  const params = useParams();
  const [fileView, setFileView] = useState('all');
  const onDirectoryClick = (type) => {
    setFileView(type);
  };
  return (
    <div style={{ marginTop: 10 }}>
      <Container sx={{ marginTop: 100 }}>
        {fileView !== 'all' ? (
          <div>
            <Box sx={{ display: 'flex', mt: 1, mb: 2, alignItems: 'center' }}>
              <IconButton
                variant="secondary"
                sx={{
                  boxShadow: 'none',
                  padding: 0,
                  minWidth: 'unset',
                  backgroundColor: 'transparent',
                  borderRadius: '50%',
                }}
                onClick={() => onDirectoryClick('all')}
              >
                <img
                  src={BackIcon}
                  alt="back"
                  style={{
                    cursor: 'pointer',
                    padding: '6px',
                    width: 30,
                    height: 30,
                  }}
                />
              </IconButton>
              <Typography>{formTypeName[fileView]}</Typography>
            </Box>
            <Grid
              container
              spacing={{ xs: 1, lg: 2, md: 2, sm: 1 }}
              sx={{ mt: 100 }}
            >
              <OpenDucuments
                patientData={params}
                fileType={fileView}
                setFileView={setFileView}
              />
            </Grid>
          </div>
        ) : (
          <Grid
            container
            spacing={{ xs: 1, lg: 2, md: 2, sm: 1 }}
            sx={{ mt: 100, p: 2 }}
            alignItems="flex-end"
          >
            <GridItem
              label="Consent Form"
              customIcon={
                <FolderIcon color="primary" sx={{ fontSize: '46px' }} />
              }
              onClick={() => onDirectoryClick(formTypes.consent)}
              style={{
                backgroundColor: 'transparent',
                padding: 0,
                alignItems: 'center',
              }}
              labelStyle={{
                color: palette.grey[700],
                textAlign: 'center',
                fontSize: '0.8rem',
                wordWrap: 'unset',
                whiteSpace: 'nowrap',
                mx: 0,
              }}
              iconStyle={{
                borderRadius: '12px',
                color: palette.primary,
              }}
              showDate={false}
            />
            <GridItem
              label="Intake Form"
              customIcon={
                <FolderIcon color="primary" sx={{ fontSize: '46px' }} />
              }
              onClick={() => onDirectoryClick(formTypes.intake)}
              style={{
                backgroundColor: 'transparent',
                padding: 0,
                alignItems: 'center',
              }}
              labelStyle={{
                color: palette.grey[700],
                textAlign: 'center',
                fontSize: '0.8rem',
                wordWrap: 'unset',
                mx: 0,
              }}
              iconStyle={{
                borderRadius: '12px',
                color: palette.primary,
              }}
              showDate={false}
            />
            <OpenDucuments fileType={fileView} patientData={params} />
          </Grid>
        )}
      </Container>
    </div>
  );
}

export default PatientFiles;

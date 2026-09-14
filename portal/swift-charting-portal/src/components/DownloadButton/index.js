import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from '../Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { serverDownload } from 'src/api/server';

const DownloadButton = ({
  label = 'Download To CSV',
  url = 'admin/clinic-staff-csv',
  fileName = 'staff-data.csv',
  confirmTitle = 'Confirm Download',
  confirmMessage = 'Do you want to proceed?',
  filtersParsed = {},
}) => {
  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [response, setResponse] = useState(null);
  const loadingState = false;

  /* ✅ DOWNLOAD WHEN CSV RESPONSE ARRIVES */
  useEffect(() => {
    if (!downloading) return;
    if (!response || typeof response !== 'string') return;

    const blob = new Blob([response], {
      type: 'text/csv;charset=utf-8;',
    });

    const downloadUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

    setDownloading(false);
    setOpen(false);
  }, [response, downloading, fileName]);

  const handleConfirm = async () => {
    try {
      setDownloading(true);
      const params = { ...filtersParsed };
      const resp = await serverDownload({
        url,
        method: 'GET',
        params,
        responseType: 'text',
      });
      // axios returns response.data as text
      setResponse(resp.data || resp);
    } catch (err) {
      // fall back: stop downloading and close
      setDownloading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <Button
        actionLabel={label}
        style={{ height: 46 }}
        onClick={() => setOpen(true)}
        disabled={loadingState || downloading}
      />

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{confirmTitle}</DialogTitle>

        <DialogContent>
          <DialogContentText>
            {confirmMessage}
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button actionLabel="Cancel" onClick={() => setOpen(false)} />
          <Button
            actionLabel={downloading ? 'Downloading...' : 'Confirm'}
            onClick={handleConfirm}
            disabled={downloading}
          />
        </DialogActions>
      </Dialog>
    </>
  );
};

DownloadButton.propTypes = {
  label: PropTypes.string,
  url: PropTypes.string,
  fileName: PropTypes.string,
  confirmTitle: PropTypes.string,
  confirmMessage: PropTypes.string,
  filtersParsed: PropTypes.instanceOf(Object),
};

export default DownloadButton;

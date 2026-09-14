import { useEffect, useState } from 'react';
import AlertDialog from 'src/components/AlertDialog';
import Events from 'src/lib/events';
import palette from 'src/theme/palette';

const ConfirmDialog = () => {
  const [open, setOpen] = useState(false);
  const [content, setMessage] = useState('Are you sure you want to delete?');
  const [dialogActions, setDialogActions] = useState([]);

  useEffect(() => {
    Events.on(
      'showConfirmDialog',
      'showConfirmDialog',
      ({ data, confirmAction, message }) => {
        setOpen(true);
        if (message?.length) setMessage(message);
        setDialogActions([
          {
            title: 'Cancel',
            action: () => setOpen(false),
            actionStyle: { color: palette.common.black, padding: '8px' },
            variant: 'secondary',
          },
          {
            title: 'Confirm',
            action: () => confirmAction({ data, close: setOpen }),
            actionStyle: { color: palette.primary.main, padding: '8px' },
            variant: 'secondary',
          },
        ]);
      }
    );
  }, []);

  return <AlertDialog open={open} content={content} actions={dialogActions} />;
};

export default ConfirmDialog;

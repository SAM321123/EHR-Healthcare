import { useState } from 'react';
import './recording-ask-modal.scss';
import { Modal } from '@mui/material';

const IsoRecordingModal = (props) => {
  const [visible, setVisible] = useState(true);
  const { onClick, onCancel } = props;
  return (
    <Modal
      open={visible}
      className="recording-iso-ask-dialog"
      title="ISO Recording Asking"
      okText="Accept"
      onOk={async () => {
        await onClick();
        setVisible(false);
      }}
      onCancel={async () => {
        await onCancel();
        setVisible(false);
      }}
      destroyOnClose
    >
      Do you want you allow Individual Cloud recording mode?
    </Modal>
  );
};

export default IsoRecordingModal;

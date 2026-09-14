import { CRCReturnCode } from '@zoom/videosdk';
import classNames from 'classnames';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import ZoomMediaContext from '../../../context/media-context';
import ZoomContext from '../../../context/zoom-context';
import { getCRCCallStatus } from '../video-constants';
import './call-out-modal.scss';
import Modal from 'src/components/modal';

const CRCCallOutModal = (props) => {
  const { visible, setVisible } = props;
  const zmClient = useContext(ZoomContext);
  const { mediaStream } = useContext(ZoomMediaContext);
  const form = useForm();
  const [status, setStatus] = useState(-1);
  const onCrcStatusChange = useCallback((payload) => {
    const { code, ip, protocol, uuid } = payload;
    setStatus(code);
  }, []);
  useEffect(() => {
    zmClient.on('crc-call-out-state-change', onCrcStatusChange);
    return () => {
      zmClient.off('crc-call-out-state-change', onCrcStatusChange);
    };
  }, [zmClient, onCrcStatusChange]);
  return (
    <Modal
      open={visible}
      className="join-by-phone-dialog"
      title="Call a H.323/SIP Room System"
      okText="Call"
      onOk={async () => {
        try {
          const data = await form.validateFields();
          const { ip, protocol } = data;
          mediaStream?.callCRCDevice(ip, protocol);
        } catch (e) {
          console.warn(e);
        }
      }}
      onCancel={async () => {
        if (status === CRCReturnCode.Ringing) {
          const { ip, protocol } = await form.validateFields();
          mediaStream?.cancelCallCRCDevice(ip, protocol);
        }
        setVisible(false);
      }}
      destroyOnClose
    >
      {/* <Form form={form} name="call-out-form">
        <Form.Item label="H.323/SIP Room System" name="ip" required>
          <Input className="ip" placeholder="IP Address" />
        </Form.Item>
        <Form.Item name="protocol" valuePropName="checked" required>
          <RadioGroup defaultValue={1}>
            <Radio value={1}>H323</Radio>
            <Radio value={2}>SIP</Radio>
          </RadioGroup>
        </Form.Item>
      </Form> */}
      {status !== -1 && (
        <div className="phone-call-status">
          CRC call status:
          <span className={classNames('status-text', getCRCCallStatus(status)?.type)}>
            {getCRCCallStatus(status)?.text}
          </span>
        </div>
      )}
    </Modal>
  );
};

export default CRCCallOutModal;

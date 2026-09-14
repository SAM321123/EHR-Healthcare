import { CardActions, CardContent, IconButton } from '@mui/material';
import classNames from 'classnames';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import Box from 'src/components/Box';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import CustomForm from 'src/components/form';
import Modal from 'src/components/modal';
import { regexCustomText } from 'src/lib/constants';
import { IconFont } from '../../../component/icon-font';

const formGroups = [{
  inputType: 'text',
  type: 'text',
  name: 'streamUrl',
  colSpan: 1,
  placeholder: 'Stream URL',
  pattern: regexCustomText,
  textLabel:"Stream URL"
},{
  inputType: 'text',
  type: 'text',
  name: 'streamKey',
  colSpan: 1,
  placeholder: 'Stream Key',
  pattern: regexCustomText,
  textLabel:'Stream Key',
},{
  inputType: 'text',
  type: 'text',
  name: 'broadcastUrl',
  colSpan: 1,
  placeholder: 'Broadcast URL',
  pattern: regexCustomText,
  textLabel:'Broadcast URL',
},]
const LiveStreamButton = (props) => {
  const { onLiveStreamClick, isLiveStreamOn } = props;
  return (
    <IconButton
      className={classNames('vc-button', {
        active: isLiveStreamOn
      })}

      ghost={true}
      shape="circle"
      size="large"
      onClick={onLiveStreamClick}
    ><IconFont type="icon-live-stream" /></IconButton>
  );
};

const LiveStreamModal = (props) => {
  const { visible, onStartLiveStream, setVisible } = props;
  const form = useForm();
  const {handleSubmit} = form;
  const onClose =() => {
    setVisible(false);
  }
  const FooterComponent = ()=>{
   
  }
  const onSubmit =useCallback((data) => {
    try {
      const { streamUrl, streamKey, broadcastUrl } = data;
      onStartLiveStream(streamUrl, streamKey, broadcastUrl);
      setVisible(false);
    } catch (e) {
      console.log(e);
    }
  },[onStartLiveStream,setVisible]);

  return (
    <Modal
    footerComponent={FooterComponent}
      open={visible}
      className="live-stream-setting-dialog"
      title="Live Stream Setting"
      okText="Start"
      onClose={() => {
        setVisible(false);
      }}
    >
       <Box>
      <CardContent>
        <CustomForm
          form={form}
          formGroups={formGroups}
          columnsPerRow={1}
        />
      </CardContent>
      <CardActions
        sx={{
          justifyContent: 'flex-start',
          paddingLeft: '24px',
          paddingRight: '24px',
        }}
      >
        <LoadingButton
          variant="outlinedSecondary"
          onClick={onClose}
          label="Cancel"
        />
        <LoadingButton
          onClick={handleSubmit(onSubmit)}
          label="Submit"
        />
      </CardActions>
    </Box>
      
    </Modal>
  );
};

export { LiveStreamButton, LiveStreamModal };

import { CardActions, CardContent } from '@mui/material';
import classNames from 'classnames';
import { useCallback, useContext, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import Box from 'src/components/Box';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import CustomForm from 'src/components/form';
import Modal from 'src/components/modal';
import { onlyNumber, regexCustomText, requiredField } from 'src/lib/constants';
import ZoomContext from '../../../context/zoom-context';
import './call-out-modal.scss';

const calcCallMe  = (data) => {
  if (data?.callme) {
    return { hide: true };
  }
  return { hide: false };
};

const CallOutModal = (props) => {
  const { visible, phoneCountryList, phoneCallStatus, onPhoneCallClick, onPhoneCallCancel, setVisible } = props;
  const form = useForm();
  const zmClient = useContext(ZoomContext);
  const {handleSubmit} = form ;

  const formGroups = useMemo(()=>[{name: 'countryCode',
    label: 'Country Code',
    placeHolder: 'Select country code',
    inputType: 'wiredSelect',
    url: null,
    labelAccessor: ['name','code'],
    valueAccessor: 'code',
  colSpan:0.4,
  options:phoneCountryList,
  }, 
    {
      inputType: 'text',
      type:'number',
      name: 'phoneNumber',
      textLabel: 'Phone No.',
      pattern:onlyNumber,
      colSpan:0.6,
      required: requiredField,
      
    },
    {
      inputType: 'checkBox',
      name: 'callme',
      label: 'Call Me',
      colSpan: 1,
      
    },
    {
      inputType: 'text',
      type:'text',
      name: 'name',
      textLabel: 'Name',
      pattern:regexCustomText,
      colSpan:1,
      dependencies: {
        keys: ['callme'],
        calc: calcCallMe,
      },
      
    },
    {
      inputType: 'checkBox',
      name: 'greeting',
      label: 'Require greeting before being connected',
      colSpan: 1,
      dependencies: {
        keys: ['callme'],
        calc: calcCallMe,
      },
      
    },
    {
      inputType: 'checkBox',
      name: 'press',
      label: 'Require pressing 1 before being connected',
      colSpan: 1,
      dependencies: {
        keys: ['callme'],
        calc: calcCallMe,
      },
      
    },
  ],[phoneCountryList])

  const onSubmit = useCallback((data)=>{

    try {
      const {
        phoneNumber,
        countryCode,
        callme,
        name,
        greeting,
        press
      } = data;
      if (callme) {
        onPhoneCallClick?.(countryCode, phoneNumber, zmClient.getCurrentUserInfo().displayName, { callMe: true });
      } else {
        onPhoneCallClick?.(countryCode, phoneNumber, name, {
          callMe: false,
          greeting: greeting,
          pressingOne: press
        });
      }
    } catch (e) {
      console.log(e);
    }
  },[onPhoneCallClick, zmClient]);

  const onClose =async () => {
    const { countryCode, phoneNumber ,
      callme
    } = form.getValues();
    if (countryCode && phoneNumber) {
      await onPhoneCallCancel?.(countryCode || '', phoneNumber, { callMe: callme });
    }

    setVisible(false);
  }
  return (
    <Modal
      open={visible}
      className="join-by-phone-dialog"
      header={{title:"Invite by phone"}}      
      onClose={onClose}
    >
      <Box>
      <CardContent>
        <CustomForm
          form={form}
          formGroups={formGroups}
          columnsPerRow={1}
        />
        <Box>
         {phoneCallStatus && (
        <div className="phone-call-status">
          Phone call status:
          <span className={classNames('status-text', phoneCallStatus.type)}>{phoneCallStatus.text}</span>
        </div>
      )}
    </Box>
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
          label="Close"
        />
        <LoadingButton
          onClick={handleSubmit(onSubmit)}
          label="Call"
        />
      </CardActions>
    </Box>

    </Modal>
  );
};

export default CallOutModal;

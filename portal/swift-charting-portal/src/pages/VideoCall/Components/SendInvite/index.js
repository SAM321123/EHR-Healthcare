import { useCallback, useEffect } from 'react';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import Box from 'src/components/Box';
import CustomButton from 'src/components/CustomButton';
import { WiredPractitionerOrAssistantAutoComplete } from 'src/wiredComponent/Form/FormFields';
import CustomForm from 'src/components/form';
import Modal from 'src/components/modal';
import useCRUD from 'src/hooks/useCRUD';
import { showSnackbar } from 'src/lib/utils';
import { SEND_USER_INVITE } from 'src/store/types';
import { useMediaQuery } from '@mui/material';
import { mobileWidth } from 'src/lib/constants';
import { useForm } from 'react-hook-form';

export const sendInviteFormField = [
  {
    ...WiredPractitionerOrAssistantAutoComplete({
      labelAccessor: ['firstName', 'lastName'],
      valueAccessor: 'id',
      params: { isActive: true },
    }),
  },
  {
    ...WiredPractitionerOrAssistantAutoComplete({
      name: 'assistant',
      label: 'Assistant',
      url: API_URL.assistant,
      labelAccessor: ['firstName', 'lastName'],
      valueAccessor: 'id',
      params: { isActive: true },
    }),
  },
];

const SendInvite = (props) => {
  const { clearSendInvite, appointmentId } = props || {};
  const isMobile = useMediaQuery(mobileWidth);

  const sendInviteForm = useForm({ mode: 'onChange' });

  const { handleSubmit: sendInviteHandleSubmit } = sendInviteForm;

  const [
    sendInviteResponse,
    ,
    sendInviteLoading,
    sendInviteCallApi,
    sendInviteClearRes,
  ] = useCRUD({
    id: SEND_USER_INVITE,
    url: API_URL.sendUserInvite,
    type: REQUEST_METHOD.post,
  });

  const handleSendUserInvite = useCallback(
    (data) => {
      const { practitioner, assistant } = data;
      sendInviteCallApi({
        data: {
          practitioner: practitioner?.id,
          assistant: assistant?.id,
          appointmentId,
        },
      });
    },
    [appointmentId]
  );

  useEffect(() => {
    if (sendInviteResponse) {
      showSnackbar({
        message: sendInviteResponse?.message || 'Invite sent successfully',
        severity: 'success',
      });
      clearSendInvite();
      sendInviteClearRes(true);
    }
  }, [sendInviteResponse]);

  const modalFooter = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', m: '20px' }}>
      <CustomButton
        variant="secondary"
        sx={{
          mr: '24px',
        }}
        label="Cancel"
        onClick={clearSendInvite}
      />
      <CustomButton
        label="Send"
        loading={sendInviteLoading}
        onClick={sendInviteHandleSubmit(handleSendUserInvite)}
      />
    </Box>
  );

  return (
    <Modal
      open
      onClose={clearSendInvite}
      containerStyle={{
        top: isMobile ? 0 : '36%',
        paddingLeft: 5,
        paddingRight: 5,
      }}
      footerComponent={modalFooter}
      isNotScrollable
      isSmall
    >
      <div id="sendInviteForm" style={{ borderRadius: 20 }}>
        <div id="headingContainer" style={{ marginBottom: 15 }}>
          <div style={{ fontSize: 20 }}>Send Invite</div>
        </div>
        <CustomForm
          formGroups={sendInviteFormField}
          columnsPerRow={1}
          form={sendInviteForm}
        />
      </div>
    </Modal>
  );
};

export default SendInvite;

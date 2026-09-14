import {
  useCallback,
  useEffect,
  useMemo
} from 'react';

import CardContent from '@mui/material/CardContent';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import useCRUD from 'src/hooks/useCRUD';

import { useForm } from 'react-hook-form';
import CustomForm from 'src/components/form';
import Modal from 'src/components/modal';
import { requiredField } from 'src/lib/constants';
import { showSnackbar } from 'src/lib/utils';
import palette from 'src/theme/palette';
import { WiredPatientAutoComplete } from 'src/wiredComponent/Form/FormFields';

export default function SendMailForm({ showMailSendModal, closeMailModal }) {
  const sendMailFormGroups = useMemo(
    () => [
      {
        ...WiredPatientAutoComplete({
          name: 'patient',
          label: 'Patient',
          url: API_URL.getPatients,
          params: { isActive: true },
          multiple: false,
          required: requiredField,
        }),
      },
    ],
    []
  );

  const form = useForm({ mode: 'onChange' });

  const { handleSubmit } = form;

  const [apiResponse, , loading, apiHandler, clear] = useCRUD({
    id: 'EmailTemplateForm',
    type: REQUEST_METHOD.post,
    url: `${API_URL.emailTemplates}/${API_URL.sendBirthdayMail}`,
  });

  useEffect(() => {
    if (apiResponse) {
      showSnackbar({
        severity: 'success',
        message: 'Mail Send',
      });
      clear();
      closeMailModal();
    }
  }, [apiResponse, clear, closeMailModal]);

  const handleSaveAccountDetails = useCallback((data) => {
    apiHandler({ data: {patientId:data.patient.id} });
  }, []);

  const footer = useMemo(
    () => ({
      leftActions: [
        {
          name: 'Send',
          disabled: loading,
          loading,
          action: handleSubmit(handleSaveAccountDetails),
        },
        {
          name: 'Close',
          action: closeMailModal,
          variant: 'outlinedSecondary',
          style: {
            boxShadow: 'none',
            color: palette.common.black,
            backgroundColor: palette.common.white,
          },
        },
        // { name: "Send me Test Email", disabled: true },  @Todo need to be add later as per requirement
      ],
    }),
    [closeMailModal, handleSaveAccountDetails, handleSubmit, loading]
  );

  return (
    <Modal
      header={{
        title: 'Send Birthday Mail',
      }}
      footer={footer}
      open={showMailSendModal}
      onClose={closeMailModal}
      boxStyle={{ width: '40%' }}
    >
      <CardContent>
        <CustomForm
          formGroups={sendMailFormGroups}
          columnsPerRow={1}
          form={form}
        />
      </CardContent>
    </Modal>
  );
}

import CardContent from '@mui/material/CardContent';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { faxType, requiredField } from 'src/lib/constants';
import { showSnackbar, triggerEvents } from 'src/lib/utils';

import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import useCRUD from 'src/hooks/useCRUD';

import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import Container from 'src/components/Container';
import CustomForm from 'src/components/form';
import Modal from 'src/components/modal';
import { SEND_PHARMACY_FAX_DATA } from 'src/store/types';
import { WiredSelect } from 'src/wiredComponent/Form/FormFields'; // Import WiredSelect

const NoteTempModal = ({ setSelectedForm, selectedForm }) => {
  const form = useForm({ mode: 'onChange' });
  const params = useParams();
  const { handleSubmit, watch, setValue } = form;

  const [
    sharedFormResponse,
    ,
    sharedFormLoading,
    shareForm,
    clearShareFormResponse,
  ] = useCRUD({
    id: `share-note-template-${params.formId}`,
    url: `${API_URL.shareNoteTemplate}/${selectedForm?.id}`,
    method: REQUEST_METHOD.post,
  });

  const radioValue = watch('sharedWith');

  useEffect(() => {
    if (sharedFormResponse) {
      showSnackbar({ message: 'Shared', severity: 'success' });
      triggerEvents(`REFRESH-TABLE-PATIENT_SHARED_FORMS_LIST`);
      clearShareFormResponse();
      setSelectedForm({});
    }
  }, [sharedFormResponse]);

  const handleSaveShareForm = useCallback(
    (formData) => {
      // eslint-disable-next-line no-param-reassign
      delete formData?.faxNumber;

      shareForm({
        data: {
          ...formData,
          faxType:faxType.PATIENT_FORM,
        },
      });
    },
    [selectedForm?.id, shareForm]
  );

  useCRUD({
    id: SEND_PHARMACY_FAX_DATA,
    url: API_URL.sendPharmacyFax,
    type: REQUEST_METHOD.create,
  });

  const faxContactData = useSelector(
    (state) =>
      state?.crud?.get('wired-select-faxContact')?.get('read')?.get('data')
        ?.results
  );

  const calc = useCallback(
    (data) => {
      if (data?.faxContact) {
        const pharmacyFaxContact = faxContactData?.find(
          (item) => item?.id === data?.faxContact
        );
        setValue('faxNumber', pharmacyFaxContact?.faxNo);
        return { hide: false };
      }
      return { hide: true };
    },
    [faxContactData, setValue]
  );

  const formGroups = useMemo(() => {
    const baseFormGroups = [
      {
        inputType: 'radio',
        name: 'sharedWith',
        required: requiredField,
        options: [
          { label: ' Share with Patient', value: 'patient' },
          { label: 'Fax to others', value: 'other' },
        ],
        colSpan: 1,
      },
    ];

    if (radioValue === 'other') {
      baseFormGroups.push(
        {
          ...WiredSelect({
            name: 'faxContactId',
            label: 'Contact Name',
            required: requiredField,
            url: API_URL.faxContact,
            labelAccessor: 'name',
            valueAccessor: 'id',
            cache: false,
          }),
          colSpan: 2,
        },
        {
          inputType: 'phoneInput',
          type: 'number',
          name: 'faxNumber',
          textLabel: 'Contact Number',
          disabled: true,
          colSpan: 2,
          gridProps: { md: 12 },
          dependencies: {
            keys: ['faxContact'],
            calc,
          },
        }
      );
    }

    return baseFormGroups;
  }, [radioValue, calc]);

  const footer = useMemo(
    () => ({
      leftActions: [
        {
          name: 'Cancel',
          variant: 'text',
          action: () => {
            setSelectedForm({});
          },
          style: { boxShadow: 'unset', color: '#303030' },
        },
        {
          name: 'Proceed',
          disabled: sharedFormLoading,
          action: handleSubmit(handleSaveShareForm),
          style: { marginRight: 16 },
        },
      ],
    }),
    [handleSaveShareForm, handleSubmit, sharedFormLoading]
  );

  return (
    <Modal
      open
      header={{ title: 'Share Note' }}
      footer={footer}
      onClose={() => setSelectedForm({})}
    >
      <Container loading={sharedFormLoading}>
        <CardContent>
          <CustomForm formGroups={formGroups} columnsPerRow={1} form={form} />
        </CardContent>
      </Container>
    </Modal>
  );
};

export default NoteTempModal;

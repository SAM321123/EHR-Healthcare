import React, { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import CardContent from '@mui/material/CardContent';

import { UI_ROUTES } from 'src/lib/routeConstants';
import { requiredField, roleTypes, successMessage } from 'src/lib/constants';
import { getUserRole, showSnackbar, triggerEvents } from 'src/lib/utils';

import useCRUD from 'src/hooks/useCRUD';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';

import Modal from 'src/components/modal';
import CustomForm from 'src/components/form';
import Container from 'src/components/Container';
import {
  WiredMasterField,
  WiredPractitionerField,
  WiredSelect,
  WiredStaffField,
} from 'src/wiredComponent/Form/FormFields';

const SharedForm = ({
  isVisible,
  selectedFormType,
  handleSharedFormModalVisbility,
  selectedPatient,
  user,
}) => {
  console.log("🚀 ~ user:", user)
  const form = useForm({});
  const params = useParams();
  const navigate = useNavigate();
  const { handleSubmit } = form;

  const [
    sharedFormResponse,
    ,
    sharedFormLoading,
    shareForm,
    clearShareFormResponse,
  ] = useCRUD({
    id: 'shareForm',
    url: API_URL.sharedFormList,
    method: REQUEST_METHOD.post,
  });

  const formGroups = useMemo(
    () => [
      {
        ...WiredStaffField({
          name: 'practitionerId',
          label: 'Practioner',
          colSpan: 1,
          placeholder: 'Select',
          required: requiredField,
        }),
      },
      {
        ...WiredSelect({
          name: 'formId',
          label: 'Forms',
          url: API_URL.getFormList,
          cache: false,
          labelAccessor: 'name',
          valueAccessor: 'id',
          required: requiredField,
          params: { limit: 300, isActive: true ,formTypeCode: selectedFormType},
          multiple: true,
          placeholder: 'Select',
        }),
      },
    ],
    [form]
  );

  useEffect(() => {
    if (sharedFormResponse) {
      if (
        sharedFormResponse?.formData?.formType?.code === 'FT_NOTE_TEMPLATES'
      ) {
        navigate(
          generatePath(UI_ROUTES.editPatientForm, {
            ...params,
            formId: sharedFormResponse?.id,
          })
        );
      }
      showSnackbar({ message: successMessage.create, severity: 'success' });
      triggerEvents(`REFRESH-TABLE-PATIENT_SHARED_FORMS_LIST`);
      clearShareFormResponse();
      handleSharedFormModalVisbility();
    }
  }, [sharedFormResponse]);

  const handleSaveShareForm = useCallback(
    (formData) => {
      console.log("🚀 ~ formData:", formData)
      shareForm({
        data: {
          formId: formData.formId,
          patientId: selectedPatient?.id,
          sharedById: user?.id,
          practitionerId: formData?.practitionerId,
        },
      });
    },
    [selectedPatient?.id, shareForm,user]
  );

  const footer = useMemo(() => {
    if (selectedFormType === 'FT_NOTE_TEMPLATES') {
      return {
        leftActions: [
          {
            name: 'Cancel',
            variant: 'outlinedSecondary',
            action: handleSharedFormModalVisbility,
            style: { boxShadow: 'unset', color: '#303030' },
          },
          {
            name: 'Add',
            disabled: sharedFormLoading,
            action: handleSubmit(handleSaveShareForm),
            style: { marginRight: 16 },
          },
        ],
      };
    }
    return {
      leftActions: [
        {
          name: 'Cancel',
          variant: 'outlinedSecondary',
          action: handleSharedFormModalVisbility,
          style: { boxShadow: 'unset', color: '#303030' },
        },
        {
          name: 'Share',
          disabled: sharedFormLoading,
          action: handleSubmit(handleSaveShareForm),
          style: { marginRight: 16 },
        },
      ],
    };
  }, [
    handleSaveShareForm,
    handleSharedFormModalVisbility,
    handleSubmit,
    sharedFormLoading,
    selectedFormType,
  ]);

  const headerTitle =
    selectedFormType === 'FT_NOTE_TEMPLATES' ? 'Add Note' : 'Share Form';

  return (
    <Modal
      open={isVisible}
      header={{ title: headerTitle }}
      footer={footer}
      onClose={handleSharedFormModalVisbility}
      boxStyle={{ width: '40%' }}
    >
      <Container loading={sharedFormLoading}>
        <CardContent>
          <CustomForm formGroups={formGroups} columnsPerRow={1} form={form} />
        </CardContent>
      </Container>
    </Modal>
  );
};

export default SharedForm;

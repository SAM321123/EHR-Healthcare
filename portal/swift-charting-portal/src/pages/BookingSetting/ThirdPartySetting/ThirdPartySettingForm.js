import React, { useCallback, useMemo } from 'react';
import isEmpty from 'lodash/isEmpty';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';

import {
  regexCommonText,
  requiredField,
  successMessage,
} from 'src/lib/constants';
import Box from 'src/components/Box';
import CustomForm from 'src/components/form';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import CustomButton from 'src/components/CustomButton';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import { WiredSelect } from 'src/wiredComponent/Form/FormFields';
import { THIRD_PARTY_SETTING } from 'src/store/types';
import useCRUD from 'src/hooks/useCRUD';
import { showSnackbar } from 'src/lib/utils';

const thirdPartySettingForm = [
  {
    ...WiredSelect({
      name: 'type',
      label: 'Type',
      required: requiredField,
      valueAccessor: 'value',
      labelAccessor: 'name',
      options: [{ label: 'Google Meet', name: 'Google Meet' }],
    }),
  },
  {
    inputType: 'text',
    name: 'clientId',
    textLabel: 'Client ID',
    required: requiredField,
    maxLength: { value: 200 },
    pattern: regexCommonText,
  },
  {
    inputType: 'text',
    name: 'clientSecret',
    textLabel: 'Client Secret',
    required: requiredField,
    maxLength: { value: 100 },
    pattern: regexCommonText,
  },
];

const ThirdPartySettingForm = ({ form, modalCloseAction, defaultData }) => {
  const [response, , loading, callApi, clearResponse] = useCRUD({
    id: `${THIRD_PARTY_SETTING}-add-update`,
    url: API_URL.thirdPartySetting,
    type: isEmpty(defaultData) ? REQUEST_METHOD.post : REQUEST_METHOD.update,
  });

  const id = defaultData?.id;
  const { handleSubmit } = form;

  const initialData = useMemo(() => {
    const data = {
      type: defaultData?.type,
      clientId: defaultData?.keys?.clientId,
      clientSecret: defaultData?.keys?.clientSecret,
    };
    return data;
  }, [defaultData]);

  const handleModalClose = () => {
    modalCloseAction();
    clearResponse(true);
  };

  const onHandleSubmit = useCallback(
    (data) => {
      const payload = data;

      payload.keys = {
        clientId: payload?.clientId,
        clientSecret: payload?.clientSecret,
      };

      delete payload.clientId;
      delete payload.clientSecret;

      if (isEmpty(defaultData)) {
        callApi({ data: payload });
      } else {
        delete payload.type;
        callApi({ ...payload }, `/${id}`);
      }
    },
    [defaultData, id, initialData]
  );

  const handleVerify = () => {
    window.open(response?.authUrl, '_blank');
    showSnackbar({
      message: isEmpty(defaultData)
        ? successMessage.create
        : successMessage.update,
      severity: 'success',
    });
    modalCloseAction();
    clearResponse(true);
  };

  return (
    <Box>
      <CardContent>
        <CustomForm
          formGroups={thirdPartySettingForm}
          form={form}
          columnsPerRow={1}
          defaultValue={isEmpty(defaultData) ? {} : initialData}
        />
      </CardContent>
      <CardActions
        sx={{
          justifyContent: 'center',
        }}
      >
        <CustomButton
          variant="secondary"
          onClick={handleModalClose}
          label="Cancel"
        />
        <LoadingButton
          loading={loading}
          onClick={handleSubmit(
            response?.authUrl ? handleVerify : onHandleSubmit
          )}
          label={response?.authUrl ? 'Click Here To Verify' : 'Verify'}
        />
      </CardActions>
    </Box>
  );
};

export default ThirdPartySettingForm;

import React, { useCallback, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';

import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import Box from 'src/components/Box';
import CustomButton from 'src/components/CustomButton';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import CustomForm from 'src/components/form';
import { faxHistoryStatus, requiredField } from 'src/lib/constants';
import { WiredSelect } from 'src/wiredComponent/Form/FormFields';
import { useSelector } from 'react-redux';
import useCRUD from 'src/hooks/useCRUD';
import { GET_PHARMACY_ORDER_DATA, SEND_PHARMACY_FAX_DATA } from 'src/store/types';
import Events from 'src/lib/events';
import { showSnackbar } from 'src/lib/utils';

const PharmacyFaxDetails = ({ modalCloseAction,selectedOrder}) => {
  const form = useForm({ mode: 'onChange' });
  const { handleSubmit, setValue } = form;

  const [faxResponse, , loading,sendFax ,clear] = useCRUD({
    id: SEND_PHARMACY_FAX_DATA,
    url: API_URL.sendPharmacyFax,
    type: REQUEST_METHOD.create,
  });
  
  const faxContactData = useSelector(
    (state) =>
      state?.crud?.get('wired-select-fax')?.get('read')?.get('data')?.results
  );

  useEffect(()=>{
    if(faxResponse){
      modalCloseAction();
      const isSuccess = faxResponse===faxHistoryStatus.SUCCESS;
      showSnackbar({
        severity: isSuccess?'success':'error',
        message: isSuccess? 'Faxed Successfully' : 'Failed to Fax',
      });
      Events.trigger(`REFRESH-TABLE-${GET_PHARMACY_ORDER_DATA}`);
      clear();

    }
  },[faxResponse])
  const calc = useCallback(
    (data) => {
      if (data?.fax) {
        const pharmacyFaxContact = faxContactData?.find(
          (item) => item?.id === data?.fax
        );
        setValue('faxContact', pharmacyFaxContact?.faxNo);
        return { hide: false };
      }
      return { hide: true };
    },
    [faxContactData, setValue]
  );

  const patientOrderFormGroups = useMemo(
    () => [
      {
        ...WiredSelect({
          name: 'fax',
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
        name: 'faxContact',
        textLabel: 'Contact Number',
        disabled: true,
        colSpan: 2,
        gridProps: { md: 12 },
        dependencies: {
          keys: ['fax'],
          calc,
        },
      },
    ],
    [calc]
  );

  // Todo need fax send api
  const onHandleSubmit = useCallback((data) => {
    const payload = {faxContact:data?.fax,faxType:selectedOrder?.id,faxTypeRef:'PharmacyOrder'}
    sendFax({data:payload})
  }, []);

  return (
    <Box>
      <CardContent>
        <CustomForm
          form={form}
          formGroups={patientOrderFormGroups}
          columnsPerRow={2}
        />
      </CardContent>
      <CardActions
        sx={{
          justifyContent: 'center',
        }}
      >
        <CustomButton
          variant="secondary"
          onClick={modalCloseAction}
          label="Cancel"
        />
        <LoadingButton
          loading={loading}
          onClick={handleSubmit(onHandleSubmit)}
          label="Send Fax"
        />
      </CardActions>
    </Box>
  );
};

export default PharmacyFaxDetails;

import CardContent from '@mui/material/CardContent';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { inputLength, regEmail, requiredField } from 'src/lib/constants';
import { showSnackbar } from 'src/lib/utils';

import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import useCRUD from 'src/hooks/useCRUD';

import { generatePath, useNavigate } from 'react-router-dom';
import { CardActions } from '@mui/material';
import { useSelector } from 'react-redux';
import Container from 'src/components/Container';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import CustomForm from 'src/components/form';
import Modal from 'src/components/modal';
import { SEND_PHARMACY_FAX_DATA } from 'src/store/types';
import { WiredSelect } from 'src/wiredComponent/Form/FormFields'; // Import WiredSelect
import { UI_ROUTES } from 'src/lib/routeConstants';

const defaultData={shareOn:'fax_only'};

const calcShareOn =(data)=>{
    if(data.faxContactId){
      return {hide:false}
    }
    return {hide:true}
}

const ShareAndFaxModal = ({ onClose,onRefersh=()=>{}, data={},url,faxType,title="title" }) => {
  const form = useForm({ mode: 'onChange' });
  const { handleSubmit, watch, setValue } = form;
  const navigate = useNavigate();
  const [isPharmacySelected,setIsPharmacySelected] = useState(false);

  const [
    sharedFormResponse,
    ,
    sharedFormLoading,
    shareForm,
    clearShareFormResponse,
  ] = useCRUD({
    id: `share-and-fax-${data?.id}`,
    url,
    method: REQUEST_METHOD.post,
  });
  
  const docShareValue = watch('shareValue');
  const radioValue = watch('sharedWith');

  useEffect(() => {
    if (sharedFormResponse) {
      showSnackbar({ message: 'Shared', severity: 'success' });
      clearShareFormResponse();
      onRefersh()
      onClose();
    }
  }, [sharedFormResponse]);

  const handleSaveShareForm = useCallback(
    (formData) => {
      // eslint-disable-next-line no-param-reassign
      delete formData?.faxNumber;     
      shareForm({
        data: {
          ...formData,
          faxType,
        },
      });
    },
    [data?.id, shareForm]
  );

  const showSendingDetailsFieldGroup = (data) => {
    if (data.share) {
      return { hide: false };
    }
    return { hide: true };
  };

  useCRUD({
    id: SEND_PHARMACY_FAX_DATA,
    url: API_URL.sendPharmacyFax,
    type: REQUEST_METHOD.create,
  });

  const faxContactData = useSelector(
    (state) =>
      state?.crud?.get('wired-select-faxContactId')?.get('read')?.get('data')
        ?.results
  );

  const calc = useCallback(
    (data) => {
      if (data?.faxContactId) {
        const pharmacyFaxContact = faxContactData?.find(
          (item) => item?.id === data?.faxContactId
        );
        setValue('faxNumber', pharmacyFaxContact?.faxNo);
        return { hide: false };
      }
      return { hide: true };
    },
    [faxContactData]
  );

  const calcEmail = useCallback(
    (data) => {
      if (data?.faxContactId && ['email_only','fax_email'].includes(data.shareOn)) {
        const pharmacyFaxContact = faxContactData?.find(
          (item) => item?.id === data?.faxContactId
        );
        if(pharmacyFaxContact?.email){
          setValue('faxEmail',pharmacyFaxContact?.email)
         return { hide: false,reFetch:true,disabled:true };
        }
        return { hide: false,reFetch:true,disabled:false };
      }
      return { hide: true };
    },
    [faxContactData]
  );

  const options = useMemo(() => {
    const opts = [{ label: 'Share Lab Request', value: 'labRequest' }];
    if (data?.isLabResult) opts.push({ label: 'Share Lab Result', value: 'labResult' });
    if (data?.hl7Message && data?.isLabResult) opts.push({ label: 'Share Both', value: 'both' });
    return opts;
  }, [data]);

  const formGroups = useMemo(() => {

    const baseFormGroups = [
        {
            inputType: 'radio',
            name: 'share',
            required: requiredField,
            options: options.length ? options : [],
            colSpan: 1,
        },
        {
            inputType: 'radio',
            name: 'sharedWith',
            required: requiredField,
            options: [
            { label: ' Share with Patient', value: 'patient' },
            { label: 'Fax to Pharmacy', value: 'other' },
            ],
            colSpan: 1,
            dependencies: {
                keys: ['share'],
                calc: showSendingDetailsFieldGroup,
            },
        },
    ];


    if (radioValue === 'other') {
      baseFormGroups.push(
        {
          ...WiredSelect({
            name: 'faxContactId',
            label: 'Pharmacy Name',
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
          textLabel: 'Pharmacy Number',
          disabled: true,
          colSpan: 2,
          gridProps: { md: 12 },
          dependencies: {
            keys: ['faxContactId'],
            calc,
          },
        },
        {
          inputType: 'radio',
          name: 'shareOn',
          required: requiredField,
          options: [
            { label: 'Fax Only', value: 'fax_only' },
            { label: 'Email Only', value: 'email_only' },
            { label: 'Fax & Email', value: 'fax_email' },

          ],
          colSpan: 1,
          dependencies: {
            keys: ['faxContactId'],
            calc:calcShareOn,
          },
        },
        {
          inputType:'text',
          name:'faxEmail',
          textLabel: 'Email',
          colSpan:1,
          pattern: regEmail,
          maxLength: { ...inputLength.email },
          dependencies: {
            keys: ['shareOn',],
            calc:calcEmail,
          },
        }
      );
    }

    return baseFormGroups;
  }, [radioValue, calc,calcEmail]);

  useEffect(() => {
    setIsPharmacySelected(radioValue === 'other');
  }, [radioValue]);

  const handleNewPharmacyContact = useCallback(() => {
    navigate(
      generatePath(UI_ROUTES.fax, {})
    )
  }, []);


  return (
    <Modal
      open
      header={{ title }}
      onClose={() => onClose({})}
      boxStyle={{ width: '40%' }}
    >
      <Container loading={sharedFormLoading}>
        <CardContent>
          <CustomForm formGroups={formGroups} columnsPerRow={1} form={form} defaultValue={defaultData}/>
        </CardContent>
        <CardContent style={{ padding: '0px', paddingLeft: '10px'}}>
          {isPharmacySelected && (
            <LoadingButton
              variant="secondary"
              loading={sharedFormLoading}
              onClick={handleNewPharmacyContact}
              label={<><p>Want to add new pharmacy contacts?</p><p style={{color: 'blue', paddingLeft: '2px'}}>Click Here!</p></>}
              sx={{
                '&:hover': {
                  backgroundColor: 'transparent', // Remove background color on hover
                  boxShadow: 'none', // Remove box shadow on hover
                },
                '&:active': {
                  backgroundColor: 'transparent', // Remove background color on hover
                  boxShadow: 'none', // Remove box shadow on hover
                },
              }}
          
            />
          )}
        </CardContent>
        <CardActions  sx={{
          justifyContent: 'flex-start',
          paddingLeft: '24px',
          paddingRight: '24px',
        }}>
          <LoadingButton
            variant="outlinedSecondary"
            onClick={onClose}
            label="Cancel"
          />
          <LoadingButton
            loading={sharedFormLoading}
            onClick={handleSubmit(handleSaveShareForm)}
            label={"Proceed"}
          />
        </CardActions>
      </Container>
    </Modal>
  );
};

export default ShareAndFaxModal;

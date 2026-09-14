import { useCallback, useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import isEmpty from 'lodash/isEmpty';
import { useForm } from 'react-hook-form';

import { useParams } from 'react-router-dom';
import { API_URL, MODULE, REQUEST_METHOD } from 'src/api/constants';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import Typography from 'src/components/Typography';
import CustomForm from 'src/components/form';
import useCRUD from 'src/hooks/useCRUD';
import usePatientDetail from 'src/hooks/usePatientDetail';
import { fileInfo, idRegex, requiredField } from 'src/lib/constants';
import Events from 'src/lib/events';
import { showSnackbar } from 'src/lib/utils';
import {
  GET_OFFICE_ALLY_PAYER_LIST,
  SAVE_INSURANCE_DATA,
} from 'src/store/types';
import {
  WiredMasterAutoComplete,
  WiredMasterField,
} from 'src/wiredComponent/Form/FormFields';
import './style.css';
import { decrypt } from 'src/lib/encryption';
import { getModulePermisions } from 'src/utils/genricMethods';
import useAuthUser from 'src/hooks/useAuthUser';
import { Tab, Tabs } from '@mui/material';
import Container from 'src/components/Container';

const showOtherPrimaryHolder = (data) => {
  if (
    data?.primary?.[0]?.insurancePolicyCode === 'insurance_policy_holder_other'
  ) {
    return { hide: false };
  }
  return { hide: true };
};

const PrimaryInsurance = ({defaultData, getAllInsurance, initialLoading, refetchData, modalCloseAction = () => {}}) => {
    const [userInfo, , , , , , userData] = useAuthUser();
    const { isCreate } = getModulePermisions({ moduleName: MODULE.insurance, userData }) || {};
    const [tabIndex, setTabIndex] = useState(0);
    const form = useForm({ mode: 'onChange' });
    const { handleSubmit, watch, setValue  } = form;
    const params = useParams();
    let { patientId } = params;
    patientId = decrypt(patientId);
    
    const [response, , loading, callInsuranceSaveAPI, clearData] = useCRUD({
      id: SAVE_INSURANCE_DATA,
      url: API_URL.insurance,
      type: REQUEST_METHOD.post
    });

    useEffect(() => {
    if (!isEmpty(response)) {
      Events.trigger(`REFRESH-PATIENT-DETAIL-${patientId}`);
      getAllInsurance({ patientId });
      showSnackbar({
        message: 'Insurance saved successfully',
        severity: 'success',
      });
      clearData();
    }
  }, [refetchData, response, patientId]);

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    const insuranceFormGroupsTab1 = useMemo(
    () => [
        {
        inputType: 'nestedForm',
        name: 'primary',
        label: 'Dosage details for active ingredients',
        textButton: 'Add New',
        required: requiredField,
        columnsPerRow: 1,
        colSpan: 1,
        isMore: false,
        formGroups: [
            {
            inputType: 'text',
            name: 'patientFirstName',
            textLabel: 'Patient First Name',
            required: requiredField,
            colSpan: 0.25,
            InputProps: { readOnly: true },
            },
            {
            inputType: 'text',
            name: 'patientMiddleName',
            textLabel: 'Patient Middle Name',
            colSpan: 0.25,
            InputProps: { readOnly: true },
            },
            {
            inputType: 'text',
            name: 'patientLastName',
            textLabel: 'Patient Last Name',
            colSpan: 0.25,
            InputProps: { readOnly: true },
            },
            {
            inputType: 'text',
            name: 'patientPreferredName',
            textLabel: 'Patient Preferred Name',
            colSpan: 0.25,
            InputProps: { readOnly: true },
            },
            {
            ...WiredMasterField({
                code: 'insurance_policy_holder',
                filter: { limit: 20 },
                name: 'insurancePolicyCode',
                label: 'Primary Insurance Policy Holder',
                labelAccessor: 'name',
                valueAccessor: 'code',
                colSpan: 0.33,
                required: requiredField,
            }),
            },
            {
            inputType: 'text',
            name: 'insurancePolicyOther',
            textLabel: 'Primary Insurance Policy Holder (Other)',
            colSpan: 0.33,
            dependencies: {
                keys: ['insurancePolicyCode'],
                calc: showOtherPrimaryHolder,
                listenAllChanges: true,
            },
            },
            {
            inputType: 'text',
            name: 'firstName',
            textLabel: 'First Name of Primary Insured',
            required: requiredField,
            colSpan: 0.33,
            },
            {
            inputType: 'text',
            name: 'lastName',
            textLabel: 'Last Name of Primary Insured',
            required: requiredField,
            colSpan: 0.33,
            },
            {
            inputType: 'text',
            name: 'insuranceId',
            textLabel: 'Insurance ID#',
            required: requiredField,
            colSpan: 0.33,
            pattern: idRegex,
            },
            {
            inputType: 'text',
            name: 'insuranceCompanyName',
            textLabel: 'Insurance Company Name',
            required: requiredField,
            colSpan: 0.33,
            },      
            {
            inputType: 'text',
            name: 'groupName',
            textLabel: 'Group Name',
            colSpan: 0.33,
            },
            {
            inputType: 'text',
            name: 'groupNumber',
            textLabel: 'Group Number',
            colSpan: 0.33,
            },
            {
            inputType: 'date',
            name: 'birthDate',
            textLabel: 'Birthdate of Primary Insured',
            label: 'Birthdate of Primary Insured',
            required: requiredField,
            colSpan: 0.33,
            },
            {
            inputType: 'text',
            name: 'insuredRelationship',
            textLabel: 'Primary Insured Relationship to Patient',
            required: requiredField,
            colSpan: 0.32,
            },
            {
            inputType: 'uploadFile',
            name: 'insuranceFrontFile',
            textLabel: 'Front of Image Needed',
            showPreview: true,
            accept: '.jpg,.jpeg,.png,.pdf',
            alwaysShowLink: true,
            gridProps: { paddingTop: '6px' },
            fileInfo: { type: fileInfo.COMMENTS },
            colSpan: 0.33,
            buttonStyle: { padding: '62px 37px', textWrap: 'pretty' },
            // required: requiredField,
            },
            {
            inputType: 'uploadFile',
            name: 'insuranceBackFile',
            textLabel: 'Back of Image Needed',
            showPreview: true,
            accept: '.jpg,.jpeg,.png,.pdf',
            alwaysShowLink: true,
            gridProps: { paddingTop: '6px' },
            fileInfo: { type: fileInfo.COMMENTS },
            colSpan: 0.33,
            buttonStyle: { padding: '62px 37px', textWrap: 'pretty' },
            // required: requiredField,
            },
        ],
        }
    ]
    )
    const insuranceFormGroupsTab2 = useMemo(
    () => [
        {
        inputType: 'nestedForm',
        name: 'primary',
        label: 'Dosage details for active ingredients',
        textButton: 'Add New',
        required: requiredField,
        columnsPerRow: 1,
        colSpan: 1,
        isMore: false,
        formGroups: [
            {
            ...WiredMasterAutoComplete({
                url: API_URL.officeAllyPayerList,
                label: 'Insurance Eligibility Check Payer ID #',
                name: 'eligibilityCheckPayerId',
                placeholder: 'Search by Payer Name  or Payer ID',
                cache: false,
                labelAccessor: 'payerName',
                valueAccessor: 'payerId',
                required: requiredField,
                showDescription: true,
                descriptionAccessor: 'payerId',
                params: { isActive: true ,transaction: 'Eligibility 270 / 271'},
                colSpan: 0.33,
                fetchInitial: true,
            }),
            },
            {
            ...WiredMasterAutoComplete({
                url: `${API_URL.officeAllyPayerList}/claim`,
                label: 'Insurance Claim Payer ID #',
                name: 'payerId',
                placeholder: 'Search by Payer Name  or Payer ID',
                cache: false,
                labelAccessor: 'payerName',
                valueAccessor: 'payerId',
                required: requiredField,
                showDescription: true,
                descriptionAccessor: 'payerId',
                params: { isActive: true },
                colSpan: 0.33,
                fetchInitial: true,
            }),
            },
            {
            ...WiredMasterAutoComplete({
                url: API_URL.officeAllyPayerList,
                label: 'Insurance Claim Status Check Payer ID #',
                name: 'claimStatusCheckPayerId',
                placeholder: 'Search by Payer Name  or Payer ID',
                cache: false,
                labelAccessor: 'payerName',
                valueAccessor: 'payerId',
                required: requiredField,
                showDescription: true,
                descriptionAccessor: 'payerId',
                params: { isActive: true, transaction: 'Claim Status 276 / 277'},
                colSpan: 0.33,
                fetchInitial: true,
            }),
            }
        ],
        },
    ]
    )

    const onHandleSubmit = useCallback(
        (data) => {
            const newData = data;
            callInsuranceSaveAPI({ data: { ...newData, patientId } });
        },
        [callInsuranceSaveAPI, patientId]
    );

    return (
        <Container
      loading={initialLoading}
    >
        <Typography variant="h6" gutterBottom>Primary Insurance</Typography>
              <Tabs value={tabIndex} onChange={handleTabChange} sx={{ mb: 2 }}>
                <Tab label="General Info" />
                <Tab label="Payer Info" />
              </Tabs>
        
              <CardContent>
                {tabIndex === 0 && (
                  <CustomForm
                    form={form}
                    formGroups={insuranceFormGroupsTab1}
                    columnsPerRow={1}
                    defaultValue={defaultData}
                  />
                )}
                {tabIndex === 1 && (
                  <CustomForm
                    form={form}
                    formGroups={insuranceFormGroupsTab2}
                    columnsPerRow={1}
                    defaultValue={defaultData}
                  />
                )}
              </CardContent>
        
              <CardActions sx={{ justifyContent: 'flex-start', px: 3 }}>
                {isCreate && (
                  <LoadingButton
                    loading={loading}
                    onClick={handleSubmit(onHandleSubmit)}
                    label="Save"
                  />
                )}
              </CardActions>
        </Container>
    )
}


export default PrimaryInsurance;
/* eslint-disable no-unused-vars */
import Box from '@mui/material/Box';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import {Card} from '@mui/material';
import isEmpty from 'lodash/isEmpty';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import Table from 'src/components/Table';
import CustomForm from 'src/components/form';
import ModalComponent from 'src/components/modal';
import useCRUD from 'src/hooks/useCRUD';

import { Grid } from '@mui/material';
import { isEqual } from 'lodash';
import Accordion from 'src/components/Accordion';
import Container from 'src/components/Container';
import Esignature from 'src/components/E-Signature';
import PageHeader from 'src/components/PageHeader';
import TableTextRendrer from 'src/components/TableTextRendrer';
import Typography from 'src/components/Typography';
import {
  dateFormats,
  directionCodeType,
  frequencyCodeType,
  medicineStatusOptions,
  regDecimal,
  regexCustomText,
  requiredField,
  roleTypes,
  routeCodeType,
  successMessage,
} from 'src/lib/constants';
import Events from 'src/lib/events';
import { convertWithTimezone, getCurrentMeridien, getFullName, getUpdatedFieldsValue, showSnackbar } from 'src/lib/utils';
import { MEDICATION_DATA, MEDICATION_LIST, SAVE_MEDICATION_DATA } from 'src/store/types';
import palette from 'src/theme/palette';
import { decrypt } from 'src/lib/encryption';
import useAuthUser from 'src/hooks/useAuthUser';

const currentMeridien = getCurrentMeridien();

const columns = [
  {
    label: 'Medication',
    type: 'text',
    render: ({ data }) => {
      const title = `${data.genericDrug} (${data.brandNameDrug})`
      return (
        <TableTextRendrer style={{maxWidth:'12rem'}}
        >
          {title}
        </TableTextRendrer>
      );
    },
    maxWidth:'10rem',
  },
  {
    label: 'Dosage Form',
    type: 'text',
    dataKey: 'doseForm.name',
    width:'20rem',
    render:({data})=>{
      // const title = data?.doseForm?.name===routeCodeType.OTHER? `${data?.routeOther} (Other)`:data?.route?.name;
      return <TableTextRendrer>
            {data?.doseForm?.name}
      </TableTextRendrer>
    },
  },
  {
    label: 'Amount',
    type: 'text',
    dataKey: 'amount',
    maxWidth:'10rem',

  },
  {
    label: 'Unit',
    type: 'text',
    dataKey: 'unit.name',
    maxWidth:'10rem',
    render:({data})=>{
      // const title = data?.doseForm?.name===routeCodeType.OTHER? `${data?.routeOther} (Other)`:data?.route?.name;
      return <TableTextRendrer>
            {data?.unit?.name}
      </TableTextRendrer>
    },

  },
  {
    label: 'Route',
    type: 'text',
    maxWidth:'10rem',
    render:({data})=>{
      const title = data?.route?.code===routeCodeType.OTHER? `${data?.routeOther} (Other)`:data?.route?.name;
      return <TableTextRendrer>
 {title}
      </TableTextRendrer>
    },

  },
  {
    label: 'Frequency',
    type: 'text',
    dataKey: 'frequency.name',
    maxWidth:'10rem',
    render:({data})=>{
      const title = data?.frequency?.code===frequencyCodeType.OTHER? `${data?.frequencyOther} (Other)`:data?.frequency?.name;
      return <TableTextRendrer>
        {title}
      </TableTextRendrer>
    },

  },
  {
    label: 'Direction',
    type: 'text',
    dataKey: 'direction.name',
    maxWidth:'10rem',
    render:({data})=>{
      const title = data?.direction?.code===directionCodeType.OTHER? `${data?.directionOther} (Other)`:data?.direction?.name;
      return <TableTextRendrer>
        {title}
      </TableTextRendrer>
    },

  },
  {
    label: 'Duration',
    type: 'text',
    dataKey: 'durationAmount',
    maxWidth:'10rem',
  },
  {
    label: 'Duration Unit',
    type: 'text',
    dataKey: 'duration.name',
    maxWidth:'10rem',
    render:({data})=>{
      // const title = data?.doseForm?.name===routeCodeType.OTHER? `${data?.routeOther} (Other)`:data?.route?.name;
      return <TableTextRendrer>
            {data?.duration?.name}
      </TableTextRendrer>
    },

  },
  {
    label: 'Reason Rx',
    type: 'text',
    maxWidth:'10rem',
    render:({data})=>{
      const title = data?.diagnoses?.map(item=>`${item?.icd?.name} ${item?.icd?.description?`(${item?.icd?.description})`:''}`).join(', ');
      return <TableTextRendrer style={{maxWidth:'10rem'}}>
 {title}
      </TableTextRendrer>
    },
  },
  {
    label: 'Quantity',
    type: 'text',
    dataKey: 'quantity',
    maxWidth:'10rem',

  },
  {
    label: 'Refill',
    type: 'text',
    dataKey: 'refill',
    maxWidth:'10rem',

  },
  {
    label: 'Medication Status',
    type: 'text',
    dataKey: 'medicineStatus.name',
    maxWidth:'10rem',

  },
  {
    label: 'Start On',
    type: 'date',
    dataKey: 'startDate',
    format: dateFormats.MMDDYYYY,
    maxWidth:'10rem',

  },
  {
    label: 'Dispense as Written',
    type: 'text',
    maxWidth:'10rem',
    render:({data})=>{
      const title = data.dispenseAsWritten?'Yes':'No';
      return <TableTextRendrer>
 {title}
      </TableTextRendrer>
    },
  },
  {
    label: 'Substitutions Permitted',
    type: 'text',
    maxWidth:'10rem',
    render:({data})=>{
      const title = data.substitutions?'Yes':'No';
      return <TableTextRendrer>
        {title}
      </TableTextRendrer>
    },
  },
  {
    label: 'Patient-specific Instructions',
    type: 'text',
    dataKey: 'patientSpecificInstructions',
    maxWidth:'10rem',
    render:({data})=>{
      const title = data.patientSpecificInstructions|| 'N/A';
      return <TableTextRendrer>
        {title}
      </TableTextRendrer>
    },
  },
  {
    label: 'Allergies/Warnings',
    type: 'text',
    dataKey: 'allergiesWarnings',
    maxWidth:'10rem',
    render:({data})=>{
      const title = data.allergiesWarnings|| 'N/A';
      return <TableTextRendrer>
        {title}
      </TableTextRendrer>
    },
  },
  {
    label: 'Additional Note',
    type: 'text',
    dataKey: 'additionalInstruction',
    maxWidth:'10rem',
    render:({data})=>{
      const title = data.additionalInstruction|| 'N/A';
      return <TableTextRendrer>
        {title}
      </TableTextRendrer>
    },
  },
];

const MedicationView = ({customMedicationId,onClose,onRefersh=()=>{}}) => {
  const navigate = useNavigate();
  const [user, , , , , validateToken] = useAuthUser();
  const patientId = user?.id; 
  const form = useForm({ mode: 'onChange' });
  
  let {medicationId} = useParams();

  const memoMedicationId = useMemo(()=>{
    if(medicationId){
      return decrypt(medicationId);
    }
    return customMedicationId || ''
  },[medicationId,customMedicationId]);

  const [expandedCard, setExpandedCard] = useState(0);

  const [
    patientMedication,
    ,
    patientMedicationLoading,
    callPatientMedicationAPI,
  ] = useCRUD({
    id: `${MEDICATION_DATA}-${memoMedicationId}`,
    url: `${API_URL.medication}/${memoMedicationId}`,
    type: REQUEST_METHOD.get,
  });
  
  useEffect(()=>{
    if(memoMedicationId){
      callPatientMedicationAPI();
    }
  },[memoMedicationId]);
  
  const [response, , loading, callMedicationSaveAPI, clearData] = useCRUD({
    id: SAVE_MEDICATION_DATA,
    url: API_URL.medication,
    type: !memoMedicationId ? REQUEST_METHOD.post : REQUEST_METHOD.update,
  });

  const handleBack = () => {
    if(onClose){
      onClose()
      return;
    }
    navigate(-1);
  };

  useEffect(() => {
    if (!isEmpty(response)) {
      showSnackbar({
        message: !memoMedicationId
          ? successMessage.create
          : successMessage.update,
        severity: 'success',
      });
      onRefersh();
      Events.trigger(`${MEDICATION_LIST}-${patientId}`);
      if(memoMedicationId){
      callPatientMedicationAPI();
      }else{
        handleBack()
      }
      clearData(true);
    }
  }, [response,memoMedicationId]);

  return (
    <Container
        style={{ display: 'flex', flexDirection: 'column' }}
        loading={patientMedicationLoading ||loading}>
        <PageHeader
          showBackIcon
          title="Back"
          onPressBackIcon={handleBack} 
        />
                <div style={{ marginBottom: 30 }}>
                <Grid container spacing={3}>
                    {/* Prescriber */}
                    <Grid item xs={6}>
                        <Grid container spacing={2}>
                            <Grid item>
                                <Typography style={{ fontWeight: 600, fontSize: '14px' }}>Prescriber :</Typography>
                            </Grid>
                            <Grid item>
                                <Typography style={{ fontSize: '14px' }}>Piyush</Typography>
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Prescriber Signature */}
                    <Grid item xs={6}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item>
                                <Typography style={{ fontWeight: 600, fontSize: '14px' }}>Prescriber Signature:</Typography>
                            </Grid>
                            <Grid item>
                                <img src={patientMedication?.signature} alt='signature' />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </div>
                <Table
                    data={patientMedication?.items}
                    totalCount={1}
                    columns={columns}
                    itemStyle={{ textTransform: 'capitalize', cursor: 'default' }}
                    timezone
                />
    </Container>
  );
};

export default MedicationView;

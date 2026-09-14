import React, { useEffect, useMemo } from 'react';
import { isEmpty } from 'lodash';
import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';

import CustomForm from 'src/components/form';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import { GET_PRACTICE_DATA_SETTING } from 'src/store/types';
import useCRUD from 'src/hooks/useCRUD';
import useAuthUser from 'src/hooks/useAuthUser';
import CancellationForm from '../Components/CancellationForm';

export const ServiceCancellationFormGroup = [
  {
    colSpan: 2,
    component: (props) => <CancellationForm formProps={props} required />,
  },
];

const ServiceCancellation = ({ form, isTitle, defaultData }) => {
  const { getValues } = form;
  const [userData] = useAuthUser();
  const [practiceData, , , getPractice] = useCRUD({
    id: GET_PRACTICE_DATA_SETTING,
    url: API_URL.practices,
    type: REQUEST_METHOD.get,
  });

  const practiceId = userData?.practice?.id;

  useEffect(() => {
    if (practiceId) {
      getPractice({}, `/${practiceId}`);
    }
  }, []);

  const initialData = useMemo(() => {
    const data = {
      cancellationChargeTime:
        getValues('cancellationChargeTime') ||
        defaultData?.cancellationChargeTime,
      cancellationCharge:
        getValues('cancellationCharge') || defaultData?.cancellationCharge,
      cancellationLeadTime:
        getValues('cancellationLeadTime') || defaultData?.cancellationLeadTime,
      cancellationRescheduleTime:
        getValues('cancellationRescheduleTime') ||
        defaultData?.cancellationRescheduleTime,
      cancellationPolicyText:
        getValues('cancellationPolicyText') ||
        defaultData?.cancellationPolicyText,
    };

    return data;
  }, [defaultData, getValues]);

  const initialCancelationData = useMemo(() => {
    if (practiceData) {
      const data = {
        cancellationChargeTime:
          getValues('cancellationChargeTime') ||
          practiceData?.cancellationChargeTime,
        cancellationCharge:
          getValues('cancellationCharge') || practiceData?.cancellationCharge,
        cancellationLeadTime:
          getValues('cancellationLeadTime') ||
          practiceData?.cancellationLeadTime,
        cancellationRescheduleTime:
          getValues('cancellationRescheduleTime') ||
          practiceData?.cancellationRescheduleTime,
        cancellationPolicyText:
          getValues('cancellationPolicyText') ||
          practiceData?.cancellationPolicyText,
      };
      return data;
    }

    return {};
  }, [practiceData, getValues]);

  return (
    <Box>
      {isTitle ? <CardHeader title={isTitle} /> : null}
      <CardContent>
        <CustomForm
          formGroups={ServiceCancellationFormGroup}
          columnsPerRow={1}
          form={form}
          defaultValue={
            !isEmpty(defaultData) ? initialData : initialCancelationData
          }
        />
      </CardContent>
    </Box>
  );
};

export default ServiceCancellation;

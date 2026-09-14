import { CardContent } from '@mui/material';
import { cloneDeep } from 'lodash';
import { useCallback } from 'react';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import Container from 'src/components/Container';
import Table from 'src/components/Table';
import useQuery from 'src/hooks/useQuery';
import { DIAGNOSIS_LIST } from 'src/store/types';

const PatientDxs = ({
  patientId,
  patientDiagnosis = [],
  setPatientDiagnosis,
  singleSelection,
}) => {
  const patientDxsColumns = [
    {
      label: 'Problem Description',
      type: 'text',
      dataKey: 'problem.description',
      //   maxWidth: '10rem',
    },
    {
      label: 'ICD Description',
      type: 'text',
      dataKey: 'ICD.description',
      //   maxWidth: '10rem',
    },
    {
      label: 'Code',
      type: 'text',
      dataKey: 'ICD.name',
    },
  ];

  const onRowClick = useCallback(
    (row) => {
      const clonedPatientDiagnosis = cloneDeep(patientDiagnosis);
      const exsitingIndex = clonedPatientDiagnosis.findIndex(
        (item) => item?.id === row?.ICD.id
      );
      if(singleSelection){
        setPatientDiagnosis([
          {...row?.ICD},
        ]);
      }else{
      if (exsitingIndex !== -1) {
        clonedPatientDiagnosis.splice(exsitingIndex, 1);
        setPatientDiagnosis(clonedPatientDiagnosis);
      } else {
        setPatientDiagnosis([
          ...clonedPatientDiagnosis,
          {...row?.ICD},
        ]);
      }
    }
    },
    [patientDiagnosis, setPatientDiagnosis,singleSelection]
  );

  const onRowStyle = useCallback(
    (row) => {
      const isExist = patientDiagnosis.some(
        (item) => item?.id === row?.ICD?.id
      );
      if (isExist) {
        return { backgroundColor: '#B8E0FF' };
      }
      return {};
    },
    [patientDiagnosis]
  );

  const onHandleSubmit = () => {};

  const [
    response,
    loading,
    page,
    rowsPerPage,
    handlePageChange,
    filters,
    handleFilters,
    sort,
    handleSort,
    handleOnFetchDataList,
  ] = useQuery({
    listId: `${DIAGNOSIS_LIST}-${patientId}`,
    url: API_URL.diagnosis,
    type: REQUEST_METHOD.get,
    subscribeSocket: true,
    queryParams: { patientId },
  });

  return (
    <Container style={{ display: 'flex', flexDirection: 'column' }}>
      <CardContent>
        <Table
          data={response?.results}
          columns={patientDxsColumns}
          onRowClick={onRowClick}
          getRowStyle={onRowStyle}
        />
      </CardContent>
      
    </Container>
  );
};
export default PatientDxs;

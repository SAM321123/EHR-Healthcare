import { CardContent } from '@mui/material';
import Box from '@mui/material/Box';
import { cloneDeep } from 'lodash';
import { useCallback, useMemo } from 'react';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import Container from 'src/components/Container';
import FilterComponents from 'src/components/FilterComponents';
import Table from 'src/components/Table';
import useQuery from 'src/hooks/useQuery';

const Search = ({
  patientDiagnosis = [],
  setPatientDiagnosis,
  singleSelection,
}) => {
  const patientDxsColumns = [
    {
      label: 'Code',
      type: 'text',
      dataKey: 'name',
      //   maxWidth: '10rem',
    },
    {
      label: 'Description',
      dataKey: 'description',
      type: 'text',
    },
  ];

  const onRowClick = useCallback(
    (row) => {
      const clonedPatientDiagnosis = cloneDeep(patientDiagnosis);
      const exsitingIndex = clonedPatientDiagnosis.findIndex(
        (item) => item?.id === row.id
      );
      if (singleSelection) {
        setPatientDiagnosis([{ ...row }]);
      } else {
        if (exsitingIndex !== -1) {
          clonedPatientDiagnosis.splice(exsitingIndex, 1);
          setPatientDiagnosis(clonedPatientDiagnosis);
        } else {
          setPatientDiagnosis([...clonedPatientDiagnosis, { ...row }]);
        }
      }
    },
    [patientDiagnosis, setPatientDiagnosis]
  );

  const onRowStyle = useCallback(
    (row) => {
      const isExist = patientDiagnosis.some((item) => item?.id === row?.id);
      if (isExist) {
        return { backgroundColor: '#B8E0FF' };
      }
      return {};
    },
    [patientDiagnosis]
  );

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
    // listId: DIAGNOSIS_DATA,
    url: API_URL.diagnosisIcd,
    type: REQUEST_METHOD.get,
    subscribeSocket: true,
    // queryParams:{patientId}
  });

  const FilterCollectionIcd = useMemo(
    () =>
      FilterComponents({
        leftComponents: [
          {
            type: 'search',
            filterProps: {
              placeholder: 'Search',
            },
            name: 'searchText',
          },
        ],
      }),
    []
  );

  return (
    <Box>
      <Container style={{ display: 'flex', flexDirection: 'column' }}>
        <CardContent>
          <Table
            headerComponent={
              <div>
                <FilterCollectionIcd
                  onFilterChange={handleFilters}
                  filters={filters}
                />
              </div>
            }
            data={response?.results}
            columns={patientDxsColumns}
            onRowClick={onRowClick}
            getRowStyle={onRowStyle}
          />
        </CardContent>
      </Container>
    </Box>
  );
};
export default Search;

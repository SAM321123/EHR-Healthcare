/* eslint-disable no-unused-vars */
import { join } from 'lodash';
import { useMemo } from 'react';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import Container from 'src/components/Container';
import FilterComponents from 'src/components/FilterComponents';
import Table from 'src/components/Table';
import TableTextRendrer from 'src/components/TableTextRendrer';
import useAuthUser from 'src/hooks/useAuthUser';
import useQuery from 'src/hooks/useQuery';
import { dateFormats } from 'src/lib/constants';
import { ALLERGIES_LIST } from 'src/store/types';

const allergiesColumns = [
  {
    label: 'Allergent',
    type: 'text',
    dataKey: 'allergy',
    sort: true,
    maxWidth: '10rem',
  },
  {
    label: 'Severity',
    type: 'text',
    dataKey: 'severities.name',
    sort: true,
    maxWidth: '10rem',
  },
  {
    label: 'Reaction',
    type: 'text',
    dataKey: 'reaction.name',
    maxWidth: '10rem',
    sort: true,
    render: ({ data }) => (
      <TableTextRendrer>
        {join(
          data?.reactions?.map((item) => item.name),
          ','
        )}
      </TableTextRendrer>
    ),
  },
  {
    label: 'Date Onset',
    dataKey: 'dateOfOnSet',
    type: 'date',
    sort: true,
    format: dateFormats.MMDDYYYY,
  },
];

const PatientAllergiesList = ({showPatientInfo= true,applyContainer=true}={}) => {

  const [user] = useAuthUser();
  const patientId = user?.id;

  const FilterCollectionHeader = useMemo(
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
    listId: `${ALLERGIES_LIST}-${patientId}`,
    url: API_URL.allergies,
    type: REQUEST_METHOD.get,
    subscribeSocket: true,
    queryParams: { patientId },
  });

  return (
    <>
      <Container
        style={{ display: 'flex', flexDirection: 'column' }}
        loading={loading}
        applyContainer={applyContainer}
      >
        <Table
          headerComponent={
            <div>
              <FilterCollectionHeader
                onFilterChange={handleFilters}
                filters={filters}
              />
            </div>
          }
          data={response?.results}
          totalCount={response?.totalResults}
          columns={allergiesColumns}
          pagination
          rowsPerPage={rowsPerPage}
          page={page}
          handlePageChange={handlePageChange}
          loading={loading}
          sort={sort}
          handleSort={handleSort}
          wrapperStyle={{ boxShadow: 'none', borderRadius: 0 }}
          timezone
        />

      </Container>
    </>
  );
};

export default PatientAllergiesList;

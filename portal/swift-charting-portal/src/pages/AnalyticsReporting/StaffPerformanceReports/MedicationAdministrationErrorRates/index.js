import {  useMemo } from 'react';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import Container from 'src/components/Container';
import FilterComponents from 'src/components/FilterComponents';
import Table from 'src/components/Table';
import useQuery from 'src/hooks/useQuery';
import { MEDICATION_ERROR_RATES } from 'src/lib/tableConstants';
import { practitionerFilterParser } from 'src/lib/utils';
import Typography from 'src/components/Typography';


const MedicationAdministrationErrorRates = () => {
  const columns = [...MEDICATION_ERROR_RATES];

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
    listId: `mediction-error-rates`,
    url: `${API_URL.analyticsAndReporting}/staff-perfomace/medication-error-rates`,
    type: REQUEST_METHOD.get,
  });
  const FilterCollectionHeader = useMemo(
    () =>
      FilterComponents({
        leftComponents: [
          {
            type: 'search',
            filterProps: {
              placeholder: 'Search patient',
            },
            name: 'searchText',
          },
        ],
        rightComponents: [
          {
            type: 'wiredSelect',
            filterProps: {
              name: 'practitionerFilter',
              url: API_URL.staff,
              label: '',
              labelAccessor: [
                'title.name',
                'firstName',
                'middleName',
                'lastName',
              ],
              params: { isActive: true, limit: 300 },
              valueAccessor: 'id',
              placeholder: 'Filter by Practitioner',
              size: 'small',
              style: { maxWidth: '220px' },
              cache: false,
              clearData: true,
              isAllOptionNeeded: true,
              defaultValue: 'ALL',
            },
            name: 'practitionerId',
            parser: practitionerFilterParser,
          },
        ],
      }),
    []
  );

  return (
    <Container
      style={{ display: 'flex', flexDirection: 'column' }}
      loading={loading}
    >
      <Table
        headerComponent={
          <>
           <Typography
              sx={{ fontSize: 14, lineHeight: '20px', fontWeight: 600 }}
            >
              Medication Administration Error Rates
            </Typography>
      <FilterCollectionHeader
        onFilterChange={handleFilters}
        filters={filters}
      />
          </>
        }
        data={response?.results}
        totalCount={response?.totalResults}
        columns={columns}
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
  );
};

export default MedicationAdministrationErrorRates;

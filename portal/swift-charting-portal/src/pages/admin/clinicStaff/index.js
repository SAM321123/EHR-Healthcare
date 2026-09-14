/* eslint-disable no-unused-vars */
import { CheckCircleOutline } from '@mui/icons-material';
import { Box } from '@mui/material';
import { useMemo } from 'react';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import Container from 'src/components/Container';
import FilterComponents from 'src/components/FilterComponents';
import Table from 'src/components/Table';
import TableTextRendrer from 'src/components/TableTextRendrer';
import useQuery from 'src/hooks/useQuery';
import {
  clinicFilterParser,
  clinicStaffFilterParser,
  getFullName2,
} from 'src/lib/utils';
import { CLINIC_STAFF_LIST } from 'src/store/types';
import dayjs from 'dayjs';
import { activeInactiveStatusOptions } from 'src/lib/constants';

const columns = [
  {
    label: 'Name',
    type: 'text',
    dataKey: 'name',
    maxWidth: '10rem',
    render: ({ data }) => (
      //  <div style={{ display: 'flex', gap: 3.89, alignItems: 'center' }}>
      //    <img
      //      style={{
      //        height: 32,
      //        width: 32,
      //        borderRadius: 50,
      //        objectFit: 'cover',
      //        filter: 'opacity(0.5)',
      //      }}
      //      src={data?.file?.file ? getImageUrl(data?.file?.file) : userIcon}
      //      alt="patient image"
      //    />
      //  </div>
      <TableTextRendrer>{getFullName2(data)}</TableTextRendrer>
    ),
  },
  {
    label: 'Email',
    type: 'text',
    dataKey: 'email',
    maxWidth: '10rem',
  },
  {
    label: 'Practice Name',
    type: 'text',
    dataKey: 'clinicName',
    maxWidth: '10rem',
  },
  {
    label: 'Role',
    type: 'text',
    dataKey: 'role',
    maxWidth: '10rem',
    render: ({ data }) => (
      <TableTextRendrer>{data?.role || 'No roles assigned'}</TableTextRendrer>
    ),
  },
  {
    label: 'Prescriber',
    dataKey: 'isPrescriber',
    type: 'boolean',
    maxWidth: '10rem',
    render: ({ data }) => {
      return (
        <Box
          sx={{
            padding: 2,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            width: 'fit-content',
          }}
        >
          {data?.isPrescriber ? (
            <CheckCircleOutline color="success" />
          ) : (
            <CheckCircleOutline color="disabled" />
          )}
        </Box>
      );
    },
  },
  {
    label: 'Status',
    dataKey: 'isActive',
    type: 'boolean',
    activeData: 'Active',
    inActiveData: 'InActive',
    width: '10rem',
  },
];

const ClinicStaff = () => {
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
    listId: CLINIC_STAFF_LIST,
    url: API_URL.adminClinicStaff,
    type: REQUEST_METHOD.get,
    subscribeSocket: true,
  });

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
        rightComponents: [
            {
                    type: 'downloadButton',
                    filterProps: {
                      label: 'Download To CSV',
                       url: API_URL.adminClinicStaffCSV, // API to download from
                      confirmTitle: 'Download Staff Data',
                      confirmMessage: 'Are you sure you want to download the staff list?',
                    },
                  },


          {
            type: 'wiredSelect',
            filterProps: {
              name: 'isActive',
              defaultOptions: [
                {
                  name: 'Active',
                  id: 'true',
                },
                {
                  name: 'In Active',
                  id: 'false',
                },
              ],
              label: '',
              size: 'small',
              style: { maxWidth: '250px' },
              labelAccessor: 'name',
              valueAccessor: 'id',
              isAllOptionNeeded: true,
              defaultValue: 'ALL',
              disableClearable: true,
            },
            name: 'isActive',
            parser: clinicStaffFilterParser,
          },
          {
            type: 'autocomplete',
            filterProps: {
              name: 'clinicId',
              url: API_URL.adminPractices,
              label: '',
              placeholder: 'Filter by practice',
              size: 'large',
              style: { maxWidth: '200px' },
              fetchInitial: true,
            },
            name: 'clinicId',
            parser: clinicFilterParser,
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
          <FilterCollectionHeader
            onFilterChange={handleFilters}
            filters={filters}
          />
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

export default ClinicStaff;

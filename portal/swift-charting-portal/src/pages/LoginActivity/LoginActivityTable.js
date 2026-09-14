import React from 'react';
import Table from 'src/components/Table';
import palette from 'src/theme/palette';
import Container from 'src/components/Container';
import { CLINIC_LOGIN_ACTIVITY } from 'src/store/types';
import { clinicLoginAuditFilterParser, getUserTimezone } from 'src/lib/utils';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import useQuery from 'src/hooks/useQuery';
import FilterComponents from 'src/components/FilterComponents';
import TableTextRendrer from 'src/components/TableTextRendrer';
import dayjs from 'dayjs';
import { dateFormats } from 'src/lib/constants';

const columns = [
  {
    label: 'Email',
    type: 'text',
    dataKey: 'email',
    maxWidth: '10rem',
    sort: true,
  },
  {
    label: 'User IP',
    dataKey: 'userIp',
    type: 'text',
    maxWidth: '10rem',
    render: ({ data }) => (
      <TableTextRendrer style={{ maxWidth: '15rem' }}>
        {data?.userIp || 'N/A'}
      </TableTextRendrer>
    ),
  },
  {
    label: 'Country',
    type: 'text',
    dataKey: 'country',
    maxWidth: '10rem',
    render: ({ data }) => (
      <TableTextRendrer>{data?.country || 'N/A'}</TableTextRendrer>
    ),
  },
  {
    label: 'State',
    type: 'text',
    dataKey: 'state',
    maxWidth: '10rem',
    render: ({ data }) => (
      <TableTextRendrer>{data?.state || 'N/A'}</TableTextRendrer>
    ),
  },
  {
    label: 'City',
    type: 'text',
    dataKey: 'city',
    maxWidth: '10rem',
    render: ({ data }) => (
      <TableTextRendrer>{data?.city || 'N/A'}</TableTextRendrer>
    ),
  },
  {
    label: 'Login Date',
    dataKey: 'loginTime',
    type: 'date',
    maxWidth: '10rem',
    format: dateFormats.MMDDYYYY,
  },
  {
    label: 'Login Time',
    dataKey: 'loginTime',
    type: 'date',
    maxWidth: '10rem',
    format: dateFormats.hhmmA,
  },
  {
    label: 'Status',
    dataKey: 'status',
    type: 'text',
    maxWidth: '10rem',
  },
  //   {
  //     label: 'Browser Info',
  //     type: 'text',
  //     dataKey: 'deviceDetail',
  //     maxWidth: '10rem',
  //     render: ({ data }) => (
  //       <TableTextRendrer>{data?.deviceDetail || 'N/A'}</TableTextRendrer>
  //     ),
  //   },
];

const LoginActivityTable = () => {
  const timezone = getUserTimezone();

  const [
    mastersList,
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
    listId: CLINIC_LOGIN_ACTIVITY,
    url: API_URL.adminClinicLogin,
    type: REQUEST_METHOD.get,
    subscribeSocket: true,
    queryParams: {
      timezone,
    },
  });

  const FilterCollectionHeader = FilterComponents({
    leftComponents: [
      {
        type: 'search',
        filterProps: {
          placeholder: 'Search email',
        },
        name: 'searchText',
      },
    ],
    rightComponents: [
         {
        type: 'datePicker',
        name: 'from',
        filterProps: {
          maxDate: filters?.rawFilters?.to
            ? dayjs(filters?.rawFilters?.to)
            : undefined,
          style: { maxWidth: '200px' },
        },
      },
      {
        type: 'datePicker',
        name: 'to',
        filterProps: {
          minDate: filters?.rawFilters?.from
            ? dayjs(filters?.rawFilters?.from)
            : undefined,
          style: { maxWidth: '200px', },
        },
      },
      {
        type: 'autocomplete',
        filterProps: {
          name: 'practiceId',
          url: API_URL.adminPractices,
          label: '',
          placeholder: 'Filter by practice',
          size: 'large',
          style: { maxWidth: '200px' },
          fetchInitial: true,
        },
        name: 'practiceId',
        parser: clinicLoginAuditFilterParser,
      },
    ],

  });

  return (
    <>
      <Container
        style={{
          backgroundColor: palette.background.paper,
          padding: 0,
          boxShadow: `0px 0px 9px 4px ${palette.grey[200]}`,
        }}
        loading={loading}
      >

        <Table
          headerComponent={
            <FilterCollectionHeader
              onFilterChange={handleFilters}
              filters={filters}
            />
          }
          data={mastersList?.results}
          totalCount={mastersList?.totalResults}
          columns={columns}
          pagination
          rowsPerPage={rowsPerPage}
          page={page}
          handlePageChange={handlePageChange}
          loading={loading}
          sort={sort}
          handleSort={handleSort}
          wrapperStyle={{
            backgroundColor: palette.common.white,
            boxShadow: 'none',
            border: `1px solid ${palette.grey[200]}`,
            borderRadius: '0 5px 5px',
          }}
          timezone
        />
      </Container>
    </>
  );
};
export default LoginActivityTable;

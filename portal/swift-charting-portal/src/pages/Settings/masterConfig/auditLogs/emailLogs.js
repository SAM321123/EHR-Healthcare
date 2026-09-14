import React from 'react';
import Table from 'src/components/Table';
import palette from 'src/theme/palette';
import Container from 'src/components/Container';
import { EMAIL_LOGS } from 'src/store/types';
import { getUserTimezone } from 'src/lib/utils';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import useQuery from 'src/hooks/useQuery';
import FilterComponents from 'src/components/FilterComponents';
import { Typography } from '@mui/material';
import TableTextRendrer from 'src/components/TableTextRendrer';
import dayjs from 'dayjs';
import { dateFormats } from 'src/lib/constants';

const columns = [
  {
    label: 'Date',
    dataKey: 'dateTime',
    type: 'date',
    maxWidth: '10rem',
    format: dateFormats.MMDDYYYYhhmmA,
  },
  {
    label: 'Email',
    type: 'text',
    dataKey: 'email',
    maxWidth: '10rem',
    sort: true,
  },
  {
    label: 'Subject',
    dataKey: 'subject',
    type: 'text',
    maxWidth: '10rem',
  },
  {
    label: 'Status',
    type: 'text',
    dataKey: 'status',
    maxWidth: '10rem',
  },
  {
    label: 'Error Message',
    type: 'text',
    dataKey: 'errorMessage',
    maxWidth: '10rem',
    render: ({ data }) => (
      <TableTextRendrer>{data?.errorMessage || 'N/A'}</TableTextRendrer>
    ),
  },
  
];

const EmailLogs = () => {
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
    listId: EMAIL_LOGS,
    url: API_URL.emailLogs,
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
          placeholder: 'Search',
        },
        name: 'searchText',
      },
    ],
    // rightComponents: [
    //   {
    //     type: 'datePicker',
    //     name: 'from',
    //     filterProps: {
    //       maxDate: filters?.rawFilters?.to
    //         ? dayjs(filters?.rawFilters?.to)
    //         : undefined,
    //     },
    //   },
    //   {
    //     type: 'datePicker',
    //     name: 'to',
    //     filterProps: {
    //       minDate: filters?.rawFilters?.from
    //         ? dayjs(filters?.rawFilters?.from)
    //         : undefined,
    //     },
    //   },
    // ],
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
export default EmailLogs;

import React, { useCallback, useMemo, useState } from 'react';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import FilterComponents from 'src/components/FilterComponents';
import Table from 'src/components/Table';
import TableTextRendrer from 'src/components/TableTextRendrer';
import useQuery from 'src/hooks/useQuery';
import { dateFormats } from 'src/lib/constants';
import {
  dateRangeFilterParser,
  getUserTimezone,
  procedureCodeFilterParser,
} from 'src/lib/utils';
import palette from 'src/theme/palette';
import Typography from 'src/components/Typography';
import Container from 'src/components/Container';
import { Box } from '@mui/material';
import dayjs from 'dayjs';

const ProcedureReport = () => {
   const timezone = getUserTimezone();
  // const [startDate, setStartDate] = useState(null);
  // const [endDate, setEndDate] = useState(null);
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
    listId: `procedure-report`,
    url: `${API_URL.analyticsAndReporting}/procedure-report`,
    type: REQUEST_METHOD.get,
    subscribeSocket: true,
    queryParams: {
      timezone,
    },
  });

  // const data = response?.results;
  const columns = [
    {
      label: 'Name',
      type: 'text',
      maxWidth: '10rem',
      dataKey: 'procedureCode.name',
    },
    {
      label: `Description`,
      type: 'text',
      dataKey: 'procedureCode.description',
      maxWidth: '10rem',
    },
    {
      label: `CPT`,
      type: 'text',
      dataKey: 'procedureCode.cptCode',
      maxWidth: '10rem',
    },
    {
      label: 'Date',
      type: 'date',
      dataKey: 'createdAt',
      maxWidth: '8rem',
      format: dateFormats.MMDDYYYY,
    },
    {
      label: 'volume',
      type: 'text',
      dataKey: 'qty',
      maxWidth: '10rem',
    },
    {
      label: 'Price',
      type: 'text',
      dataKey: 'price',
      maxWidth: '10rem',
      render: ({ data }) => (
        <TableTextRendrer style={{ maxWidth: '8rem' }}>
          {data?.price ? `$${data?.price}` : 'N/A'}
        </TableTextRendrer>
      ),
    },
    {
      label: 'Discount Percentage',
      type: 'text',
      dataKey: 'discPer',
      maxWidth: '10rem',
      render: ({ data }) => (
        <TableTextRendrer style={{ maxWidth: '8rem' }}>
          {data?.discPer ? `${data?.discPer}%` : 'N/A'}
        </TableTextRendrer>
      ),
    },
    {
      label: 'Discount Amount',
      type: 'text',
      dataKey: 'discAmt',
      maxWidth: '10rem',
      render: ({ data }) => (
        <TableTextRendrer style={{ maxWidth: '8rem' }}>
          {data?.discAmt ? `$${data?.discAmt}` : 'N/A'}
        </TableTextRendrer>
      ),
    },
    {
      label: 'Tax Percentage',
      type: 'text',
      dataKey: 'taxPer',
      maxWidth: '10rem',
      render: ({ data }) => (
        <TableTextRendrer style={{ maxWidth: '8rem' }}>
          {data?.taxPer ? `${data?.taxPer}%` : 'N/A'}
        </TableTextRendrer>
      ),
    },
    {
      label: 'Tax Amount',
      type: 'text',
      dataKey: 'taxAmt',
      maxWidth: '10rem',
      render: ({ data }) => (
        <TableTextRendrer style={{ maxWidth: '8rem' }}>
          {data?.taxAmt ? `$${data?.taxAmt}` : 'N/A'}
        </TableTextRendrer>
      ),
    },
    {
      label: 'Total Charges',
      type: 'text',
      dataKey: 'total',
      maxWidth: '10rem',
      render: ({ data }) => (
        <TableTextRendrer style={{ maxWidth: '8rem' }}>
          {data?.total ? `$${data?.total}` : 'N/A'}
        </TableTextRendrer>
      ),
    },
  ];

  // const handleChangePatient = (value) => {
  //   setPatientId(value ? value?.id : null);
  //   handleFilters({patientId: patientId})
  // };
  // const handleChangePractitioner = (value) => {
  //   setPractitionerId(value ? value?.id : null);
  //   handleFilters({practitionerId: practitionerId})
  // };

  const FilterCollectionHeader = useMemo(
    () =>
      FilterComponents({
        leftComponents: [
          {
            type: 'datePicker',
            name: 'from',
            filterProps: {
              maxDate: filters?.rawFilters?.to ? dayjs(filters?.rawFilters?.to) : undefined
            }
          },
          {
            type: 'datePicker',
            name: 'to',
            filterProps: {
              minDate: filters?.rawFilters?.from ? dayjs(filters?.rawFilters?.from) : undefined
            }
          },
          // {
          //   type: 'dateRangePicker',
          //   name: 'dateRangePicker',
          //   filterProps: {
          //     tabaleId: 'procedure_report'
          //   },  

          //   parser: dateRangeFilterParser,
          // },
        ],
        rightComponents: [
          {
            type: 'autocomplete',
            filterProps: {
              name: 'procedureCodeId',
              url: API_URL.procedureCode,
              label: '',
              labelAccessor: 'name',
              placeholder: 'Filter by procedure code',
              size: 'small',
              style: { maxWidth: '220px' },
              fetchInitial: true,
              params: { isActive: true, limit: 300 },
              showDescription: true,
              descriptionAccessor: 'description',
            },
            name: 'procedureCodeId',
            parser: procedureCodeFilterParser,
          },
        ],
      }),
    []
  );
  return (
    <div style={{ marginTop: '40px' }}>
      <Box
        sx={{
          border: '1px solid #ccc',
          borderRadius: '8px',
          padding: '16px',
          backgroundColor: '#f9f9f9',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Typography
          sx={{
            fontSize: '20px',
            fontWeight: 800,
            lineHeight: '20px',
            color: palette.text.dark,
            padding: '8px',
          }}
        >
          Procedure Report
        </Typography>
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
      </Box>
    </div>
  );
};

export default ProcedureReport;

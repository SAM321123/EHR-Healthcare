import React, { useMemo } from 'react';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import FilterComponents from 'src/components/FilterComponents';
import Table from 'src/components/Table';
import TableTextRendrer from 'src/components/TableTextRendrer';
import useQuery from 'src/hooks/useQuery';
import { dateFormats, roleTypes } from 'src/lib/constants';
import {
  appointmenStatusFilterParser,
  appointmentTypeFilterParser,
  getFullName,
  practitionerFilterParser,
  staffNameFilterParser,
} from 'src/lib/utils';
import palette from 'src/theme/palette';
import Typography from 'src/components/Typography';
import Container from 'src/components/Container';
import { Box } from '@mui/material';

const AppointmentListReport = () => {
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
    listId: `patient-appointment-list-report`,
    url: `${API_URL.analyticsAndReporting}/get-appointment-list-report`,
    type: REQUEST_METHOD.get,
    subscribeSocket: true,
  });

  // const data = response?.results;
  const columns = [
    {
      label: `Appointment Title`,
      type: 'text',
      dataKey: 'title',
      sort: true,
      maxWidth: '10rem',
      render: ({ data }) => (
        <>
          <TableTextRendrer>{data?.title || 'N/A'}</TableTextRendrer>
        </>
      ),
    },
    {
      label: `Practitioner`,
      type: 'text',
      dataKey: 'practitionerId',
      sort: true,
      maxWidth: '10rem',
      render: ({ data }) => (
        <>
          <TableTextRendrer>{getFullName(data?.practitioner)}</TableTextRendrer>
        </>
      ),
    },
    {
      label: 'Date',
      dataKey: 'startDateTime',
      type: 'date',
      sort: true,
      maxWidth: '10rem',
      format: dateFormats.MMDDYYYY,
    },
    {
      label: 'Start Time',
      dataKey: 'startDateTime',
      type: 'date',
      sort: true,
      maxWidth: '10rem',
      format: dateFormats.hhmmA,
    },
    {
      label: 'End Time',
      dataKey: 'endDateTime',
      type: 'date',
      sort: true,
      maxWidth: '10rem',
      format: dateFormats.hhmmA,
    },
    {
      label: `Appointment Type`,
      type: 'text',
      dataKey: 'type',
      maxWidth: '10rem',
      render: ({ data }) => (
        <>
          <TableTextRendrer>{data?.type?.name}</TableTextRendrer>
        </>
      ),
    },
    {
      label: `Status`,
      type: 'text',
      dataKey: 'status.name',
      maxWidth: '10rem',
    },
    {
      label: `Virtual Appointment`,
      type: 'text',
      dataKey: 'isVirtual',
      maxWidth: '10rem',
      render: ({ data }) => (
        <>
          <TableTextRendrer>{data.isVirtual ? 'Yes' : 'No'}</TableTextRendrer>
        </>
      ),
    },
    {
      label: `Recurring Appointment`,
      type: 'text',
      dataKey: 'isRecurring',
      maxWidth: '10rem',
      render: ({ data }) => (
        <>
          <TableTextRendrer>{data.isRecurring ? 'Yes' : 'No'}</TableTextRendrer>
        </>
      ),
    },
  ];

  // const handleFilterChange = () => {
  //     console.log('handle filter chnage ')
  // }

  const FilterCollectionHeader = useMemo(
    () =>
      FilterComponents({
        rightComponents: [
          {
            type: 'wiredSelect',
            filterProps: {
              name: 'appointmentTypeFilter',
              url: `${API_URL.getMasters}/appointment_type`,
              label:"Appointment Type",
              labelAccessor: [
                'name',
              ],
              params: {
                isActive: true,
                limit: 20,
              },
              valueAccessor: 'code',
              placeholder: 'Filter by Appointment Type ',
              size: 'small',
              style: { maxWidth: '220px' },
              cache: false,
              clearData: true,
              isAllOptionNeeded: true,
              defaultValue: 'ALL',
            },
            name: 'typeCode',
            parser: appointmentTypeFilterParser,
          },
          {
            type: 'wiredSelect',
            filterProps: {
              name: 'appointmentStausFilter',
              url: `${API_URL.getMasters}/appointment_status`,
              label:"Appointment Status",
              labelAccessor: [
                'name'
              ],
              params: {
                isActive: true,
                limit: 20,
              },
              valueAccessor: 'code',
              placeholder: 'Filter by Practitioner',
              size: 'small',
              style: { maxWidth: '220px' },
              cache: false,
              clearData: true,
              isAllOptionNeeded: true,
              defaultValue: 'ALL',
            },
            name: 'statusCode',
            parser: appointmenStatusFilterParser,
          },
          {
            type: 'wiredSelect',
            filterProps: {
              name: 'practitionerFilter',
              url: API_URL.staff,
              label:"Practitioner Name",
              labelAccessor: [
                'title.name',
                'firstName',
                'middleName',
                'lastName',
              ],
              params: {
                isActive: true,
                limit: 300,
                role: roleTypes.practitioner,
              },
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
          All Appointments
        </Typography>
        <Container
          style={{ display: 'flex', flexDirection: 'column' }}
          loading={loading}
        >
          <Table
            headerComponent={
              <>
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
      </Box>
    </div>
  );
};

export default AppointmentListReport;

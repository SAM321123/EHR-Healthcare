import { useMemo } from 'react';
import dayjs from 'dayjs';

import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import Container from 'src/components/Container';
import FilterComponents from 'src/components/FilterComponents';
import Table from 'src/components/Table';
import TableTextRendrer from 'src/components/TableTextRendrer';
import useQuery from 'src/hooks/useQuery';
import { dateFormats } from 'src/lib/constants';
import { clinicFilterParser, getUserTimezone } from 'src/lib/utils';
import { CLINIC_CRON_LOGS } from 'src/store/types';
import './cronLogs.scss';

const cronMethodOptions = [
  {
    id: 'sendAppointmentReminderMinutely',
    name: 'Send Appointment Reminder Minutely',
  },
  {
    id: 'getLabOrderResultTask',
    name: 'Get Lab Order Result',
  },
  {
    id: 'deactivateCalendarSchedule',
    name: 'Deactivate Calendar Schedule',
  },
  {
    id: 'markAppointmentMissedTask',
    name: 'Mark Appointment Missed',
  },
  {
    id: 'readOutboundFile',
    name: 'Read Outbound File',
  },
  {
    id: 'readClaimFile',
    name: 'Read Claim File',
  },
  {
    id: 'subscriptionUpdate',
    name: 'Subscription Update',
  },
  {
    id: 'trialExpiryReminder',
    name: 'Trial Expiry Reminder',
  },
  {
    id: 'subscriptionRenew',
    name: 'Subscription Renew',
  },
];

const cronMethodFilterParser = (filter) => {
  const appliedFilter = { ...filter };

  if (appliedFilter?.method === 'ALL') {
    delete appliedFilter.method;
  }

  return appliedFilter;
};

const formatCronError = (error) => {
  if (!error) {
    return 'N/A';
  }

  if (typeof error === 'string') {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch (stringifyError) {
    return String(error);
  }
};

const columns = [
  {
    label: 'Date',
    dataKey: 'createdAt',
    type: 'date',
    format: dateFormats.MMDDYYYYhhmmA,
    sort: true,
    maxWidth: '12rem',
  },
  {
    label: 'Cron Method',
    type: 'text',
    dataKey: 'method',
    sort: true,
    maxWidth: '12rem',
    render: ({ data }) => (
      <TableTextRendrer>{data?.method || 'N/A'}</TableTextRendrer>
    ),
  },
  {
    label: 'Status',
    type: 'text',
    dataKey: 'status',
    sort: true,
    maxWidth: '8rem',
    render: ({ data }) => (
      <TableTextRendrer>{data?.status || 'N/A'}</TableTextRendrer>
    ),
  },
  {
    label: 'Time Taken',
    type: 'text',
    dataKey: 'timeTaken',
    sort: true,
    maxWidth: '8rem',
    render: ({ data }) => (
      <TableTextRendrer>
        {data?.timeTaken ? `${data.timeTaken} ms` : 'N/A'}
      </TableTextRendrer>
    ),
  },
  {
    label: 'Error',
    type: 'text',
    dataKey: 'error',
    maxWidth: '16rem',
    render: ({ data }) => (
      <TableTextRendrer>{formatCronError(data?.error)}</TableTextRendrer>
    ),
  },
];

const ClinicCronLogs = () => {
  const timezone = getUserTimezone();

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
  ] = useQuery({
    listId: CLINIC_CRON_LOGS,
    url: API_URL.adminCronLogs,
    type: REQUEST_METHOD.get,
    subscribeSocket: true,
    queryParams: { timezone },
  });

  const emptyMessage = filters?.parsedFilters?.clinicId
    ? 'No cron logs found for the selected clinic.'
    : 'Please select a clinic/practice to view cron logs.';

  const FilterCollectionHeader = useMemo(
    () =>
      FilterComponents({
        leftComponents: [
          {
            type: 'search',
            filterProps: {
              placeholder: 'Search method, status, time taken or error',
              height: '40px',
              style: {
                width: '240px',
                minWidth: '240px',
              },
            },
            name: 'searchText',
          },
        ],
        rightComponents: [
          {
            type: 'autocomplete',
            filterProps: {
              name: 'clinicId',
              url: API_URL.adminPractices,
              placeholder: 'Filter by practice',
              size: 'small',
              style: {
                maxWidth: '190px',
                minWidth: '190px',
              },
              fetchInitial: true,
            },
            name: 'clinicId',
            parser: clinicFilterParser,
          },
          {
            type: 'wiredSelect',
            filterProps: {
              name: 'method',
              defaultOptions: cronMethodOptions,
              label: '',
              size: 'small',
              style: {
                maxWidth: '210px',
                minWidth: '210px',
              },
              labelAccessor: 'name',
              valueAccessor: 'id',
              isAllOptionNeeded: true,
              allOptionLabel: 'All Methods',
              defaultValue: 'ALL',
              disableClearable: true,
            },
            name: 'method',
            parser: cronMethodFilterParser,
          },
          {
            type: 'datePicker',
            name: 'from',
            filterProps: {
              label: '',
              placeholder: 'From',
              maxDate: filters?.rawFilters?.to
                ? dayjs(filters.rawFilters.to)
                : undefined,
              style: {
                maxWidth: '150px',
                minWidth: '150px',
              },
            },
          },
          {
            type: 'datePicker',
            name: 'to',
            filterProps: {
              label: '',
              placeholder: 'To',
              minDate: filters?.rawFilters?.from
                ? dayjs(filters.rawFilters.from)
                : undefined,
              style: {
                maxWidth: '150px',
                minWidth: '150px',
              },
            },
          },
        ],
      }),
    [filters]
  );

  return (
    <Container style={{ display: 'flex', flexDirection: 'column' }} loading={loading}>
      <Table
        headerComponent={
          <FilterCollectionHeader
            onFilterChange={handleFilters}
            filters={filters}
            className="cron-log-filters"
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
        emptyMessage={emptyMessage}
      />
    </Container>
  );
};

export default ClinicCronLogs;

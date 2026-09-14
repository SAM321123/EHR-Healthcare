/* eslint-disable no-unused-vars */
import { Box } from '@mui/material';
import { useMemo } from 'react';
import dayjs from 'dayjs';

import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import Container from 'src/components/Container';
import FilterComponents from 'src/components/FilterComponents';
import Table from 'src/components/Table';
import TableTextRendrer from 'src/components/TableTextRendrer';
import useQuery from 'src/hooks/useQuery';

import {
  clinicFilterParser,
  clinicwisePractitionerFilterParser,
  formatPatientNames,
  getFullName,
  getUserTimezone,
} from 'src/lib/utils';

import { CLINIC_APPOINTMENT } from 'src/store/types';
import { dateFormats, roleTypes } from 'src/lib/constants';

const columns = [
  {
    label: 'Patient Name',
    type: 'text',
    sort: true,
    maxWidth: '10rem',
    dataKey: 'id',
    render: ({ data }) => (
      <TableTextRendrer>
        {formatPatientNames(data?.patients || [])}
      </TableTextRendrer>
    ),
  },
  {
    label: 'Status',
    type: 'text',
    dataKey: 'statusCode',
    maxWidth: '10rem',
    render: ({ data }) => (
      <TableTextRendrer>{data?.status?.name || 'N/A'}</TableTextRendrer>
    ),
  },
  {
    label: 'Date',
    dataKey: 'startDateTime',
    type: 'date',
    format: dateFormats.MMDDYYYYhhmmA,
    sort: true,
    maxWidth: '10rem',
  },
  {
    label: 'Provider',
    sort: true,
    maxWidth: '10rem',
    dataKey: 'practitionerId',
    render: ({ data }) => (
      <TableTextRendrer>
        {getFullName(data?.practitioner)}
      </TableTextRendrer>
    ),
  },
  {
    label: 'Type',
    dataKey: 'typeCode',
    type: 'text',
    sort: true,
    maxWidth: '10rem',
    render: ({ data }) => (
      <TableTextRendrer>{data?.type?.name || 'N/A'}</TableTextRendrer>
    ),
  },
  {
    label: 'Reason for appointment',
    dataKey: 'reasonForAppointment',
    type: 'text',
    sort: true,
    maxWidth: '5rem',
    render: ({ data }) => (
      <TableTextRendrer>{data?.reasonForAppointment || 'N/A'}</TableTextRendrer>
    ),
  },
];

const ClinicAppointment = () => {
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
    listId: CLINIC_APPOINTMENT,
    url: API_URL.adminClinicAppointment,
    type: REQUEST_METHOD.get,
    subscribeSocket: true,
    queryParams: { timezone },
  });

  // ✅ derived state (no useState needed)
  const showPractitionerFilter = Boolean(filters?.parsedFilters?.clinicId);

  const FilterCollectionHeader = useMemo(
    () =>
      FilterComponents({
        leftComponents: [
          {
            type: 'datePicker',
            name: 'from',
            filterProps: {
              maxDate: filters?.rawFilters?.to
                ? dayjs(filters.rawFilters.to)
                : undefined,
              style: { maxWidth: '200px' },
            },
          },
          {
            type: 'datePicker',
            name: 'to',
            filterProps: {
              minDate: filters?.rawFilters?.from
                ? dayjs(filters.rawFilters.from)
                : undefined,
              style: { maxWidth: '200px' },
            },
          },
        ],

        rightComponents: [
          {
            type: 'autocomplete',
            filterProps: {
              name: 'clinicId',
              url: API_URL.adminPractices,
              placeholder: 'Filter by practice',
              size: 'large',
              style: { maxWidth: '200px' },
              fetchInitial: true,
            },
            name: 'clinicId',
            parser: clinicFilterParser,
          },

          ...(showPractitionerFilter
            ? [
                {
                  type: 'autocomplete',
                  filterProps: {
                    name: 'practitionerId',
                    url: API_URL.adminClinicwiseStaff,
                    params: {
                      clinicId: filters?.parsedFilters?.clinicId,
                      role: roleTypes.practitioner,
                    },
                    labelAccessor: [
                      'title.name',
                      'firstName',
                      'middleName',
                      'lastName',
                    ],
                    placeholder: 'Filter by practitioner',
                    size: 'large',
                    style: { maxWidth: '200px' },
                    fetchInitial: true,
                  },
                  name: 'practitionerId',
                  parser: clinicwisePractitionerFilterParser,
                },
              ]
            : []),
        ],
      }),
    [filters, showPractitionerFilter]
  );

  return (
    <Container style={{ display: 'flex', flexDirection: 'column' }} loading={loading}>
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

export default ClinicAppointment;

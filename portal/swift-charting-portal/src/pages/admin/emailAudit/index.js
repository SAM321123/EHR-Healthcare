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
    getUserTimezone,
} from 'src/lib/utils';

import {  CLINIC_EMAIL_LOGS } from 'src/store/types';
import { dateFormats, roleTypes } from 'src/lib/constants';



const EmailAudit = () => {
    const timezone = getUserTimezone();

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
        listId: CLINIC_EMAIL_LOGS,
        url: API_URL.adminClinicEmailLogs,
        type: REQUEST_METHOD.get,
        subscribeSocket: true,
        queryParams: { timezone },
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
                    }
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

export default EmailAudit;

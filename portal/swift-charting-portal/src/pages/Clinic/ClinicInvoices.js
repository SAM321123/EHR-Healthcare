import React, { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Typography,
} from '@mui/material';
import { API_URL, REQUEST_METHOD } from "src/api/constants";
import { GET_SUBSCRIPTION_INVOICES } from "src/store/types";
import Container from "src/components/Container";
import Table from 'src/components/Table';
import useQuery from 'src/hooks/useQuery';
import { convertWithTimezone } from 'src/lib/utils';
import { dateFormats } from 'src/lib/constants';
import { useParams } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import TableTextRendrer from 'src/components/TableTextRendrer';
import dayjs from 'dayjs';

const ClinicInvoices = () => {
  const params = useParams();  
  
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [selectedYear, setSelectedYear] = useState(dayjs());

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
    listId: GET_SUBSCRIPTION_INVOICES,
    url: `${API_URL.clinic}/invoices/${params?.clinicId}`,
    type: REQUEST_METHOD.get,
    subscribeSocket: true,
  });

  const formatCurrency = (amount, currency = 'USD') => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
      }).format(amount);
    } catch {
      return `${currency} ${amount}`;
    }
  };

  const columns = [
    {
      label: 'Subscription ID',
      type: 'text',
      dataKey: 'subscriptionId',
      sort: true,
      maxWidth: '10rem',
      render: ({ data }) => <TableTextRendrer style={{ fontWeight: 800}}>{data?.subscriptionId}</TableTextRendrer>
    },
    {
      label: 'Amount Paid',
      type: 'text',
      dataKey: 'amountPaid',
      sort: true,
      render: ({ data }) => {
        const statusColor = {
          paid: 'green',
          open: 'orange',
          failed: 'red',
        }[data?.status?.toLowerCase()] || 'gray';

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TableTextRendrer>
              {formatCurrency(data?.amountPaid, data?.currency)}
            </TableTextRendrer>
            {data?.status && (
              <Chip
                label={data?.status}
                size="small"
                sx={{
                  backgroundColor: statusColor,
                  color: '#fff',
                  textTransform: 'capitalize',
                }}
              />
            )}
          </Box>
        );
      },
    },
    {
      label: 'Invoice Number',
      type: 'text',
      dataKey: 'invoiceNumber',
      sort: true,
      render: ({ data }) => (
        <Typography
          variant="body2"
          sx={{
            textDecoration: 'underline',
            cursor: 'pointer',
            color: 'primary.main',
            fontWeight: 500,
          }}
        >
          {data?.rawEvent?.number || '-'}
        </Typography>
      ),
    },
    {
      label: 'Created At',
      type: 'text',
      dataKey: 'created',
      sort: true,
      render: ({ data }) => {
        return <>
          <TableTextRendrer>
            {convertWithTimezone(
              data?.paymentDate, 
              { format: dateFormats.MMDDYYYYhhmmA }
            )}
          </TableTextRendrer>
        </>;
      },
    },
    {
      label: 'Actions',
      type: 'custom',
      dataKey: 'actions',
      render: ({ data }) =>
        data?.rawEvent?.invoice_pdf ? (
          <Button
            size="small"
            variant="outlined"
            href={data.rawEvent.invoice_pdf}
            target="_blank"
            rel="noopener noreferrer"
          >
            Download PDF
          </Button>
        ) : (
          <Typography variant="caption" color="text.secondary">
            Not available
          </Typography>
        ),
    },
  ];

  return (
    <Container
      maxWidth="lg"
      sx={{
        mt: 4,
        mb: 4,
        p: 3,
        backgroundColor: '#fff',
        borderRadius: 2,
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          alignItems: 'center',
          flexWrap: 'wrap',
          mb: 2,
          mt: 2,
        }}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            views={['year']}
            label="Select Year"
            value={selectedYear}
            onChange={(newValue) => {
              if (newValue) {
                setSelectedYear(newValue);
                handleFilters({
                  ...filters?.parsedFilters,
                  year: newValue.year(), // Note: 0-based (Jan = 0)
                });
              }
            }}
            slotProps={{
              textField: {
                variant: 'outlined',
                size: 'small',
              },
            }}
          />
        </LocalizationProvider>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            views={['month']}
            label="Select Month"
            value={selectedMonth}
            onChange={(newValue) => {
              if (newValue) {
                setSelectedMonth(newValue);
                handleFilters({
                  ...filters?.parsedFilters,
                  month: newValue.month(), // Note: 0-based (Jan = 0)
                });
              }
            }}
            slotProps={{
              textField: {
                variant: 'outlined',
                size: 'small',
              },
            }}
          />
        </LocalizationProvider>
      </Box>
      <Table
        data={response}
        totalCount={response?.length}
        columns={columns}
        pagination
        rowsPerPage={rowsPerPage}
        page={page}
        handlePageChange={handlePageChange}
        loading={loading}
        sort={sort}
        handleSort={handleSort}
        timezone
        wrapperStyle={{
          boxShadow: 'none',
          borderRadius: 0,
        }}
      />
    </Container>
  );
};

export default ClinicInvoices;
import {
  ArcElement as ChartJSArcElement,
  Chart as ChartJS,
  Tooltip,
} from 'chart.js';
import { useCallback, useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2'; // Import Pie instead of Doughnut
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import useCRUD from 'src/hooks/useCRUD';
import { Legend } from '../PatientsDemographicReport/chartUtils';
import { getFullName, getUserTimezone } from 'src/lib/utils';
import Typography from 'src/components/Typography';
import { LocalizationProvider } from '@mui/x-date-pickers-pro/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers-pro/AdapterDayjs';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import dayjs from 'dayjs';
import { Box, Grid, TextField } from '@mui/material';
import Container from 'src/components/Container';
import Table from 'src/components/Table';
import { MEDICATION_ADMINISTRATION } from 'src/lib/tableConstants';
import palette from 'src/theme/palette';
import ModalComponent from 'src/components/modal';
import ViewEmarDetails from './viewEmartDetails';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

ChartJS.register(ChartJSArcElement, Tooltip);

const status = [
  { label: 'On Time', value: 'onTime' },
  { label: 'Delayed', value: 'delayed' },
  { label: 'Before Time', value: 'beforeTime' },
  { label: 'Missed', value: 'missed' },
  { label: 'Incorrect', value: 'incorrect' },
];
const MedicationAdministeredOnTimeReport = ({ practitioners }) => {
  const [emarData, setEmarData] = useState();
  const [modalOpen, setModalOpen] = useState(false);
  const timezone = getUserTimezone();
  const columns = [...MEDICATION_ADMINISTRATION];

  const [selectedPractitioner, setSelectedPractitioner] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  // const [selectedDateRange, setSelectedDateRange] = useState([null, null]); // State to store date range
  const [response, , loading, getReport] = useCRUD({
    id: `mediction-administered-report`,
    url: `${API_URL.analyticsAndReporting}/get-medication-administered`,
    type: REQUEST_METHOD.get,
  });

  useEffect(() => {
    getReport({
      timezone,
      practitionerId: selectedPractitioner,
      startDate: startDate ? dayjs(startDate).format('YYYY-MM-DD') : null, // Format date to ISO string
      endDate: endDate ? dayjs(endDate).format('YYYY-MM-DD') : null, // Format date to ISO string
      status: selectedStatus,
    });
  }, [selectedPractitioner, startDate, getReport, selectedStatus, endDate]);

  const chartLabels = response?.result?.map((item) => item.group);
  const chartValues = response?.result?.map((item) => parseInt(item.count, 10));
  const colors = ['#4CAF50', '#ff9203', '#FFEB3B', '#0f03ff', '#ff0303'];
  const data = {
    labels: chartLabels || [],
    datasets: [
      {
        data: chartValues || [],
        backgroundColor: colors,
        hoverBackgroundColor: colors,
        borderWidth: 1,
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false, // Disable the legend
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce(
              (acc, val) => acc + val,
              0
            ); // Sum of all values
            const percentage = total
              ? Number.isInteger((value / total) * 100)
                ? (value / total) * 100
                : ((value / total) * 100).toFixed(2)
              : 0;
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
      datalabels: {
        display: false, // Hide the labels on the chart
      },
    },
  };

  const handleViewEmar = useCallback((rowData) => {
    if (rowData) {
      setEmarData(rowData);
      setModalOpen(true);
    }
  }, []);

  const handlePractitionerChange = (e) => {
    const value = e.target.value === '' ? null : Number(e.target.value);
    setSelectedPractitioner(isNaN(value) ? null : value);
  };
  const handleStatusChange = (e) => {
    const value = e.target.value === '' ? null : e.target.value;
    setSelectedStatus(value);
  };

  // const handleDateRangeChange = (newValue) => {
  //   setSelectedDateRange(newValue);
  // };

  const closeEmarModal = useCallback(() => {
    setModalOpen(false);
    setEmarData(null);
  }, []);

  const moreActions = [
    {
      label: 'View',
      icon: 'view',
      action: handleViewEmar,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} sm={6} md={4}>
          <Typography
            sx={{
              fontSize: '20px',
              fontWeight: 800,
              lineHeight: '20px',
              color: palette.text.dark,
              padding: '8px',
            }}
          >
            Medication Administration Accuracy
          </Typography>
          <Legend
            labels={data?.labels}
            data={data?.datasets?.[0]?.data}
            colors={colors}
            pieChart={true}
          />
          <div>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={12} md={12}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <DatePicker
                      label="From"
                      value={startDate}
                      onChange={(newValue) => setStartDate(newValue)}
                      renderInput={(params) => (
                        <TextField {...params} fullWidth />
                      )}
                    />
                    <Typography variant="h6">-</Typography>
                    <DatePicker
                      label="To"
                      value={endDate}
                      onChange={(newValue) => setEndDate(newValue)}
                      minDate={startDate} // Prevents selecting an end date before the start date
                      renderInput={(params) => (
                        <TextField {...params} fullWidth />
                      )}
                    />
                  </Box>
                </LocalizationProvider>
                {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateRangePicker
                    startText="Start Date"
                    endText="End Date"
                    value={selectedDateRange}
                    onChange={handleDateRangeChange}
                    localeText={{ start: 'From', end: 'To' }}
                  />
                </LocalizationProvider> */}
              </Grid>
              <Grid item xs={12} sm={12} md={6}>
                <select
                  onChange={handlePractitionerChange}
                  defaultValue={selectedPractitioner}
                  style={{
                    flex: '1 1 30%',
                    minWidth: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                >
                  <option value={null}>All Clinician</option>
                  {practitioners?.map((practitioner, idx) => (
                    <option key={idx} value={practitioner.id}>
                      {getFullName(practitioner)}
                    </option>
                  ))}
                </select>
              </Grid>
              <Grid item xs={12} sm={12} md={6}>
                <select
                  onChange={handleStatusChange}
                  defaultValue={selectedStatus}
                  style={{
                    flex: '1 1 30%',
                    minWidth: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                >
                  <option value="">All</option>
                  {status?.map((item, idx) => (
                    <option key={idx} value={item.value}>
                      {item?.label}
                    </option>
                  ))}
                </select>
              </Grid>
            </Grid>
          </div>
          <div
            style={{
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              margin: '2px',
            }}
          >
            <Pie data={data} options={options} />
          </div>
        </Grid>
        <Grid item xs={12} sm={6} md={8}>
          <Container
            style={{ display: 'flex', flexDirection: 'column' }}
            loading={loading}
          >
            <Table
              data={response?.EMARMedication}
              // totalCount={response?.results?.totalResults}
              columns={columns}
              // pagination
              // rowsPerPage={rowsPerPage}
              // page={page}
              // handlePageChange={handlePageChange}
              // loading={loading}
              // sort={sort}
              // handleSort={handleSort}
              isScroll={true}
              wrapperStyle={{ boxShadow: 'none', borderRadius: 0 }}
              timezone
              actionButtons={moreActions}
            />
          </Container>
        </Grid>
      </Grid>
      {modalOpen && (
        <ModalComponent
          open={modalOpen}
          header={{
            title: 'View Details',
            closeIconAction: closeEmarModal,
          }}
          modalStyle={{ width: '100%' }}
        >
          <ViewEmarDetails emarData={emarData} />
        </ModalComponent>
      )}

      {/* {!loading && response ? ( */}

      {/* ) : (
        <Typography>Loading...</Typography>
      )} */}
    </div>
  );
};

export default MedicationAdministeredOnTimeReport;

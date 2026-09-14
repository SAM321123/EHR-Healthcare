import dayjs from 'dayjs';

import TimePicker from 'src/components/TimePicker';
import Table from 'src/components/Table';
import CheckboxLabel from 'src/components/Checkbox';

const columns = ({
  setError,
  handleStartTime,
  handleEndTime,
  handleCheckboxChange,
}) => [
  {
    label: 'Day',
    type: 'text',
    dataKey: 'day',
    cellStyle: { paddingRight: '60px' },
    maxWidth: '17rem',
  },
  {
    label: 'From',
    render: ({ data, index }) => (
      <TimePicker
        sx={{ width: 160, pr: '30px' }}
        disabled={data.isClosed}
        value={dayjs(`2022-04-17T${data.startHrs}`)}
        onChange={handleStartTime(index)}
      />
    ),
  },
  {
    label: 'To',
    render: ({ data, index }) => (
      <TimePicker
        sx={{ width: 160, pr: '30px' }}
        disabled={data.isClosed}
        value={dayjs(`2022-04-17T${data.endHrs}`)}
        onError={setError}
        minTime={dayjs(`2022-04-17T${data.startHrs}`).add(5, 'minute')}
        onChange={handleEndTime(index)}
      />
    ),
  },
  {
    render: ({ data, index }) => (
      <CheckboxLabel
        label="Closed"
        checked={data.isClosed}
        onChange={handleCheckboxChange(index)}
      />
    ),
  },
];

const ScheduleTable = ({
  handleStartTime,
  handleEndTime,
  handleCheckboxChange,
  handleTimePickerClose,
  schedule,
  setError,
}) => (
  <Table
    data={schedule}
    columns={columns({
      setError,
      handleStartTime,
      handleEndTime,
      handleTimePickerClose,
      handleCheckboxChange,
    })}
    wrapperStyle={{
      height: 'unset',
      boxShadow: 'none',
      border: '1px solid #E6EDFF',
      borderRadius: 0,
      marginTop: '27px',
    }}
    containerStyle={{ maxHeight: 'unset' }}
    itemStyle={{ textTransform: 'capitalize' }}
  />
);

export default ScheduleTable;

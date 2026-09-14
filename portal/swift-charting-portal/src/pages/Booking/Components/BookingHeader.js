import PageHeader from 'src/components/PageHeader';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import useTheme from '@mui/styles/useTheme';

const RightContent = ({ view, onViewChange }) => {
  const theme = useTheme();
  return (
    <div className="calendar-views">
      <div
        className="calendar-view"
        id="calendar"
        role="presentation"
        onClick={onViewChange}
      >
        <CalendarTodayOutlinedIcon
          sx={{
            width: '16px',
            height: '16px',
            color:
              view === 'calendar'
                ? theme.palette.primary.main
                : theme.palette.grey[1000],
          }}
        />
      </div>
      <div
        className="list-view"
        id="list"
        role="presentation"
        onClick={onViewChange}
      >
        <FormatListBulletedRoundedIcon
          sx={{
            width: '16px',
            height: '16px',
            color:
              view === 'list'
                ? theme.palette.primary.main
                : theme.palette.grey[1000],
          }}
        />
      </div>
    </div>
  );
};

const BookingHeader = ({ view, onViewChange }) => (
  <PageHeader
    rightContent={[
      {
        render: <RightContent view={view} onViewChange={onViewChange} />,
      },
    ]}
  />
);

export default BookingHeader;

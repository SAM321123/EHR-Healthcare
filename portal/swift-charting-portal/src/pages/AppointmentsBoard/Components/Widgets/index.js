import Card from '../Card';
import './widgets.scss';

const Widgets = ({ widgets,appointmentsStatsData = { } }) => (
  <div className="widgets-container">
    {widgets?.map(({ label , startIcon, value = " " }) => (
      <Card label={label} count={appointmentsStatsData[value] || 0} startIcon={startIcon} key={label} />
    ))}
  </div>
);

export default Widgets;

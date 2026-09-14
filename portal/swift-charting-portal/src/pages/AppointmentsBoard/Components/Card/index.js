import './card.scss';

const Card = ({ startIcon = '', label = '', count = '' }) => (
  <div className="appointment-card">
    {startIcon && <div className={`widget-icon ${startIcon}`} />}
    <div className="info-area">
      <div className="card-heading">{label}</div>
      <div className="data">{count}</div>
    </div>
  </div>
);

export default Card;

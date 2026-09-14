import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';

const CustomTooltip = styled(({ className, bgColor, title, children }) => {
  return (
    <Tooltip
      title={
        <div className={className}>
          <div className="custom-tooltip-title">
            {title}
          </div>
        </div>
      }
      classes={{ popper: className }}
    >
      {children}
    </Tooltip>
  );
})`
  .custom-tooltip {
    background-color: ${({ bgColor }) => bgColor};
    color: white;
    font-size: 14px;
    padding: 10px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .custom-tooltip-title {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-bottom: 5px;
    font-size: 14px;
  }

  .custom-tooltip-content p {
    margin: 0;
    font-size: 14px;
  }

  .MuiTooltip-tooltip {
    background-color: ${({ bgColor }) => bgColor} !important;
    color: white;
    font-size: 14px;
    font-weight: 500;
  }
`;

export default CustomTooltip;
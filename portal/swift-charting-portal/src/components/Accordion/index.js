import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MuiAccordion from '@mui/material/Accordion';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Chip from '@mui/material/Chip';
import styled from '@mui/material/styles/styled';
import PropTypes from 'prop-types';

import palette from 'src/theme/palette';
import Box from '../Box';
import Typography from '../Typography';

const AccordionWrapper = styled((props) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  '&:not(:last-child)': {
    borderBottom: 0,
  },
  '&:before': {
    display: 'none',
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: '1px solid rgba(0, 0, 0, .125)',
}));

const Accordion = ({
  children,
  onChange,
  panelId,
  textLabels,
  defaultExpanded,
  style={},
}) => (
  <AccordionWrapper
    onChange={onChange}
    key={panelId}
    defaultExpanded={defaultExpanded}
  >
    <AccordionSummary
      expandIcon={<ExpandMoreIcon />}
      aria-controls={`panel${panelId}-content`}
      id={`panel${panelId}-header`}
      sx={{...style}}
    >
      <Box style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {textLabels.map((item) => {
          if (item?.type === 'text')
            return (
              <Typography sx={{ fontSize: '14px',...(item?.style || {}) }}>{item?.label}</Typography>
            );
          if (item?.type === 'chips' && item?.label)
            return (
              <Chip
                label={item?.label}
                sx={{ color: palette.background.appleGreen }}
              />
            );
          return null;
        })}
      </Box>
    </AccordionSummary>
    <AccordionDetails>{children}</AccordionDetails>
  </AccordionWrapper>
);

Accordion.defaultProps = {
  textLabel: '',
  panelId: '',
  onChange: () => {},
  children: <span />,
};

Accordion.propTypes = {
  textLabel: PropTypes.string,
  panelId: PropTypes.string,
  children: PropTypes.node,
  onChange: PropTypes.func,
};

export default Accordion;

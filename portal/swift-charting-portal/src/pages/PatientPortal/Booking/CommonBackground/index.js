import styled from '@mui/material/styles/styled';

import { verticalScale } from 'src/lib/utils';
import DopeLogo from '../../../../assets/images/svg/dopelogo.png';

const StyledRoot = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    padding: '0px 138px',
  },
  display: 'flex',
  minHeight: '100%',
  minWidth: '100%',
  backgroundColor: '#F6F6F6',
  overflowX: 'hidden',
  padding: '0px 0px',
}));

const StyledSection = styled('div')(({ theme }) => ({
  minWidth: '100%',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: theme.customShadows.card,
  backgroundColor: theme.palette.primary.main,
  position: 'absolute',
  top: 0,
  left: 0,
  height: verticalScale(338),
  zIndex: 1000,
  overflowX: 'hidden',
}));

const StyledContent = styled('div')(({ theme }) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: theme.customShadows.card,
  backgroundColor: theme.palette.common.white,
  marginTop: verticalScale(138),
  alignSelf: 'flex-start',
  zIndex: 1000,
  justifyContent: 'center',
}));

const StyledImg = styled('div')(() => ({
  paddingTop: verticalScale(45),
  paddingLeft: '24px',
}));

const CommonBackground = ({ getURL, children }) => (
  <StyledRoot>
    <StyledSection>
      <StyledImg>
        <img
          alt="booking"
          src={getURL() || DopeLogo}
          style={{
            height: 50,
            maxWidth: 250,
            objectFit: 'contain',
          }}
        />
      </StyledImg>
    </StyledSection>
    <StyledContent>{children}</StyledContent>
  </StyledRoot>
);

export default CommonBackground;

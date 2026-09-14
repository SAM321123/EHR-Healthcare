/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable no-unused-vars */
import { Helmet } from 'react-helmet-async';
import styled from '@mui/material/styles/styled';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import useValidateAuth from 'src/hooks/useValidateAuth';
import { getImageUrl, scale, verticalScale } from 'src/lib/utils';
import palette from 'src/theme/palette';
import { useEffect, useState } from 'react';
import { roleTypes } from 'src/lib/constants';
import useResponsive from '../../hooks/useResponsive';
import TherapyCounselling from '../../assets/images/loginPerson.png';
import PulseOne from '../../assets/images/pulseOne.png';
import PulseTwo from '../../assets/images/pulseTwo.png';
import PulseThree from '../../assets/images/pulseThree.png';
import StartOne from '../../assets/images/startOne.png';
import StartTwo from '../../assets/images/startTwo.png';
import LogoMain from '../../assets/images/logoMain.png';
import CircleGreen from '../../assets/images/circleGreen.png';
import CircleBlue from '../../assets/images/circleBlue.png';
import DoctorProfile from '../../assets/images/doctorProfile.png';
import PatientProfile from '../../assets/images/patientProfile.png';
import Typography from '../Typography';
import { GET_PRACTICE_DATA_SETTING } from 'src/store/types';
import useCRUD from 'src/hooks/useCRUD';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';

const StyledRoot = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    // display: 'flex',
    position:'relative',
    display:'grid',
    gridTemplateColumns: '1fr 1fr',
  },
   minHeight:'100%'
}));

const StyledSection = styled('div')(({ theme }) => ({
  width: '100%',
  // maxWidth: '50%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  boxShadow: theme.customShadows.card,
  backgroundColor: theme.palette.background.main,
  // transform: 'scale(0.85)',

}));

const StyledContent = styled('div')(({ theme }) => ({
  maxWidth: scale(448),
  // transform: 'scale(0.85)',
  // maxHeight: verticalScale(534),
  margin: 'auto',
  // minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  paddingTop:verticalScale(54),
  paddingBottom:verticalScale(38)
}));

const AuthContainer = ({ label, component:Component,login=false,title="",subTitle="" }) => {
  const [selectedRole,setSelectedRole] = useState(roleTypes.practitioner)
  const [imageUrl, setImageUrl] = useState(null);

  const [getPracticeSettingResponse, ,getPracticeSettingLoading ,getPracticeSetting, clearPracticeSetting] = useCRUD({
    id: GET_PRACTICE_DATA_SETTING,
    url: API_URL.practiceSetting,
    type: REQUEST_METHOD.get,
  });

  useEffect(() => {
    getPracticeSetting();
  }, []); 

  useEffect(() => {
    const imageUrl = getImageUrl(getPracticeSettingResponse?.logo?.name, {
      isPublic: true,
    });
    setImageUrl(imageUrl);
  }, [getPracticeSettingResponse?.logo?.name]);
  
  useValidateAuth();
  const mdUp = useResponsive('up', 'md');
  return (
    <>
      {/* <Helmet>
        <title>{label}</title>
      </Helmet> */}

      <StyledRoot>
        {mdUp && (
          <StyledSection>
            <Box sx={{alignSelf:'flex-end'}} >
            <img
                src={PulseOne}
                alt="login"
                style={{width:scale(429),height:verticalScale(152)}}
                // width="429"
                // height='152'

              />
            </Box>
            <Box sx={{alignSelf:'flex-start',marginTop:verticalScale(4.37)}}>
              <img src={StartOne} alt="login" style={{width:scale(40),height:scale(40),marginLeft:scale(115)}}/>
            </Box>
            <Box sx={{position:'relative'}}>
                <img
                  src={TherapyCounselling}
                  alt="login"
                  style={{width:scale(440),height:verticalScale(368.54)}}
                                />
                               <div style={{position:'absolute',right:-scale(49),top:verticalScale(233)}}>
                                <img alt='login' style={{width:scale(20),height:scale(20)}} src={StartTwo}/>
                                </div> 
            </Box>
            <Box sx={{alignSelf:'flex-start',marginTop:-scale(0.38)}}>
            <img
                src={PulseTwo}
                alt="login"
                style={{width:scale(289),height:verticalScale(101)}}

              />
              </Box>
              <Box sx={{alignSelf:'flex-end',position:'absolute',bottom:verticalScale(27)}}>
               <img
                src={PulseThree}
                alt="login"
                style={{width:scale(199),height:verticalScale(69)}}

              />
            </Box>
          </StyledSection>
        )}

        <Container maxWidth="sm">
          <StyledContent>
          <div style={{position:'relative'}}>
          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)', display: 'flex', alignItems: 'center', flexDirection: 'column', position: 'relative',border:`1px solid ${palette.border.main}`,borderRadius:16,paddingLeft:24,paddingRight:24,paddingTop:verticalScale(16),paddingBottom:verticalScale(16) ,backdropFilter:'blur(6.5px)'}}>
  <div>
    <img src={LogoMain} style={{ width: scale(120), height: scale(60) }} alt='logo' />
  </div>
   <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: verticalScale(12) }}>
    <Typography sx={{ fontSize: 24, lineHeight: '36px', fontWeight: 700 }}>{title}</Typography>
    <Typography color={palette.text.secondary} sx={{ fontSize: (12), lineHeight: '20px', fontWeight: 400, marginTop: verticalScale(0.125) }}>{subTitle}</Typography>
  </div>
  {login && <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:10,marginTop:verticalScale(24)}} >
    <div>
      <Typography mb={verticalScale(1.25)} color={palette.text.primary} style={{fontSize:12,fontWeight:500,lineHeight:'18px'}}>Please Select You are a</Typography>
    </div>
    <div style={{display:'flex',gap:scale(16)}}>

    <div onClick={()=>setSelectedRole(roleTypes.patient)} style={{cursor:'pointer',backgroundColor:palette.background.accentGreen,width:scale(100),height:scale(94),borderRadius:9,paddingTop:verticalScale(11),paddingBottom:verticalScale(11),paddingLeft:scale(26),paddingRight:scale(26),display:'flex',flexDirection:'column',alignItems:"center",gap:6,...(selectedRole===roleTypes.patient?{border:`2px solid ${palette.background.main}`}:{})}}>
      <div style={{backgroundColor:palette.background.main,width:scale(48),height:scale(48),borderRadius:50,padding:scale(12)}}>
      <img style={{width:scale(24),height:scale(24)}} src={PatientProfile} alt='doctor'/>
      </div>
      <div><Typography color={palette.text.primary} style={{fontSize:12,fontWeight:500,lineHeight:'18px'}}>Patient</Typography></div>
    
    </div>
    <div onClick={()=>setSelectedRole(roleTypes.practitioner)} style={{cursor:'pointer',backgroundColor:palette.background.accentGreen,width:scale(100),height:scale(94),borderRadius:9,paddingTop:verticalScale(11),paddingBottom:verticalScale(11),paddingLeft:scale(26),paddingRight:scale(26),display:'flex',flexDirection:'column',alignItems:"center",gap:6,...(selectedRole===roleTypes.practitioner?{border:`2px solid ${palette.background.main}`}:{})}}>
      <div style={{backgroundColor:palette.background.main,width:scale(48),height:scale(48),borderRadius:50,padding:scale(12)}}>
      <img style={{width:scale(24),height:scale(24)}} src={DoctorProfile} alt='doctor'/>
      </div>
      <div><Typography color={palette.text.primary} style={{fontSize:12,fontWeight:500,lineHeight:'18px'}}>Practitioner</Typography></div>
    
    </div>
    </div>
  </div>}
  { typeof Component ==='function' ?<Component selectedRole={selectedRole}/>: Component}
</div>
<div style={{ position: 'absolute', top: -scale(16), left: -scale(19), zIndex: -1 }}> <img alt='login' style={{ width: scale(52), height: scale(52) }} src={CircleBlue} /></div>
  <div style={{ position: 'absolute', bottom: scale(17), right: -scale(39), zIndex: -1 }}> <img alt='login' style={{ width: scale(83), height: scale(83) }} src={CircleGreen} /></div>
</div>
          </StyledContent>
        </Container>
      </StyledRoot>
    </>
  );
};

export default AuthContainer;

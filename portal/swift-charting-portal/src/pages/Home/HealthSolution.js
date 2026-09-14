/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/img-redundant-alt */
import React from 'react';
// import ellipseImage from "../../assets/images/Ellipse 20.jpg";
import Typography from 'src/components/Typography';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import introImg from 'src/assets/images/intro.png';
import Box from 'src/components/Box';
import palette from 'src/theme/palette';
import CustomForm from 'src/components/form';
import { verticalScale } from 'src/lib/utils';
import { useForm } from 'react-hook-form';

const locations = [
  { name: 'Gilbert', code: 'gilbert' },
  { name: 'New York', code: 'new_york' },
  { name: 'Los Angeles', code: 'los_angeles' },
  { name: 'London', code: 'london' },
  { name: 'Tokyo', code: 'tokyo' }
];

const medicalSpecialties = [
  { name: 'Neurologist', code: 'neurologist' },
  { name: 'Cardiologist', code: 'cardiologist' },
  { name: 'Dermatologist', code: 'dermatologist' },
  { name: 'Pediatrician', code: 'pediatrician' },
  { name: 'Oncologist', code: 'oncologist' }
];
export const healthSolutionFormGroups = [
  {
    inputType: 'wiredAuto',
    name: 'location',
    label:"Select Location",
    options: locations,
    labelAccessor:'name',
    valueAccessor:'code',
    colSpan:0.4,
    labelProps:{
      color:palette.text.dull
    }
  },
  {
    inputType: 'wiredAuto',
    name: 'lookingFor',
    label: 'Looking For',
    options:medicalSpecialties,
    labelAccessor:'name',
    valueAccessor:'code',
    colSpan:0.4,
    labelProps:{
      color:palette.text.dull
    }

  },
]
const HealthSolution = () => {
  const form = useForm({ mode: 'onSubmit' });
  return (
    <Box className="outter-main-hero-section" sx={{backgroundColor:palette.background.offGreenTwo}}>    
   <Box className="main-hero-section">    
  <div className="health-soltution container" >

      <div className="content-wrapper" >
        <div className='content-inner-wrapper'>
          <div>
        <Typography variant='h1' style={{color:palette.background.main}}>
          Health Solutions for All
        </Typography>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:40}}>
          <div>
        <Typography className="health-solution-discription" style={{color:palette.text.offWhite}}>
          Fusce volutpat lectus et nisl consectetur finibus. In vitae
          scelerisque augue, in varius eros. Nunc sapien diam, euismod et
          pretium id, volutpat et tortor. In vulputate lorem quis dui
          vestibulum, vitae imperdiet diam bibendum.
          </Typography>
        </div>
          <div className='health-solution-button-wrapper'>
        <LoadingButton
            id="bookbtnsecond"
            // fullWidth
            size="medium"
            type="submit"
            label="Book Appointment"
          />
        </div>
        </div>
        </div>
        <div className='searc-bar-background'>
        <div className='searc-bar-wrapper'>
        <CustomForm
            formGroups={healthSolutionFormGroups}
            columnsPerRow={1}
            form={form}
            gridGap={verticalScale(2)}
            showLabel={false}
          />
           <LoadingButton
            id="search-result"
            // fullWidth
            size="medium"
            type="submit"
            label="Search For Result"
          />
        </div>
      </div>
      </div>
      <div className="banner-image-wrapper" style={{position:''}}>
        <div className='banner-image-wrapper'>
        <div className="banner-image" style={{backgroundImage:`url(${introImg})` }}/>
        </div>
        
      </div>
  </div>
  </Box>
  </Box>

)
};
export default HealthSolution;

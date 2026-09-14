/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable no-unused-vars */
import Box from 'src/components/Box';
import Typography from 'src/components/Typography';
import palette from 'src/theme/palette';
import anxiety from 'src/assets/images/anxiety.png';
import stress from 'src/assets/images/stress.png';
import addiction from 'src/assets/images/addiction.png';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import learnMore from "src/assets/images/learnMore.png";

const Component = ({src,label,discription,action,reverse=false})=><Box className="treatment-item-wrapper" sx={{flexDirection:reverse?'row-reverse':'row'}}>
    <Box >
      <div className='treatment-item-image-wrapper'>
        <img src={src} alt='dummy' />
      </div>
    </Box>
    <Box sx={{display:'flex',flexDirection:'column',gap:6.25,alignSelf:'end'}}>
      <Box sx={{display:'flex',flexDirection:'column',gap:2.5}}>
        <Box>
          <Typography color={palette.text.dark} className="treatment-item-label" variant="h3">{label}</Typography>
        </Box>
        <Box>
          <Typography color={palette.text.offWhite} className="treatment-item-discription">
            {discription}
          </Typography>
        </Box>

      </Box>
      <Box>
        <LoadingButton id="learmore" label={<div className='learnmorebuttondiv'><p> Learn More</p><img style={{width:14 ,height:14}} src={learnMore} alt="learn more"/></div>}/>
      </Box>
    </Box>
    
  </Box>

const Treatment = () => (
  <Box className="treatment-section container" sx={{}}>
  <Box  className="treatment-section-title-wrapper">
  <Box>
      <Typography color={palette.background.main} variant='h2'>Treatments</Typography>
  </Box>
  <Box>
      <Typography color={palette.text.offWhite} className="treatment-discription">
      Vestibulum tempus imperdiet sem ac porttitor. Vivamus pulvinar commodo orci, suscipit porttitor velit elementum non. Fusce nec pellentesque erat, id lobortis nunc. Donec dui leo, ultrices quis turpis nec, sollicitudin sodales tortor. Aenean dapibus magna quam, id tincidunt quam placerat consequat. Nulla eu laoreet ex. Vestibulum nec vulputate turpis, id euismod orci. Phasellus consectetur tortor est. 
      </Typography>
  </Box>
  </Box>
  <Box sx={{display:'flex',flexDirection:'column',gap:5}}>
    <Component src={anxiety} label="Anxiety" discription="Vestibulum tempus imperdiet sem ac porttitor. Vivamus pulvinar commodo orci, suscipit porttitor velit elementum non. Fusce nec pellentesque erat, id lobortis nunc. Donec dui leo, ultrices quis turpis nec, sollicitudin sodales tortor. Aenean dapibus magna quam, id tincidunt quam placerat consequat. Nulla eu laoreet ex. Vestibulum nec vulputate turpis, id euismod orci. Phasellus consectetur tortor est. "/>
    <Component reverse src={stress} label="Stress Related Disorder" discription="Vestibulum tempus imperdiet sem ac porttitor. Vivamus pulvinar commodo orci, suscipit porttitor velit elementum non. Fusce nec pellentesque erat, id lobortis nunc. Donec dui leo, ultrices quis turpis nec, sollicitudin sodales tortor. Aenean dapibus magna quam, id tincidunt quam placerat consequat. Nulla eu laoreet ex. Vestibulum nec vulputate turpis, id euismod orci. Phasellus consectetur tortor est. "/>
    <Component src={addiction} label="Addiction" discription="Vestibulum tempus imperdiet sem ac porttitor. Vivamus pulvinar commodo orci, suscipit porttitor velit elementum non. Fusce nec pellentesque erat, id lobortis nunc. Donec dui leo, ultrices quis turpis nec, sollicitudin sodales tortor. Aenean dapibus magna quam, id tincidunt quam placerat consequat. Nulla eu laoreet ex. Vestibulum nec vulputate turpis, id euismod orci. Phasellus consectetur tortor est. "/>
  </Box>

</Box>
);

export default Treatment;

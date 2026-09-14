import SliderMUI from '@mui/material/Slider';

const Slider = ({...props }) =>{
  let {min=0,max=100}=props;
  try{
    min=parseInt(min)
    max=parseInt(max);
  }catch(err){
    min=0;
    max=100
  }
   return <SliderMUI
      valueLabelDisplay="auto"
      {...props}
      min={min}
      max={max}
    />
};

export default Slider;

/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable no-unused-vars */
import Box from 'src/components/Box';
import Typography from 'src/components/Typography';
import palette from 'src/theme/palette';
import orthodontistOne from 'src/assets/images/orthodontistOne.png'
import orthodontistTwo from 'src/assets/images/orthodontistTwo.png'
import orthodontistThree from 'src/assets/images/orthodontistThree.png'
import Slider from 'react-slick';
import arrowLeftSlider from 'src/assets/images/arrowLeftSlider.png'
import arrowRightSlider from 'src/assets/images/arrowRightSlider.png'

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './team.css'
import { useRef } from 'react';

const  settings = {
  arrows:false,
  dots: false,
  infinite: false,
  speed: 500,
  slidesToShow: 3,
  slidesToScroll: 3,
  initialSlide: 0,
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 3,
        infinite: true,
        dots: true
      }
    },
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 2,
        initialSlide: 2
      }
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1
      }
    }
  ]
};
const data =[{src:orthodontistOne,link:'',title:'Orthodontist.',name:'Dr. Jim Carry'},{src:orthodontistTwo,link:'',title:'Orthodontist.',name:'Dr. Jim Carry'},{src:orthodontistThree,link:'',title:'Orthodontist.',name:'Dr. Jim Carry'}]
const Item = ({src,link,title,name})=><Box>
      <Box sx={{position:'relative',marginLeft:1,marginRight:1}}>
        <div style={{position:'relative'}}>
        <img src={src} alt="team" className='team-image'/>
        <div className='profileSection' style={{position:'absolute',background:`linear-gradient(100.58deg, ${palette.background.main} -30.87%, rgba(51, 122, 183, 0) 125.06%)`,bottom:19,left:17,borderRadius:12,padding:'10px 12px 10px 12px'}}>
          <Box sx={{display:'flex',justifyContent:'space-between'}}>
            <Box>
        <Box>
          <Typography  variant='b' color={palette.common.white} style={{fontSize:18,fontWeight:600,lineHeight:'26px'}}>{name}</Typography>
        </Box>
        <Box>
          <Typography color={palette.common.white} className="team-item-title">{title}</Typography>
        </Box>
            </Box>
            <Box>
              <div style={{backgroundColor:palette.background.main,borderRadius:8,padding:'5px 20px 5px 20px'}}>
                <Typography variant='b' color={palette.common.white}>Profile</Typography>
              </div>
            </Box>
          </Box>
        </div>
        </div>
      
      </Box>
  </Box>
const Team = () => {
  const sliderRef = useRef();
  const next = ()=>{
    sliderRef.current.slickNext()
  }
  const prev = ()=>{
    sliderRef.current.slickPrev()
  }
 return <Box className="team-section-wrapper" sx={{backgroundColor:palette.background.offGreen}}>
  <Box className="team-section container" >
  <Box className="team-section-title-wrapper">
  <Box>
      <Typography className="team-title" color={palette.background.main} variant='h2'>Meet The Team</Typography>
  </Box>
  <Box>
      <Typography color={palette.text.offWhite} className="team-discription">
      Vestibulum tempus imperdiet sem ac porttitor. Vivamus pulvinar commodo orci, suscipit porttitor velit elementum non.  Learn More
      </Typography>
  </Box>
  </Box>
  <div className="slider-container">
    <Slider ref={sliderRef} {...settings}>
    {
      data.map((item,index)=><div key={index}><Item {...item} key={index}/></div>)
    }
    </Slider>
  <div className='arrow-container'>
    <Box className="arrow-wrapper">
    <div style={{backgroundColor:palette.background.paper}} className="arrow-image-wrapper" onClick={prev}>
      <img src={arrowLeftSlider} alt="arrow left"/>
    </div>
    <div style={{backgroundColor:palette.background.paper}} className="arrow-image-wrapper" onClick={next}>
      <img src={arrowRightSlider} alt="arrow right"/>
    </div>
    </Box>
    </div>
  </div>

</Box>
</Box>
};
export default Team;

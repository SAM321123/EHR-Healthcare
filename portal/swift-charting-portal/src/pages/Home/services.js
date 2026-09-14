import React from "react";
import Box from "src/components/Box";
import Typography from "src/components/Typography";
import palette from "src/theme/palette";
import therapyOne from "src/assets/images/therapyOne.png";
import therapyTwo from "src/assets/images/therapyTwo.png";
import therapyThree from "src/assets/images/therapyThree.png";

const data =[{label:'Individual Counselling',discreption:'Vestibulum tempus imperdiet sem ac porttitor. Vivamus pulvinar commodo orci, suscipit porttitor velit elementum non.  Learn More',src:therapyOne},{label:'Mindfulness based Programs',discreption:'Vestibulum tempus imperdiet sem ac porttitor. Vivamus pulvinar commodo orci, suscipit porttitor velit elementum non.  Learn More',src:therapyTwo},{label:'Counselling & Therapies',discreption:'Vestibulum tempus imperdiet sem ac porttitor. Vivamus pulvinar commodo orci, suscipit porttitor velit elementum non.  Learn More',src:therapyThree}]

const OurServices =()=>(
    <Box className="ourservices-section container" sx={{}}>
        <Box className="ourservices-section-title-wrapper" >
        <Box>
            <Typography variant='h2' color={palette.background.main} >Our Services</Typography>
        </Box>
        <Box>
            <Typography color={palette.text.offWhite} className="ourservices-discription">
            Vestibulum tempus imperdiet sem ac porttitor. Vivamus pulvinar commodo orci, suscipit porttitor velit elementum non. Fusce nec pellentesque erat, id lobortis nunc. Donec dui leo, ultrices quis turpis nec, sollicitudin sodales tortor. Aenean dapibus magna quam, id tincidunt quam placerat consequat. Nulla eu laoreet ex. Vestibulum nec vulputate turpis, id euismod orci. Phasellus consectetur tortor est. 
            </Typography>
        </Box>
        </Box>
        <Box className="services-box" sx={{display:'flex',gap:3.75}}>
            {data.map((item,index)=><Box key={index}>
                <Box>
                    <Box className="services-images-wrapper" sx={{position:'relative'}}>
                        <img alt='dummy' src={item.src} />
                        <div className="services-name">
                        <Box>
                            <Typography className="services-name-text" color={palette.common.white} >{item.label}</Typography>
                            </Box>
                        </div>
                    </Box>
                </Box>
                <Box className="services-description-wrapper">
                    <Typography className="services-description" color={palette.text.offWhite}>{item.discreption}</Typography>
                </Box>
            </Box>)}
        </Box>
    </Box>
)
export default OurServices
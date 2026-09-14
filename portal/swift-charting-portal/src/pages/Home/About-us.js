/* eslint-disable import/no-duplicates */
import React from 'react';
import Typography from 'src/components/Typography';
import aboutImage from 'src/assets/images/Group 1000001027.png';
// eslint-disable-next-line import/no-duplicates
import dotImages from 'src/assets/images/Group 1000001024@2x.png';
import aboutUsSvg from 'src/assets/images/aboutUsSvg.png';
import palette from 'src/theme/palette';

const AboutUs = () => (
  <div
    className="abt-us-section container"
  >
    <img
      src={aboutImage}
      alt="about images"
  
    />
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'center',
        gap: '20px',
        justifyContent: 'center',
      }}
    >
      <div style={{position:'relative'}}>
        <img src={aboutUsSvg} alt="about Us" style={{width:178,height:178,alignSelf:'flex-end'}}/>
        <div style={{position:'absolute',top:49,left:39}}><Typography variant='h2'
          style={{ color: '#337AB7' }}
        >
          About US
        </Typography>
        </div>
      </div>
      <div style={{marginLeft:39,display:'flex',gap:20,flexDirection:'column'}}>
        <Typography color={palette.text.offWhite} className="about-us-discription">
          Vestibulum tempus imperdiet sem ac porttitor. Vivamus pulvinar commodo
          orci, suscipit porttitor velit elementum non. Fusce nec pellentesque
          erat, id lobortis nunc. Donec dui leo, ultrices quis turpis nec,
          sollicitudin sodales tortor. Aenean dapibus magna quam, id tincidunt
          quam placerat consequat. Nulla eu laoreet ex. Vestibulum nec vulputate
          turpis, id euismod orci. Phasellus consectetur tortor est. Donec
          lectus ex, rhoncus ac consequat at, viverra sit amet sem. Aliquam sed
          vestibulum nibh. Phasellus ut lorem pharetra.
        </Typography>
        <div>
        <img src={dotImages} alt="dotImages" style={{width:405,height:70}} />
      </div>
      </div>
     
    </div>
  </div>
);
export default AboutUs;

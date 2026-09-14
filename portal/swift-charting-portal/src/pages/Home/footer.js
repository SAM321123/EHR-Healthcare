import logomain from 'src/assets/images/logoMain.png';
import Typography from 'src/components/Typography';
import arrowfot from 'src/assets/images/arrow-foter.png';
import whatsp from 'src/assets/images/whtsp.png';
import fb from 'src/assets/images/fb.png';
import insta from 'src/assets/images/insta.png';
import twit from 'src/assets/images/twitter.png';
import pint from 'src/assets/images/pint.png';
import './footer.css';

const FooterSection = () => (
  <div  className='footer-wrapper'  style={{
    backgroundColor: ' #337AB7'}}>
  <div
    className="footer-section container"
  >
    <div className='footer-2'
    >

      <div className='logo-sec'>
        <div>
          <img
          className='logo-img'
            src={logomain}
            alt="footer logo"
            
          />
        </div>
        <div style={{ display: 'flex', gap: 10, flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              border: '1px  solid #FFFFFF',
              borderRadius: '10px',
              gap: '10px',
              padding: '15px',
              alignItems:'center'
            }}
          >
            <img
              src={arrowfot}
              alt="arw-img"
              style={{
                width: ' 13px',
                height: '16px',
                Rotation: -180,
              }}
            />
            <Typography style={{ color: '#fff' }} className="fnt-size">
              Take an Appointment
            </Typography>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              border: '1px  solid #FFFFFF',
              borderRadius: '10px',
              gap: '10px',
              padding: '15px',
              alignItems:'center'
            }}
          >
            <img
              src={whatsp}
              alt="whatsp"
              style={{
                width: 18,
                height: 18,
              }}
            />
            <Typography  style={{ color: '#fff' }} className="fnt-size">
              Connect on Whatsapp
            </Typography>
          </div>
        </div>
      </div>
        <div className="service-section"  style={{
        display: 'flex',
        textWrap: 'nowrap',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
      }}>
        <div
            style={{
            gap: '20px',
            display: 'flex',
            flexDirection: 'column',
            flex:1,
            alignItems:'flex-start'
            }}
        >
            <div>
            <Typography style={{ color: '#ffffff' }} className="fnt-size" >SERVICES</Typography>
            </div>

            <div style={{display:'flex',flexDirection:'column',alignItems:'flex-start',gap:10}}>
            <Typography style={{ color: '#ffffff' }} className="fnt-size">Pathology</Typography>
            <Typography style={{ color: '#ffffff' }} className="fnt-size">Radiology</Typography>
            <Typography style={{ color: '#ffffff' }} className="fnt-size">Pharmacy</Typography>
            </div>
        </div>

        <div
            style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            flex:1,
            alignItems:'flex-start'

            }}
        >
            <div>
            
            <Typography style={{ color: '#ffffff' }} className="fnt-size">HEALTH CHECKUP</Typography>
            </div>
            <div style={{display:'flex',flexDirection:'column',alignItems:'flex-start',gap:10}}>
            <Typography style={{ color: '#FFFFFF' }} className="fnt-size"> Woman Health</Typography>
            <Typography style={{ color: '#ffffff' }} className="fnt-size">Cancer Screening</Typography>
            <Typography style={{ color: '#ffffff' }} className="fnt-size">Cardiac Health</Typography>
            <Typography style={{ color: '#ffffff' }} className="fnt-size">MRI Checkup</Typography>
            </div>
        </div>

        <div
            style={{
            display: 'flex',
            flexDirection: 'column',
            flex:1,
            alignItems:'flex-start'

            }}
        >
            <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
            }}
            >
            
            <div>
                <Typography style={{ color: '#ffffff' }} className="fnt-size">DEPARTMENTS</Typography>
            </div>
            <div style={{display:'flex',flexDirection:'column',alignItems:'flex-start',gap:10}}>
                <Typography style={{ color: '#ffffff' }} className="fnt-size">General</Typography>
                <Typography style={{ color: '#ffffff' }} className="fnt-size">Dermatology</Typography>
                <Typography style={{ color: '#ffffff' }} className="fnt-size"> Cardiology</Typography>
                <Typography style={{ color: '#ffffff' }} className="fnt-size">Cancer</Typography>
            </div>
            </div>
        </div>

        <div
            style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            flex:1,
            alignItems:'flex-start'

            }}
        >
            <div>
            <Typography style={{ color: '#ffffff' }} className="fnt-size">QUICK LINKS</Typography>
            </div>

            <div style={{display:'flex',flexDirection:'column',alignItems:'flex-start',gap:10}}>
            <Typography style={{ color: '#ffffff' }} className="fnt-size">License</Typography>
            <Typography style={{ color: '#ffffff' }} className="fnt-size">Changelog</Typography>
            </div>
        </div>

        </div>
    </div>
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',

          gap: '17px',
        }}
      >
        <div>
          <img
            src={fb}
            alt="fb"
            style={{
              width: '26.67px',
              height: '26.56px',
              top: '2.72px',
              left: '2.67px',
            }}
          />
        </div>
        <div>
          <img
            src={twit}
            alt="twit"
            style={{
              width: '26.67px',
              height: '26.56px',
              top: '2.72px',
              left: '2.67px',
            }}
          />
        </div>
        <div>
          <img
            src={pint}
            alt="pint"
            style={{
              width: '26.67px',
              height: '26.56px',
              top: '2.72px',
              left: '2.67px',
            }}
          />
        </div>
        <div>
          <img
            src={insta}
            alt="insta"
            style={{
              width: '26.67px',
              height: '26.56px',
              top: '2.72px',
              left: '2.67px',
            }}
          />
        </div>
      </div>
    </div>
  </div>
  </div>
);

export default FooterSection;

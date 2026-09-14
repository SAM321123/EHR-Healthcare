import React from 'react'
import LoadingButton from 'src/components/CustomButton/loadingButton'
import Typography from 'src/components/Typography'
import palette from 'src/theme/palette'
import one from 'src/assets/images/one.png';
import two from 'src/assets/images/two.png';
import three from 'src/assets/images/three.png';
// import twoFactor from "src/assets/images/twoFactor.png";

const steps = [{src:one,title:"Process - 1",discription:"Party we years to order allow asked of. We so opinion friends me message as delight. "},{src:two,title:"Process - 2",discription:"Party we years to order allow asked of. We so opinion friends me message as delight."},{src:three,title:"Process - 3",discription:"Party we years to order allow asked of. We so opinion friends me message as delight."}]
const Stepper = ({src,title,discription})=>(
        <div className='how-it-work-stepper-wrapper'>
            {/* <div style={{backgroundColor:palette.background.paper}} className='twoFactorAuthentication-wrapper'>
                <img src={twoFactor} alt="twoFactorAuthentication"/>
            </div> */}
            <div className='stepper-first-wrapper'>
        <div className='process-count'><Typography variant="h4" className="step-title">{title}</Typography></div>
        <div className='work-count'><img src={src} alt="step-count" /></div>
        </div>
        <div className='work-description'><Typography color={palette.text.dull}  className="step-discription">{discription}</Typography></div>
</div>  
    )
const HowItWork = () => (
    <div className='background-image-section container'>
    <div className='how-it-work-main-section'>
        <div className='how-it-work-first-section'>
            <div className='how-it-work-first-container'>
                <div className='how-it-work-title-wrapper'>
                    <Typography color={palette.background.main} variant="h1" className="how-it-work-title">How it Works</Typography>
                </div>
                <div className='how-it-work-discription-wrapper'>
                    <div className='how-it-work-discription-inner-wrapper'>
                        <Typography color={palette.text.dull} className="how-it-work-discription">Yet bed any for travelling assistance indulgence unpleasing. Not thoughts all exercise blessing. Indulgence way everything joy.</Typography>
                    </div>
                    <div>
                        <LoadingButton id="get-started" label="Get Started"/>
                    </div>
                </div>
            </div>
            <div className='how-it-work-step-one-wrapper '>
                    <Stepper {...steps[0]} />
            </div> 
        </div>
        <div  className='how-it-work-step-second-container'>
            <div className='how-it-work-step-second-wrapper'>
                <Stepper {...steps[1]}/>
            </div>
        </div>
        <div  className='how-it-work-step-third-container'>
            <div className='how-it-work-step-third-wrapper'>
                <Stepper {...steps[2]}/>
            </div>
        </div>
    </div>
    </div>
  )

export default HowItWork
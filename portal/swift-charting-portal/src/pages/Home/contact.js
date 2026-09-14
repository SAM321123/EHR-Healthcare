import React from "react";
import Box from "src/components/Box";
import Typography from "src/components/Typography";
import messageIcon from 'src/assets/images/message.png'; 
import phoneIcon from 'src/assets/images/phone.png'; 
import CustomForm from "src/components/form";
import { requiredField } from "src/lib/constants";
import { useForm } from "react-hook-form";
import { verticalScale } from "src/lib/utils";
import palette from "src/theme/palette";
import LoadingButton from "src/components/CustomButton/loadingButton";

export const contactUsFormGroups = [
    {
      inputType: 'text',
      type: 'text',
      name: 'name',
      required: requiredField,
      gridProps: { md: 12 },
      placeholder:'Name',
    },
    {
        inputType: 'text',
        type: 'text',
        name: 'phone',
        required: requiredField,
        gridProps: { md: 12 },
      placeholder:'Phone',

      },
      {
        inputType: 'text',
        type: 'text',
        name: 'email',
        required: requiredField,
        gridProps: { md: 12 },
        placeholder:'Email',
      },
      {
        inputType: 'wiredSelect',
        name: 'appointmentType',
        placeholder: 'Appointment Type',
        options: [
            { name: 'Group Session', code: 'group' },
            { name: 'Individual', code: 'individual' },
          ],
        labelAccessor:'name',
        valueAccessor:'code',
      },
      {
        inputType: 'textArea',
        type: 'textArea',
        name: 'message',
        required: requiredField,
        gridProps: { md: 12 },
      placeholder:'Message',

      },
   
  ];

const Contact = () => {
  const form = useForm({ mode: 'onSubmit' });
  const { handleSubmit } = form;
  const handleSubmitNow = ()=>{

  }
        return <Box className="contactus-section container" sx={{}}>
            <Box sx={{flex:0.5}}>
                <Box className='contact-left-section'>
                    <Box sx={{display:'flex',flexDirection:'column',gap:3}}>
                    <Typography variant='h2' color={palette.background.main} style={{fontSize:40,lineHeight:'60px',fontWeight:600}}>
                    Get started with Swiftcharting
                    </Typography>
                    <Typography color={palette.text.offWhite} className="contactus-discription">
                    Far far away, behind the word mountains, far from the countries Vokalia and Consonantia.
                    </Typography>
                    </Box>
                    <Box style={{display:'flex',gap:20,flexDirection:'column'}}>
                        <Box style={{display:'flex',gap:16,alignItems:'center'}}>
                          <div style={{width:27,height:27}}>
                            <img src={messageIcon} alt="email"/>
                            </div>
                            <Typography color={palette.text.dark}>medico@health.care</Typography>
                        </Box>
                        <Box style={{display:'flex',gap:16,alignItems:'center'}}>
                          <div style={{width:27,height:27}}>
                            <img src={phoneIcon} alt="phone"/>
                            </div>
                            <Typography color={palette.text.dark}>(123) 456-7890</Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>
            <Box sx={{flex:0.5}} >
            <CustomForm
            formGroups={contactUsFormGroups}
            columnsPerRow={1}
            form={form}
            gridGap={verticalScale(2)}
            showLabel={false}
          />
          <div className="submitnow-wrapper">
            <LoadingButton label="Submit Now" className="submitbtn" fullWidth sx={{borderRadius:'5px'}} onClick={handleSubmit(handleSubmitNow)}/>
          </div>
            </Box>
        </Box>
};

export default Contact;

import { CardActions, CardContent, Divider } from '@mui/material';
import isEmpty from 'lodash/isEmpty';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import Container from 'src/components/Container';
import useAuthUser from 'src/hooks/useAuthUser';
import useCRUD from 'src/hooks/useCRUD';
import BuilderPreview from 'src/pages/FormBuilder/NewForm/BuilderPreview';
import './print.css'
import LoadingButton from 'src/components/CustomButton/loadingButton';
import ConsentFormPreview from '../NewForm/ConsentFormPreview';
import Typography from 'src/components/Typography';
import { PRACTICE_SETTING } from 'src/store/types';
import { getAddress } from 'src/lib/constants';
import { getImageUrl } from 'src/lib/utils';

const FormBuilderPDF = () => {
  const params = useParams();
  const { formId } = params || {};
  const [formGroups, setFormGroups] = useState([]);

  const [user] = useAuthUser();

  const form = useForm({ mode: 'onChange' });


  const [practiceSettingData, , practiceSettingDataLoading, getPracticeSetting] =
  useCRUD({
    id: PRACTICE_SETTING ,
    url: `${API_URL.practiceSetting}`,
    type: REQUEST_METHOD.get,
    });
  console.log("🚀 ~ FormBuilderPDF ~ practiceSettingData:", practiceSettingData)

  const [formResponse, , formResponseLoading, getForm, clearFormResponse] =
  useCRUD({
    id: `get-patient-medical-history-form-${formId}`,
    url: `${API_URL.getFormList}/${formId}`,
    type: REQUEST_METHOD.get,
    });
  useEffect(() => {
    getForm();
    getPracticeSetting();
  }, []);

  useEffect(() => {
    return () => {
      clearFormResponse(true);
    };
  }, [clearFormResponse]);

  useEffect(() => {
    if (!isEmpty(formResponse)) {
      setFormGroups(JSON.parse(formResponse?.questions || '[]'));
    }
  }, [formResponse]);

  return (
    <Container loading={formResponseLoading}>

      <CardContent
        style={{ width: '100%', paddingTop: '54px', paddingBottom: 12 }}
      >
              <div style={{display:'flex',gap:20,justifyContent:'space-between'}}>
                <div>
        <div><Typography style={{fontWeight:600,fontSize:'20px'}}>{practiceSettingData?.name || ''}</Typography></div>
        <div style={{display:'flex',gap:5}}><Typography style={{fontWeight:600,fontSize:'12px'}}>Email:</Typography><Typography style={{fontSize:'12px'}}>{practiceSettingData?.email || ''}</Typography></div>
        <div style={{display:'flex',gap:5}}><Typography style={{fontWeight:600,fontSize:'12px'}}>Contact:</Typography><Typography style={{fontSize:'12px'}}>{practiceSettingData?.contact || ''}</Typography></div>

        <div style={{display:'flex',gap:5}}><Typography style={{fontWeight:600,fontSize:'12px'}}>Address:</Typography><Typography style={{fontSize:'12px'}}>{getAddress(practiceSettingData || {})}</Typography></div>
      </div>
      <div>
        <img alt="logo" style={{width:60,height:60,objectFit:'contain'}} src={getImageUrl(practiceSettingData?.logo?.file)}/>
      </div>
      </div>
      <div style={{marginTop:10}}>
      <Divider/>
      </div>
        <div style={{marginTop:30}}>
          { formResponse?.formTypeCode!=="FT_CONSENT_FORMS" && formGroups?.length > 0 && (
            <BuilderPreview
              form={form}
              rules={[]}
              formGroups={formGroups}
              setFormGroups={setFormGroups}
              cardStyle={{ boxShadow: 'none' }}
              cardContentStyle={{ padding: 0 }}
            />
          )}
          {
            formResponse?.formTypeCode==="FT_CONSENT_FORMS" && <ConsentFormPreview formData={formResponse}/>
          }
          <div style={{ marginTop: 10 }}></div>
        </div>
        <div></div>
      </CardContent>
      <CardActions className='printButtonWrapper'   sx={{
          justifyContent: 'flex-end',
          paddingLeft:'24px',
          paddingRight:'24px',
          marginBottom:'30px',
        }}>
     {formResponse &&  <LoadingButton
          onClick={()=>window.print()}
          label="Print Or Save"
        />}
      </CardActions>
    </Container>
  );
};
export default FormBuilderPDF;

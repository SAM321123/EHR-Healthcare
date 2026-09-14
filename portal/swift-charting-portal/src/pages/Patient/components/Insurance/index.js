/* eslint-disable jsx-a11y/alt-text */
import { CardContent } from '@mui/material';
import { isEmpty } from 'lodash';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import checkIcon from 'src/assets/images/check.png';
import Container from 'src/components/Container';
import Typography from 'src/components/Typography';
import usePatientDetail from 'src/hooks/usePatientDetail';
import palette from 'src/theme/palette';
import InsuranceForm from './insuranceForm';
import SelfForm from './selfForm';
import { decrypt } from 'src/lib/encryption';


const Insurance = () => {
  const [billingType, setBillingType] = useState('self');
  const params = useParams();

  let { patientId } = params;
  patientId =decrypt(patientId);

  const [patientData] = usePatientDetail({ patientId });

  useEffect(()=>{
    if(!isEmpty(patientData)){
    setBillingType(patientData?.billingType)
    }
  },[patientData])
  return <Container>
    <CardContent>
    <div style={{ display: 'flex' }}>
              <div
                className="hover-btn"
                onClick={() => setBillingType('self')}
                style={{
                  padding: 10,
                  backgroundColor: palette.background.main,
                  display: 'flex',
                  alignItems: 'center',
                  borderTopLeftRadius: 6,
                  borderBottomLeftRadius: 6,
                  opacity: billingType === 'self' ? 0.9 : 1,
                }}
              >
                {billingType === 'self' && (
                  <img src={checkIcon} style={{ width: 20, height: 20 }} />
                )}
                <Typography color={palette.common.white}>Self</Typography>
              </div>
              <div
                className="hover-btn"
                onClick={() => setBillingType('insured')}
                style={{
                  padding: 10,
                  backgroundColor: palette.background.main,
                  display: 'flex',
                  alignItems: 'center',
                  borderTopRightRadius: 6,
                  borderBottomRightRadius: 6,
                  opacity: billingType === 'insured' ? 0.9 : 1,
                }}
              >
                {billingType === 'insured' && (
                  <img src={checkIcon} style={{ width: 20, height: 20 }} />
                )}
                <Typography color={palette.common.white}>Insurance</Typography>
              </div>
            </div>
            <div>
                {
                  billingType==='self'?<SelfForm/>:<InsuranceForm/>
                }
            </div>
            </CardContent>
  </Container>

}

export default Insurance
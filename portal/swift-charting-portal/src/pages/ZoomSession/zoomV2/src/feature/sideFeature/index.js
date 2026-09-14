import { Box, CardContent } from '@mui/material';
import React, { useMemo, useState } from 'react';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import useCRUD from 'src/hooks/useCRUD';
import { VALIDATE_ZOOM_SESSION_INVITE } from 'src/store/types';
import checkIcon from 'src/assets/images/check.png';
import palette from 'src/theme/palette';
import Typography from 'src/components/Typography';
import Notes from './notes';
import PatientAppointmentFormList from './patientAppointmentForms';

const SideFeature = () => {
    const [viewType, setViewType] = useState('notes');
    
    const [{ sessionDetail: { appointment = {} } = {} } = {}, , ] = useCRUD({
    id: VALIDATE_ZOOM_SESSION_INVITE,
    url: API_URL.validateZoomSessionInvite,
    type: REQUEST_METHOD.post,
    });

    const patientForms = useMemo(() => appointment?.patientForms || [], [appointment]);

    return (
        <Box style={{width:'100%', height: '100%'}}>
          <div style={{ display: 'flex' }}>
            <div
              className="hover-btn"
              onClick={() => setViewType('notes')}
              style={{
              padding: 10,
              backgroundColor: palette.background.main,
              display: 'flex',
              alignItems: 'center',
              borderTopLeftRadius: 6,
              borderBottomLeftRadius: 6,
              opacity: viewType === 'notes' ? 0.9 : 1,
              }}
            >
              {viewType === 'notes' && (
                <img src={checkIcon} style={{ width: 20, height: 20 }} />
              )}
              <Typography color={palette.common.white}>Notes</Typography>
            </div>
            <div
              className="hover-btn"
              onClick={() => setViewType('patientForms')}
              style={{
              padding: 10,
              backgroundColor: palette.background.main,
              display: 'flex',
              alignItems: 'center',
              borderTopRightRadius: 6,
              borderBottomRightRadius: 6,
              opacity: viewType === 'patientForms' ? 0.9 : 1,
              }}
            >
              {viewType === 'patientForms' && (
                <img src={checkIcon} style={{ width: 20, height: 20 }} />
              )}
              <Typography color={palette.common.white}>Patient Forms</Typography>
            </div>
          </div>
          <div 
            style={{ 
              width: '100%', 
              marginTop: '20px', 
              width: '100%',
              height: '90%'
            }}>
            {viewType==='notes'? <Notes /> : <PatientAppointmentFormList patientForms={patientForms} />}
          </div>
        </Box>
    )
}

export default SideFeature;
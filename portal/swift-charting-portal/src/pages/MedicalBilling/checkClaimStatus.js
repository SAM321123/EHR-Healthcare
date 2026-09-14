import Box from '@mui/material/Box';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import isEmpty from 'lodash/isEmpty';
import { useForm } from 'react-hook-form';
 
import LoadingButton from 'src/components/CustomButton/loadingButton';
import CustomForm from 'src/components/form';
import { useCallback, useEffect, useState } from 'react';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import { CHECK_CLAIM_Status } from 'src/store/types';
import useCRUD from 'src/hooks/useCRUD';
import { showSnackbar } from 'src/lib/utils';
import ModalComponent from 'src/components/modal';
import { parseEDI277 } from '../Patient/components/EligibilityCheckHistory/Parser/parserX12';

const CheckClaimStatusData = ({
  checkModalCloseAction = () => {},
  refetchData,
  patientId,
  defaultData,
}) => {
  const form = useForm({ mode: 'onChange' });
  const { handleSubmit, watch } = form;
  const [masterFormGroups, setMasterFormGroups] = useState();
  const [openResultModal , setOpenResultModal] = useState(false);
  const [claimStatusResult , setClaimStatusResult] = useState([]);

  
  const [resClaimStatus, , loadClaimStatus, checkClaimStatusAPI, clearClaimStatus] = useCRUD({
    id: CHECK_CLAIM_Status,
    url: API_URL.checkClaimStatus,
    type: REQUEST_METHOD.post,
  });
  useEffect(() => {
    if (!isEmpty(resClaimStatus)) {
      if(resClaimStatus?.status===false)
      {
        showSnackbar({
          message: resClaimStatus?.msg,
          severity: 'error',
        });
        clearClaimStatus(true);
      }
      else
      {
      showSnackbar({
        message: resClaimStatus?.msg,
        severity: 'success',
      });
      if(resClaimStatus?.data)
      {
        const parsedResult = parseEDI277(resClaimStatus?.data);
        setClaimStatusResult(parsedResult);
        setOpenResultModal(true);
      }
      clearClaimStatus(true);

      //checkModalCloseAction();
    }
    }
  }, [clearClaimStatus, refetchData, resClaimStatus]);
  
  const onHandleSubmit = useCallback(
    (data) => {
      checkClaimStatusAPI({ data });
    },
    [checkClaimStatusAPI]
  );


  const closeOpenResultModal = useCallback(() => {
    clearClaimStatus(true);
   // refetchData();
    setOpenResultModal(false);
    checkModalCloseAction();
  }, [checkModalCloseAction, clearClaimStatus]);
  useEffect(() => {
    // const newMasterFormGroups = [
    //   {
    //     ...WiredStaffField({
    //       name: 'primaryProviderId',
    //       label:"Select Provider",
    //       colSpan:2,
    //       placeholder:'Select',
    //       required: requiredField,
    //     }),
    //   },
    
    // ];

   

    //setMasterFormGroups(newMasterFormGroups);
  }, []);
 
  return (
    <Box>
      <CardContent>
        <CustomForm
          form={form}
          formGroups={masterFormGroups}
          columnsPerRow={2}
          defaultValue={isEmpty(defaultData) ? {} : defaultData}
        />
        <div id="DataResult" 
        style={{
        margin: '2em 0em',
      }}>Click the submit button to check claim Status Details!</div>
      </CardContent>
      <CardActions
        sx={{
          justifyContent: 'flex-start',
          paddingLeft: '24px',
          paddingRight: '24px',
        }}
      >
        <LoadingButton
          variant="outlinedSecondary"
          onClick={checkModalCloseAction}
          label="Cancel"
        />
        <LoadingButton
          loading={loadClaimStatus}
          onClick={handleSubmit(onHandleSubmit)}
          label="Check Now"
        />
      </CardActions>

      {openResultModal && (
       <ModalComponent
       open={openResultModal}
       header={{
         title: 'Claim Status',
         closeIconAction: closeOpenResultModal,
       }}
       modalStyle={{ minWidth: '500px', borderRadius: '10px' }}
     >
       <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
       
         <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '8px' }}>
           <h3 style={{ fontWeight: '600', marginBottom: '8px', color: '#333' }}>
             Status: 
             <span style={{ color: claimStatusResult?.claimStatus === 'Rejected' ? 'red' : 'green' }}>
               {' '}{claimStatusResult?.claimStatus || 'Unknown'}
             </span>
           </h3>
         </div>
     
         {/* When claimStatus is Unknown */}
  {(!claimStatusResult?.claimStatus || claimStatusResult?.claimStatus === 'Unknown') ? (
    <div style={{ marginTop: '16px', padding: '12px', background: '#fff3cd', borderRadius: '8px' }}>
      <h4 style={{ color: '#856404', fontWeight: 'bold', marginBottom: '8px' }}>Notice:</h4>
      <p style={{ color: '#856404', fontSize: '14px' }}>
        Payer is not returning any status. Please contact your payer to get the claim status.
      </p>
    </div>
  ) : (
    <>
      {/* Error Code 4 */}
      {claimStatusResult?.errors?.some(error => error.includes('Error Code: 4')) && (
        <div style={{ marginTop: '16px', padding: '12px', background: '#ffe5e5', borderRadius: '8px' }}>
          <h4 style={{ color: '#d32f2f', fontWeight: 'bold', marginBottom: '8px' }}>Processing Error</h4>
          <p style={{ color: '#d32f2f', fontSize: '14px' }}>
            There was an issue processing your request (Error Code: 4). Please verify the claim details and try again.
          </p>
        </div>
      )}

      {/* General Errors */}
      {claimStatusResult?.errors?.length > 0 &&
        !claimStatusResult.errors.some(error => error.includes('Error Code: 4')) && (
          <div style={{ marginTop: '16px', padding: '12px', background: '#ffe5e5', borderRadius: '8px' }}>
            <h4 style={{ color: '#d32f2f', fontWeight: 'bold', marginBottom: '8px' }}>Errors:</h4>
            <ul style={{ paddingLeft: '20px', color: '#d32f2f', fontSize: '14px' }}>
              {claimStatusResult.errors.map((error, index) => (
                <li key={index} style={{ marginBottom: '6px' }}>{error}</li>
              ))}
            </ul>
          </div>
        )}

      {/* Success Messages */}
      {claimStatusResult?.successMessages?.length > 0 && (
        <div style={{ marginTop: '16px', padding: '12px', background: '#e6f4ea', borderRadius: '8px' }}>
          <h4 style={{ color: '#388e3c', fontWeight: 'bold', marginBottom: '8px' }}>Success Messages:</h4>
          <ul style={{ paddingLeft: '20px', color: '#388e3c', fontSize: '14px' }}>
            {claimStatusResult.successMessages.map((msg, index) => (
              <li key={index} style={{ marginBottom: '6px' }}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      {/* No Messages */}
      {claimStatusResult?.errors?.length === 0 && claimStatusResult?.successMessages?.length === 0 && (
        <p style={{ marginTop: '16px', color: '#666' }}>No additional messages available.</p>
      )}
    </>
  )}
       </div>
     </ModalComponent>
     
      
      )}
    </Box>
  );
};
 
export default CheckClaimStatusData;

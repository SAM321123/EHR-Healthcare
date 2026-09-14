import { isEmpty } from 'lodash';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import useCRUD from 'src/hooks/useCRUD';
import { decrypt } from 'src/lib/encryption';
import Events from 'src/lib/events';
import { showSnackbar } from 'src/lib/utils';
import { SAVE_INSURANCE_DATA } from 'src/store/types';

const SelfForm = () => {
    const params = useParams();
    let { patientId } = params;
    patientId =decrypt(patientId);

    const [response, , loading, callMarkSelfAPI, clearData] = useCRUD({
        id: SAVE_INSURANCE_DATA,
        url: API_URL.markBillingSelf,
        type:  REQUEST_METHOD.post,
      });
    
      useEffect(() => {
        if (!isEmpty(response)) {
            Events.trigger(`REFRESH-PATIENT-DETAIL-${patientId}`)
          showSnackbar({
            message: "Marked billing self",
            severity: 'success',
          });
          clearData(true);
        }
      }, [ response,patientId]);

    const markBillingSelf = ()=>{
        callMarkSelfAPI({data:{patientId}})
    }

  return (
    <div
        style={{
            display:'flex',
          justifyContent: 'flex-start',
          gap:10,
          marginTop:40,
        }}
      >
        {/* <LoadingButton
          variant="outlinedSecondary"
          onClick={()=>{}}
          label="Cancel"
        /> */}
        <LoadingButton
          loading={loading}
          onClick={markBillingSelf}
          label="Save"
        />
      </div>
  )
}

export default SelfForm
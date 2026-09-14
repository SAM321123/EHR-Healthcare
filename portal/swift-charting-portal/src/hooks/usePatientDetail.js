import { useEffect } from 'react';
import { API_URL } from 'src/api/constants';
import { showSnackbar } from 'src/lib/utils';
import useCRUD from './useCRUD';
import Events from 'src/lib/events';

const usePatientDetail = ({ patientId,forceRefetch=false }) => {
  const [data, error, loading, getDetail, clearResponse] = useCRUD({
    id: `patient-detail-${patientId}`,
    url: `${API_URL.getPatients}/${patientId}`,
    type: 'read',
    subscribeSocket:true
  });

  useEffect(() => {
    Events.on(`REFRESH-PATIENT-DETAIL-${patientId}`, patientId, getDetail);
  }, [getDetail, patientId]);

  useEffect(() => {
    if (patientId && (!data || forceRefetch)) {
      getDetail();
    }
  }, [patientId]);

  useEffect(() => {
    if (error) {
      showSnackbar({ message: error, severity: 'error' });
      clearResponse(true);
    }
  }, [error, clearResponse]);
  return [data?.results || data, loading, getDetail, clearResponse];
};

export default usePatientDetail;

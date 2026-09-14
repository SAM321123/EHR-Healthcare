import { useEffect } from 'react';
import { API_URL } from 'src/api/constants';
import { showSnackbar } from 'src/lib/utils';
import useCRUD from './useCRUD';
import Events from 'src/lib/events';

const useStaffDetail = ({ staffId,forceRefetch=false }) => {
  const [data, error, loading, getDetail, clearResponse] = useCRUD({
    id: `REFRESH-STAFF-DETAIL-${staffId}`,
    url: `${API_URL.staff}/${staffId}`,
    type: 'read',
    subscribeSocket:true
  });

  useEffect(() => {
    Events.on(`REFRESH-STAFF-DETAIL-${staffId}`, staffId, getDetail);
  }, [getDetail, staffId]);

  useEffect(() => {
    if (staffId && (!data || forceRefetch)) {
      getDetail();
    }
  }, [staffId]);

  useEffect(() => {
    if (error) {
      showSnackbar({ message: error, severity: 'error' });
      clearResponse(true);
    }
  }, [error, clearResponse]);
  return [data?.results || data, loading, getDetail, clearResponse];
};

export default useStaffDetail;

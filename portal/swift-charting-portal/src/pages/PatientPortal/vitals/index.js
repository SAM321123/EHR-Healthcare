/* eslint-disable no-unused-vars */
import { cloneDeep } from 'lodash';
import isEmpty from 'lodash/isEmpty';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import AlertDialog from 'src/components/AlertDialog';
import Container from 'src/components/Container';
import FilterComponents from 'src/components/FilterComponents';
import Table from 'src/components/Table';
import TableTextRendrer from 'src/components/TableTextRendrer';
import ModalComponent from 'src/components/modal';
import useCRUD from 'src/hooks/useCRUD';
import useQuery from 'src/hooks/useQuery';
import { dateFormats } from 'src/lib/constants';
import { showSnackbar } from 'src/lib/utils';
import {
  VITALS_DATA,
  VITALS_LIST
} from 'src/store/types';
import palette from 'src/theme/palette';
import useAuthUser from 'src/hooks/useAuthUser';
import ShowPatientActivityLog from 'src/pages/Patient/components/Home/TopCard';



const Vitals = () => {
  const [user, , , , , validateToken] = useAuthUser();
  const patientId = user?.id;


  const [
    response,
    loading,
    page,
    rowsPerPage,
    handlePageChange,
    filters,
    handleFilters,
    sort,
    handleSort,
    handleOnFetchDataList,
  ] = useQuery({
    listId: `${VITALS_LIST}-${patientId}`,
    url: API_URL.vitals,
    type: REQUEST_METHOD.get,
    subscribeSocket: true,
    queryParams: { patientId },
  });

  return (
    <>
      <Container
        style={{ display: 'flex', flexDirection: 'column' }}
        loading={loading}
      >
        <div style={{ marginTop: 30 }}>
            <ShowPatientActivityLog patientId={patientId} />
        </div>
      </Container>
    </>
  );
};

export default Vitals;

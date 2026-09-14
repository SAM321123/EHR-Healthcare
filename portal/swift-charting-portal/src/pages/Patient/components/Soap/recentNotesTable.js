import { useParams } from 'react-router-dom';

import { dateFormats } from 'src/lib/constants';
import { dateFormatter, getFullName } from 'src/lib/utils';

import Table from 'src/components/Table';

import useAuthUser from 'src/hooks/useAuthUser';
import { useSelector } from 'react-redux';

import { CardContent } from '@mui/material';
import { useMemo } from 'react';
import TableTextRendrer from 'src/components/TableTextRendrer';
import { decrypt } from 'src/lib/encryption';
import { ENCOUNTERS_LIST } from 'src/store/types';

const RecentNotesTable = ({onSoapClick}) => {
  const [userData] = useAuthUser();

  const params = useParams();
  let patientId = params?.patientId || userData?.id;
  if (params.patientId) {
    patientId = decrypt(patientId);
  }
  const recentNotesData = useSelector(
    (state) =>
      state?.crud
        ?.get(`${ENCOUNTERS_LIST}-${patientId}`)
        ?.get('read')
        ?.get('data')?.results
  );
  const soapNotesData =
  recentNotesData?.filter(
    (note) => note.soapForm && Object.keys(note.soapForm).length > 0
  ) || [];
  
  const formColumns = useMemo(() => {
    return [
      {
        label: 'Encounter Type',
        type: 'text',
        dataKey: 'encounterType.name',
        maxWidth: '15rem',
      },
      {
        label: 'Assign To',
        type: 'text',
        dataKey: 'encounterType.name',
        maxWidth: '15rem',
        render: ({ data }) => (
          <TableTextRendrer>{getFullName(data.assignedTo)}</TableTextRendrer>
        )
       },
      {
        label: 'Start Date',
        type: 'text',
        dataKey: 'startDate',
        maxWidth: '15rem',
        render: ({ data }) => (
          <TableTextRendrer>{`${dateFormatter(
            data.startDate,
            dateFormats.MMMDDYYYY
          )}`}</TableTextRendrer>
        ),
      },
      {
        label: 'Time',
        type: 'text',
        dataKey: 'startDate',
        maxWidth: '15rem',
        render: ({ data }) => (
          <TableTextRendrer>{`${dateFormatter(
            data.startDate,
            dateFormats.hhmmA
          )}`}</TableTextRendrer>
        ),
      },
      {
        label: 'Action',
        type: 'text',
        dataKey: 'action',
        maxWidth: '10rem',
        render: ({ data }) =><div className='hover' onClick={()=>onSoapClick(data)}>SOAP</div>          
      },
      
    ];
  }, []);

  return (
    <CardContent>
      <Table
        data={soapNotesData ||[]}
        totalCount={soapNotesData?.length}
        columns={formColumns}
        wrapperStyle={{ overflow: 'auto',border:'none' }}
        timezone
        itemStyle={{ textTransform: 'capitalize' }}
      />
    </CardContent>
  );
};

export default RecentNotesTable;

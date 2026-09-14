import React from 'react'
import { useLocation, useParams } from 'react-router-dom'
import TableTextRendrer from 'src/components/TableTextRendrer';
import useReduxState from 'src/hooks/useReduxState';
import { dateFormats } from 'src/lib/constants';
import { decrypt } from 'src/lib/encryption';
import { dateFormatter } from 'src/lib/utils';
import palette from 'src/theme/palette';

const EncounterColumn = ({data,componentKey}) => {
    const params = useParams();
const location=  useLocation()
 const [formData] = useReduxState(
    `Patient_Encounter-Form-Data`,
    {}
  );

  const compoentData = formData[componentKey] || []
const isEncounterRoute = location.pathname.includes('encounters');

    let {encounterId} = params || {};
    if(encounterId){
        encounterId = decrypt(encounterId);
    }
    const title = data?.patientEncounterId ? isEncounterRoute && compoentData.includes(data.id) ? 'Current'  :  data?.patientEncounterId==encounterId?'Current':`${dateFormatter(
        data?.patientEncounter?.startDate,
        dateFormats.MMMDDYYYY
      )} - ${data?.patientEncounter?.encounterType?.name}` :isEncounterRoute && compoentData.includes(data.id) ? 'Current'  : 'N/A'
  return (
    <TableTextRendrer style={{...(title==='Current'? {color:palette.common.green}:{})}}>{title}</TableTextRendrer>
  )
}

export default EncounterColumn
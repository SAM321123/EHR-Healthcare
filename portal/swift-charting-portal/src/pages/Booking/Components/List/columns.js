import { API_URL } from 'src/api/constants';
import ActionButton from 'src/components/ActionButton';
import TableTextRendrer from 'src/components/TableTextRendrer';
import { appointmentStatusCode, dateFormats, timeFormats } from 'src/lib/constants';
import { formatPatientNames, getFullName } from 'src/lib/utils';
import {
  handleJoinAppointment
} from 'src/pages/VideoCall/utility';
import { GET_APPOINTMENT } from 'src/store/types';
import palette from 'src/theme/palette';
import TableDropDown from 'src/wiredComponent/DropDown';

const appointmentColumns = [
  {
    label: `Appointment ID`,
    type: 'text',
    dataKey: 'id',
    sort: true,
    maxWidth: '10rem',
  },
  {
    label: 'Status',
    dataKey: 'statusCode',
    type: 'text',
    sort: true,
    render: ({ data }) => (
      <>
        {
          data?.statusCode !== appointmentStatusCode?.COMPLETE && data?.statusCode !== appointmentStatusCode?.MISSED 
          ? (
            <TableDropDown
              data={data.status || {}}
              id={data.id}
              api={`${API_URL.appointment}/${data.id}`}
              code="appointment_status"
              dataKey="statusCode"
              eventId={`${GET_APPOINTMENT}-${data?.patients?.[0]?.id}`}
            />
          ) 
          :<TableTextRendrer style={{maxWidth:'10rem', color: data?.status?.colorCode || palette.text.offWhite}}>{data?.status?.name || 'N/A' }</TableTextRendrer>
        }
      </>
    ),
  },
  {
    label: 'Patient Name',
    type: 'text',
    sort: true,
    maxWidth: '10rem',
    dataKey: 'id',
    render: ({ data }) => (
      <>
        <TableTextRendrer>
          {formatPatientNames(data?.patients||[])}
        </TableTextRendrer>
      </>
    ),
  },
  {
    label: 'Date',
    dataKey: 'startDateTime',
    type: 'date',
    format: dateFormats.MMDDYYYYhhmmA,
    sort: true,
    maxWidth: '10rem',
  },
  {
    label: 'Provider',
    sort: true,
    maxWidth: '10rem',
    dataKey: 'practitionerId',
    render: ({ data }) => (
      <>
        <TableTextRendrer>
          {getFullName(data?.practitioner)}
        </TableTextRendrer>
      </>
    ),
  },
  {
    label: 'Type',
    dataKey: 'typeCode',
    type: 'text',
    sort: true,
    maxWidth: '10rem',
    render: ({ data }) => (
      <>
        <TableTextRendrer>
          {data?.type?.name}
        </TableTextRendrer>
      </>
    ),
  },
 
  {
    label: 'Reason for appointment',
    dataKey: 'reasonForAppointment',
    type: 'text',
    sort: true,
    maxWidth: '5rem',
    render:({data})=>{
      return <TableTextRendrer>{data?.reasonForAppointment || 'N/A' }</TableTextRendrer>
    }
  },
  {
    render: ({ data }) => (
      <ActionButton
        className="page_header_button"
        type="action"
        label="Join"
        onClick={() => handleJoinAppointment(`${data?.googleMeetLink}`)}
        style={{
          borderRadius: 8,
          fontSize: '0.8rem',
          ...(!data?.googleMeetLink ? { display: 'none' } : {}),
        }}
      />
    ),
  },
];

export default appointmentColumns;

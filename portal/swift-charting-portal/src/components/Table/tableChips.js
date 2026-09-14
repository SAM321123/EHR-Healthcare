import React from 'react';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import { Chip, Tooltip } from '@mui/material';
import palette from 'src/theme/palette';
import {
  appointmentStatus,
  faxHistoryStatus,
  formStatus,
  invoiceStatus,
  medicineStatus,
  pharmacyOrderFaxStatus,
  roleTypes,
} from 'src/lib/constants';
import { getUserRole } from 'src/lib/utils';

export function getChipColor(status) {
  switch (status) {
    case invoiceStatus.PAID:
    case medicineStatus.NEW:
    case formStatus.FAXED:
    case appointmentStatus.CONFIRMED:
      return {
        color: palette.background.appleGreen,
        backgroundColor: 'rgba(52, 178, 56, 0.1)',
      };
    case invoiceStatus.SENT:
    case medicineStatus.STOP:
    case formStatus.PARTIAL:  
      return {
        color: palette.background.pomegranate,
        backgroundColor: 'rgba(239, 46, 46, 0.1)',
      };
    case invoiceStatus.PARTIALLY_PAID:
    case medicineStatus.CHANGE:
    case formStatus.PENDING:
    case appointmentStatus.CHECKIN:
      return {
        color: palette.background.pizazz,
        backgroundColor: 'rgba(255, 149, 0, 0.1)',
      };
    case invoiceStatus.DRAFT:
    case formStatus.SENT:
    case appointmentStatus.CANCELLED:  
      return {
        color: palette.primary.main,
        backgroundColor: 'rgba(9, 179, 251, 0.1)',
      };
    case faxHistoryStatus.SUCCESS:
    case formStatus.COMPLETE:
      return {
        color: palette.background.appleGreen,
        backgroundColor: 'rgba(52, 178, 56, 0.1)',
      };
    case faxHistoryStatus.FAILED:
    case appointmentStatus.MISSED:
      return {
        color: palette.background.pomegranate,
        backgroundColor: 'rgba(239, 46, 46, 0.1)',
      };
    case pharmacyOrderFaxStatus.PENDING:
      return {
        color: palette.background.pomegranate,
        backgroundColor: 'rgba(239, 46, 46, 0.1)',
      };
    case pharmacyOrderFaxStatus.FAXED:
      return {
        color: palette.background.appleGreen,
        backgroundColor: 'rgba(52, 178, 56, 0.1)',
      };
    case pharmacyOrderFaxStatus.CREATED:
      return {
        color: palette.background.pizazz,
        backgroundColor: 'rgba(255, 149, 0, 0.1)',
      };
      case appointmentStatus.COMPLETED:
        return {
          color: palette.appointmentStatus.Completed,
          backgroundColor: 'rgba(128,128,128, 0.1)',
        };
        case appointmentStatus.PENDING_CONFIRMATION:
        return {
          color: palette.background.lightRed,
          backgroundColor: 'rgba(255,122,122, 0.1)',
        };
        case appointmentStatus.READY_FOR_PRACTITIONER:
        return {
          color: palette.appointmentStatus['Ready For Practitioner'],
          backgroundColor: 'rgba(128,128,0, 0.1)',
        };
        case appointmentStatus.WAITING_ROOM:
        return {
          color: palette.appointmentStatus['Waiting Room'],
          backgroundColor: 'rgba(128,0,128, 0.1)',
        };
    default:
      return {};
  }
}
function getChipText(row, column) {
  const userRole = getUserRole()
  switch (get(row, column?.labelAccessor) || row?.status) {
    case invoiceStatus.PAID:
      return 'Paid';
    case invoiceStatus.SENT:
      return  userRole === roleTypes.patient  ? 'Payment Pending' : 'Sent';
    case invoiceStatus.PARTIALLY_PAID:
      return 'Partially Paid';
    case invoiceStatus.DRAFT:
      return 'Draft';
    default:
      return get(row, column?.labelAccessor) || row?.status;
  }
}

const TableChips = ({ row, column }) => (
  <Tooltip
    title={get(row, column?.tooltipAccessor) || getChipText(row, column)}
  >
    <Chip
      size="small"
      sx={{
        fontSize: '12px',
        fontStyle: 'normal',
        fontWeight: 500,
        lineHeight: '150%',
        px: 2,
        backgroundColor: 'rgba(52, 178, 56, 0.1)',
        color: palette.background.appleGreen,
        ...getChipColor(get(row, column?.labelAccessor) || row?.status),
      }}
      label={getChipText(row, column)}
    />
  </Tooltip>
);

TableChips.defaultProps = {
  data: {},
};

TableChips.propTypes = {
  data: PropTypes.instanceOf(Object),
};

export default TableChips;

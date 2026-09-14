import ShareIcon from '@mui/icons-material/Share';
import LoopIcon from '@mui/icons-material/Loop';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import palette from 'src/theme/palette';
import FaxOutlinedIcon from '@mui/icons-material/FaxOutlined';
import LocalPharmacyOutlinedIcon from '@mui/icons-material/LocalPharmacyOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import SendIcon from '@mui/icons-material/Send';
import KeyboardDoubleArrowDownOutlinedIcon from '@mui/icons-material/KeyboardDoubleArrowDownOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import NotesIcon from '@mui/icons-material/Notes';

import editIcon from 'src/assets/images/edit.png';
import deleteIcon from 'src/assets/images/delete.png';
import viewIcon from 'src/assets/images/view.png';
import LockOpenIcon from '@mui/icons-material/LockOpen';

const TableActionIcons = (type) => {
  switch (type) {
    case 'unblock':
      return (
        <LockOpenIcon
          size="small"
          sx={{ width: '18px', height: '18px', color: palette.text.secondary }}
        />);
    case 'view':
      return (
        <img src={viewIcon} style={{ width: 16, height: 16 }} alt="view" />
      );
    case 'delete':
      return (
        <img src={deleteIcon} style={{ width: 16, height: 16 }} alt="delete" />
      );
    case 'edit':
      return (
        <img src={editIcon} style={{ width: 16, height: 16 }} alt="edit" />
      );
    case 'share':
      return (
        <ShareIcon
          size="small"
          sx={{ width: '18px', height: '18px', color: palette.common.icon }}
        />
      );
    case 'fax':
      return (
        <FaxOutlinedIcon
          size="small"
          sx={{ width: '18px', height: '18px', color: palette.primary.main }}
        />
      );
    case 'pharmacyOrder':
      return (
        <LocalPharmacyOutlinedIcon
          size="small"
          sx={{ width: '18px', height: '18px', color: palette.primary.main }}
        />
      );
    case 'ship':
      return (
        <LocalShippingOutlinedIcon
          size="small"
          sx={{ width: '18px', height: '18px', color: palette.primary.main }}
        />
      );
    case 'print':
      return (
        <PrintOutlinedIcon
          size="small"
          sx={{ width: '18px', height: '18px', color: palette.primary.main }}
        />
      );
    case 'regenerate':
      return (
        <LoopIcon
          size="small"
          sx={{ width: '18px', height: '18px', color: palette.primary.main }}
        />
      );
    case 'download':
      return (
        <img
          width="18px"
          height="18px"
          alt={type}
          src="/assets/icons/ic_download.svg"
        />
      );
    case 'history':
      return (
        <SettingsBackupRestoreIcon
          size="small"
          sx={{ width: '20px', height: '20px', color: palette.text.offWhite }}
        />
      );
    case 'send':
      return (
        <SendIcon
          size="small"
          sx={{ width: '20px', height: '20px', color: palette.text.offWhite }}
        />
      );
    case 'import':
      return (
        <KeyboardDoubleArrowDownOutlinedIcon
          size="small"
          sx={{ width: '20px', height: '20px', color: palette.text.offWhite }}
        />
      );
    case 'schedule':
      return (
        <AccessTimeIcon
          size="small"
          sx={{ width: '20px', height: '20px', color: palette.text.offWhite }}
        />
      );
    case 'note':
      return (
        <NotesIcon
          size="small"
          sx={{ width: '20px', height: '20px', color: palette.text.offWhite }}
        />
      );
    case 'check':
      return (
        <CheckCircleOutlineIcon
          size="small"
          sx={{ width: '20px', height: '20px', color: palette.background.appleGreen }}
        />
      );
    case 'discard':
      return (
        <CancelOutlinedIcon
          size="small"
          sx={{ width: '20px', height: '20px', color: palette.error.main }}
        />
      );
    default:
      return <div />;
  }
};

export default TableActionIcons;

import { Card } from '@mui/material';
import palette from 'src/theme/palette';
import moment from 'moment';
import { getFullName, getImageUrl } from 'src/lib/utils';
import './PreviewScreenCard.css';

const PreviewScreenCard = (props) => {
  const {
    style = {},
    cardStyle = {},
    patient = {},
  } = props;

  return (
   <div style={{display:'flex',gap:10,alignItems:'center'}}>
    <div>
    <img
            style={{ height: 40, width: 40, objectFit: 'cover' ,borderRadius:20}}
            src={patient?.file?.file ? getImageUrl(patient.file.file) : "/assets/images/avatars/patient.webp"}
            alt="profile"
          />
    </div>
    <div>{getFullName(patient)}</div>
   </div>
  );
};

export default PreviewScreenCard;

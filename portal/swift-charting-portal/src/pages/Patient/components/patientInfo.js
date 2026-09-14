import React from 'react';
import Typography from 'src/components/Typography';
import person from 'src/assets/images/patient.png';
import palette from 'src/theme/palette';
import usePatientDetail from 'src/hooks/usePatientDetail';
import { useParams } from 'react-router-dom';
import { formatPhoneNumber, getDateDiff, getFullName, getGender, getImageUrl } from 'src/lib/utils';
import { decrypt } from 'src/lib/encryption';
import userIcon from 'src/assets/images/user.png';


const PatientInfo = ({ wrapperStyle = {},customPatientId }) => {
  const params = useParams()
  let { patientId } = params || {};
  if(params.patientId){
  patientId =decrypt(patientId);
  }

  const [patientData] = usePatientDetail({ patientId:customPatientId||patientId});

  let updatedAllergies = [];

  if (patientData && patientData.allergies) {
    updatedAllergies = patientData.allergies.filter(
      (elem) => elem.isActive && !elem.isDeleted
    );
  }
const patientGender = getGender(patientData)
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: '1px solid #E8E8E8',
        padding: '10px',
        gap: '10px',
        borderRadius: '8px',
        ...wrapperStyle,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '18px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '10px',
            alignItems: 'center',
          }}
        >
          <img
            src={
              patientData?.file?.file
                ? getImageUrl(patientData?.file?.file)
                : userIcon
            }
            alt="person"
            width="40"
            height="40"
            style={{ borderRadius: '4px',objectFit:'cover' }}
          />
          <div>
            <div
              style={{ display: 'flex', flexDirection: 'row', gap: '3.89px' }}
            >
              <Typography
                style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  lineHeight: '18px',
                  color: palette.text.primary,
                }}
              >
                {getFullName(patientData)}
              </Typography>
              <Typography
                style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  lineHeight: '18px',
                  color: palette.text.likeblack,
                }}
              >
                [id:{patientData?.id}]
              </Typography>
              {!!patientData?.dob && (
                <Typography
                  style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    lineHeight: '18px',
                    color: palette.text.primary,
                  }}
                >
                  -{' '}
                  {getDateDiff(patientData.dob, new Date(), { unit: 'years' })}{' '}
                  Yrs
                </Typography>
              )}
                {patientGender && <Typography
                  style={{
                    color: palette.text.offWhite,
                    fontSize: '12px',
                    fontWeight: '600',
                    lineHeight: '18px',
                  }}
                >
                  ,{patientGender}
                  
                </Typography>}
            </div>
            {patientData?.email && (
              <div
                style={{ display: 'flex', flexDirection: 'row', gap: '3.89px' }}
              >
                <Typography
                  style={{
                    color: palette.text.offWhite,
                    fontSize: '12px',
                    fontWeight: '500',
                    lineHeight: '18px',
                  }}
                >
                  Email:
                </Typography>
                <Typography
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    lineHeight: '18px',
                    color: palette.text.likeblack,
                  }}
                >
                  {patientData.email}
                </Typography>
              </div>
            )}
            {patientData?.phone && (
              <div
                style={{ display: 'flex', flexDirection: 'row', gap: '3.89px' }}
              >
                <Typography
                  style={{
                    color: palette.text.offWhite,
                    fontSize: '12px',
                    fontWeight: '500',
                    lineHeight: '18px',
                  }}
                >
                  Phone:
                </Typography>
                <Typography
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    lineHeight: '18px',
                    color: palette.text.likeblack,
                  }}
                >
                  {formatPhoneNumber(patientData.phone)}
                </Typography>
              </div>
            )}
            {patientData?.address?.description && (
              <div
                style={{ display: 'flex', flexDirection: 'row', gap: '3.89px' }}
              >
                <Typography
                  style={{
                    color: palette.text.offWhite,
                    fontSize: '12px',
                    fontWeight: '500',
                    lineHeight: '18px',
                    
                  }}
                >
                  Address:
                </Typography>
                <Typography
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    lineHeight: '18px',
                    color: palette.text.likeblack,
                    overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth:'320px',
                  }}
                >
              {[
                patientData?.address?.description,
                patientData?.address?.postalCode,
              ].filter(Boolean).join(", ")}
                </Typography>
              </div>
            )}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '3.89px',
          }}
        >
          <Typography
            style={{
              color: palette.text.offWhite,
              fontSize: '12px',
              fontWeight: '500',
              lineHeight: '18px',
            }}
          >
            MRN:
          </Typography>
          <Typography
            style={{
              fontSize: '12px',
              fontWeight: 600,
              lineHeight: '18px',
              color: palette.text.likeblack,
            }}
          >
            NA
          </Typography>
        </div>
      </div>
      {!!updatedAllergies.length && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            padding: '10px',
            gap: '10px',
            alignItems: 'center',
          }}
        >
          <Typography
            style={{
              color: '#FF0000',
              fontSize: '12px',
              fontWeight: 600,
              lineHeight: '18px',
            }}
          >
            Allergies:
          </Typography>
          {updatedAllergies.slice(0, 3).map((item, index) => (
            <button
              key={index}
              style={{
                backgroundColor: '#FFFF',
                border: '0.97px solid #E8E8E8',
                borderRadius: '3.89px',
              }}
            >
              <Typography
                style={{
                  fontSize: '13.63px',
                  fontWeight: '400',
                  lineHeight: '20.45px',
                  color: '#666666',
                }}
              >
                {item.allergy}
              </Typography>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientInfo;

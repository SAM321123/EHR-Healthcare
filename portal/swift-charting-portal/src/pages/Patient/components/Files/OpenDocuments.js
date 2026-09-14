import React, { useEffect } from 'react';
import palette from 'src/theme/palette';
import useCRUD from 'src/hooks/useCRUD';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import { get } from 'lodash';
import { getImageUrl } from 'src/lib/utils';
import Loader from 'src/components/Loader';
import { GridItem } from './GridItem';

function OpenDucuments({ patientData, fileType }) {
  const labelKey = fileType === 'all' ? 'file.name' : 'formData.name';
  const [documentList, , , getDocumentList] = useCRUD({
    id: `GET_DOCUMENT_LIST_${fileType}`,
    url: fileType === 'all' ? API_URL.patientFile : API_URL.sharedFormList,
    type: REQUEST_METHOD.get,
  });

  const [documentRes, , loading, getDocumentDetails, clearDetails] = useCRUD({
    id: `GET_DOCUMENT_DETAILS`,
    url: API_URL.downloadPatientFormPDF,
    type: REQUEST_METHOD.get,
  });

  const downloadFile = (blob) => {
    const pdfWindow = window.open('');
    pdfWindow.document.write(
      `<iframe width='100%' height='100%' src='data:application/pdf;base64, ${encodeURI(
        blob
      )}'></iframe>`
    );
    clearDetails(true);
  };

  useEffect(() => {
    if (documentRes) {
      downloadFile(documentRes);
    }
  }, [documentRes]);
  const getBlobData = (file, type, patient) => {
    const imageUrl = getImageUrl(`${patient}/${file}`,{isPatientFile: true});
    fetch(imageUrl, {credentials: 'include'})

      .then((response) => response.blob())
      .then((responseAsBlob) => {
        const blobData = new Blob([responseAsBlob], { type });
        const downloadURL = window.URL.createObjectURL(blobData);
        window.open(downloadURL, '_blank');
        URL.revokeObjectURL(downloadURL);
      })
      .catch(() => {});
  };

  const openFullView = (item) => {
    if (fileType !== 'all') {
      getDocumentDetails({ stringBuffer: true }, `/${item.id}`);
    } else {
      const imgUrl = item?.file ? getImageUrl(`${item?.patient}/${get(item, 'file.name')}`, {isPatientFile: true, }) : '';
      if (imgUrl) {
        getBlobData(get(item, 'file.name'), get(item, 'file.mimetype'), item?.patient);
      }
    }
  };
  useEffect(() => {
    const params = {
      patient: patientData?.id,
    };
    if (fileType !== 'all') params.formType = fileType;
    getDocumentList(params);
  }, [fileType]);

  return (
    <>
      {documentList &&
        documentList?.results?.map((item) => (
          <GridItem
            key={item}
            fileType={fileType}
            item={item}
            label={get(item, labelKey)}
            icon="/assets/images/pdfIcon.png"
            style={{
              backgroundColor: 'transparent',
              padding: 0,
              alignItems: 'center',
            }}
            labelStyle={{
              color: palette.grey[700],
              textAlign: 'center',
              fontSize: '0.8rem',
              wordWrap: 'unset',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              mx: 0,
            }}
            imageStyle={{
              height: 65,
              width: 65,
              padding: '0px',
              borderRadius: '12px',
            }}
            iconStyle={{
              borderRadius: '12px',
            }}
            onClick={() => openFullView(item)}
          />
        ))}
      <Loader loading={loading} />
    </>
  );
}

export default OpenDucuments;

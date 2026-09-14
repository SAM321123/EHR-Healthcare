import React, { useEffect, useState } from 'react';
import { IconButton } from '@mui/material';
import { ArrowLeft, ArrowRight } from '@mui/icons-material';
import useCRUD from 'src/hooks/useCRUD';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import { GET_EDUCATION_CONTENT } from 'src/store/types';
import { getImageUrl } from 'src/lib/utils';
import VideoPlayer from './VideoPlayer';

const CarouselComponent = (props) => {
  const {
    style = {},
    isMobile = false,
    setTotalEducationContents = () => {},
    setWatchedEducationContents = () => {},
    educationContentIds = [],
  } = props;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [educationContentUrls, setEducationContentUrls] = useState([]);
  const [educationContents, setEducationContents] = useState([]);
  const [educationContentResponse, , , getEducationContents] = useCRUD({
    id: GET_EDUCATION_CONTENT,
    url: `${API_URL.getEducationContent}?id=${educationContentIds.join(',')}`,
    type: REQUEST_METHOD.get,
  });

  useEffect(() => {
    if (educationContentIds.length) {
      getEducationContents();
    }
  }, [educationContentIds]);

  useEffect(() => {
    if (Array.isArray(educationContentResponse?.results)) {
      const urls = [];
      setEducationContents(educationContentResponse.results);
      if (educationContentResponse?.results?.length) {
        setTotalEducationContents(educationContentResponse.results.length);
      }
      educationContentResponse.results.forEach((item) => {
        if (item.isUrl) {
          urls.push(item.url);
        } else if (item?.file?.file && item?.file?.mimetype?.includes('video')) {
          urls.push(getImageUrl(item?.file?.name));
        }
      });
      setEducationContentUrls(urls);
    }
  }, [educationContentResponse]);
  return (
    <>
      <div
        style={{
          marginTop: 20,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          height: 300,
          width: isMobile ? '98vw' : 520,
          ...style,
        }}
      >
        <IconButton
          onClick={() =>
            setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev))
          }
          disabled={currentIndex === 0}
          style={{
            height: 50,
            width: 50,
            borderRadious: '50%',
          }}
        >
          <ArrowLeft style={{ height: 40, width: 30 }} />
        </IconButton>
        <VideoPlayer
          educationContentId={educationContents[currentIndex]?.id}
          source={educationContentUrls[currentIndex]}
          containerStyle={{
            height: 300,
            width: isMobile ? '85vw' : 460,
            borderRadious: 11,
          }}
          setWatched={(contentId) => {
            setWatchedEducationContents((prev) => {
              const updates = { ...prev };
              updates[contentId] = true;
              setCurrentIndex((pre) =>
                pre < educationContentUrls.length - 1 ? pre + 1 : pre
              );
              return updates;
            });
          }}
        />
        <IconButton
          onClick={() =>
            setCurrentIndex((prev) =>
              prev < educationContentUrls.length - 1 ? prev + 1 : prev
            )
          }
          disabled={currentIndex === educationContentUrls.length - 1}
          style={{
            height: 50,
            width: 50,
            borderRadious: '50%',
          }}
        >
          <ArrowRight style={{ height: 40, width: 30 }} />
        </IconButton>
      </div>
      <div style={{ marginTop: 32 }}>
        <div
          style={{
            textAlign: 'center',
            color: '#303030',
            fontSize: 16,
            fontFamily: 'Poppins',
            fontStyle: 'normal',
            fontWeight: 600,
            lineHeight: 'normal',
          }}
        >
          {educationContents?.[currentIndex]?.name || ''}
        </div>
        <div
          style={{
            textAlign: 'center',
            color: '#303030',
            fontSize: 14,
            fontFamily: 'Poppins',
            fontStyle: 'normal',
            fontWeight: 500,
            lineHeight: 'normal',
          }}
        >
          {educationContents?.[currentIndex]?.description || ''}
        </div>
      </div>
    </>
  );
};
export default CarouselComponent;

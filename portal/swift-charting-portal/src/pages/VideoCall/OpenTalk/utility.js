const getPublisherContainerStyle = ({
  hasVideo = false,
  streams = [],
  showParticipants = false,
  publisherProfilePic = '',
  isMobile = false,
}) => {
  let style = {
    height: '100%',
    width: showParticipants ? '66vw' : '100%',
    borderRadius: '0.6rem',
  };

  if (streams.length) {
    style = {
      ...style,
      position: 'absolute',
      bottom: 10,
      height: '20vh',
      width: isMobile ? '95%' : '18%',
    };
  }
  if (!hasVideo) {
    style = {
      ...style,
      backgroundColor: '#1f1f1f',
      backgroundImage: `url(${publisherProfilePic})`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center center',
      zIndex: 5,
    };
  }
  return style;
};

const getPublisherStyle = ({ hasVideo = false }) => {
  const style = {
    height: '100%',
    width: '100%',
    borderRadius: '0.6rem',
    display: 'flex',
    justifyContent: 'center',
  };

  if (!hasVideo) {
    style.display = 'none';
  }
  return style;
};

const getPublisherProperties = () => {
  const style = { height: '100%', width: '100%' };
  return style;
};

const getSubscriberContainerStyle = ({ isMobile, streams }) => {
  const style = {
    position: 'absolute',
    bottom: 0,
    left: '19.5%',
    width: '80%',
    height: '20vh',
    borderRadius: '0.6rem',
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    gap: 10,
    ...(!streams?.length ? { display: 'none' } : {}),
  };
  return style;
};

const getSubscriberProperties = () => {
  const style = {
    height: '100%',
    width: '100%',
  };
  return style;
};

export {
  getPublisherContainerStyle,
  getPublisherStyle,
  getPublisherProperties,
  getSubscriberContainerStyle,
  getSubscriberProperties,
};

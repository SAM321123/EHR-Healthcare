import * as React from 'react';
import Avatar from '@mui/material/Avatar';

const BackgroundLetterAvatars = ({ name }) => {
  const getAvatarName = React.useMemo(
    () => ({
      sx: {
        bgcolor: 'pink',
      },
      children: `${name.split(' ')[0][0]}${name.split(' ')[1][0]}`,
    }),
    [name]
  );

  return <Avatar {...getAvatarName} />;
};

export default BackgroundLetterAvatars;

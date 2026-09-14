// material-ui
import { styled } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import FullScreenLoader from './FullScreenLoader';

const LoaderWrapper = styled('div')({
  position: 'fixed',
  top: 0,
  left: 0,
  zIndex: 1301,
  width: '100%',
});

const CircularLoaderWrapper = styled('div')({
  width: '80%',
  textAlign: 'center',
});

const LoaderType = {
  circular: (color, restProps) => (
    <CircularLoaderWrapper>
      <CircularProgress color={color} {...restProps} />
    </CircularLoaderWrapper>
  ),
  fullScreen: (color, restProps) => <FullScreenLoader color={color} {...restProps} />,
  linear: (color, restProps) => (
    <LoaderWrapper>
      <LinearProgress color={color} {...restProps} />
    </LoaderWrapper>
  ),
};

const Loader = ({
  type = 'linear', color = 'secondary', loading = false, ...restProps
}) => {
  const LoaderComponent = LoaderType[type](color, restProps);
  return loading ? <div>{LoaderComponent}</div> : null;
};

export default Loader;

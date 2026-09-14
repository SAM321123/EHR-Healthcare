import PropTypes from 'prop-types';

import Loader from '../Loader';

const Container = ({
  loading = false,
  children = null,
  style = {},
  applyContainer = true,
  ...restProps
}) => {
  if (applyContainer) {
    return (
      <div
        {...restProps}
        style={{
          ...style,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
        data-testid="container_test"
      >
        <Loader loading={loading} />
        {children}
      </div>
    );
  }

  return children;
};

Container.propTypes = {
  children: PropTypes.node,
  loading: PropTypes.bool,
  style: PropTypes.object,
  applyContainer: PropTypes.bool,
};

export default Container;

import React from 'react';
import PropTypes from 'prop-types';
import Typography from 'src/components/Typography';

const TextLabel = ({ variant, text, gridProps,label,textLabel, ...restProps } = {}) => (
  <Typography variant={variant} {...restProps} fullWidth>
    {text || label ||textLabel}
  </Typography>
);

TextLabel.defaultProps = {
  variant: 'body1',
};

TextLabel.propTypes = {
  variant: PropTypes.string,
};

export default TextLabel;

import EditableMatrix from './EditableMatrix';
import SimpleMatrix from './SimpleMatrix';

const Matrix = ({
   preview, ...restProps
}) => {
  if(preview) {
    return <SimpleMatrix {...restProps} />
  }
  return <EditableMatrix {...restProps} />
};

export default Matrix;

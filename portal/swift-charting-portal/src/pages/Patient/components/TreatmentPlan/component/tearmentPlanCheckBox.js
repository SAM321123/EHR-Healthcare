import { Checkbox } from '@mui/material'
import React from 'react'
import checkedIcon from 'src/assets/images/checkedIcon.png';
import unCheckedIcon from 'src/assets/images/unCheckedIcon.png';
import palette from 'src/theme/palette';

const TearmentPlanCheckBox = ({sx={}, ...rest}) => {
  return (<Checkbox  icon={<img src={unCheckedIcon} style={{width:18,height:18}} alt="Unchecked" />}
    checkedIcon={<img src={checkedIcon} style={{width:18,height:18}} alt="Checked" />}  {...rest} sx={{ ...sx,padding:'10px !important'}}/>
  )
}

export default TearmentPlanCheckBox
import React from 'react'
import palette from 'src/theme/palette'
import Typography from '../Typography'
import { Tooltip } from '@mui/material'

const TableTextRendrer = ({children,style={}}) => (
    <Tooltip  title={children} placement='bottom-start' ><Typography style={{
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      fontSize:12,
      color:palette.text.offWhite,
      lineHeight:'20px',
      fontWeight:400,
      fontFamily:'Poppins',
      ...style
    }}>{children}</Typography> </Tooltip>
  )

export default TableTextRendrer
import { Box } from '@mui/material'
import React from 'react'
import Esignature from 'src/components/E-Signature'

function ConsentSignature(props) {
  return (
    <Box sx={{display:'flex',justifyContent:'center',alignItems:'center'}}><Esignature {...props}/></Box>
  )
}

export default ConsentSignature
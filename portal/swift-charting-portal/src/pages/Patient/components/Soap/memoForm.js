import { isEqual } from 'lodash'
import React from 'react'
import CustomForm from 'src/components/form'

const MemoForm = ({form,defaultSubmissionValue,formGropus}) => {
  return (
    <CustomForm form={form} formGroups={formGropus} defaultValue={defaultSubmissionValue} />
  )
}

export default React.memo(MemoForm,(prev,next)=>{
    return isEqual(prev.defaultSubmissionValue,next.defaultSubmissionValue) && isEqual(prev.formGropus,next.formGropus)
   })
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import Accordion from 'src/components/Accordion'
import Box from 'src/components/Box'
import BuilderPreview from 'src/pages/FormBuilder/NewForm/BuilderPreview'
import palette from 'src/theme/palette'

const cardStyle={boxShadow:'none'};
const cardContentStyle={padding:0};
const RenderDynamicForms = ({formData}={}) => {
    const [questions,setQuestions] = useState([]);
    const [response,setResponse] = useState([]);
    const [expandedCard, setExpandedCard] = useState(0);
  
    const form = useForm();
    const handleChange = (panel) => (event, newExpanded) => {
      setExpandedCard(newExpanded ? panel : false);
    };
    useEffect(()=>{
setQuestions(JSON.parse(formData?.formData?.questions || '[]'));
setResponse(JSON.parse(formData?.responses || '[]'))
    },[formData])
  return (
    <Accordion
      defaultExpanded
      expanded={expandedCard}
      onChange={handleChange()}
      style={{backgroundColor: palette.background.babyBlue,width:'100%'}}
      textLabels={[
        {
          type: 'text',
          label: formData?.formData?.name,
          style:{fontSize:'16px',fontWeight:600}
        },
      ]}
    >
          <Box>
            <BuilderPreview
              form={form}
              formGroups={questions}
              defaultValue={response}
              cardStyle={cardStyle}
              cardContentStyle={cardContentStyle}
              disabled
            />
          </Box>
        </Accordion>
  )
}

export default RenderDynamicForms
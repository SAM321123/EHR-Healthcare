import React, { useState } from 'react';
import Accordion from 'src/components/Accordion';
import FormData from './formData';
import palette from 'src/theme/palette';

const ViewForm = ({ form }) => {
  const [expandedCard, setExpandedCard] = useState(0);

  const handleChange = (panel) => (event, newExpanded) => {
    setExpandedCard(newExpanded ? panel : false);
  };

  return (
    <Accordion
      defaultExpanded
      expanded={expandedCard}
      onChange={handleChange()}
      style={{backgroundColor: palette.background.babyBlue,}}
      textLabels={[
        {
          type: 'text',
          label: form?.title,
          style:{fontSize:'16px',fontWeight:600}
        },
      ]}
    >
      <div>
        <div style={{ marginBottom: 30,display:'table',tableLayout:'fixed',width:'100%' }}>
          <FormData data={form} />
        </div>
      </div>
    </Accordion>
  );
};

export default React.memo(ViewForm);

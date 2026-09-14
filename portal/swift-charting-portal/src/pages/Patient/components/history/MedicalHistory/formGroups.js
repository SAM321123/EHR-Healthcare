import Typography from 'src/components/Typography';
const { requiredField } = require("src/lib/constants");

const MedicalHistoryFormGroups = [
   {
    component:()=><div><Typography style={{textAlign:"center"}}>Are you under a physician’s care now</Typography></div>,
    colSpan:0.4
   },
   {
    inputType: 'radio',
    name: 'underPhysician',
    required: requiredField,
    options:[{label:'Yes',value:1},{label:'No',value:0}],
    colSpan: 0.23,
  },
  {
    inputType: 'text',
    placeholder:'If Yes',
    name: 'underPhysicianComment',
    colSpan: 0.37,
  },
  {
    component:()=><div><Typography  style={{textAlign:"center"}}>Have you under a physician’s care now?</Typography></div>,
    colSpan:0.4
   },
   {
    inputType: 'radio',
    name: 'everUnderPhysician',
    required: requiredField,
    options:[{label:'Yes',value:1},{label:'No',value:0}],
    colSpan: 0.23,
  },
  {
    inputType: 'text',
    placeholder:'If Yes',
    name: 'everUnderPhysicianComment',
    colSpan: 0.37,
  },
  {
    component:()=><div style={{display:"flex", height:"100%",alignItems:"center"}}><Typography style={{ dispaly:"flex",textAlign:"start"}}>Have you ever had a serious head or neck injury?</Typography></div>,
    colSpan:0.4
   },
   {
    inputType: 'radio',
    name: 'injury',
    required: requiredField,
    options:[{label:'Yes',value:1},{label:'No',value:0}],
    colSpan: 0.23,
  },
  {
    inputType: 'text',
    placeholder:'If Yes',
    name: 'injuryComment',
    colSpan: 0.37,
  },
  {
    component:()=><div style={{display:"flex", height:"100%",textAlign:"center"}}>
      <Typography style={{ dispaly:"flex",textAlign:"start"}}>Are you taking any medications, pills or drugs?</Typography></div>,
    colSpan:0.4
   },
   {
    inputType: 'radio',
    name: 'takingDrugs',
    required: requiredField,
    options:[{label:'Yes',value:1},{label:'No',value:0}],
    colSpan: 0.23,
  },
  {
    inputType: 'text',
    placeholder:'If Yes',
    name: 'takingDrugsComment',
    colSpan: 0.37,
  },
  {
    component:()=><div style={{display:"flex", height:"100%",textAlign:"center"}}>
      <Typography style={{ dispaly:"flex",textAlign:"start"}}>Do you take or have you taken Phen-Fen or Redux?</Typography></div>,
    colSpan:0.4
   },
   {
    inputType: 'radio',
    name: 'takenRedux',
    required: requiredField,
    options:[{label:'Yes',value:1},{label:'No',value:0}],
    colSpan: 0.23,
  },
  {
    inputType: 'text',
    placeholder:'If Yes',
    name: 'takenReduxComment',
    colSpan: 0.37,
  },
  {
    component:()=><div style={{display:"flex", height:"100%",textAlign:"center"}}>
      <Typography style={{ dispaly:"flex",textAlign:"start"}}>Have you ever taken Fosamax, Boniva, Actonel or any other medication containing bisphosphonates?</Typography></div>,
    colSpan:0.4
   },
   {
    inputType: 'radio',
    name: 'takenFosamax',
    required: requiredField,
    options:[{label:'Yes',value:1},{label:'No',value:0}],
    colSpan: 0.23,
  },
  {
    inputType: 'text',
    placeholder:'If Yes',
    name: 'takenFosamaxComment',
    colSpan: 0.37,
  },
  {
    component:()=><div style={{display:"flex", height:"100%",textAlign:"center"}}>
      <Typography style={{ dispaly:"flex",textAlign:"start"}}>Are you on a special diet?</Typography></div>,
    colSpan:0.4
   },
   {
    inputType: 'radio',
    name: 'onDiet',
    required: requiredField,
    options:[{label:'Yes',value:1},{label:'No',value:0}],
    colSpan: 0.23,
  },
  {
  
    inputType: 'text',
    placeholder:'If Yes',
    name: 'onDietComment',
    colSpan: 0.37,
  },
  {
    component:()=><div style={{display:"flex", height:"100%",textAlign:"center"}}><Typography style={{ dispaly:"flex",textAlign:"start"}}>Do you use tobacco?</Typography></div>,
    colSpan:0.4
   },
   {
    inputType: 'radio',
    name: 'useTobacco',
    required: requiredField,
    options:[{label:'Yes',value:1},{label:'No',value:0}],
    colSpan: 0.23,
  },
  {
    inputType: 'text',
    placeholder:'If Yes',
    name: 'useTobaccoComment',
    colSpan: 0.37,
  },
  {
    component:()=><div style={{display:"flex", height:"100%",textAlign:"center"}}>
      <Typography style={{ dispaly:"flex",textAlign:"start"}}>Do you use controlled substances?</Typography></div>,
    colSpan:0.4
   },
   {
    inputType: 'radio',
    name: 'useSubstances',
    required: requiredField,
    options:[{label:'Yes',value:1},{label:'No',value:0}],
    colSpan: 0.23,
  },
  {
    inputType: 'text',
    placeholder:'If Yes',
    name: 'useSubstancesComment',
    colSpan: 0.37,
  },

  {
    component:()=><div style={{textAlign:"center",display:"flex",height:"100%"}}><Typography style={{ dispaly:"flex",textAlign:"start"}}>Women: Are you...</Typography></div>,
    colSpan:0.4
   },
   {
    inputType: 'radio',
    name: 'condition',
    required: requiredField,
    options:[{label:'Pregnant/Trying to get pregnant',value:"Pregnant/Trying to get pregnant"},{label:'Nursing ?',value:"Nursing ?"},{label:'Taking oral contraceptives?',value:"Taking oral contraceptives?"}],
    colSpan: 0.6,
  },
]

export default MedicalHistoryFormGroups;
import { alpha } from '@mui/material/styles';

// ----------------------------------------------------------------------

// SETUP COLORS
const GREY = {
  0: '#FFFFFF',
  100: '#F9FAFB',
  200: '#F4F6F8',
  300: '#DFE3E8',
  400: '#C4CDD5',
  500: '#919EAB',
  600: '#666666',
  700: '#454F5B',
  800: '#333333',
  900: '#161C24',
  1000: '#84818A',
};

const PRIMARY = {
  lighter: '#D1E9FC',
  light: '#76B0F1',
  main: '#337AB7',
  dark: '#029cde',
  darker: '#061B64',
  contrastText: '#fff',
};

const SECONDARY = {
  lighter: '#D6E4FF',
  light: '#84A9FF',
  main: '#3366FF',
  dark: '#1939B7',
  darker: '#091A7A',
  contrastText: '#fff',
};

const INFO = {
  lighter: '#D0F2FF',
  light: '#74CAFF',
  main: '#1890FF',
  dark: '#0C53B7',
  darker: '#04297A',
  contrastText: '#fff',
  paleRed: '#FFCACA',
  dimGray: '#636363',
};

const SUCCESS = {
  lighter: '#E9FCD4',
  light: '#AAF27F',
  main: '#54D62C',
  dark: '#229A16',
  darker: '#08660D',
  contrastText: GREY[800],
};

const WARNING = {
  lighter: '#FFF7CD',
  light: '#FFE16A',
  main: '#FFC107',
  dark: '#B78103',
  darker: '#7A4F01',
  contrastText: GREY[800],
};

const ERROR = {
  lighter: '#FFE7D9',
  light: '#FFA48D',
  main: '#FF4842',
  dark: '#B72136',
  darker: '#7A0C2E',
  contrastText: '#fff',
};

const palette = {
  common: { black: '#000', white: '#fff', icon: '#636363',green:'#4CD28D' },
  primary: PRIMARY,
  secondary: SECONDARY,
  info: INFO,
  success: SUCCESS,
  warning: WARNING,
  error: ERROR,
  grey: GREY,
  divider: alpha(GREY[500], 0.24),
  text: {
    primary: GREY[800],
    secondary: GREY[600],
    disabled: GREY[500],
    dull:'#8D8D8D',
    dark:'#000',
    offWhite:'#777777',
    offGray:'#999999',
    radio:'#C5C7CD',
  },
  background: {
    paper: '#fff',
    default: GREY[100],
    neutral: GREY[200],
    offWhite: '#F6F6F6',
    accentBlue: '#EAF0F7',
    accentGreen:'#F9FCFF',
    lightRed: '#FF7A7A',
    appleGreen: '#34B239',
    pizazz: '#FF9500',
    pomegranate: '#EF3030',
    mediumPurple: '#9F47E3',
    main:'#337AB7',
    coco:'#E8E8E8',
    offGreen:'#E6F6FE',
    offGreenTwo:'#EFF8FF',
    babyBlue:'#E3F5FF',
    babyGreen:'#EEFAFF',
    tableGray:'#F2F5FA',
    litegreen:' #4CD28D',
    maron: '#B7334B',
    blue: '#337AB7',
    skyblue:"#1CB5BD",
  lightgrey: '#999999',
  offBlue:'#F8F9FC',
  },
  border:{
    main:'#E8E8E8',
    secondary:'#999999'
  },
  action: {
    active: GREY[600],
    hover: alpha(GREY[500], 0.08),
    selected: alpha(GREY[500], 0.16),
    disabled: alpha(GREY[500], 0.8),
    disabledBackground: alpha(GREY[500], 0.24),
    focus: alpha(GREY[500], 0.24),
    hoverOpacity: 0.08,
    disabledOpacity: 0.48,
  },
  pageHeader: {
    titleColor: '#18395E',
  },
  appointmentStatus:{
    Missed: '#9b9c9a',
    Confirmed: '#34B239',
    'Pending Confirmation': '#ffc0cb',
    Cancelled: '#0000ff',
    'Check In': '#FF9500',
    Completed: '#808080',
    'Ready For Practitioner': '#808000',
    'Waiting Room':'#800080' 
  },
  bmiCategory: {
    Underweight: '#FF9500',
    Normal: '#34B239',
    Overweight: '#ff0000',
    Obesity: '#8c0404',
  },
};

export default palette;

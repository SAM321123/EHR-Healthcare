
export const getAntdItem = (
  label,
  key,
  icon,
  children,
  type
) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return {
    key,
    icon,
    children,
    label,
    type
  };
};

export const getAntdDropdownMenu = (
  items,
  onClick= () => {},
  clzName,
) => {
  return {
    items,
    onClick,
    className: clzName ?? 'vc-dropdown-menu'
  };
};
export const isImageFile = (fileName) => {
  const [ext] = fileName.split('.').reverse();
  return ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext);
};
export const isExcelFile = (fileName) => {
  const [ext] = fileName.split('.').reverse();
  return ['xls', 'xlsx'].includes(ext);
};
export const isWordFile = (fileName) => {
  const [ext] = fileName.split('.').reverse();
  return ['doc', 'docx'].includes(ext);
};
export const isPPTFile = (fileName) => {
  const [ext] = fileName.split('.').reverse();
  return ['ppt', 'pptxx'].includes(ext);
};
export const isPdfFile = (fileName) => {
  const [ext] = fileName.split('.').reverse();
  return ['pdf'].includes(ext);
};
export const isZipFile = (fileName) => {
  const [ext] = fileName.split('.').reverse();
  return ['zip', 'gz', 'rar'].includes(ext);
};

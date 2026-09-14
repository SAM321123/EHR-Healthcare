module.exports = () => {
  const smallChars = 'abcdefghijklmnopqrstuvwxyz';
  const capChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const nums = '0123456789';
  const specialChars = '@$!%*?&';
  let password = '';
  for (let i = 0; i < 2; i++) {
    password += smallChars.charAt(Math.floor(Math.random() * smallChars.length));
    password += capChars.charAt(Math.floor(Math.random() * capChars.length));
    password += nums.charAt(Math.floor(Math.random() * nums.length));
    password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
  }
  return 'Hrhk@1234';
};

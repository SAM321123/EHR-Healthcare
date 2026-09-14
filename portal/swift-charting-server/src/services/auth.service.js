const cookie = require('cookie');
const  tokenService  = require('./token.service');
const { errorMessages } = require('../config/error');
const { tokenTypes } = require('../config/tokens');
const  dbService  = require('./db.service');
const  userService  = require('./user.service');
const { getModels } = require('../utils/connection');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');


const setTokenOnResponseHeader = async (tokens, res) => {
  res.setHeader('Set-Cookie', [
    cookie.serialize('access_token', tokens?.access?.token, {
      httpOnly: true,
      sameSite: 'none',
      maxAge: tokens?.access?.expires,
      path: '/',
      secure: true,
    }),
    cookie.serialize('refresh_token', tokens?.refresh?.token, {
      httpOnly: true,
      sameSite: 'none',
      maxAge: tokens?.refresh?.expires,
      path: '/',
      secure: true,
    }),
  ]);
};

const isValidToken = async (resetPasswordToken,{model}, isGeneratePassword) => {
  try {
    const tokenType = isGeneratePassword ? tokenTypes.GENERATE_PASSWORD : tokenTypes.RESET_PASSWORD
    const resetPasswordTokenDoc = await tokenService.verifyToken({token:resetPasswordToken, type:tokenType},{model});
    if(resetPasswordTokenDoc){
      return errorMessages.VALID_TOKEN;
    }
  } catch (error) {
    return errorMessages.INVALID_TOKEN;
  }
}

const loginUserWithEmailAndPassword =async(email,password,{tenantId})=>{
  const db = getModels(tenantId);
  const user = await dbService.getOne({model:db.User,filter:{where:{email,isDeleted:false}}});
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages.INCORRECT_LOGIN);
  }
  if(!user.isActive){
    throw new ApiError(httpStatus.UNAUTHORIZED, errorMessages.USER_INACTIVE);
  }
  return user;

}

const changePassword = async ({ password, newPassword, user,tenantId }) => {
  const { id: userId, email } = user;
  await loginUserWithEmailAndPassword(email, password,{tenantId});
  await userService.updateUserById(userId, { password: newPassword },{tenantId});

};


module.exports = {
  setTokenOnResponseHeader,
  isValidToken,
  loginUserWithEmailAndPassword,
  changePassword,
};

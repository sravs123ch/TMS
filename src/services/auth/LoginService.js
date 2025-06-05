import Api from '../Api';

export const login = async (username, password, ipAddress, latitude, longitude) => {
  const response = await Api.post('authentication/login', {
    username,
    password,
    ipAddress,
    latitude,
    longitude
  });
  return response.data;
};

export const resetPassword = async (loginId) => {
  const response = await Api.post('password/reset', { loginId });
  return response.data;
};

export const forgotPassword = async (loginId) => {
  const response = await Api.post('password/forgot', { loginId });
  return response.data;
}; 
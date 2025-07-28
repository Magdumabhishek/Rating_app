export const getToken = () => localStorage.getItem('token');
export const getRole = () => {
  return localStorage.getItem('role');
};


export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
};

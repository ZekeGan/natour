import axios from 'axios';
import { showAlert } from './alert';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:9999/api/v1/user/login',
      data: {
        email,
        password,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'login successfully');
      location.assign('/');
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:9999/api/v1/user/logout',
    });

    if (res.data.status === 'success') {
      showAlert('success', 'logout successfully');
      location.reload(true);
    }
  } catch (err) {
    console.warn(err.response.data.message);
  }
};

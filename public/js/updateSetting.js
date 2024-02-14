import axios from 'axios';
import { showAlert } from './alert';

export const updateAccount = async (data) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: 'http://127.0.0.1:9999/api/v1/user/updateMe',
      data,
    });

    if (res.data.status === 'success') {
      showAlert('success', 'account update successfully');
      location.reload(true);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const updatePassword = async (
  currentPassword,
  newPassword,
  passwordConfirm
) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: 'http://127.0.0.1:9999/api/v1/user/updatePassword',
      data: {
        password: currentPassword,
        newPassword,
        newPasswordConfirm: passwordConfirm,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'password update successfully');
      location.reload(true);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

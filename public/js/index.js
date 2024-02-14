import { login, logout } from './auth';
import { displayMap } from './mapbox';
import { updateAccount, updatePassword } from './updateSetting';

// login
const loginForm = document.querySelector('.form--login');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;
    login(email, password);
  });
}

// logout
const logoutAddress = document.querySelector('.nav__el--logut');
if (logoutAddress) {
  logoutAddress.addEventListener('click', () => {
    logout();
  });
}

// account
const accountForm = document.querySelector('.form--updateAccount');
if (accountForm) {
  accountForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('email', document.querySelector('#email').value);
    form.append('name', document.querySelector('#name').value);
    form.append('photo', document.querySelector('#photo').files[0]);

    updateAccount(form);
  });
}

// password
const passwordForm = document.querySelector('.form--updatePassword');
if (passwordForm) {
  passwordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const currentPassword = document.querySelector('#password-current').value;
    const newPassword = document.querySelector('#password').value;
    const passwordConfirm = document.querySelector('#password-confirm').value;
    updatePassword(currentPassword, newPassword, passwordConfirm);
  });
}

// mapbox
const mapbox = document.querySelector('#map');
if (mapbox) {
  const locations = JSON.parse(mapbox.dataset.location);
  displayMap(locations);
}

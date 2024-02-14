const clearAlert = () => {
  const alert = document.querySelector('.alert');
  if (alert) {
    alert.parentElement.removeChild(alert);
  }
};

export const showAlert = (type, msg) => {
  clearAlert();

  const el = `<div class='alert alert--${type}'>${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', el);

  window.setTimeout(clearAlert, 5000);
};

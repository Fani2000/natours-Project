export const hideAlerts = () => {
  const el = document.querySelector(".alert");
  if (el) {
    el.parentElement.removeChild(el);
  }
};

export const showAlert = (type, msg) => {
  console.log(type, msg);
  hideAlerts();
  const markup = `<div class='alert alert--${type}'>${msg}</div>`;
  document.querySelector("body").insertAdjacentHTML("afterbegin", markup);
  setTimeout(() => {
    hideAlerts();
  }, 5000);
};

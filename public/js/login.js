import { showAlert } from "./alerts.js";

const login = async (email, password) => {
  try {
    const res = await axios({
      method: "POST",
      url: "/api/v1/users/login",
      data: {
        email,
        password,
      },
    });

    if (res.data.status === "success") {
      // alert("Logged in successfully!");
      showAlert("success", "Logged in successfully!");
      setTimeout(() => {
        location.assign("/");
      }, 1500);
    }
  } catch (error) {
    console.log(error);
    // alert(err.response.data.message)
    showAlert(
      "error",
      "Failed to log in, please enter the correct credentials!"
    );
  }
};

const logout = async () => {
  try {
    const res = await axios({
      method: "GET",
      url: "/api/v1/users/logout",
    });

    console.log(res)
    if (res.data.status === "success") location.assign('/');

  } catch (error) {
    showAlert("error", "Error logging out!, Please try again later.");
  }
};
export default document.addEventListener("DOMContentLoaded", (e) => {
  const logoutBtn = document.querySelector(".nav__el--logout");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }

  document.querySelector(".form--login")?.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    login(email, password);
  });
});


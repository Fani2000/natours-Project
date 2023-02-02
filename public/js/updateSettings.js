import { showAlert } from "./alerts";

const updateSettings = async (name, email) => {
    console.log(name,email)
  try {
    const res = await axios({
      method: "PATCH",
      url: "http://localhost:3000/api/v1/users/updateMe",
      data: {
        name,
        email,
      },
    });

    console.log(res.data)

    if (res.data.status === "success") {
        showAlert('success', 'Changed the user details!')
        location.assign('/me')
    }

  } catch (error) {
    console.log(error.message);
    showAlert("error", error.message);
  }
};

export default document.addEventListener("DOMContentLoaded", (e) => {
  document.querySelector(".form-user-data")?.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const username = document.getElementById("name").value;

    updateSettings(username, email);
  });
});

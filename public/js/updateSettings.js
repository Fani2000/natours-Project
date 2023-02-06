import { showAlert } from "./alerts";

const updateSettings = async (data) => {
  try {
    const res = await axios({
      method: "PATCH",
      url: "/api/v1/users/updateMe",
      data
    });

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

    const form = new FormData()
    form.append('name', document.getElementById("name").value)
    form.append('email', document.getElementById("email").value)
    form.append('photo', document.getElementById("photo").files[0])

    updateSettings(form);
  });
});

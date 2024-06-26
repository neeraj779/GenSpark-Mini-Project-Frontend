// Function to check JWT token in local storage
function checkAuth() {
  const token = localStorage.getItem("token");
  const logoutButton = document.getElementById("logoutButton");

  if (token) {
    logoutButton.style.display = "block";
  } else {
    window.location.href = ".././auth/login.html";
  }
}


function handleLogout() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  window.location.href = "/";
}

window.onload = checkAuth;


const logoutButton = document.getElementById("logoutButton");
if (logoutButton) {
  logoutButton.addEventListener("click", function () {
    handleLogout();
  });
}

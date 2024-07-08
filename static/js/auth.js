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

function manageNavLinks() {
  const userRole = localStorage.getItem("role");
  if (userRole === "Student") {
    document.querySelector('a[href="Teachers.html"]').style.display = "none";
    document.querySelector('a[href="Students.html"]').style.display = "none";
    document.querySelector('a[href="Enrollments.html"]').style.display = "none";
  }
  if (userRole === "Admin") {
    document.querySelector('a[href="AssignmentSubmisson.html"]').style.display =
      "none";
  }

  if (userRole === "Teacher") {
    document.querySelector('a[href="Teachers.html"]').style.display = "none";
    document.querySelector('a[href="AssignmentSubmisson.html"]').style.display =
      "none";
  }
}

window.onload = function () {
  checkAuth();
  manageNavLinks();
};

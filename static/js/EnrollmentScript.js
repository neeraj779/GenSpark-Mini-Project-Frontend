const token = localStorage.getItem("token");
const apiUrl = "http://localhost:5172/api/v1/Enrollment";

async function fetchApi(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    switch (response.status) {
      case 400:
        displayErrorMessage(
          "Bad request: The server could not understand the request."
        );
        return -1;
      case 401:
        displayErrorMessage(
          "Unauthorized: Authentication is required and has failed or has not yet been provided."
        );
        return -1;
      case 404:
        displayErrorMessage(
          "Not found: It seems like there is no data available."
        );
        return -1;
      default:
        displayErrorMessage(
          `HTTP error ${response.status}: ${response.statusText}`
        );
        return -1;
    }
  }
  return response.json();
}

async function loadEnrollments() {
  try {
    const data = await fetchApi(`${apiUrl}/GetAllEnrollments`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (data !== -1) {
      const EnrollmentsList = document.getElementById("enrollment-list");
      EnrollmentsList.innerHTML = "";
      data.forEach(createEnrollmentCard);
    }
  } catch (error) {
    console.error("Error fetching Enrollments:", error);
    displayErrorMessage("Error fetching Enrollments. Please try again later.");
  }
}

function displayErrorMessage(message) {
  const errorMessage = document.createElement("div");
  errorMessage.className = "alert alert-info";
  errorMessage.textContent = message;
  document.querySelector(".container").appendChild(errorMessage);
}

function createEnrollmentCard(enrollment) {
  const EnrollmentCard = document.createElement("div");
  EnrollmentCard.className = "card";
  EnrollmentCard.innerHTML = `
    <div class="header">
        <img
        src=".././assets/img/enrollment.png"
        alt="Enrollment"
        />
    </div>
    <div class="info">
        <p class="title">Enrollment Details</p>
        <span class="card-text">Enrollment Id: ${
          enrollment.enrollmentId
        }</span><br />
        <span class="card-text">Student Id: ${enrollment.studentId}</span><br />
        <span class="card-text">Course Code: ${
          enrollment.courseCode
        }</span><br />
        <span class="card-text">Enrollment Date: ${
          enrollment.enrollmentDate.split("T")[0]
        }</span><br />
    </div>
    <div class="footer">
        <button type="button" class="action" onclick="getStudentDetails(${
          enrollment.studentId
        })">Get Student Details</button>
        <button class="btn">
        <svg viewBox="0 0 15 17.5" height="17.5" width="15" xmlns="http://www.w3.org/2000/svg" class="icon">
        <path transform="translate(-2.5 -1.25)" d="M15,18.75H5A1.251,1.251,0,0,1,3.75,17.5V5H2.5V3.75h15V5H16.25V17.5A1.251,1.251,0,0,1,15,18.75ZM5,5V17.5H15V5Zm7.5,10H11.25V7.5H12.5V15ZM8.75,15H7.5V7.5H8.75V15ZM12.5,2.5h-5V1.25h5V2.5Z" id="Fill"></path>
        </svg>
        </button>
    </div>`;
  document.getElementById("enrollment-list").appendChild(EnrollmentCard);
}

async function getStudentDetails(studentId) {
  try {
    let apiUrl = "http://localhost:5172/api/v1/Student";
    const data = await fetchApi(
      `${apiUrl}/GetStudentById?studentId=${studentId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (data !== -1) {
      console.log(data);
    }
  } catch (error) {
    console.error("Error fetching Student Details:", error);
    displayErrorMessage(
      "Error fetching Student Details. Please try again later."
    );
  }
}

loadEnrollments();

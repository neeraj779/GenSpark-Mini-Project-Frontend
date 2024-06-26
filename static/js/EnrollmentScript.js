const token = localStorage.getItem("token");
const apiUrl = "http://localhost:5172/api/v1/Enrollment";

async function fetchApi(url, options = {}, returnType = "json") {
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
      case 409:
        displayErrorMessage("conflict: It seems like the data already exists.");
        return -1;
      case 500:
        displayErrorMessage(
          "Internal Server Error: The server has encountered a situation it doesn't know how to handle."
        );
        return -1;
      default:
        displayErrorMessage(
          `HTTP error ${response.status}: ${response.statusText}`
        );
        return -1;
    }
  }
  if (returnType === "text") return response.text();
  return response.json();
}

async function fetchStudents() {
  const students = await fetchApi(
    "http://localhost:5172/api/v1/Student/GetAllStudents",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return students !== -1 ? students : [];
}

async function fetchCourses() {
  const courses = await fetchApi(
    "http://localhost:5172/api/v1/Course/GetAllCourses",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return courses !== -1 ? courses : [];
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
  Swal.fire({
    icon: "error",
    title: "Oops... we ran into some trouble 🥲",
    text: message,
  });
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
        <button class="btn-unenroll" onclick="unenrollStudentHandler(${
          enrollment.studentId
        }, '${enrollment.courseCode}')">
        <svg viewBox="0 0 15 17.5" height="17.5" width="15" xmlns="http://www.w3.org/2000/svg" class="icon">
        <path transform="translate(-2.5 -1.25)" d="M15,18.75H5A1.251,1.251,0,0,1,3.75,17.5V5H2.5V3.75h15V5H16.25V17.5A1.251,1.251,0,0,1,15,18.75ZM5,5V17.5H15V5Zm7.5,10H11.25V7.5H12.5V15ZM8.75,15H7.5V7.5H8.75V15ZM12.5,2.5h-5V1.25h5V2.5Z" id="Fill"></path>
        </svg>
        </button>
    </div>`;
  document.getElementById("enrollment-list").appendChild(EnrollmentCard);
}

async function createEnrollmentForm() {
  const students = await fetchStudents();
  const courses = await fetchCourses();

  const studentOptions = students
    .map(
      (student) =>
        `<option value="${student.studentId}">${student.fullName} (ID: ${student.studentId})</option>`
    )
    .join("");

  const courseOptions = courses
    .map(
      (course) =>
        `<option value="${course.courseCode}">${course.courseName} (Code: ${course.courseCode})</option>`
    )
    .join("");

  return `<form id="add-enrollment-form">
    <div class="form-group">
      <label for="studentId" class="form-label">Student:</label>
      <select class="form-select" id="studentId" name="studentId" onblur="validateSelect("studentId")">
      <option value="None" selected disabled>Please select a student</option>
        ${studentOptions}
      </select>
      <div class="error" id="studentIdError"></div>
    </div>
    <div class="form-group">
      <label for="courseCode" class="form-label mt-3">Course:</label>
      <select class="form-select" id="courseCode" name="courseCode" onblur="validateSelect("courseCode")">
      <option value="None" selected disabled>Please select a course</option>
        ${courseOptions}
      </select>
      <div class="error" id="courseCodeError"></div>
    </div>
    </form>`;
}

async function openAddEnrollmentModal() {
  Swal.fire({
    title: "Add New Enrollment",
    html: await createEnrollmentForm(),
    focusConfirm: false,
    showCancelButton: true,
    allowOutsideClick: false,
    showCloseButton: true,
    confirmButtonText: "Add Enrollment",
    preConfirm: () => {
      const popup = Swal.getPopup();
      const studentId = popup.querySelector("#studentId").value;
      const courseCode = popup.querySelector("#courseCode").value;

      if (validateForm("enrollment") === false) {
        Swal.showValidationMessage(
          `Please fix the above errors first before submitting.`
        );
      }

      return {
        studentId,
        courseCode,
      };
    },
  }).then((result) => {
    if (result.isConfirmed) {
      const newEnrollment = result.value;
      addNewEnrollment(newEnrollment);
    }
  });
}

async function addNewEnrollment(enrollment) {
  try {
    let response = await fetchApi(
      `${apiUrl}/EnrollStudentInCourse`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: enrollment.studentId,
          courseCode: enrollment.courseCode,
        }),
      },
      "text"
    );
    if (response !== -1) {
      console.log(response);
      Swal.fire("Success", "Enrollment added successfully.", "success");
      loadEnrollments();
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Oops... we ran into some trouble 🥲",
      text: "It seems we couldn't add the enrollment. Please try again later. it might be a network issue.",
    });
  }
}

async function unenrollStudentHandler(studentId, courseCode) {
  Swal.fire({
    title: "Are you sure?",
    text: "Do you want to unenroll this student from the course? This action cannot be undone.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes Unenroll",
    cancelButtonText: "Cancel",
    background: "#f7f9fb",
  }).then((result) => {
    if (result.isConfirmed) {
      unenrollStudent(studentId, courseCode);
    } else if (result.isDismissed) {
      Swal.fire({
        title: "Cancelled",
        text: "Student unenrollment has been cancelled.",
        icon: "error",
        confirmButtonText: "OK",
        background: "#f7f9fb",
      });
    }
  });
}

async function unenrollStudent(studentId, courseCode) {
  try {
    const data = await fetchApi(
      `${apiUrl}/UnenrollStudentFromCourse`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: studentId,
          courseCode: courseCode,
        }),
      },
      "text"
    );

    if (data !== -1) {
      Swal.fire({
        title: "Success!",
        text: "Student unenrolled successfully.",
        icon: "success",
        confirmButtonText: "OK",
        background: "#f7f9fb",
      }).then(() => {
        loadEnrollments();
      });
    }
  } catch (error) {
    console.error("Error unenrolling student:", error);
    displayErrorMessage("Error unenrolling student. Please try again later.");
  }
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
      showStudentInfo(data);
    }
  } catch (error) {
    console.error("Error fetching Student Details:", error);
    displayErrorMessage(
      "Error fetching Student Details. Please try again later."
    );
  }
}

function showStudentInfo(student) {
  Swal.fire({
    title: "Student Information",
    html: `
        <div class="student-info">
          <p><strong>Student ID:</strong> ${student.studentId}</p>
          <p><strong>Full Name:</strong> ${student.fullName}</p>
          <p><strong>Roll No:</strong> ${student.rollNo}</p>
          <p><strong>Department:</strong> ${student.department}</p>
          <p><strong>Gender:</strong> ${student.gender}</p>
          <p><strong>Date of Birth:</strong> ${new Date(
            student.dateOfBirth
          ).toLocaleDateString()}</p>
          <p><strong>Email:</strong> ${student.email}</p>
          <p><strong>Phone:</strong> ${student.phone}</p>
          <p><strong>Status:</strong> ${student.status}</p>
        </div>
      `,
    icon: "info",
    confirmButtonText: "OK",
    background: "#f7f9fb",
  });
}

loadEnrollments();

const token = localStorage.getItem("token");
const apiUrl = "http://localhost:5172/api/v1/Student";

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

async function loadStudents() {
  try {
    const data = await fetchApi(`${apiUrl}/GetAllStudents`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (data !== -1) {
      const StudentsList = document.getElementById("students-list");
      StudentsList.innerHTML = "";
      data.forEach(createStudentCard);
    }
  } catch (error) {
    console.error("Error fetching Students:", error);
    displayErrorMessage("Error fetching Students. Please try again later.");
  }
}

function displayErrorMessage(message) {
  const errorMessage = document.createElement("div");
  errorMessage.className = "alert alert-info";
  errorMessage.textContent = message;
  document.querySelector(".container").appendChild(errorMessage);
}

function createStudentCard(student) {
  let studentImage = ".././assets/img/MStudent.avif";
  if (student.gender === "Female")
    studentImage = ".././assets/img/FStudent.avif";
  const studentCard = document.createElement("div");
  studentCard.className = "col-md-4 mb-4";
  studentCard.innerHTML = `<div class="card">
      <div class="card-body">
        <img src="${studentImage}" class="card-img-top" alt="student Image" />
        <div class="card__title text-center">${student.fullName}</div>
        <div class="card__subtitle text-center mb-2">Personal Details</div>
        <span class="card-text">Roll No.: ${student.rollNo}</span><br />
        <span class="card-text">Department.: ${student.department}</span><br />
        <span class="card-text"
          >Date of Birth: ${new Date(
            student.dateOfBirth
          ).toLocaleDateString()}</span
        ><br />
        <span class="card-text">Gender: ${student.gender}</span><br />
        <span class="card-text"
          >Phone: ${student.phone}
          <a
            class="edit-btn"
            onclick="updateStudentPhone(${student.studentId})"
          >
            <i class="fas fa-edit"></i> </a></span
        ><br />
        <span class="card-text"
          >Email: ${student.email}
          <a
            class="edit-btn"
            onclick="updateStudentEmail(${student.studentId})"
          >
            <i class="fas fa-edit"></i> </a></span
        ><br />
        <span class="card-text"
          >Status: ${student.status}
          <a
            class="edit-btn"
            onclick="updateStudentStatus(${student.studentId})"
          >
            <i class="fas fa-edit"></i> </a
        ></span>
          <button
            class="btn btn-danger"
            onclick="deleteStudent(${student.studentId})"
          >
            Delete
          </button>
      </div>
    </div>`;
  document.getElementById("students-list").appendChild(studentCard);
}

function updateStudentEmail(id) {
  updateEntityField("Student", id, "Email", loadStudents);
}

function updateStudentPhone(id) {
  updateEntityField("Student", id, "Phone", loadStudents);
}

function updateStudentStatus(id) {
  updateEntityField("Student", id, "Status", loadStudents);
}

function deleteStudent(id) {
  deleteEntity("Student", id, loadStudents);
}

function CreateAddStudentForm() {
  return `<form id="add-student-form">
        <div class="form-group">
          <label for="name">Name</label>
          <input
            type="text"
            class="form-control"
            id="name"
            name="name"
            onblur="validateText('name')"
          />
          <div class="error" id="nameError"></div>
        </div>
        <div class="form-group">
          <label for="rollno">Roll No.</label>
          <input
            type="text"
            class="form-control"
            id="rollno"
            name="rollno"
            onblur="validateText('rollno')"
          />
          <div class="error" id="rollnoError"></div>
        </div>
        <div class="form-group">
          <label for="department">Department</label>
          <input
            type="text"
            class="form-control"
            id="department"
            name="department"
            onblur="validateText('department')"
          />
          <div class="error" id="departmentError"></div>
        </div>
        <div class="form-group">
          <label for="studentGender" class="form-label">Gender</label>
          <select class="form-select" id="gender" onblur="validateSelect("gender")" required>
            <option value="None" selected disabled>Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <div class="error" id="genderError"></div>
        </div>
        <div class="form-group">
          <label for="dob">Date of Birth</label>
          <input
            type="date"
            class="form-control"
            id="dob"
            name="dob"
            onblur="validateDate("dob");"
          />
          <div class="error" id="dobError"></div>
        </div>
        <div class="form-group">
          <label for="phone">Phone</label>
          <input
            type="text"
            class="form-control"
            id="phone"
            name="phone"
            onblur="validatePhone()"
          />
          <div class="error" id="phoneError"></div>
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            class="form-control"
            id="email"
            name="email"
            onblur="validateEmail()"
          />
          <div class="error" id="emailError"></div>
        </div>
        <div class="form-group">
          <label for="status" class="form-label">Status</label>
          <select class="form-select" id="status" onblur="validateSelect("status")" required>
            <option value="None" selected disabled>Select Status</option>
            <option value="Undergraduate">Undergraduate</option>
            <option value="Postgraduate">Postgraduate</option>
            <option value="Alumni">Alumni</option>
            <option value="Graduated">Graduated</option>
            <option value="DroppedOut">DroppedOut</option>
            <option value="Expelled">Expelled</option>
            <option value="Suspended">Suspended</option>
            <option value="Transferred">Transferred</option>
          </select>
          <div class="error" id="statusError"></div>
        </div>
      </form>`;
}

function openAddStudentModal() {
  Swal.fire({
    title: "Add New student",
    html: CreateAddStudentForm(),
    focusConfirm: false,
    showCancelButton: true,
    allowOutsideClick: false,
    showCloseButton: true,
    confirmButtonText: "Add student",
    preConfirm: () => {
      const popup = Swal.getPopup();
      const studentName = popup.querySelector("#name").value;
      const studentRollNo = popup.querySelector("#rollno").value;
      const studentDepartment = popup.querySelector("#department").value;
      const studentGender = popup.querySelector("#gender").value;
      const studentDOB = popup.querySelector("#dob").value;
      const studentPhone = popup.querySelector("#phone").value;
      const studentEmail = popup.querySelector("#email").value;
      const studentStatus = popup.querySelector("#status").value;

      if (validateForm("student") === false) {
        Swal.showValidationMessage(
          `Please fix the above errors first before submitting.`
        );
      }

      return {
        studentName,
        studentRollNo,
        studentDepartment,
        studentGender,
        studentDOB,
        studentPhone,
        studentEmail,
        studentStatus,
      };
    },
  }).then((result) => {
    if (result.isConfirmed) {
      const newstudent = result.value;
      addNewstudent(newstudent);
    }
  });
}

async function addNewstudent(student) {
  try {
    await fetchApi(`${apiUrl}/Registerstudent`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName: student.studentName,
        rollNo: student.studentRollNo,
        department: student.studentDepartment,
        gender: student.studentGender,
        dateOfBirth: student.studentDOB,
        phone: student.studentPhone,
        email: student.studentEmail,
        status: student.studentStatus,
      }),
    });
    Swal.fire("Success", "student added successfully!", "success");
    loadStudents();
  } catch (error) {
    console.error("Error adding student:", error);
    Swal.fire({
      icon: "error",
      title: "Oops... we ran into some trouble 🥲",
      text: "It seems we couldn't add the student record. Please try again later. it might be a network issue.",
    });
  }
}

function searchStudents() {
  const searchInput = document
    .getElementById("search-input")
    .value.toLowerCase();
  const students = document.querySelectorAll("#students-list .card");

  students.forEach((teacher) => {
    const name = teacher
      .querySelector(".card__title")
      .textContent.toLowerCase();
    if (name.includes(searchInput)) {
      teacher.parentElement.style.display = "block";
    } else {
      teacher.parentElement.style.display = "none";
    }
  });
}

loadStudents();

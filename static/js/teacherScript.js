const token = localStorage.getItem("token");
const apiUrl = "http://localhost:5172/api/v1/Teacher";

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

async function loadTeachers() {
  try {
    const data = await fetchApi(`${apiUrl}/GetAllTeachers`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (data !== -1) {
      const teachersList = document.getElementById("teachers-list");
      teachersList.innerHTML = "";
      data.forEach(createTeacherCard);
    }
  } catch (error) {
    console.error("Error fetching teachers:", error);
    displayErrorMessage("Error fetching teachers. Please try again later.");
  }
}

function displayErrorMessage(message) {
  const errorMessage = document.createElement("div");
  errorMessage.className = "alert alert-info";
  errorMessage.textContent = message;
  document.querySelector(".container").appendChild(errorMessage);
}

function createTeacherCard(teacher) {
  const teacherCard = document.createElement("div");
  teacherCard.className = "col-md-4 mb-4";
  teacherCard.innerHTML = `<div class="card">
      <div class="card-body">
        <img
          src=".././assets/img/teacher.jpg"
          class="card-img-top"
          alt="Teacher Image"
        />
        <div class="card__title text-center">${teacher.fullName}</div>
        <div class="card__subtitle text-center mb-2">Personal Details</div>
        <span class="card-text">Gender: ${teacher.gender}</span><br />
        <span class="card-text"
          >Date of Birth: ${new Date(
            teacher.dateOfBirth
          ).toLocaleDateString()}</span
        ><br />
        <span class="card-text">
          Phone: ${teacher.phone}
          <a
            class="edit-btn"
            onclick="updateTeacherPhone(${teacher.teacherId})"
          >
            <i class="fas fa-edit"></i>
          </a> </span
        ><br />
        <span class="card-text">
          Email: ${teacher.email}
          <a
            class="edit-btn"
            onclick="updateTeacherEmail(${teacher.teacherId})"
          >
            <i class="fas fa-edit"></i>
          </a> </span
        >
        <button
          class="btn btn-danger"
          onclick="deleteTeacher(${teacher.teacherId})"
        >
          Delete
        </button>
      </div>
    </div>`;
  document.getElementById("teachers-list").appendChild(teacherCard);
}

function updateTeacherEmail(id) {
  updateEntityField("Teacher", id, "Email", loadTeachers);
}

function updateTeacherPhone(id) {
  updateEntityField("Teacher", id, "Phone", loadTeachers);
}

function deleteTeacher(id) {
  deleteEntity("Teacher", id, loadTeachers);
}

function CreateAddTeacherForm() {
  return `<form id="add-teacher-form">
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
          <label for="teacherGender" class="form-label">Gender</label>
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
            onblur="validateDOB()"
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
      </form>`;
}

function openAddTeacherModal() {
  Swal.fire({
    title: "Add New Teacher",
    html: CreateAddTeacherForm(),
    focusConfirm: false,
    showCancelButton: true,
    allowOutsideClick: false,
    showCloseButton: true,
    confirmButtonText: "Add Teacher",
    preConfirm: () => {
      const popup = Swal.getPopup();
      const teacherName = popup.querySelector("#name").value;
      const teacherGender = popup.querySelector("#gender").value;
      const teacherDOB = popup.querySelector("#dob").value;
      const teacherPhone = popup.querySelector("#phone").value;
      const teacherEmail = popup.querySelector("#email").value;

      if (validateForm("teacher") === false) {
        Swal.showValidationMessage(
          `Please fix the above errors first before submitting.`
        );
      }

      return {
        teacherName,
        teacherGender,
        teacherDOB,
        teacherPhone,
        teacherEmail,
      };
    },
  }).then((result) => {
    if (result.isConfirmed) {
      const newTeacher = result.value;
      addNewTeacher(newTeacher);
    }
  });
}

async function addNewTeacher(teacher) {
  try {
    await fetchApi(`${apiUrl}/RegisterTeacher`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName: teacher.teacherName,
        gender: teacher.teacherGender,
        dateOfBirth: teacher.teacherDOB,
        phone: teacher.teacherPhone,
        email: teacher.teacherEmail,
      }),
    });
    Swal.fire("Success", "Teacher added successfully!", "success");
    loadTeachers();
  } catch (error) {
    console.error("Error adding teacher:", error);
    Swal.fire({
      icon: "error",
      title: "Oops... we ran into some trouble 🥲",
      text: "It seems we couldn't add the teacher record. Please try again later. it might be a network issue.",
    });
  }
}

loadTeachers();

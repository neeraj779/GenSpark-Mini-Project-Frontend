const token = localStorage.getItem("token");

function loadTeachers() {
  fetch("http://localhost:5172/api/v1/Teacher/GetAllTeachers", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.json();
    })
    .then((data) => {
      const teachersList = document.getElementById("teachers-list");
      teachersList.innerHTML = "";
      data.forEach((teacher) => {
        const teacherCard = document.createElement("div");
        teacherCard.className = "col-md-4 mb-4";
        teacherCard.innerHTML = `
              <div class="card">
                <div class="card-body">
                  <img src=".././assets/img/teacher.jpg" class="card-img-top" alt="Teacher Image" />
                  <p class="card-title text-center">Teacher Details</p>
                  <span class="card-text">Name: ${teacher.fullName}</span><br>
                  <span class="card-text">Gender: ${teacher.gender}</span><br>
                  <span class="card-text">Date of Birth: ${new Date(
                    teacher.dateOfBirth
                  ).toLocaleDateString()}</span>
                  <br>
                  <span class="card-text">
                  Phone: ${teacher.phone}
                  <a class="edit-btn" onclick="updateTeacherPhone(${
                    teacher.teacherId
                  })">
                  <i class="fas fa-edit"></i>
                  </a>
                  </span>
                  <br>
                  <span class="card-text">
                  Email: ${teacher.email} 
                  <a class="edit-btn" onclick="updateTeacherEmail(${
                    teacher.teacherId
                  })">
                <i class="fas fa-edit"></i>
                </a>
                </span>
                <br>
                  <button class="btn btn-danger mt-2" onclick="deleteTeacher(${
                    teacher.teacherId
                  })">Delete</button>
                </div>
              </div>
            `;
        teachersList.appendChild(teacherCard);
      });
    })
    .catch((error) => {
      console.error("Error fetching teachers:", error);
      const errorMessage = document.createElement("div");
      errorMessage.className = "alert alert-danger";
      errorMessage.textContent =
        "Error fetching teachers. Please try again later.";
      document.querySelector(".container").appendChild(errorMessage);
    });
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

function openAddTeacherModal() {
  Swal.fire({
    title: "Add New Teacher",
    html: `
      <form id="add-teacher-form">
        <div class="form-group">
          <label for="name">Name</label>
          <input
            type="text"
            class="form-control"
            id="name"
            name="name"
            onblur="validateName()"
          />
          <div class="error" id="nameError"></div>
        </div>
        <div class="form-group">
          <label for="teacherGender" class="form-label">Gender</label>
          <select class="form-select" id="gender" onblur="validateGender()" required>
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
      </form>
    `,
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

      if (validateForm() === false) {
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

function addNewTeacher(teacher) {
  fetch("http://localhost:5172/api/v1/Teacher/RegisterTeacher", {
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
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.json();
    })
    .then((data) => {
      Swal.fire("Success", "Teacher added successfully!", "success");
      loadTeachers();
    })
    .catch((error) => {
      console.error("Error adding teacher:", error);
      Swal.fire({
        icon: "error",
        title: "Oops... we ran into some trouble 🥲",
        text: "It seems we couldn't add the teacher record. Please try again later. it might be a network issue.",
      });
    });
}

loadTeachers();

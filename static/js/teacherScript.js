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
        <div class="mb-3">
          <label for="teacherName" class="form-label">Full Name</label>
          <input type="text" class="form-control" id="teacherName" required>
        </div>
        <div class="mb-3">
          <label for="teacherGender" class="form-label">Gender</label>
          <select class="form-select" id="teacherGender" required>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div class="mb-3">
          <label for="teacherDOB" class="form-label">Date of Birth</label>
          <input type="date" class="form-control" id="teacherDOB" required>
        </div>
        <div class="mb-3">
          <label for="teacherPhone" class="form-label">Phone</label>
          <input type="text" class="form-control" id="teacherPhone" required>
        </div>
        <div class="mb-3">
          <label for="teacherEmail" class="form-label">Email</label>
          <input type="email" class="form-control" id="teacherEmail" required>
        </div>
      </form>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Submit",
    preConfirm: () => {
      const teacherName = Swal.getPopup().querySelector("#teacherName").value;
      const teacherGender =
        Swal.getPopup().querySelector("#teacherGender").value;
      const teacherDOB = Swal.getPopup().querySelector("#teacherDOB").value;
      const teacherPhone = Swal.getPopup().querySelector("#teacherPhone").value;
      const teacherEmail = Swal.getPopup().querySelector("#teacherEmail").value;

      if (
        !teacherName ||
        !teacherGender ||
        !teacherDOB ||
        !teacherPhone ||
        !teacherEmail
      ) {
        Swal.showValidationMessage(`Please enter all fields`);
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
  const respons = await fetch(
    "http://localhost:5172/api/v1/Teacher/RegisterTeacher",
    {
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
    }
  )
    .then((response) => {
      response.json().then((data) => {
        if (response.status === 400) {
          Swal.fire(
            "Error",
            "There was an error adding the teacher. Please try again.",
            "error"
          );
        } else {
          Swal.fire("Success", "Teacher added successfully!", "success");
          loadTeachers();
        }
      });
    })
    .catch((error) => {
      console.error("Error adding teacher:", error);
      Swal.fire(
        "Error",
        "There was an error adding the teacher. Please try again.",
        "error"
      );
    });
}

loadTeachers();

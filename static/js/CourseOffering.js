const token = localStorage.getItem("token");
const apiUrl = "http://localhost:5172/api/v1/CourseOffering";

const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

async function fetchApi(url, options = {}) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      handleErrors(response.status);
      return null;
    }
    return response.json();
  } catch (error) {
    console.error("Network error:", error);
    displayErrorMessage("Network error. Please try again later.");
    return null;
  }
}

function handleErrors(status) {
  const messages = {
    400: "Bad request: The server could not understand the request.",
    401: "Unauthorized: Authentication is required and has failed or has not yet been provided.",
    404: "Not found: It seems like there is no data available.",
  };
  const message =
    messages[status] || `HTTP error ${status}: ${response.statusText}`;
  displayErrorMessage(message);
}

async function loadCourseOfferings() {
  const data = await fetchApi(`${apiUrl}/GetAllCourseOfferings`, { headers });
  if (data) {
    renderCourseOfferings(data);
  }
}

function displayErrorMessage(message) {
  const errorMessage = document.createElement("div");
  errorMessage.className = "alert alert-info";
  errorMessage.textContent = message;
  document.querySelector(".container").appendChild(errorMessage);
}

function createCourseOfferingCard(courseOffering) {
  const role = localStorage.getItem("role");

  const cardHtml = `
    <div class="card">
      <div class="card-body">
        <img src=".././assets/img/Course.jpg" alt="CourseOffering Image" />
        <div class="card-content">
          <div class="CourseOffering-code">CourseOffering Id: ${
            courseOffering.courseOfferingId
          }</div>
          <div class="CourseOffering-credit">Course Code: ${
            courseOffering.courseCode
          }</div>
          <div class="CourseOffering-credit">Teacher Id: ${
            courseOffering.teacherId
          }
            ${
              role !== "Student"
                ? getEditButton(courseOffering.courseOfferingId)
                : ""
            }
          </div>
          ${
            role !== "Student"
              ? getDeleteButton(
                  courseOffering.teacherId,
                  courseOffering.courseCode
                )
              : ""
          }
        </div>
      </div>
    </div>`;

  document
    .getElementById("CourseOfferings-list")
    .insertAdjacentHTML("beforeend", cardHtml);
}

function getEditButton(courseOfferingId) {
  return `<a class="edit-btn" id="edit-btn" onclick="updateCourseOfferingHelper(${courseOfferingId})">
            <i class="fas fa-edit"></i>
          </a>`;
}

function getDeleteButton(teacherId, courseCode) {
  return `<button class="btn btn-danger" onclick="deleteCourseOffering(${teacherId}, '${courseCode}')">Delete</button>`;
}

function renderCourseOfferings(data) {
  const courseOfferingsList = document.getElementById("CourseOfferings-list");
  courseOfferingsList.innerHTML = "";
  data.forEach(createCourseOfferingCard);
}

async function deleteCourseOffering(teacherId, courseCode) {
  const url = `${apiUrl}/UnassignTeacherFromCourseOffering?teacherid=${teacherId}&CourseCode=${courseCode}`;
  const success = await performPostRequest(url);

  if (success) {
    Swal.fire("Success", "CourseOffering deleted successfully!", "success");
    loadCourseOfferings();
  }
}

async function performPostRequest(url) {
  try {
    const response = await fetchApi(url, {
      method: "POST",
      headers,
    });
    return response !== null;
  } catch (error) {
    console.error("Error performing POST request:", error);
    Swal.fire({
      icon: "error",
      title: "Oops... we ran into some trouble 🥲",
      text: "It seems we couldn't complete the request. Please try again later.",
    });
    return false;
  }
}

async function fetchTeachers() {
  const url = "http://localhost:5172/api/v1/Teacher/GetAllTeachers";
  const teachers = await fetchApi(url, { headers });
  return teachers || [];
}

async function fetchCourses() {
  const url = "http://localhost:5172/api/v1/Course/GetAllCourses";
  const courses = await fetchApi(url, { headers });
  return courses || [];
}

function createOptions(data, valueField, textField) {
  return data
    .map(
      (item) =>
        `<option value="${item[valueField]}">${item[textField]} (ID: ${item[valueField]})</option>`
    )
    .join("");
}

async function createForm() {
  const teachers = await fetchTeachers();
  const courses = await fetchCourses();

  const teacherOptions = createOptions(teachers, "teacherId", "fullName");
  const courseOptions = createOptions(courses, "courseCode", "courseName");

  return `
    <form id="add-CourseOffering-form">
      <div class="form-group">
        <label class="form-label">Teacher:</label>
        <select class="form-select" id="teacherId" name="teacherId">
          <option value="None" selected disabled>Please select a teacher</option>
          ${teacherOptions}
        </select>
        <div class="error" id="teacherIdError"></div>
      </div>
      <div class="form-group">
        <label for="courseCode" class="form-label mt-3">Course:</label>
        <select class="form-select" id="courseCode" name="courseCode">
          <option value="None" selected disabled>Please select a course</option>
          ${courseOptions}
        </select>
        <div class="error" id="courseCodeError"></div>
      </div>
    </form>`;
}

async function openAddCourseOfferingModal() {
  Swal.fire({
    title: "Add New CourseOffering",
    html: await createForm(),
    focusConfirm: false,
    showCancelButton: true,
    allowOutsideClick: false,
    showCloseButton: true,
    confirmButtonText: "Add CourseOffering",
    preConfirm: () => {
      const popup = Swal.getPopup();
      const teacherId = popup.querySelector("#teacherId").value;
      const courseCode = popup.querySelector("#courseCode").value;

      if (validateForm("newCourseOffering") === false) {
        Swal.showValidationMessage(`Please fix the errors before submitting.`);
        return null;
      }

      return { teacherId, courseCode };
    },
  }).then((result) => {
    if (result.isConfirmed) {
      addNewCourseOffering(result.value);
    }
  });
}

async function addNewCourseOffering(courseOffering) {
  const url = `${apiUrl}/AssignTeacherForCourseOffering?teacherid=${courseOffering.teacherId}&CourseCode=${courseOffering.courseCode}`;
  const success = await performPostRequest(url);

  if (success) {
    Swal.fire("Success", "CourseOffering added successfully!", "success");
    loadCourseOfferings();
  }
}

async function CreateUpdateCourseOfferingForm() {
  const teachers = await fetchTeachers();
  const teacherOptions = teachers
    .map(
      (teacher) =>
        `<option value="${teacher.teacherId}">
        ${teacher.fullName} (ID: ${teacher.teacherId})
      </option>`
    )
    .join("");

  return `
    <form id="add-CourseOffering-form">
    <div class="form-group">
        <label class="form-label">Teacher:</label>
        <select class="form-select" id="teacherId" name="teacherId">
          <option value="None" selected disabled>Please select a teacher</option>
          ${teacherOptions}
        </select>
        <div class="error" id="teacherIdError"></div>
      </div>
        </form >`;
}

async function updateCourseOfferingHelper(courseOfferingId) {
  Swal.fire({
    title: "Update CourseOffering",
    html: await CreateUpdateCourseOfferingForm(),
    focusConfirm: false,
    showCancelButton: true,
    allowOutsideClick: false,
    showCloseButton: true,
    confirmButtonText: "Update Tecaher",
    preConfirm: () => {
      const popup = Swal.getPopup();
      const teacherId = popup.querySelector("#teacherId").value;

      if (validateForm("updateCourseOffering") === false) {
        Swal.showValidationMessage(`Please fix the errors before submitting.`);
        return null;
      }

      return { courseOfferingId, teacherId };
    },
  }).then((result) => {
    if (result.isConfirmed) {
      updateCourseOffering(result.value);
    }
  });
}

async function updateCourseOffering(courseOffering) {
  const url = `${apiUrl}/UpdateTeacherForCourseOffering?teacherid=${courseOffering.teacherId}&courseOfferingId=${courseOffering.courseOfferingId}`;
  const success = await performPostRequest(url);

  if (success) {
    Swal.fire("Success", "Teacher updated successfully!", "success");
    loadCourseOfferings();
  }
}

loadCourseOfferings();

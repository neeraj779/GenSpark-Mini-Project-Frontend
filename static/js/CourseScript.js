const token = localStorage.getItem("token");
const apiUrl = "http://localhost:5172/api/v1/Course";

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

async function loadCourses() {
  try {
    const data = await fetchApi(`${apiUrl}/GetAllCourses`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (data !== -1) {
      const CoursesList = document.getElementById("courses-list");
      CoursesList.innerHTML = "";
      data.forEach(createCourseCard);
    }
  } catch (error) {
    console.error("Error fetching Courses:", error);
    displayErrorMessage("Error fetching Courses. Please try again later.");
  }
}

function displayErrorMessage(message) {
  const errorMessage = document.createElement("div");
  errorMessage.className = "alert alert-info";
  errorMessage.textContent = message;
  document.querySelector(".container").appendChild(errorMessage);
}

function createCourseCard(course) {
  const CourseCard = document.createElement("div");
  CourseCard.className = "card";
  CourseCard.innerHTML = `
    <div class="card-body">
        <img src=".././assets/img/course.jpg" alt="Course Image" />
        <div class="card-content">
            <div class="course-name">${course.courseName}</div>
            <div class="course-code">Course Code: ${course.courseCode}</div>
            <div class="course-credit">Credits: ${course.courseCredit} 
            <a class="edit-btn"
            onclick="UpdateCourseCreditHours('${course.courseCode}')">
            <i class="fas fa-edit"></i> </a>
            </div>
            <button
            class="btn btn-danger"
            onclick="deleteCourse('${course.courseCode}')"
          >
            Delete
          </button>
        </div>
    </div>`;
  document.getElementById("courses-list").appendChild(CourseCard);
}

function UpdateCourseCreditHours(id) {
  updateEntityField("Course", id, "CreditHours", loadCourses);
}

function deleteCourse(id) {
  deleteEntity("Course", id, loadCourses);
}

function CreateAddCourseForm() {
  return `<form id="add-Course-form">
        <div class="form-group">
          <label for="courseName">Course Name</label>
          <input
            type="text"
            class="form-control"
            id="courseName"
            name="courseName"
            onblur="validateText('courseName')"
          />
          <div class="error" id="courseNameError"></div>
        </div>
        <div class="form-group">
        <label for="courseCode">Course Code</label>
        <input
            type="text"
            class="form-control"
            id="courseCode"
            name="courseCode"
            onblur="validateText('courseCode')"
        />
        <div class="error" id="courseCodeError"></div>
        </div>
        <div class="form-group">
        <label for="courseCredit">Course Credit Hours</label>
        <input
            type="number"
            class="form-control"
            id="courseCredit"
            name="courseCredit"
            onblur="validateText('courseCredit')"
        />
        <div class="error" id="courseCreditError"></div>
        </div>
      </form>`;
}

function openAddCourseModal() {
  Swal.fire({
    title: "Add New Course",
    html: CreateAddCourseForm(),
    focusConfirm: false,
    showCancelButton: true,
    allowOutsideClick: false,
    showCloseButton: true,
    confirmButtonText: "Add Course",
    preConfirm: () => {
      const popup = Swal.getPopup();
      const courseName = popup.querySelector("#courseName").value;
      const courseCode = popup.querySelector("#courseCode").value;
      const courseCredit = popup.querySelector("#courseCredit").value;

      if (validateForm("course") === false) {
        Swal.showValidationMessage(
          `Please fix the above errors first before submitting.`
        );
      }

      return {
        courseName,
        courseCode,
        courseCredit,
      };
    },
  }).then((result) => {
    if (result.isConfirmed) {
      const newCourse = result.value;
      addNewCourse(newCourse);
    }
  });
}

async function addNewCourse(course) {
  try {
    await fetchApi(`${apiUrl}/CreateCourse`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        courseName: course.courseName,
        courseCode: course.courseCode,
        courseCredit: course.courseCredit,
      }),
    });
    Swal.fire("Success", "Course added successfully!", "success");
    loadCourses();
  } catch (error) {
    console.error("Error adding Course:", error);
    Swal.fire({
      icon: "error",
      title: "Oops... we ran into some trouble 🥲",
      text: "It seems we couldn't add the Course record. Please try again later. it might be a network issue.",
    });
  }
}

loadCourses();

const token = localStorage.getItem("token");
const apiUrl = "http://localhost:5172/api/v1/Assignment";

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
  if (returnType === "blob") return response.blob();
  return response.json();
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

async function loadAssignments() {
  try {
    const data = await fetchApi(`${apiUrl}/GetAllAssignments`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (data !== -1) {
      const AssignmentsList = document.getElementById("assignment-list");
      AssignmentsList.innerHTML = "";
      data.forEach(createAssignmentCard);
    }
  } catch (error) {
    console.error("Error fetching Assignments:", error);
    displayErrorMessage("Error fetching Assignments. Please try again later.");
  }
}

function displayErrorMessage(message) {
  Swal.fire({
    icon: "error",
    title: "Oops... we ran into some trouble 🥲",
    text: message,
  });
}

function createAssignmentCard(assignment) {
  const role = localStorage.getItem('role');

  const AssignmentCard = document.createElement("div");
  AssignmentCard.className = "card";
  AssignmentCard.innerHTML = `
    <div class="header">
        <img
        src=".././assets/img/assignment.jpg"
        alt="Assignment"
        />
    </div>
    <div class="info">
        <p class="title">Assignment Details</p>
        <span class="card-text">Assignment Id: ${
          assignment.assignmentId
        }</span><br />
        <span class="card-text">Title: ${assignment.title}</span><br />
        <span class="card-text">Course Code: ${
          assignment.courseCode
        }</span><br />
        <span class="card-text">Due Date: ${
          assignment.assignmentDueDate.split("T")[0]
        }
        ${role !== 'Student' ? `
        <a
            class="edit-btn"
            onclick="UpdateAssignmentDueDate(${assignment.assignmentId})"
          >
        <i class="fas fa-edit"></i> </a>
        ` : ''}
        </span>
        <br />
    </div>
    <div class="footer">
        <button type="button" class="action" onclick="downloadAssignment(${
          assignment.assignmentId
        })">Download Assignment</button>
        ${role !== 'Student' ? `
        <button class="btn-unenroll" onclick="UpdateAssignmentDueDate(${
          assignment.assignmentId
        }, '${assignment.courseCode}')">
        <svg viewBox="0 0 15 17.5" height="17.5" width="15" xmlns="http://www.w3.org/2000/svg" class="icon">
        <path transform="translate(-2.5 -1.25)" d="M15,18.75H5A1.251,1.251,0,0,1,3.75,17.5V5H2.5V3.75h15V5H16.25V17.5A1.251,1.251,0,0,1,15,18.75ZM5,5V17.5H15V5Zm7.5,10H11.25V7.5H12.5V15ZM8.75,15H7.5V7.5H8.75V15ZM12.5,2.5h-5V1.25h5V2.5Z" id="Fill"></path>
        </svg>
        </button>
        ` : ''}
    </div>`;
  document.getElementById("assignment-list").appendChild(AssignmentCard);
}

async function createAssignmentForm() {
  const courses = await fetchCourses();

  const courseOptions = courses
    .map(
      (course) =>
        `<option value="${course.courseCode}">${course.courseName} (Code: ${course.courseCode})</option>`
    )
    .join("");

  return `<form id="add-assignment-form">
    <div class="form-group">
        <label class="form-label" for="title">Assignment Title</label>
        <input
        type="text"
        class="form-control"
        id="title"
        name="title"
        onblur="validateText('title')"
        />
    <div class="error" id="titleError"></div>
    </div>
    <div class="form-group">
      <label class="form-label mt-3" for="courseCode">Select a Course:</label>
      <select class="form-select" id="courseCode" name="courseCode" onblur="validateSelect("courseCode")">
      <option value="None" selected disabled>Please select a course</option>
        ${courseOptions}
      </select>
      <div class="error" id="courseCodeError"></div>
    </div>
    <div class="form-group">
        <label class="form-label mt-3" for="dueDate">Assignment Due Date</label>
        <input
        type="date"
        class="form-control"
        id="dueDate"
        name="dueDate"
        onblur="validateDate('dueDate')"
        />
    <div class="error" id="dueDateError"></div>
    <div class="form-group">
        <label class="form-label mt-3" for="assignmentfile">Upload Assignment</label>
        <input
        type="file"
        class="form-control"
        id="assignmentfile"
        name="assignmentfile"
        accept=".pdf"
        onblur="validateFile('assignmentfile')"
        />
    <div class="error" id="assignmentfileError"></div>
    </div>
    </form>`;
}

async function openAddAssignmentModal() {
  Swal.fire({
    title: "Add New Assignment",
    html: await createAssignmentForm(),
    focusConfirm: false,
    showCancelButton: true,
    allowOutsideClick: false,
    showCloseButton: true,
    confirmButtonText: "Add Assignment",
    preConfirm: () => {
      const popup = Swal.getPopup();
      const title = popup.querySelector("#title").value;
      const courseCode = popup.querySelector("#courseCode").value;
      const assignmentDueDate = popup.querySelector("#dueDate").value;
      const assignmentFile = popup.querySelector("#assignmentfile").files[0];

      if (validateForm("assignment") === false) {
        Swal.showValidationMessage(
          `Please fix the above errors first before submitting.`
        );
      }

      const formData = new FormData();
      formData.append("Title", title);
      formData.append("CourseCode", courseCode);
      formData.append("assignmentDueDate", assignmentDueDate);
      formData.append("File", assignmentFile);

      return formData;
    },
  }).then((result) => {
    if (result.isConfirmed) {
      const newAssignment = result.value;
      addNewAssignment(newAssignment);
    }
  });
}

async function addNewAssignment(assignment) {
  try {
    let response = await fetchApi(`${apiUrl}/CreateAssignment`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: assignment,
    });
    if (response !== -1) {
      console.log(response);
      Swal.fire("Success", "Assignment added successfully.", "success");
      loadAssignments();
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Oops... we ran into some trouble 🥲",
      text: "It seems we couldn't add the Assignment. Please try again later. it might be a network issue.",
    });
  }
}

async function downloadAssignment(assignmentId) {
  try {
    let response = await fetchApi(
      `${apiUrl}/GetAssignmentFile?assignmentId=${assignmentId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      "blob"
    );
    if (response !== -1) {
      const url = window.URL.createObjectURL(response);
      const a = document.createElement("a");
      a.href = url;
      a.download = `assignment_${assignmentId}.pdf`;
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);

      Swal.fire("Success", "Assignment downloaded successfully.", "success");
    }
  } catch (error) {
    console.error("Error downloading Assignment:", error);
    Swal.fire({
      icon: "error",
      title: "Oops... we ran into some trouble 🥲",
      text: "It seems we couldn't download the Assignment. Please try again later. it might be a network issue.",
    });
  }
}

function UpdateAssignmentDueDate(id) {
  updateEntityField("Assignment", id, "DueDate", loadAssignments);
}

function deleteAssignment(id) {
  deleteEntity("Assignment", id, loadAssignments);
}

loadAssignments();

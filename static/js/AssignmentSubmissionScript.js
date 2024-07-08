const token = localStorage.getItem("token");
const apiUrl = "http://localhost:5172/api/v1/AssignmentSubmission";
const apiUrlForDownload = "http://localhost:5172/api/v1/Assignment";

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
    const data = await fetchApi(`${apiUrl}/GetAssignedAssignments`, {
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
    icon: "info",
    text: message,
  });
}

async function isAlreadySubmitted(assignmentId) {
  try {
    const response = await fetch(
      `${apiUrl}/GetSubmittedAssignmentStatus?assignmentId=${assignmentId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.status;
  } catch (error) {
    console.error("Error fetching Assignments:", error);
    displayErrorMessage("Error fetching Assignments. Please try again later.");
  }
}

async function createAssignmentCard(assignment) {
  let isSubmitted = await isAlreadySubmitted(assignment.assignmentId);
  let isEmpty = true;
  if (isSubmitted !== 200) {
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
        }</span><br />
    </div>
    <div class="footer">
        <button type="button" class="action" onclick="openUploadAssignmentModal(${
          assignment.assignmentId
        })">Submit Assignment</button>
        <button class="Btn" onclick="downloadAssignment(${
          assignment.assignmentId
        })">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="1em"
            viewBox="0 0 384 512"
            class="svgIcon"
          >
            <path
              d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.8 224 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"
            ></path>
          </svg>
          <span class="icon2"></span>
        </button>

    </div>`;
    isEmpty = false;
    document.getElementById("assignment-list").appendChild(AssignmentCard);
  }
  if (isEmpty)
    displayErrorMessage(
      "No Assignments available for submission at the moment."
    );
}

async function createAssignmentForm() {
  return `<form id="upload-assignment-form">
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

async function openUploadAssignmentModal(assignmentId) {
  Swal.fire({
    title: "Upload Assignment",
    html: await createAssignmentForm(),
    focusConfirm: false,
    showCancelButton: true,
    allowOutsideClick: false,
    showCloseButton: true,
    confirmButtonText: "Submit Assignment",
    preConfirm: () => {
      const popup = Swal.getPopup();
      const assignmentFile = popup.querySelector("#assignmentfile").files[0];

      if (validateForm("SubmitAssignment") === false) {
        Swal.showValidationMessage(
          `Please fix the above errors first before submitting.`
        );
      }

      const formData = new FormData();
      formData.append("AssignmentId", assignmentId);
      formData.append("File", assignmentFile);

      return formData;
    },
  }).then((result) => {
    if (result.isConfirmed) {
      const newAssignment = result.value;
      uploadAssignment(newAssignment);
    }
  });
}

async function uploadAssignment(assignment) {
  try {
    let response = await fetchApi(`${apiUrl}/SubmitAssignment`, {
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
      `${apiUrlForDownload}/GetAssignmentFile?assignmentId=${assignmentId}`,
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

loadAssignments();

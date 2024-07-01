function validateField(fieldId, errorId, validationFn, errorMsg) {
  const field = document.getElementById(fieldId);
  const errorElement = document.getElementById(errorId);
  if (validationFn(field.value)) {
    errorElement.textContent = "";
    field.classList.remove("invalid-input");
    field.classList.add("valid-input");
  } else {
    errorElement.textContent = errorMsg;
    field.classList.remove("valid-input");
    field.classList.add("invalid-input");
  }
}

function validateText(field) {
  validateField(
    field,
    `${field}Error`,
    (value) => value.trim() !== "",
    `${field} is required.`
  );
}

function validatePhone() {
  validateField(
    "phone",
    "phoneError",
    (value) => /^[0-9]{10}$/.test(value),
    "Enter a valid 10-digit phone number."
  );
}

function validateDate(field) {
  validateField(
    field,
    `${field}Error`,
    (value) => value !== "",
    `${field} is required.`
  );
}

function validateEmail() {
  validateField(
    "email",
    "emailError",
    (value) => /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(value),
    "Enter a valid email address."
  );
}

function validateSelect(field) {
  validateField(
    field,
    `${field}Error`,
    (value) => value !== "None",
    `${field} is required.`
  );
}

function validateFile(field) {
  let errorMsg = `${field} is required.`;

  const validationFunction = () => {
    const file = document.getElementById("assignmentfile").files[0];
    if (!file) {
      errorMsg = `${field} is required.`;
      return false;
    } else if (file.type !== "application/pdf") {
      console.log(file.type);
      errorMsg = "Only PDF files are allowed.";
      return false;
    } else {
      return true;
    }
  };

  validationFunction();
  validateField(field, `${field}Error`, validationFunction, errorMsg);
}

function validateForm(entity) {
  if (entity === "course") {
    validateText("courseName");
    validateText("courseCode");
    validateText("courseCredit");
  }

  if (entity === "teacher") {
    validateText("name");
    validatePhone();
    validateDate("dob");
    validateEmail();
    validateSelect("gender");
  }

  if (entity === "student") {
    validateText("name");
    validateText("rollno");
    validateText("department");
    validatePhone();
    validateDate("dob");
    validateEmail();
    validateSelect("gender");
    validateSelect("status");
  }

  if (entity === "enrollment") {
    validateSelect("studentId");
    validateSelect("courseCode");
  }

  if (entity == "assignment") {
    validateText("title");
    validateDate("dueDate");
    validateSelect("courseCode");
    validateFile("assignmentfile");
  }

  const errors = document.querySelectorAll(".error");
  let formValid = true;
  errors.forEach((error) => {
    if (error.textContent !== "") {
      formValid = false;
    }
  });

  return formValid;
}

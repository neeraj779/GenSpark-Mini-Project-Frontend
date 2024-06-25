async function updateEntityField(entityType, entityId, field, dataLoader) {
  const token = localStorage.getItem("token");
  const url = `http://localhost:5172/api/v1/${entityType}/Update${entityType}${field}`;

  return Swal.fire({
    title: `Update ${field}`,
    input: field === "Email" ? "email" : field === "Status" ? "select" : "text",
    inputOptions: {
      Undergraduate: "Undergraduate",
      Postgraduate: "Postgraduate",
      Alumni: "Alumni",
      Graduated: "Graduated",
      DroppedOut: "DroppedOut",
      Expelled: "Expelled",
      Suspended: "Suspended",
      Transferred: "Transferred",
    },
    inputLabel: `${
      field === "Status" ? "Select" : "Enter"
    } new ${field.toLowerCase()}`,
    inputPlaceholder: `${
      field === "Status" ? "Select" : "Enter"
    } your ${field.toLowerCase()}`,
    showCancelButton: true,
    confirmButtonText: `Update ${field}`,
    showLoaderOnConfirm: true,
    inputValidator: (value) => {
      if (!value) {
        return `${field} cannot be empty!`;
      }
    },
    preConfirm: async (value) => {
      try {
        const response = await fetch(url, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: entityId, [field.toLowerCase()]: value }),
        });
        if (!response.ok) {
          const error = await response.json();
          return Swal.showValidationMessage(`${JSON.stringify(error.errors)}`);
        }
        return response.json();
      } catch (error) {
        Swal.showValidationMessage(`Request failed: ${error}`);
      }
    },
    allowOutsideClick: () => !Swal.isLoading(),
  }).then((result) => {
    let updatedField = field.toLowerCase();
    if (field === "CreditHours") updatedField = "courseCredit";
    if (result.isConfirmed) {
      Swal.fire({
        title: `${field} updated to: ${result.value[updatedField]}`,
        confirmButtonText: "Ok",
      });
      dataLoader();
    }
  });
}

function deleteEntity(entityType, entityId, dataLoader) {
  const token = localStorage.getItem("token");
  let url = `http://localhost:5172/api/v1/${entityType}/Delete${entityType}Record?${entityType.toLowerCase()}Id=${entityId}`;
  if (entityType === "Course")
    url = `http://localhost:5172/api/v1/${entityType}/Delete${entityType}?courseCode=${entityId}`;

  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              "Network response was not ok " + response.statusText
            );
          }
          return response.json();
        })
        .then((data) => {
          Swal.fire({
            title: "Deleted!",
            text: `Your ${entityType.toLowerCase()} has been deleted.`,
            icon: "success",
            confirmButtonText: "Ok",
          });
          dataLoader();
        })
        .catch((error) => {
          console.error(`Error deleting ${entityType.toLowerCase()}:`, error);
          Swal.fire({
            title: "Error!",
            text: `Error deleting ${entityType.toLowerCase()}. Please try again later.`,
            icon: "error",
            confirmButtonText: "Ok",
          });
        });
    }
  });
}

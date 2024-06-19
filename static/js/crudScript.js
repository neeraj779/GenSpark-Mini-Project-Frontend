async function updateEntityField(entityType, entityId, field, DataLoader) {
  const token = localStorage.getItem("token");
  const url = `http://localhost:5172/api/v1/${entityType}/Update${entityType}${field}`;

  return Swal.fire({
    title: `Update ${field}`,
    input: field === "Email" ? "email" : "text",
    inputLabel: `Enter new ${field.toLowerCase()}`,
    inputPlaceholder: `Enter your ${field.toLowerCase()}`,
    showCancelButton: true,
    confirmButtonText: `Update ${field}`,
    showLoaderOnConfirm: true,
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
    if (result.isConfirmed) {
      Swal.fire({
        title: `${field} updated to: ${result.value[field.toLowerCase()]}`,
        confirmButtonText: "Ok",
      });
      DataLoader();
    }
  });
}

function deleteEntity(entityType, entityId) {
  const token = localStorage.getItem("token");
  const url = `http://localhost:5172/api/v1/${entityType}/Delete${entityType}Record?${entityType.toLowerCase()}Id=${entityId}`;

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
          loadTeachers();
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

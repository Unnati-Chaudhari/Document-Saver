const documentForm = document.querySelector("#documentform");
const documentName = document.querySelector("#document_name");
const documentNum = document.querySelector("#document_number");
const issueDate = document.querySelector("#issue_date");
const expiryDate = document.querySelector("#expiry_date");
const submitBtn = document.querySelector(".form_submit_button");
const nameError = document.querySelector(".doc_name_error");
const numError = document.querySelector(".doc_num_error");
const issueError = document.querySelector(".doc_issue_date_error");
const expiryError = document.querySelector(".doc_expiry_date_error");

let documents = JSON.parse(localStorage.getItem("documents")) || [];

const editIndex = localStorage.getItem("editIndex");

if (documentForm && editIndex !== null) {
  const documentToEdit = documents[editIndex];
  if (documentToEdit) {
    documentName.value = documentToEdit.name;
    documentNum.value = documentToEdit.number;
    issueDate.value = documentToEdit.issueDate;
    expiryDate.value = documentToEdit.expiryDate;
    submitBtn.textContent = "Update Document";
  }
}

function getDocumentStatus(expiryDate) {
  const today = new Date();
  const expiry = new Date(expiryDate);
  if (expiry < today) {
    return "Expired";
  }
  const difference = expiry - today;
  const daysLeft = difference / (1000 * 60 * 60 * 24);
  if (daysLeft <= 30) {
    return "Upcoming";
  }
  return "Active";
}

const totalCount = document.querySelector("#totalCount");
const upcomingCount = document.querySelector("#upcomingCount");
const expiredCount = document.querySelector("#expiredCount");

function updateCounts() {
  let upcoming = 0;
  let expired = 0;
  documents.forEach((documentData) => {
    const status = getDocumentStatus(documentData.expiryDate);
    if (status === "Upcoming") {
      upcoming++;
    }
    if (status === "Expired") {
      expired++;
    }
  });

  if (totalCount) {
    totalCount.textContent = documents.length;
  }
  if (upcomingCount) {
    upcomingCount.textContent = upcoming;
  }
  if (expiredCount) {
    expiredCount.textContent = expired;
  }
}

if (documentForm) {
  documentForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const nameValue = documentName.value.trim();
    const numValue = documentNum.value.trim();
    const issueValue = issueDate.value;
    const expiryValue = expiryDate.value;

    let isValid = true;

    if (nameValue === "") {
      nameError.textContent = "Please enter document name.";
      isValid = false;
    } else {
      nameError.textContent = "";
    }

    if (numValue === "") {
      numError.textContent = "Please enter document number.";
      isValid = false;
    } else {
      numError.textContent = "";
    }

    if (issueValue === "") {
      issueError.textContent = "Please enter issue date.";
      isValid = false;
    } else {
      issueError.textContent = "";
    }

    if (expiryValue === "") {
      expiryError.textContent = "Please enter expiry date.";
      isValid = false;
    } else {
      expiryError.textContent = "";
    }

    if (issueValue !== "" && expiryValue !== "") {
      if (expiryValue <= issueValue) {
        expiryError.textContent = "Expiry date must be after issue date.";
        isValid = false;
      }
    }

    if (isValid) {
      const documentData = {
        name: nameValue,
        number: numValue,
        issueDate: issueValue,
        expiryDate: expiryValue,
      };

      if (editIndex !== null) {
        documents[editIndex] = documentData;
        localStorage.removeItem("editIndex");
        submitBtn.textContent = "Add Document";
      } else {
        documents.push(documentData);
      }
      localStorage.setItem("documents", JSON.stringify(documents));
      updateCounts();
      console.log(documents);
    }
  });
}

const allDocumentsList = document.querySelector("#alldocList");
const renewalList = document.querySelector("#renewalList");
const expiredList = document.querySelector("#expiredList");
const searchInput = document.querySelector("#search_doc");

if (allDocumentsList) {
  displayDocuments();
}

function displayDocuments(filteredDocuments = documents) {
  allDocumentsList.innerHTML = "";
  renewalList.innerHTML = "";
  expiredList.innerHTML = "";
  if (documents.length === 0) {
    allDocumentsList.innerHTML = `
      <div class="empty_state">
        📄 No documents added yet
      </div>
    `;
    renewalList.innerHTML = `
      <div class="empty_state">
        ⚠️ No upcoming renewals
      </div>
    `;
    expiredList.innerHTML = `
      <div class="empty_state">
        🚨 No expired documents
      </div>
    `;
    return;
  }

  if (filteredDocuments.length === 0) {
    allDocumentsList.innerHTML = `
      <div class="empty_state">
        🔍 No documents found
      </div>
    `;
    renewalList.innerHTML = `
      <div class="empty_state">
        🔍 No matching documents
      </div>
    `;
    expiredList.innerHTML = `
      <div class="empty_state">
        🔍 No matching documents
      </div>
    `;
    return;
  }

  let hasUpcoming = false;
  let hasExpired = false;

  filteredDocuments.forEach((documentData) => {
    const index = documents.indexOf(documentData);
    const status = getDocumentStatus(documentData.expiryDate);
    const documentCard = document.createElement("div");

    documentCard.classList.add("document_card");
    documentCard.innerHTML = `

      <div class="doc_name">
        ${documentData.name}
      </div>
      <p class="doc_number">
        <span>Number:</span>
        ${documentData.number}
      </p>
      <p class="issue_date">
        <span>Issue-date:</span>
        ${documentData.issueDate}
      </p>
      <p class="expiry_date">
        <span>Expiry-date:</span>
        ${documentData.expiryDate}
      </p>
      <div
        class="document_status ${status.toLowerCase()}"
      >
        <span>
          ${status}
        </span>
      </div>
      <div class="document_actions">
        <button
          class="edit_btn"
          data-index="${index}"
        >
          <i class="fa-solid fa-pen"></i>
          Edit
        </button>
        <button
          class="delete_btn"
          data-index="${index}"
        >
          <i class="fa-solid fa-trash"></i>
          Delete
        </button>
      </div>
    `;
    allDocumentsList.appendChild(documentCard);
    if (status === "Upcoming") {
      hasUpcoming = true;
      renewalList.appendChild(documentCard.cloneNode(true));
    }
    if (status === "Expired") {
      hasExpired = true;

      expiredList.appendChild(documentCard.cloneNode(true));
    }
  });
  if (!hasUpcoming) {
    renewalList.innerHTML = `
      <div class="empty_state">
        ⚠️ No upcoming renewals
      </div>
    `;
  }
  if (!hasExpired) {
    expiredList.innerHTML = `
      <div class="empty_state">
        🚨 No expired documents
      </div>
    `;
  }
  document.querySelectorAll(".edit_btn").forEach((button) => {
    button.addEventListener("click", () => {
      const index = button.dataset.index;

      localStorage.setItem("editIndex", index);

      window.location.href = "index.html";
    });
  });

  document.querySelectorAll(".delete_btn").forEach((button) => {
    button.addEventListener("click", () => {
      const index = button.dataset.index;
      documents.splice(index, 1);
      localStorage.setItem("documents", JSON.stringify(documents));
      displayDocuments();
      updateCounts();
    });
  });
}

if (searchInput) {
  searchInput.addEventListener("input", () => {
    const searchValue = searchInput.value.toLowerCase().trim();
    const filteredDocuments = documents.filter((documentData) => {
      return (
        documentData.name.toLowerCase().includes(searchValue) ||
        documentData.number.toLowerCase().includes(searchValue)
      );
    });
    displayDocuments(filteredDocuments);
  });
}

updateCounts();

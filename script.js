let bpChart;
let selectedPatientId;
let currentPatient;

const patientList = document.querySelector(".patient-list");
const searchInput = document.querySelector(".search-box input");
const profileName = document.querySelector(".profile-card h2");
const profileAge = document.querySelector(".profile-card p");
const profileImage = document.querySelector(".profile-img");
const detailValues = document.querySelectorAll(".detail span");
const phone = detailValues[1];
const insurance = detailValues[2];
const respiratory = document.querySelector(".respiratory");
const temperature = document.querySelector(".temperature");
const heartRate = document.querySelector(".heart-rate");
const tableBody = document.querySelector("tbody");
const labList = document.querySelector(".lab-card ul");
const appointmentForm = document.querySelector("#appointmentForm");
const formMessage = document.querySelector(".form-message");
const appointmentsList = document.querySelector("#appointmentsList");
const todayVisits = document.querySelector("#todayVisits");
const patientModal = document.querySelector("#patientModal");
const modalTitle = document.querySelector("#modalTitle");
const modalPatientId = document.querySelector("#modalPatientId");
const modalDob = document.querySelector("#modalDob");
const modalInsurance = document.querySelector("#modalInsurance");
const modalPhone = document.querySelector("#modalPhone");
const providerMenuButton = document.querySelector("#providerMenuButton");
const providerMenu = document.querySelector("#providerMenu");
const messageModal = document.querySelector("#messageModal");
const messageForm = document.querySelector("#messageForm");
const messageFormStatus = document.querySelector("#messageFormStatus");
const teamModal = document.querySelector("#teamModal");
const teamForm = document.querySelector("#teamForm");
const teamFormStatus = document.querySelector("#teamFormStatus");
const teamList = document.querySelector("#teamList");
const historyRange = document.querySelector("#historyRange");

async function requestJson(url, options) {
    const response = await fetch(url, options);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Request failed");
    return data;
}

function getChartData(patient, range = "Last 6 Months") {
    if (range === "Last 6 Months") return patient.chart;
    const labels = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", ...patient.chart.labels];
    const extendSeries = (values) => values.map((value, index) => value - 2 + (index % 3)).concat(values);
    return {
        labels,
        systolic: extendSeries(patient.chart.systolic),
        diastolic: extendSeries(patient.chart.diastolic)
    };
}

function createChart(patient, range = historyRange.value) {
    const canvas = document.getElementById("bpChart");
    if (bpChart) bpChart.destroy();
    const chartData = getChartData(patient, range);
    bpChart = new Chart(canvas, {
        type: "line",
        data: {
            labels: chartData.labels,
            datasets: [
                { label: "Systolic", data: chartData.systolic, borderColor: "#e8795f", backgroundColor: "rgba(232, 121, 95, .12)", fill: true, tension: .4 },
                { label: "Diastolic", data: chartData.diastolic, borderColor: "#1b9aaa", tension: .4 }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } }
    });
}

function renderPatientList(patients) {
    patientList.innerHTML = patients.length ? patients.map((patient) => `
        <div class="patient${patient.id === selectedPatientId ? " active" : ""}" data-id="${patient.id}">
            <img src="${patient.image}" alt="${patient.name}">
            <div><h4>${patient.name}</h4><p>${patient.gender}, ${patient.age}</p></div>
        </div>
    `).join("") : '<p class="loading">No patients found.</p>';
    patientList.querySelectorAll(".patient").forEach((card) => card.addEventListener("click", () => loadPatient(card.dataset.id)));
}

function renderPatient(patient) {
    currentPatient = patient;
    selectedPatientId = patient.id;
    profileName.textContent = patient.name;
    profileAge.textContent = `${patient.gender}, ${patient.age} Years`;
    profileImage.src = patient.image;
    profileImage.alt = `${patient.name} profile photo`;
    phone.textContent = patient.phone;
    insurance.textContent = patient.insurance;
    respiratory.textContent = patient.vitals.respiratory;
    temperature.textContent = patient.vitals.temperature;
    heartRate.textContent = patient.vitals.heart;
    tableBody.innerHTML = patient.diagnosis.map(([problem, description, status]) => `<tr><td>${problem}</td><td>${description}</td><td>${status}</td></tr>`).join("");
    labList.innerHTML = patient.labs.map((lab) => `<li>${lab}</li>`).join("");
    document.querySelectorAll(".patient").forEach((card) => card.classList.toggle("active", card.dataset.id === patient.id));
    appointmentForm.dataset.patientId = patient.id;
    modalTitle.textContent = `${patient.name} information`;
    modalPatientId.textContent = patient.id.toUpperCase();
    modalDob.textContent = new Date(`${patient.dateOfBirth}T00:00:00`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    modalInsurance.textContent = patient.insurance;
    modalPhone.textContent = patient.phone;
    createChart(patient);
}

function exportDiagnostics() {
    if (!currentPatient) return;
    const rows = [["Problem", "Description", "Status"], ...currentPatient.diagnosis];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    link.download = `${currentPatient.name.replaceAll(" ", "-").toLowerCase()}-diagnostics.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
}

function formatAppointmentDate(date) {
    return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function renderAppointments(appointments) {
    todayVisits.textContent = String(appointments.length).padStart(2, "0");
    appointmentsList.innerHTML = appointments.length ? appointments.slice(0, 4).map((appointment) => `
        <div class="appointment-item">
            <div class="appointment-date"><strong>${formatAppointmentDate(appointment.date)}</strong><span>${appointment.time}</span></div>
            <div class="appointment-info"><strong>${appointment.type}</strong><p>${appointment.patientId === selectedPatientId ? "Selected patient" : "Patient appointment"}</p></div>
            <span class="pill blue-pill">${appointment.status}</span>
        </div>
    `).join("") : '<p class="loading">No upcoming appointments.</p>';
}

async function loadAppointments() {
    try {
        renderAppointments(await requestJson("/api/appointments"));
    } catch (error) {
        appointmentsList.innerHTML = `<p class="loading">${error.message}</p>`;
    }
}

function renderTeam(team) {
    teamList.innerHTML = team.length ? team.map((member) => `
        <div class="team-member"><span class="team-avatar ${member.color}">${member.initials}</span><div><strong>${member.name}</strong><p>${member.specialty}</p></div><i class="fa-solid fa-ellipsis"></i></div>
    `).join("") : '<p class="loading">No care-team members yet.</p>';
    document.querySelector(".team-count").textContent = `${team.length} members`;
}

async function loadTeam() {
    try {
        renderTeam(await requestJson("/api/teams"));
    } catch (error) {
        teamList.innerHTML = `<p class="loading">${error.message}</p>`;
    }
}

async function loadPatient(patientId) {
    try {
        renderPatient(await requestJson(`/api/patients/${patientId}`));
    } catch (error) {
        patientList.innerHTML = `<p class="loading">${error.message}</p>`;
    }
}

async function loadPatients(search = "") {
    try {
        const patients = await requestJson(`/api/patients?search=${encodeURIComponent(search)}`);
        renderPatientList(patients);
        if (!selectedPatientId && patients[0]) await loadPatient(patients[0].id);
    } catch (error) {
        patientList.innerHTML = `<p class="loading">${error.message}</p>`;
    }
}

searchInput.addEventListener("input", () => loadPatients(searchInput.value));

appointmentForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    formMessage.textContent = "Saving appointment...";
    const formData = new FormData(appointmentForm);
    try {
        await requestJson("/api/appointments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ patientId: appointmentForm.dataset.patientId, date: formData.get("date"), time: formData.get("time"), type: formData.get("type") })
        });
        formMessage.textContent = "Appointment scheduled successfully.";
        appointmentForm.reset();
        await loadAppointments();
    } catch (error) {
        formMessage.textContent = error.message;
    }
});

document.querySelector("#messageButton").addEventListener("click", () => {
    messageFormStatus.textContent = "";
    messageForm.reset();
    messageModal.hidden = false;
    document.querySelector("#messageText").focus();
});

messageForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    messageFormStatus.textContent = "Sending...";
    try {
        await requestJson("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ patientId: selectedPatientId, text: document.querySelector("#messageText").value }) });
        messageFormStatus.textContent = "Secure message sent.";
        setTimeout(() => { messageModal.hidden = true; }, 700);
    } catch (error) {
        messageFormStatus.textContent = error.message;
    }
});

document.querySelector("#createTeamButton").addEventListener("click", () => {
    teamFormStatus.textContent = "";
    teamForm.reset();
    teamModal.hidden = false;
    document.querySelector("#teamName").focus();
});

teamForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    teamFormStatus.textContent = "Saving...";
    const formData = new FormData(teamForm);
    try {
        await requestJson("/api/teams", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: formData.get("name"), specialty: formData.get("specialty") }) });
        await loadTeam();
        teamModal.hidden = true;
    } catch (error) {
        teamFormStatus.textContent = error.message;
    }
});

document.querySelector(".primary-action").addEventListener("click", () => { patientModal.hidden = false; });
document.querySelector("#exportDiagnosticsButton").addEventListener("click", exportDiagnostics);
document.querySelector(".modal-close").addEventListener("click", () => { patientModal.hidden = true; });
patientModal.addEventListener("click", (event) => { if (event.target === patientModal) patientModal.hidden = true; });
document.querySelectorAll("#messageModal .modal-close, #teamModal .modal-close").forEach((button) => button.addEventListener("click", () => button.closest(".modal-backdrop").hidden = true));
messageModal.addEventListener("click", (event) => { if (event.target === messageModal) messageModal.hidden = true; });
teamModal.addEventListener("click", (event) => { if (event.target === teamModal) teamModal.hidden = true; });
document.addEventListener("keydown", (event) => { if (event.key === "Escape") patientModal.hidden = true; });
providerMenuButton.addEventListener("click", () => { providerMenu.hidden = !providerMenu.hidden; providerMenuButton.setAttribute("aria-expanded", String(!providerMenu.hidden)); });
document.addEventListener("click", (event) => { if (!providerMenu.contains(event.target) && !providerMenuButton.contains(event.target)) providerMenu.hidden = true; });
document.querySelector("#signOutButton").addEventListener("click", () => { providerMenu.hidden = true; alert("You are signed out of this demo workspace."); });
const notificationButton = document.querySelector("#notificationButton");
const notificationPanel = document.querySelector("#notificationPanel");
notificationButton.addEventListener("click", () => {
    notificationPanel.hidden = !notificationPanel.hidden;
    notificationButton.setAttribute("aria-expanded", String(!notificationPanel.hidden));
    if (!notificationPanel.hidden) document.querySelector(".notification-dot").hidden = true;
});
document.addEventListener("click", (event) => {
    if (!notificationPanel.contains(event.target) && !notificationButton.contains(event.target)) {
        notificationPanel.hidden = true;
        notificationButton.setAttribute("aria-expanded", "false");
    }
});
document.querySelectorAll("[data-scroll]").forEach((button) => button.addEventListener("click", () => document.getElementById(button.dataset.scroll).scrollIntoView({ behavior: "smooth" })));
historyRange.addEventListener("change", () => { if (currentPatient) createChart(currentPatient, historyRange.value); });

loadPatients();
loadAppointments();
loadTeam();

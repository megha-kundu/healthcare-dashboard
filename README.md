# 🏥 HealthCare Dashboard

A modern, responsive **full-stack healthcare management dashboard** built to manage patient information, health records, appointments, diagnostics, lab results, care-team members, and secure patient messaging.

The project combines a responsive frontend with a **Node.js + Express.js REST API** and **MongoDB** database to create a functional healthcare management experience.

## 🌐 Live Demo

### 👉 [View HealthCare Dashboard](https://healthcare-dashboard-nanr.onrender.com/)

---

## 📌 Project Overview

HealthCare Dashboard is a full-stack web application designed to provide healthcare professionals with a centralized interface for managing patient information and daily healthcare operations.

The dashboard allows users to:

- Search and switch between patients
- View patient profiles and vital signs
- Analyze blood-pressure history through interactive charts
- Manage diagnostic information
- Export diagnostic data as CSV
- View laboratory results
- Schedule appointments
- Manage care-team members
- Send patient messages
- View notifications
- Access patient information through interactive UI components

Patient and application data are stored in **MongoDB** and accessed through REST API endpoints built with **Express.js**.

---

## ✨ Key Features

### 👥 Patient Management
- Patient search functionality
- Displays all 8 patients
- Dynamic patient profile switching
- Patient contact and insurance information
- Patient information modal
- Patient profile images

### ❤️ Health Monitoring
- Respiratory rate
- Body temperature
- Heart rate
- Dynamic health cards
- Blood-pressure history
- Interactive Chart.js visualization
- Last 6 months and last year chart views

### 🩺 Diagnostics & Laboratory
- Dynamic diagnostic table
- Diagnostic history
- CSV export for diagnostic data
- Laboratory test results
- Patient-specific diagnostic information

### 📅 Appointment Management
- Appointment scheduling
- Patient selection
- Date and time selection
- Appointment type
- Appointment status
- Appointment data stored in MongoDB

### 👨‍⚕️ Care Team
- View healthcare team members
- Add new care-team members
- Automatic initials generation
- Care-team data stored in MongoDB

### 💬 Patient Messaging
- Secure patient messaging interface
- Patient-specific messages
- Messages stored in MongoDB
- Form validation

### 🔔 Dashboard UI
- Notifications panel
- Provider dropdown
- Interactive buttons and modals
- Smooth animations
- Responsive navigation
- Mobile-friendly layout

### 📱 Responsive Design
The dashboard is designed to work across:

- 💻 Desktop
- 📱 Mobile
- 📟 Tablet

---

## 🛠️ Technology Stack

### Frontend
- **HTML5** — Page structure and semantic layout
- **CSS3** — Responsive layout, cards, animations, modals, and styling
- **JavaScript** — Dynamic UI, patient selection, forms, charts, search, notifications, and interactions
- **Chart.js** — Interactive blood-pressure charts
- **Font Awesome** — Interface icons

### Backend
- **Node.js** — Backend runtime
- **Express.js** — REST API and static file serving
- **Mongoose** — MongoDB object modeling
- **dotenv** — Environment variable management

### Database
- **MongoDB** — Stores patients, appointments, care-team members, and messages

### Deployment
- **Render** — Full-stack application deployment

---

## 🔗 API Endpoints

The application includes REST API endpoints for managing application data.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check API and database status |
| GET | `/api/patients` | Retrieve patients |
| GET | `/api/patients/:id` | Retrieve a specific patient |
| GET | `/api/appointments` | Retrieve appointments |
| POST | `/api/appointments` | Create an appointment |
| GET | `/api/teams` | Retrieve care-team members |
| POST | `/api/teams` | Add a care-team member |
| POST | `/api/messages` | Send a patient message |

---

## 🗄️ Database

MongoDB is used to persist application data.

The application manages collections for:

- Patients
- Appointments
- Care Team
- Messages

The application also supports **startup database seeding** using JSON data when the corresponding collections are empty.


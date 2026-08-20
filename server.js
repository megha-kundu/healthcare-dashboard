require("dotenv").config();

const express = require("express");
const fs = require("fs/promises");
const path = require("path");
const mongoose = require("mongoose");

const app = express();
const port = process.env.PORT || 3000;
const dataDirectory = path.join(__dirname, "data");
const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/healthcare_dashboard";

const patientSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true, index: true },
    gender: String,
    age: Number,
    dateOfBirth: String,
    phone: String,
    insurance: String,
    image: String,
    vitals: { respiratory: String, temperature: String, heart: String },
    chart: { labels: [String], systolic: [Number], diastolic: [Number] },
    diagnosis: [[String]],
    labs: [String]
}, { versionKey: false });

const appointmentSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    patientId: { type: String, required: true, index: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    type: { type: String, required: true },
    status: { type: String, default: "Scheduled" }
}, { versionKey: false });

const teamSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    specialty: { type: String, required: true },
    initials: { type: String, required: true },
    color: { type: String, default: "purple" }
}, { versionKey: false });

const messageSchema = new mongoose.Schema({
    patientId: { type: String, required: true, index: true },
    text: { type: String, required: true, trim: true, maxlength: 500 },
    sender: { type: String, default: "Dr. Megha Kundu" }
}, { timestamps: true, versionKey: false });

const Patient = mongoose.model("Patient", patientSchema);
const Appointment = mongoose.model("Appointment", appointmentSchema);
const Team = mongoose.model("Team", teamSchema);
const Message = mongoose.model("Message", messageSchema);

app.use(express.json());
app.use(express.static(__dirname));

async function readSeedData(fileName) {
    const file = await fs.readFile(path.join(dataDirectory, fileName), "utf8");
    return JSON.parse(file);
}

async function seedDatabase() {
    if (await Patient.countDocuments() === 0) {
        await Patient.insertMany(await readSeedData("patients.json"));
        console.log("Seeded patients into MongoDB");
    }
    if (await Appointment.countDocuments() === 0) {
        await Appointment.insertMany(await readSeedData("appointments.json"));
        console.log("Seeded appointments into MongoDB");
    }
    if (await Team.countDocuments() === 0) {
        await Team.insertMany([
            { id: "team-001", name: "Alex Smith", specialty: "Cardiologist", initials: "AS", color: "purple" },
            { id: "team-002", name: "Jamie Lee", specialty: "Primary nurse", initials: "JL", color: "orange" }
        ]);
        console.log("Seeded care team into MongoDB");
    }
}

app.get("/api/health", (request, response) => {
    response.json({ status: "ok", service: "healthcare-dashboard-api", database: mongoose.connection.readyState === 1 ? "mongodb" : "disconnected" });
});

app.get("/api/patients", async (request, response) => {
    try {
        const search = String(request.query.search || "").trim();
        const filter = search ? { name: { $regex: search, $options: "i" } } : {};
        const patients = await Patient.find(filter).select("id name gender age image").sort({ name: 1 }).lean();
        response.json(patients);
    } catch (error) {
        console.error(error);
        response.status(500).json({ error: "Unable to load patients" });
    }
});

app.get("/api/patients/:id", async (request, response) => {
    try {
        const patient = await Patient.findOne({ id: request.params.id }).lean();
        if (!patient) return response.status(404).json({ error: "Patient not found" });
        response.json(patient);
    } catch (error) {
        console.error(error);
        response.status(500).json({ error: "Unable to load patient" });
    }
});

app.get("/api/appointments", async (request, response) => {
    try {
        response.json(await Appointment.find().sort({ date: 1, time: 1 }).lean());
    } catch (error) {
        console.error(error);
        response.status(500).json({ error: "Unable to load appointments" });
    }
});

app.post("/api/appointments", async (request, response) => {
    const { patientId, date, time, type } = request.body;
    if (!patientId || !date || !time || !type) return response.status(400).json({ error: "Patient, date, time, and appointment type are required" });
    try {
        if (!await Patient.exists({ id: patientId })) return response.status(400).json({ error: "Patient not found" });
        const appointment = await Appointment.create({ id: `apt-${Date.now()}`, patientId, date, time, type, status: "Scheduled" });
        response.status(201).json(appointment.toObject());
    } catch (error) {
        console.error(error);
        response.status(500).json({ error: "Unable to create appointment" });
    }
});

app.get("/api/teams", async (request, response) => {
    try {
        response.json(await Team.find().sort({ name: 1 }).lean());
    } catch (error) {
        console.error(error);
        response.status(500).json({ error: "Unable to load care team" });
    }
});

app.post("/api/teams", async (request, response) => {
    const { name, specialty } = request.body;
    if (!name?.trim() || !specialty?.trim()) return response.status(400).json({ error: "Name and specialty are required" });
    try {
        const cleanName = name.trim();
        const member = await Team.create({
            id: `team-${Date.now()}`,
            name: cleanName,
            specialty: specialty.trim(),
            initials: cleanName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase(),
            color: "blue"
        });
        response.status(201).json(member.toObject());
    } catch (error) {
        console.error(error);
        response.status(500).json({ error: "Unable to create care-team member" });
    }
});

app.post("/api/messages", async (request, response) => {
    const { patientId, text } = request.body;
    if (!patientId || !text?.trim()) return response.status(400).json({ error: "Patient and message are required" });
    try {
        if (!await Patient.exists({ id: patientId })) return response.status(400).json({ error: "Patient not found" });
        const message = await Message.create({ patientId, text: text.trim() });
        response.status(201).json(message.toObject());
    } catch (error) {
        console.error(error);
        response.status(500).json({ error: "Unable to send message" });
    }
});

app.get("*", (request, response) => response.sendFile(path.join(__dirname, "index.html")));

async function startServer() {
    try {
        await mongoose.connect(mongoUri);
        await seedDatabase();
        app.listen(port, () => console.log(`HealthCare server running at http://localhost:${port} with MongoDB`));
    } catch (error) {
        console.error("MongoDB connection failed. Check MONGODB_URI and Atlas Network Access.");
        console.error(error.message);
        process.exit(1);
    }
}

startServer();

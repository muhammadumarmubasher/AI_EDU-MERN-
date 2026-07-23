const dns = require("dns");

dns.setServers([
    "8.8.8.8",
    "1.1.1.1"
]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

require("dotenv").config();

const app = express();


// =========================
// Middleware
// =========================

app.use(cors());
app.use(express.json());


// =========================
// API Routes
// =========================

app.use("/api/video", require("./routes/video"));
app.use("/api/auth", require("./routes/auth"));


// =========================
// Health Check
// =========================

app.get("/api/health", (req, res) => {

    res.json({
        success: true,
        message: "AI Education Backend Running"
    });

});


// =========================
// Serve React Frontend
// =========================

app.use(express.static(path.join(__dirname, "build")));

app.use((req, res) => {

    res.sendFile(
        path.join(__dirname, "build", "index.html")
    );

});


// =========================
// MongoDB Connection
// =========================

const connectDB = async () => {

    try {

        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000
        });

        console.log("✅ MongoDB Connected");

    } catch (error) {

        console.error(
            "❌ MongoDB Connection Error:",
            error.message
        );

        process.exit(1);

    }

};

connectDB();


// =========================
// Start Server
// =========================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(
        `🚀 Server running on http://localhost:${PORT}`
    );

});
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/dbConnect");
const bodyParser = require("body-parser");
const authRoute = require("./routes/authRoute");
const chatRoute=require("./routes/chatRoute")
dotenv.config();
const PORT = process.env.PORT || 8000;

const app = express();

// Middleware setup
app.use(cors()); // Optional: You can add options here
app.use(express.json()); // Parses JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parses URL-encoded bodies
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoute);
app.use("/api/chat",chatRoute);
// DB connection
connectDB();

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

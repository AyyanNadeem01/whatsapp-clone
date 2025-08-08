const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/dbConnect");
const bodyParser = require("body-parser");
const authRoute = require("./routes/authRoute");
const chatRoute=require("./routes/chatRoute");
const statusRoute=require("./routes/statusRoute");
const initializeSocket=require("./services/socketService");
const http=require("http");
dotenv.config();
const PORT = process.env.PORT || 8000;

const app = express();
const corsOption={
  origin:process.env.FRONTEND_URL,
  credentials:true
}

// Middleware setup
app.use(cors(corsOption));
app.use(express.json()); // Parses JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parses URL-encoded bodies
app.use(cookieParser());

// DB connection
connectDB();
//create server
const server=http.createServer(app);
const io=initializeSocket(server);
//applying socket middleware before routes
app.use((req,res,next)=>{
  req.io=io;
  req.socketUserMap=io.socketUserMap;
  next();
});
// Routes
app.use("/api/auth", authRoute);
app.use("/api/chat",chatRoute);
app.use("/api/status",statusRoute);
// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

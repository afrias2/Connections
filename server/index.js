// Import necessary libraries and modules
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import { register } from "./controllers/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import { verifyToken } from "./middleware/auth.js";
import { createPost } from "./controllers/posts.js";
import User from "./models/User.js";
import Post from "./models/Post.js";

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

// Create an Express app instance
const app = express();

// Middleware Setup
app.use(express.json()); // Parse incoming JSON data
app.use(helmet()); // Adds security headers to HTTP responses
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" })); // Set CORS policy
app.use(morgan("common")); // HTTP request logging
app.use(bodyParser.json({ limit: "30mb", extended: true })); // Parse JSON data with specified limits
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true })); // Parse URL-encoded data with specified limits
app.use(cors()); // Enable CORS for all routes
app.use("/assets", express.static(path.join(__dirname, 'public/assets'))); // Serve static assets from the 'public/assets' directory

// File Storage Setup using Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/assets"); // Set the destination for uploaded files
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Set the filename for uploaded files
    },
});
const upload = multer({ storage }); // Create a multer instance for file upload

//Routes with files
app.post("/auth/register", upload.single("picture"), register);
app.post("/posts", verifyToken, upload.single("picture"), createPost);

//Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes); 


// Mongoose Setup for Database Connection
const PORT = process.env.PORT || 6001; // Set the server port
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    // Start the server and listen on the specified port
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));
}).catch((error) => console.log(`${error} did not connect`));

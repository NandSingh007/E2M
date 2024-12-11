"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const mongoose_1 = __importDefault(require("mongoose")); // Assuming MongoDB connection
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const Register_1 = __importDefault(require("./Modal/Register"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken")); // For generating a token
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Initialize express app
const app = (0, express_1.default)();
// Create HTTP server
const server = http_1.default.createServer(app);
// Initialize Socket.io server
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});
// Rate limiting middleware
const loginRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many login attempts from this IP, please try again after 15 minutes."
});
const registrationRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 3,
    message: "Too many registration attempts from this IP, please try again after 15 minutes."
});
// Connect to MongoDB (Adjust your MongoDB URL)
mongoose_1.default
    .connect("mongodb://localhost:27017/mydatabase", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("Connected to MongoDB"))
    .catch((error) => console.error("MongoDB connection error:", error));
let users = {};
// Socket.io connection handling
io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);
    // Listen for a user to register themselves with their userId
    socket.on("register", (userId) => {
        users[userId] = socket.id; // Map user ID to socket ID for direct messaging
        console.log(`User registered: ${userId}`);
    });
    // Private message event
    socket.on("private_message", ({ toUserId, message }) => {
        const socketId = users[toUserId]; // Find the recipient’s socket ID
        if (socketId) {
            io.to(socketId).emit("receive_message", message); // Send message to the specified user
            console.log(`Message sent to ${toUserId}: ${message}`);
        }
        else {
            console.log(`User ${toUserId} not found`);
        }
    });
    // Clean up on disconnect
    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
        for (let [userId, socketId] of Object.entries(users)) {
            if (socketId === socket.id) {
                delete users[userId];
                break;
            }
        }
    });
});
// Middleware to parse incoming JSON bodies
app.use(express_1.default.json());
// Example route with rate limiting
app.post("/login", loginRateLimiter, (req, res) => {
    const { email, password } = req.body;
    // Perform login logic here (e.g., check email and password)
    if (email === "user@example.com" && password === "password123") {
        return res.status(200).json({ message: "Login successful" });
    }
    return res.status(401).json({ message: "Invalid credentials" });
});
// Example registration route with rate limiting
app.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    // Check if the required data is present
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }
    try {
        // Check if email already exists
        const existingUser = yield Register_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }
        // Hash the password before saving
        const hashedPassword = yield bcryptjs_1.default.hash(password, 12);
        // Create a new user
        const newUser = new Register_1.default({
            email,
            password: hashedPassword
        });
        // Save the new user to the database
        yield newUser.save();
        // Create a JWT token (expires in 2 days)
        const token = jsonwebtoken_1.default.sign({ userId: newUser._id }, process.env.JWT_SECRET || "your_jwt_secret", {
            expiresIn: "2d" // Token expiration set to 2 days
        });
        // Send a response with the token
        res.status(201).json({ message: "User registered successfully", token });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}));
// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

import express, { Request, Response } from "express";
import http from "http";
import { createClient } from "redis";
import { Server, Socket } from "socket.io";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import User from "./Modal/Register";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cors from "cors";
import bodyParser from "body-parser";

import cluster from "cluster";
import os from "os";
import OpenAI from "openai";

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000", // Frontend origin
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true // If you're using cookies or authorization headers
  })
);

app.use(express.json());
app.use(bodyParser.json());
// all url variable start
let mongoUrl =
  "mongodb+srv://shubhamsrathore07:EWM5tNjmAmC8ksGg@cluster0.nuwtn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
let OpenAIUrl =
  "xai-ZcvHfRKzM0yGeESGLK3lB0PGVnchcaMoIe8K94SVguUKQtLABFOELPaKMCoMtMYkeYnTrPEVvQqn44zo";

// all url variable end
if (cluster.isMaster) {
  const numCPUs = os.cpus().length;

  console.log(`Master cluster setting up ${numCPUs} workers...`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork(); // Spawn a worker for each CPU core
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
  });
} else {
  // Create server inside worker process
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_ORIGIN || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  // MongoDB Connection
  mongoose
    .connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(() => console.log("Connected to MongoDB"))
    .catch((error) => console.error("MongoDB connection error:", error));

  // Redis Connection
  const redisClient = createClient();

  redisClient
    .connect()
    .then(() => console.log("Connected to Redis"))
    .catch((err) => console.error("Redis connection error:", err));

  process.on("exit", async () => {
    await redisClient.quit();
    console.log("Disconnected from Redis");
  });

  interface PrivateMessagePayload {
    roomId: string;
    text: string;
    timestamp: string;
  }

  interface MessageData {
    sender: "user" | "bot";
    text: string;
    timestamp: string;
  }

  io.on("connection", (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("user-Register", async (token: string) => {
      try {
        const decoded = jwt.decode(token) as { userId: string } | null;
        if (!decoded || !decoded.userId) {
          throw new Error("Invalid token");
        }
        const userId = decoded.userId;

        await redisClient.lPush(`sockets:${userId}`, socket.id);
        await redisClient.hSet(`user:${userId}`, {
          online: "true",
          lastActive: new Date().toISOString()
        });

        io.emit("user_online", { userId });
      } catch (error: any) {
        console.error("Error in user registration:", error.message);
        socket.disconnect();
      }
    });

    socket.on("join_room", async (userId: string) => {
      socket.join(userId);
      // console.log(userId, "userId");
      try {
        const messages = await redisClient.lRange(`messages:${userId}`, 0, 49);
        messages.reverse(); // Reverse the array to show most recent messages first

        // console.log(messages, "messages");
        socket.emit(
          "previous_messages",
          messages.map((msg) => JSON.parse(msg)).reverse()
        );
      } catch (error: any) {
        console.error("Error fetching messages:", error.message);
      }
    });
    socket.on("private_message", async (payload: PrivateMessagePayload) => {
      const { roomId, text, timestamp } = payload;
      // console.log(roomId, text, timestamp, "userId, text, timestamp");
      const messageData: MessageData = { sender: "user", text, timestamp };

      try {
        // Rate limiting
        const rateLimitKey = `rateLimit:${roomId}`;
        const messageCount = await redisClient.incr(rateLimitKey);
        await redisClient.expire(rateLimitKey, 60); // Set expiration for the key to 60 seconds

        if (messageCount > 10) {
          socket.emit("rate_limit_exceeded", "Too many messages.");
          return;
        }

        // Save the user message to Redis
        await redisClient.rPush(
          `messages:${roomId}`,
          JSON.stringify(messageData)
        );
        socket.to(roomId).emit("receive_message", messageData); // Emit user message to the room
        // console.log("User message:", text);

        // Get bot response
        // console.log("Fetching bot response for:", text);
        const botResponse = await getChatbotResponse(text);
        // console.log("Received bot response:", botResponse);

        const botMessageData: MessageData = {
          sender: "bot",
          text: botResponse,
          timestamp: new Date().toISOString()
        };

        // Save the bot message to Redis
        await redisClient.rPush(
          `messages:${roomId}`,
          JSON.stringify(botMessageData)
        );
        io.to(roomId).emit("receive_message", botMessageData); // Emit full bot message to the room
      } catch (error: any) {
        console.error("Error handling private message:", error.message);
      }
    });

    socket.on("disconnect", async () => {
      // console.log(`User disconnected: ${socket.id}`);
      try {
        const keys = await redisClient.keys("sockets:*");
        for (const key of keys) {
          const socketId = await redisClient.lPop(key);
          if (socketId === socket.id) {
            const userId = key.split(":")[1];
            const remainingSockets = await redisClient.lLen(
              `sockets:${userId}`
            );
            if (remainingSockets === 0) {
              const lastActive = new Date().toISOString();
              await redisClient.hSet(`user:${userId}`, {
                online: "false",
                lastActive
              });
              io.emit("user_last_active", {
                userId,
                online: false,
                lastActive
              });
            }
            break;
          }
        }
      } catch (error: any) {
        console.error("Error handling disconnect:", error.message);
      }
    });
  });

  async function getChatbotResponse(userMessage: string): Promise<string> {
    try {
      // Use OpenAI API or a similar service to generate a chatbot response
      const openai = new OpenAI({
        apiKey: OpenAIUrl,
        baseURL: "https://api.x.ai/v1"
      });

      const completion = await openai.chat.completions.create({
        model: "grok-beta",
        messages: [
          { role: "system", content: "You are an intelligent chatbot." },
          { role: "user", content: userMessage }
        ]
      });
      // console.log(completion);
      if (completion?.choices?.[0]?.message?.content) {
        return completion.choices[0].message.content;
      }
      return "I'm sorry, I couldn't generate a response.";
    } catch (error) {
      console.error("Error generating chatbot response:", error);
      return "I'm sorry, I couldn't process your request.";
    }
  }

  app.post("/login", async (req: Request, res: Response) => {
    const { username, password } = req.body;
    // console.log(username, password);
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    try {
      const user = await User.findOne({ username });
      if (!user)
        return res.status(401).json({ message: "Invalid email or password" });

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid)
        return res.status(401).json({ message: "Invalid email or password" });

      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || "your_jwt_secret",
        {
          expiresIn: "2d"
        }
      );

      return res.status(200).json({ message: "Login successful", token });
    } catch (error) {
      console.error("Error during login:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(
    "/registration",

    async (req: Request, res: Response) => {
      const { username, password } = req.body;
      // console.log(username, password);
      if (!username || !password) {
        return res
          .status(400)
          .json({ message: "username and password are required" });
      }

      try {
        const existingUser = await User.findOne({ username });
        if (existingUser)
          return res.status(400).json({ message: " username already exists" });

        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
      }
    }
  );

  app.get("/user-collection", async (req: Request, res: Response) => {
    try {
      // Extract the `id` from the `authorization` header
      const userId = req.headers.authorization;

      if (!userId) {
        return res
          .status(400)
          .json({ message: "User ID not provided in the header" });
      }

      // Find the user in the database using the provided `userId`
      const data = await User.findById(userId);

      if (!data) {
        return res.status(404).json({ message: "User not found" });
      }

      // Respond with the user data
      res.status(200).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

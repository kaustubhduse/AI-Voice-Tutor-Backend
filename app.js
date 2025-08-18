import express from "express";
import cors from "cors";
import chatRoutes from "./routes/chatRoutes.js";

const app = express();

app.use(
  cors({
    origin: "*", 
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], 
  })
);

app.use(express.json());
app.use("/api", chatRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the Chat API");
});

export default app;

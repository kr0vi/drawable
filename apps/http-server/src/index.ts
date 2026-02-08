import express from "express";
import jwt from "jsonwebtoken";
import authMiddleware from "./middlewares/auth";


//todo - zod validation for request body and query params
const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/signup", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  //database logic to create user

  res.send("Signup done");
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  //database validation logic to check user credentials

  const userId = "123"; // This should be the actual user ID from the database
  const token = jwt.sign({ userId }, "secretkey");
  res.json({ token });
});

app.post("/room", authMiddleware, (req, res) => {
  res.send("Room endpoint");
});
 
app.listen(3000, () => {
  console.log("HTTP server is running on port 3000");
});

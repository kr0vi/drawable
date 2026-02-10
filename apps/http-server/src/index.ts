import express from "express";
import jwt from "jsonwebtoken";
import authMiddleware from "./middlewares/auth";
import { prisma } from "@repo/db/lib/prisma.js";
//@ts-ignore
import { createRoomSchema, authSchema } from "@repo/common/schema";
//@ts-ignore
import { JWT_SECRET } from "@repo/backend-common/config";

//todo - zod validation for request body and query params
const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/signup", async (req, res) => {
  const { success, data } = authSchema.safeParse(req.body);
  if (!success) {
    return res.status(400).json({ error: data.errors });
  }

  const username = data.username as string;
  const email = data.email as string;
  const password = data.password as string;
  await prisma.user.create({
    data: {
      username,
      password,
      email,
    },
  });

  res.send("Signup done");
});

app.post("/login", async (req, res) => {
  const { success, data } = authSchema.safeParse(req.body);
  if (!success) {
    return res.status(400).json({ error: data.errors });
  }

  const username = data.username;
  const password = data.password as string;

  //database validation logic to check user credentials

  const user = await prisma.user.findUnique({
    where: {
      username,
      password,
    },
  });

  const userId = user?.id; // This should be the actual user ID from the database
  const token = jwt.sign({ userId }, JWT_SECRET);
  res.json({ token });
});

app.post("/room", authMiddleware, (req, res) => {
  const { success, data } = createRoomSchema.safeParse(req.body);
  if (!success) {
    return res.status(400).json({ error: data.errors });
  }

  const name = data.name;

  //database logic to create room

  res.send("Room endpoint");
});

app.listen(3000, () => {
  console.log("HTTP server is running on port 3000");
});

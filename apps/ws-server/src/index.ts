import { WebSocketServer } from "ws";
import jwt, { decode, JwtPayload } from "jsonwebtoken";
//@ts-ignore
import { JWT_SECRET } from "@repo/backend-common/config";
import { prisma } from "@repo/db/lib/prisma.js";
const wss = new WebSocketServer({ port: 8080 });

interface UsersArray {
  userId: string;
  rooms: string[];
  sock: any;
}

const Users: UsersArray[] = [];

//  {type:"join_room", room:"room1"}
//  {type:"leave_room", room:"room1"}
//  {type:"chat",message:"message here", room:"room1"}

async function checkUser(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!(decoded as JwtPayload).userId) {
      return null;
    }
    const user = await prisma.user.findUnique({
      where: {
        id: (decoded as JwtPayload).userId,
      },
    });
    if (!user) {
      return null;
    }
    return user;
  } catch (e) {
    console.log(e);
    return null;
  }
}

wss.on("connection", async (socket, request) => {
  console.log("Client connected");
  const url = request.url;
  const querryParams = new URLSearchParams(url?.split("?")[1]);
  const token = querryParams.get("token");
  if (!token) {
    socket.send("Unauthorized");
    socket.close();
    return;
  }
  const currentUser = await checkUser(token);
  if (!currentUser) {
    socket.send("Unauthorized");
    socket.close();
    return;
  }

  socket.on("message", (msg) => {
    const decodedData = JSON.parse(msg.toString());
    if (decodedData.type === "join_room") {
      Users.push({
        userId: currentUser.id,
        rooms: [decodedData.room],
        sock: socket,
      });
      socket.send(`Joined room: ${decodedData.room}`);
    } else if (decodedData.type === "leave_room") {
      const userIndex = Users.findIndex((u) => u.userId === currentUser.id);
      if (userIndex !== -1) {
        //@ts-ignore
        Users[userIndex].rooms =
          Users[userIndex]?.rooms.filter((r) => r !== decodedData.room) || [];
        socket.send(`Left room: ${decodedData.room}`);
      }
    } else if (decodedData.type === "chat") {
      const roomName = decodedData.room;
      Users.forEach((user) => {
        if (user.rooms.includes(roomName)) {
          user.sock.send(decodedData.message);
        }
      });
    }
    if (decodedData == "db") {
      socket.send(Users);
    }
  });
});

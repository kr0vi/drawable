import {WebSocketServer} from 'ws';
import jwt, { JwtPayload } from 'jsonwebtoken';

const wss = new WebSocketServer({port: 8080});


wss.on("connection",(socket,request)=>{
    console.log("Client connected");
    const url = request.url;
    const querryParams = new URLSearchParams(url?.split("?")[1]);
    const token = querryParams.get("token");
    if(!token){
        socket.send("Unauthorized");
        socket.close();
        return;
    }

    const decoded = jwt.verify(token, "secretkey");
   
    if(!(decoded as JwtPayload).userId){
        socket.send("Unauthorized");
        socket.close();
        return;
    }

    socket.on("message",(msg)=>{
        socket.send(`Echo: ${msg.toString()}`);
    })
})
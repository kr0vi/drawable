import {WebSocketServer} from 'ws';

const wss = new WebSocketServer({port: 8080});


wss.on("connection",(socket)=>{
    console.log("Client connected");

    socket.on("message",(msg)=>{
        socket.send(`Echo: ${msg.toString()}`);
    })
})
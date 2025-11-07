import { WebSocket, WebSocketServer } from "ws";
let ws=new WebSocketServer({port:8081})
import cors from 'cors';
import express from 'express';

const app = express();
app.use(express.json());

// ✅ Allowed origins for CORS
const allowedOrigins = [
  'http://localhost:5173',
  'https://chat-front-umber-eight.vercel.app',
  
];

// ✅ Apply CORS
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      const normalizedOrigin = origin.replace(/\/$/, '');
      if (allowedOrigins.includes(normalizedOrigin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.get('/', (req, res) => {
  res.json({ message: 'WebSocket + Express server running ✅' });
});

interface User{
    socket:WebSocket,
    room:String,
    username:String
}
let allcon:User[]=[];
ws.on('connection',function(socket){
    socket.on('message',function(m){
        let parsed=JSON.parse(m.toString());
        if(parsed.type=='join'){
            allcon.push({
                socket,
                room:parsed.payload.roomId,
                username:parsed.payload.username
            })
        
            //join message received from frontend
            /*{
                "type":"join",
                "payload":{
                    roomId: 123
                }
            }*/

        }
        else if(parsed.type=='chat'){
            //find room from socket 
            let currRoom=null;
            for(let i=0;i<allcon.length;i++){
                if(socket==allcon[i].socket){
                    currRoom=allcon[i].room
                }
            } 
            //forward msg to all room peeps
            for(let i=0;i<allcon.length;i++){
                if(currRoom==allcon[i].room){
                    allcon[i].socket.send(JSON.stringify({
                        "message":parsed.payload.message,
                        "sender":parsed.payload.sender
                    }))
                }
            } 

             //'chat' message received from frontend
            /*{
                "type":"chat",
                "payload":{
                    message: Hi, Sorry, But I just cant
                }
            }*/
        }
    })
})

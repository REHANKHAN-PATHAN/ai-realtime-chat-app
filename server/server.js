require("dotenv").config()

const express =
require("express")

const mongoose =
require("mongoose")

const http =
require("http")

const {
translate
} =
require("google-translate-api-x")

const {
Server
} =
require("socket.io")

const cors =
require("cors")

const axios =
require("axios")

const path =
require("path")

const multer =
require("multer")

const fs =
require("fs")

const authRoutes =
require("./routes/auth")

const profileRoutes =
require("./routes/profile")

const Message =
require("./models/Message")

const app =
express()

const server =
http.createServer(app)

const io =
new Server(server,{

cors:{
origin:
"http://localhost:5173",

methods:[
"GET",
"POST"
]
}
})

// MIDDLEWARE

app.use(cors())

app.use(express.json())

app.use(

"/uploads",

express.static(

path.join(
__dirname,
"uploads"
)
)
)

// CREATE UPLOADS FOLDER

if(

!fs.existsSync("uploads")

){

fs.mkdirSync("uploads")
}

// MULTER STORAGE

const storage =
multer.diskStorage({

destination:
(req,file,cb)=>{

cb(
null,
"uploads/"
)
},

filename:
(req,file,cb)=>{

cb(

null,

Date.now() +
"-" +
file.originalname
)
}
})

const upload =
multer({
storage
})

// FILE UPLOAD API

app.post(

"/upload",

upload.single("file"),

(req,res)=>{

res.json({

file:req.file.filename
})
}
)

// ROUTES

app.use(
"/api/auth",
authRoutes
)

app.use(
"/api/profile",
profileRoutes
)

// MONGODB

mongoose.connect(

"mongodb://127.0.0.1:27017/chatapp"

)

.then(()=>{

console.log(
"MongoDB Connected"
)
})

.catch((err)=>{

console.log(err)
})

// GET MESSAGES

app.get(

"/messages",

async(req,res)=>{

try{

const messages =
await Message.find()

res.json(messages)
}

catch(error){

console.log(error)
}
})

// ONLINE USERS

let onlineUsers = []

// SOCKET CONNECTION

io.on(

"connection",

(socket)=>{

console.log(
"User Connected"
)

// JOIN CHAT

socket.on(

"join_chat",

(username)=>{

const existingUser =

onlineUsers.find(

(user)=>

user.username === username
)

if(!existingUser){

onlineUsers.push({

id:socket.id,

username
})
}

io.emit(

"online_users_list",

onlineUsers
)

console.log(
onlineUsers
)
})

// SEND MESSAGE

socket.on(

"send_message",

async(data)=>{

try{

const messageData = {

username:
data.username,

receiver:
data.receiver,

message:
data.message,

time:
data.time,

status:"Delivered",

file:
data.file || "",

voice:
data.voice || ""
}

const newMessage =
new Message(messageData)

await newMessage.save()

io.emit(

"receive_message",

newMessage
)

// AI CHAT

if(

data.message
.trim()
.startsWith("/ai")

&&

data.receiver === data.username

){

socket.emit(
"ai_typing"
)

const prompt =
data.message
.replace("/ai","")
.trim()

try{

const response =
await axios.post(

"https://openrouter.ai/api/v1/chat/completions",

{

model:
"nvidia/nemotron-3-super-120b-a12b:free",

messages:[

{
role:"user",

content:prompt
}
]
},

{

headers:{

Authorization:

`Bearer ${process.env.OPENROUTER_API_KEY}`,

"Content-Type":
"application/json"
}
}
)

const aiText =
response.data
.choices[0]
.message
.content

const aiReply = {

username:
"AI Bot",

receiver:
data.username,

message:
aiText,

time:
new Date()
.toLocaleTimeString(),

status:
"Delivered"
}

const aiMessage =
new Message(aiReply)

await aiMessage.save()

socket.emit(
"receive_message",
aiMessage
)

socket.emit(
"hide_ai_typing"
)
}

catch(error){

console.log(error)

socket.emit(
"hide_ai_typing"
)
}
}
}

catch(error){

console.log(error)
}
}
)

// DELETE MESSAGE

socket.on(

"delete_message",

async(id)=>{

try{

await Message.findByIdAndDelete(id)

io.emit(
"message_deleted",
id
)
}

catch(error){

console.log(error)
}
})

// EDIT MESSAGE

socket.on(

"edit_message",

async(data)=>{

try{

const updated =
await Message.findByIdAndUpdate(

data.id,

{
message:data.message,
edited:true
},

{
new:true
}
)

io.emit(
"message_edited",
updated
)
}

catch(error){

console.log(error)
}
})

// TYPING

socket.on(

"typing",

()=>{

socket.broadcast.emit(
"show_typing"
)
}
)

// STOP TYPING

socket.on(

"stop_typing",

()=>{

socket.broadcast.emit(
"hide_typing"
)
}
)

// DISCONNECT

socket.on(

"disconnect",

()=>{

onlineUsers =
onlineUsers.filter(

(user)=>
user.id !== socket.id
)

io.emit(

"online_users_list",

onlineUsers
)

console.log(
"Disconnected"
)
})
})

app.post(

"/translate",

async(req,res)=>{

try{

const {

text,
language

} = req.body

const result =
await translate(

text,

{
to:language
}
)

res.json({

translated:

result.text

||

result.translation

||

result
})
}

catch(error){

console.log(error)

res.status(500).json({

message:"Translation Error"
})
}
})

// START SERVER

server.listen(

5000,

()=>{

console.log(
"Server Running"
)
})
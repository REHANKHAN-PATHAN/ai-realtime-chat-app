import React,
{
useEffect,
useState,
useRef
}

from "react"

import "./Chat.css"

import axios from "axios"

import io from "socket.io-client"

import EmojiPicker
from "emoji-picker-react"

const socket =
io(https://ai-chat-backend-h2hy.onrender.com)

function Chat(){

const username =
localStorage.getItem("username")

const [message,
setMessage] =
useState("")

const [messages,
setMessages] =
useState([])

const [onlineUsers,
setOnlineUsers] =
useState([])

const [unreadCounts,
setUnreadCounts] =
useState({})

const [typing,
setTyping] =
useState(false)

const [aiTyping,
setAiTyping] =
useState(false)

const [selectedUser,
setSelectedUser] =
useState(username)

const [groupMode,
setGroupMode] =
useState(false)

const [aiMode,
setAiMode] =
useState(false)

const [translatedMessages,
setTranslatedMessages] =
useState({})

const [translateLanguage,
setTranslateLanguage] =
useState("hi")

const [showEmoji,
setShowEmoji] =
useState(false)

const [profile,
setProfile] =
useState(null)

const [theme,
setTheme] =
useState(

localStorage.getItem("theme")
||
"dark"
)

const [selectedFile,
setSelectedFile] =
useState(null)

const [recording,
setRecording] =
useState(false)

const [paused,
setPaused] =
useState(false)

const mediaRecorderRef =
useRef(null)

const audioChunksRef =
useRef([])

const [audioBlob,
setAudioBlob] =
useState(null)

const messageEndRef =
useRef(null)

const emojiRef =
useRef(null)

const fileInputRef =
useRef(null)

// LOAD PROFILE

useEffect(()=>{

const email =
localStorage.getItem("email")

axios.get(

`https://ai-chat-backend-h2hy.onrender.com/api/profile/${email}`

)

.then((res)=>{

setProfile(res.data)
})

},[])

// THEME

useEffect(()=>{

document.body.className =
theme

localStorage.setItem(
"theme",
theme
)

},[theme])

// LOAD MESSAGES

useEffect(()=>{

axios.get(

"https://ai-chat-backend-h2hy.onrender.com/messages"

)

.then((res)=>{

setMessages(res.data)
})

},[])

// JOIN CHAT

useEffect(()=>{

if(username){

socket.emit(
"join_chat",
username
)

setSelectedUser(
username
)
}

},[username])

// SOCKET EVENTS

useEffect(()=>{

const receiveMessage =
(data)=>{

setMessages((prev)=>{

const exists =
prev.some(

(msg)=>
msg._id === data._id
)

if(exists)
return prev

return [...prev,data]
})

if(

data.username !== username

&&

data.username !== selectedUser

&&

data.username !== "AI Bot"

){

setUnreadCounts((prev)=>({

...prev,

[data.username]:

(prev[data.username] || 0) + 1
}))
}
}

const deleteHandler =
(id)=>{

setMessages(

(prev)=>

prev.filter(

(msg)=>
msg._id !== id
)
)
}

const editHandler =
(updated)=>{

setMessages(

(prev)=>

prev.map((msg)=>

msg._id === updated._id

?

updated

:

msg
)
)
}

socket.on(
"receive_message",
receiveMessage
)

socket.on(
"online_users_list",
(users)=>{

setOnlineUsers(users)
})

socket.on(
"show_typing",
()=>{

setTyping(true)
})

socket.on(
"hide_typing",
()=>{

setTyping(false)
})

socket.on(
"ai_typing",
()=>{

setAiTyping(true)
})

socket.on(
"hide_ai_typing",
()=>{

setAiTyping(false)
})

socket.on(
"message_deleted",
deleteHandler
)

socket.on(
"message_edited",
editHandler
)

return ()=>{

socket.off(
"receive_message",
receiveMessage
)

socket.off(
"message_deleted",
deleteHandler
)

socket.off(
"message_edited",
editHandler
)
}

},[selectedUser])

// AUTO SCROLL

useEffect(()=>{

setTimeout(()=>{

messageEndRef.current
?.scrollIntoView({

behavior:"smooth"
})

},100)

},[messages,selectedUser])

// CLOSE EMOJI

useEffect(()=>{

const handleClickOutside =
(event)=>{

if(

emojiRef.current &&

!emojiRef.current.contains(
event.target
)

){

setShowEmoji(false)
}
}

document.addEventListener(
"mousedown",
handleClickOutside
)

return ()=>{

document.removeEventListener(
"mousedown",
handleClickOutside
)
}

},[])

// EMOJI

const onEmojiClick =
(emojiObject)=>{

setMessage(

prev =>
prev +
emojiObject.emoji
)
}

// FILE UPLOAD

const uploadFile =
async()=>{

if(!selectedFile)
return ""

const formData =
new FormData()

formData.append(
"file",
selectedFile
)

const res =
await axios.post(

"https://ai-chat-backend-h2hy.onrender.com/upload",

formData
)

return res.data.file
}

// SEND MESSAGE

const sendMessage =
async()=>{

if(
message.trim() === ""
&&
!selectedFile
&&
!audioBlob
)
return

if(selectedUser === "")
return

let uploadedFile = ""

if(selectedFile){

uploadedFile =
await uploadFile()
}

const messageData = {

username,

receiver:

groupMode

?

"GROUP_CHAT"

:

selectedUser,

message:

aiMode

?

`/ai ${message}`

:

message,

time:
new Date()
.toLocaleTimeString(),

status:"Delivered",

file:uploadedFile,

voice:audioBlob
}

socket.emit(
"send_message",
messageData
)

setMessage("")
setSelectedFile(null)
setAudioBlob(null)

if(fileInputRef.current){

fileInputRef.current.value = ""
}

socket.emit(
"stop_typing"
)
}

// ENTER SEND

const handleKeyDown =
(e)=>{

if(e.key === "Enter"){

e.preventDefault()

sendMessage()
}
}

// DELETE

const deleteMessage =
(id)=>{

socket.emit(
"delete_message",
id
)
}

// EDIT

const editMessage =
(msg)=>{

const newMessage =
prompt(

"Edit Message",

msg.message
)

if(!newMessage)
return

socket.emit(

"edit_message",

{
id:msg._id,
message:newMessage
}
)
}

// VOICE RECORD

const startRecording =
async()=>{

const stream =
await navigator.mediaDevices.getUserMedia({

audio:true
})

const mediaRecorder =
new MediaRecorder(stream)

mediaRecorderRef.current =
mediaRecorder

audioChunksRef.current = []

mediaRecorder.ondataavailable =
(event)=>{

if(event.data.size > 0){

audioChunksRef.current.push(
event.data
)
}
}

mediaRecorder.onstop =
()=>{

const blob =
new Blob(

audioChunksRef.current,

{
type:"audio/webm"
}
)

const reader =
new FileReader()

reader.readAsDataURL(blob)

reader.onloadend =
()=>{

setAudioBlob(
reader.result
)
}
}

mediaRecorder.start()

setRecording(true)

setPaused(false)
}

const stopRecording =
()=>{

if(mediaRecorderRef.current){

mediaRecorderRef.current.stop()

setRecording(false)

setPaused(false)
}
}

const pauseRecording =
()=>{

if(

mediaRecorderRef.current.state === "recording"

){

mediaRecorderRef.current.pause()

setPaused(true)
}
}

const resumeRecording =
()=>{

if(

mediaRecorderRef.current.state === "paused"

){

mediaRecorderRef.current.resume()

setPaused(false)
}
}

// LOGOUT

const logout =
()=>{

localStorage.clear()

window.location.href = "/"
}

const translateMessage =
async(id,text)=>{

try{

const res =
await axios.post(

"https://ai-chat-backend-h2hy.onrender.com/translate",

{

text,

language:translateLanguage

}
)

setTranslatedMessages((prev)=>({

...prev,

[id]:
res.data.translated
}))
}

catch(error){

console.log(error)
}
}

return(

<div className="chat-container">

<div className="sidebar">

<h2>
Online
</h2>

{
onlineUsers.length > 0

?

onlineUsers.map((user,index)=>(

<div

key={index}

className="user-box"

onClick={()=>{

setSelectedUser(
user.username
)

setUnreadCounts((prev)=>({

...prev,

[user.username]:0
}))
}}
>

<div className="user-row">

<span className="online-user-name">

🟢 {

user.username === username

?

"You (AI)"

:

user.username

}

</span>

{
unreadCounts[user.username] > 0 ? (

<div className="unread-badge">

{unreadCounts[user.username]}

</div>

) : null
}

</div>

</div>
))

:

<p className="no-users">

No Users Online

</p>
}

</div>

<div className="chat-box">

<div className="top-bar">

<div className="top-left">

<div className="logo-section">

<h1>
🤖 AI Chat App
</h1>

<div className="welcome-text">

Welcome,
{profile?.username}

</div>

</div>

</div>

<div className="top-actions">

<button

className="group-btn"

onClick={()=>{

setGroupMode(

!groupMode
)
}}
>

{

groupMode

?

"GROUP ON 👥"

:

"GROUP OFF"
}

</button>

<button

className="ai-mode-btn"

onClick={()=>{

setAiMode(

!aiMode
)
}}
>

{

aiMode

?

"AI IS ON 🤖"

:

"AI IS OFF"
}

</button>

<button

className="theme-btn"

onClick={()=>{

setTheme(

theme === "dark"

?

"light"

:

"dark"
)
}}
>

{

theme === "dark"

?

"☀️"

:

"🌙"
}

</button>

<button onClick={logout}>
Logout
</button>

</div>

</div>

{
selectedUser &&

<h4>

Chatting with:

{

groupMode

?

"Group Chat 👥"

:

selectedUser
}

</h4>
}

<div className="translate-select-box">

<select

value={translateLanguage}

onChange={(e)=>{

setTranslateLanguage(
e.target.value
)
}}
>

<option value="en">
English
</option>

<option value="hi">
Hindi
</option>

<option value="gu">
Gujarati (ગુજરાતી)
</option>

<option value="ur">
Urdu
</option>

<option value="fr">
French
</option>

<option value="es">
Spanish
</option>

<option value="ja">
Japanese
</option>

</select>

</div>

<div className="messages">

{

messages

.filter(

(msg)=>

(

msg.username === username
&&

(

msg.receiver === selectedUser

||

msg.receiver === "GROUP_CHAT"

)

)

||

(

msg.username === selectedUser
&&

(

msg.receiver === username

||

msg.receiver === "GROUP_CHAT"

)

)

||

(

msg.username === "AI Bot"
&&
msg.receiver === username
&&
selectedUser === username

)

||

msg.receiver === "GROUP_CHAT"
)

.map((msg,index)=>(

<div

key={index}

className={

msg.username === username

?

"my-message"

:

"other-message"
}

>

<p>

<strong>

{msg.username}

</strong>

</p>

<p>

{
translatedMessages[msg._id]

?

translatedMessages[msg._id]

:

msg.message.replace("/ai","")
}

</p>

<button

className="translate-btn"

onClick={()=>{

translateMessage(

msg._id,

msg.message
)
}}
>

🌍 Translate

</button>

{

msg.file &&

<a

href={`https://ai-chat-backend-h2hy.onrender.com/uploads/${msg.file}`}

target="_blank"
>

📎 Download File

</a>
}

{
msg.voice &&

<audio
controls
className="voice-player"
>

<source
src={msg.voice}
type="audio/webm"
/>

</audio>
}

<div className="message-info">

<small>

{msg.time}

{

msg.edited &&
" (edited)"
}

</small>

{

msg.username === username &&

<small className="status">

{

msg.status === "Delivered"

?

"✓✓ Delivered"

:

"✓ Sent"
}

</small>
}

</div>

{

msg.username === username &&

<div className="message-actions">

<button
onClick={()=>deleteMessage(msg._id)}
>

🗑️

</button>

<button
onClick={()=>editMessage(msg)}
>

✏️

</button>

</div>
}

</div>
))
}

{

typing &&

<p className="typing">
Typing...
</p>
}

{

aiTyping &&

<p className="typing">

🤖 AI is typing...

</p>
}

<div ref={messageEndRef}></div>

</div>

{
selectedFile &&

<div className="selected-file-name">

📎 Selected:
{selectedFile.name}

</div>
}

<div className="input-area">

{
audioBlob &&

<div className="preview-audio">

<audio controls>

<source
src={audioBlob}
type="audio/webm"
/>

</audio>

</div>
}

<div
className="emoji-container"
ref={emojiRef}
>

<button

className="emoji-btn"

onClick={()=>{

setShowEmoji(
!showEmoji
)
}}
>

😀

</button>

{

showEmoji &&

<div className="emoji-picker">

<EmojiPicker
onEmojiClick={onEmojiClick}
/>

</div>
}

</div>

<label className="custom-file-upload">

📎 Choose File

<input

type="file"

ref={fileInputRef}

hidden

onChange={(e)=>{

setSelectedFile(
e.target.files[0]
)
}}
/>

</label>

<input

type="text"

placeholder="Enter Message"

value={message}

onChange={(e)=>{

setMessage(
e.target.value
)

socket.emit(
"typing"
)
}}

onKeyDown={handleKeyDown}
/>

<button onClick={sendMessage}>
Send
</button>

{

!recording

?

<button
onClick={startRecording}
>

🎤

</button>

:

<div className="record-controls">

{

!paused

?

<button
onClick={pauseRecording}
>

⏸️

</button>

:

<button
onClick={resumeRecording}
>

▶️

</button>
}

<button
onClick={stopRecording}
>

⏹️

</button>

</div>
}

</div>

</div>

</div>
)
}

export default Chat
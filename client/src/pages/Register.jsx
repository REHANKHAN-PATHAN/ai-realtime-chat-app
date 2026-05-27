import React,{useState}
from "react"

import "./Auth.css"

import axios from "axios"

import {
Link,
useNavigate
}

from "react-router-dom"

function Register(){

const navigate =
useNavigate()

const [username,setUsername]
= useState("")

const [email,setEmail]
= useState("")

const [password,setPassword]
= useState("")

const registerUser =
async()=>{

try{

await axios.post(

"https://ai-chat-backend-h2hy.onrender.com/api/auth/register",

{
username,
email,
password
}
)

alert(
"Registration Successful"
)

navigate("/")
}

catch(err){
   console.log(err.response?.data)
   alert(err.response?.data || "Signup failed")
}
}

return(

<div className="auth-container">

<div className="auth-box">

<h1>
Create Account
</h1>

<p className="subtitle">
Welcome to AI Chat App
</p>

<input

type="text"

placeholder="Username"

value={username}

onChange={(e)=>
setUsername(
e.target.value
)}
/>

<input

type="email"

placeholder="Email"

value={email}

onChange={(e)=>
setEmail(
e.target.value
)}
/>

<input

type="password"

placeholder="Password"

value={password}

onChange={(e)=>
setPassword(
e.target.value
)}
/>

<button
onClick={registerUser}
>

Signup

</button>

<p>

Already have account?

<Link to="/">
Login
</Link>

</p>

</div>

</div>
)
}

export default Register
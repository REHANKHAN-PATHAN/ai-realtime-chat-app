import React,{useState}
from "react"

import "./Auth.css"

import axios from "axios"

import {
Link,
useNavigate
}

from "react-router-dom"

function Login(){

const navigate =
useNavigate()

const [email,setEmail]
= useState("")

const [password,setPassword]
= useState("")

const loginUser =
async()=>{

try{

const res =
await axios.post(

"http://localhost:5000/api/auth/login",

{
email,
password
}
)

localStorage.setItem(
"username",
res.data.username
)

localStorage.setItem(
"email",
email
)

navigate("/chat")

window.location.reload()
}

catch(error){

alert(
"Invalid Credentials"
)
}
}

return(

<div className="auth-container">

<div className="auth-box">

<h1>
Welcome Back
</h1>

<p className="subtitle">
Login to continue chatting
</p>

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
onClick={loginUser}
>

Login

</button>

<p>

Don't have account?

<Link to="/register">
Signup
</Link>

</p>

</div>

</div>
)
}

export default Login
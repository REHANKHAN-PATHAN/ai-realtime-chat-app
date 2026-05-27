import React from "react"

import {

BrowserRouter,

Routes,

Route,

Navigate

}

from "react-router-dom"

import Login
from "./pages/Login"

import Register
from "./pages/Register"

import Chat
from "./pages/Chat"

function App(){

const user =
localStorage.getItem(
"username"
)

return(

<BrowserRouter>

<Routes>

<Route

path="/"

element={

user

?

<Navigate to="/chat" />

:

<Login />
}
/>

<Route

path="/register"

element={<Register />}
/>

<Route

path="/chat"

element={

user

?

<Chat />

:

<Navigate to="/" />
}
/>

</Routes>

</BrowserRouter>
)
}

export default App
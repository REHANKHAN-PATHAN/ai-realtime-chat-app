const express =
require("express")

const bcrypt =
require("bcryptjs")

const jwt =
require("jsonwebtoken")

const router =
express.Router()

const User =
require("../models/User")

// REGISTER

router.post(

"/register",

async(req,res)=>{

try{

const {

username,
email,
password

} = req.body

// CHECK USERNAME

const existingUsername =
await User.findOne({

username
})

if(existingUsername){

return res.status(400)
.json({

message:
"Username already exists"
})
}

// CHECK EMAIL

const existingEmail =
await User.findOne({

email
})

if(existingEmail){

return res.status(400)
.json({

message:
"Email already exists"
})
}

// HASH PASSWORD

const hashedPassword =
await bcrypt.hash(
password,
10
)

// CREATE USER

const newUser =
new User({

username,
email,
password:
hashedPassword
})

await newUser.save()

res.status(201)
.json({

message:
"User Registered"
})
}

catch(error){

console.log(error)

res.status(500)
.json({

message:
"Server Error"
})
}
})

// LOGIN

router.post(

"/login",

async(req,res)=>{

try{

const {

email,
password

} = req.body

const user =
await User.findOne({

email
})

if(!user){

return res.status(400)
.json({

message:
"Invalid Email"
})
}

const isMatch =
await bcrypt.compare(

password,

user.password
)

if(!isMatch){

return res.status(400)
.json({

message:
"Invalid Password"
})
}

const token =
jwt.sign(

{
id:user._id
},

"secretkey"
)

res.json({

token,

username:
user.username
})
}

catch(error){

console.log(error)

res.status(500)
.json({

message:
"Server Error"
})
}
})

module.exports =
router
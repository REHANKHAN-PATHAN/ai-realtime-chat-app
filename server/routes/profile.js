const express =
require("express")

const multer =
require("multer")

const User =
require("../models/User")

const router =
express.Router()

// STORAGE

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
Date.now()
+
"-"
+
file.originalname
)
}
})

const upload =
multer({

storage
})

// UPDATE PROFILE

router.post(

"/update",

upload.single(
"profilePic"
),

async(req,res)=>{

try{

const {

email,
username,
bio

} = req.body

const updateData = {

username,
bio
}

if(req.file){

updateData.profilePic =

req.file.filename
}

const updatedUser =
await User.findOneAndUpdate(

{email},

updateData,

{new:true}
)

res.json(
updatedUser
)
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

// GET PROFILE

router.get(

"/:email",

async(req,res)=>{

try{

const user =
await User.findOne({

email:
req.params.email
})

res.json(user)
}

catch(error){

console.log(error)
}
})

module.exports =
router
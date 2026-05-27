const mongoose =
require("mongoose")

const messageSchema =
new mongoose.Schema(

{

username:{
type:String,
required:true
},

receiver:{
type:String,
required:true
},

message:{
type:String,
default:""
},

time:{
type:String
},

status:{
type:String,
default:"Sent"
},

edited:{
type:Boolean,
default:false
},

// FILE SHARING

file:{
type:String,
default:""
},

// VOICE MESSAGE

voice:{
type:String,
default:""
}

},

{
timestamps:true
}

)

module.exports =
mongoose.model(
"Message",
messageSchema
)
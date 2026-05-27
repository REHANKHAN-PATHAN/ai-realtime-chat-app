const mongoose =
require("mongoose")

const userSchema =
new mongoose.Schema({

username:{
type:String,
required:true
},

email:{
type:String,
required:true
},

password:{
type:String,
required:true
},

bio:{
type:String,
default:"Hey there! I am using AI Chat App."
},

profilePic:{
type:String,
default:""
}
})

module.exports =
mongoose.model(
"User",
userSchema
)
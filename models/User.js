const mongoose=require('mongoose');
const {Schema}=mongoose;

const UserSchema=new Schema({
    name:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true,
        unique:true
    },
    password:{
        type:String,
        require:true
    },
    date:{
        type:String,
        default:new Date(+new Date() + 7*24*60*60*1000)
    }
})

const User=mongoose.model('user',UserSchema);
module.exports=User;
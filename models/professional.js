const mongoose=require('mongoose');
const {Schema}=mongoose;

const ProfSchema=new Schema({
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
    aadhar:{
        type:String,
        require:true,
        unique:true,
        minlength: 12,
        maxlength: 12
    },
    category:{
        type:String,
        require:true,
        default:"Serviceman"
    },
    contact:{
        type:Number,
        default:"9545887585",
        require:true,
    },
    date:{
        type:String,
        default:new Date(+new Date() + 7*24*60*60*1000)
    }
})

const Professional=mongoose.model('professional',ProfSchema);
module.exports=Professional;
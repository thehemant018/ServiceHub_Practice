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
    city:{
        type:String,
        require:true,
        default:"Anand"
    },
    address:{
        type:String,
        require:true,
        default:"ADIT boys hostel, Anand"
    },
    contact:{
        type:Number,
        default:"9545887585",
        require:true,
    },
    location: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: {
            type: [Number], // Array of [longitude, latitude]
            required: true
        }
    },
    date:{
        type:String,
        default:new Date(+new Date() + 7*24*60*60*1000)
    }
})

const Professional=mongoose.model('professional',ProfSchema);
module.exports=Professional;
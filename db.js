const mongoose=require('mongoose');
const mongoURL="mongodb://localhost:27017/practice";

const connectToMongo=()=>{
    mongoose.connect(mongoURL);
    console.log('Mongo Db connected');
}
module.exports=connectToMongo;
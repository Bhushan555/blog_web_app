const mongoose=require('mongoose');
const connectDB= async(callback) =>{
    try{
        mongoose.set('strictQuery',false);
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`Database Connected: ${conn.connection.host}`); 
    }
    catch(error){
        console.log(error)
    }
    callback();
}

module.exports=connectDB;
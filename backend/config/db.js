const mongoose = require('mongoose');

const connectDB = async () =>{
    try{
        await mongoose.connect(process.env.MONGPDB_CONNECTION);
        console.log('connected to database musicApp');
        
    }catch(err){
        console.log('error connecting db');
        console.log(err);
    }
};

module.exports = connectDB;


const express = require('express');
const youtubebadl = require('youtube-dl-exec');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const port = 3000;
 const connectDB = require('./config/db')
//midleware
const app = express();
dotenv.config();

//DB connection 
connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth',authRoutes);

app.use('/api/song',require('./routes/song'));
// app.use('/songs',express.static(path.join(__dirname,'songs')));

app.listen(port,()=>{
    console.log(`server is runnig on port ${port}`);
    
});
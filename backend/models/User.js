const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:String,
    email:{type :String, unique:true},
    password:String,
    userProfileUrl:String,
    playList:[
        {
            title:String,
            songs:[
                {title:String,artist:String,thumbnail:String,audioUrl:String,videoId:String}
            ]
        }
    ],
},{timestamps:true});

module.exports = mongoose.model('User',userSchema);
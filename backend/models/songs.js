const mongoose = require('mongoose');

const songSchema = mongoose.Schema({
    title:String,
    artist:String,
    thumbnail:String,
    audioUrl:String,
    videoId:String,
})

module.exports = mongoose.model('Song',songSchema);
const express = require('express');
const youtubebadl = require('youtube-dl-exec');
const path = require('path');
const cors = require('cors');
const { log } = require('console');
const app = express();
const port = 3000;
app.use(cors());
app.get('/api/download',async(req,res)=>{
    const query = req.query.search;
    const videoInfo = await youtubebadl(`ytsearch1:${query}`,{
        dumpSingleJson:true,
    })

    let title = videoInfo.title;
    title = title.replace(/[^a-zA-Z0-9_\-]/g, '_');
    // console.log(videoInfo);
    const fileName = `${title}.mp3`

    const rawTitle = videoInfo.entries[0].title;

    // Try to split by '-'
    let [artistPart, songPart] = rawTitle.split(' - ');

    if (!songPart) {
        // If no hyphen, fallback to the part before first '|'
        [songPart] = rawTitle.split('|');
        artistPart = 'Unknown'; // or leave empty
    }

    // Further clean the song title (remove "Full VIDEO song" etc.)
    songPart = songPart.replace(/Full.*$/i, '').trim();

    const songData = {
        artist: artistPart.trim(),
        thumbnail: videoInfo.entries[0].thumbnail,
        title: songPart,
        url: `http://localhost:3000/songs/${fileName}`
    };

    console.log(songData);
    try{
        await youtubebadl(`ytsearch1:${query}`,{
            extractAudio:true,
            audioFormat: 'mp3',
            output:path.join(__dirname,'songs',fileName)
        });
        console.log("Downloaded",fileName);
        res.status(200).json(songData);
    }catch(err){
        res.status(500).json({message:`internal server issu ${err}`});
    }

});

app.use('/songs',express.static(path.join(__dirname,'songs')));

app.listen(port,()=>{
    console.log(`server is runnig on port ${port}`);
    
});
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
  let raw = rawTitle.toLowerCase();

    // Remove common clutter
    raw = raw.replace(/\[.*?\]|\(.*?\)|official|video|lyrics|audio|hd|4k|full|feat\.?|ft\.?/gi, '')
            .replace(/[^a-zA-Z0-9\s\-]/g, '') // remove special characters
            .replace(/\s+/g, ' ')             // collapse multiple spaces
            .trim();

    let artistPart = 'Unknown';
    let songPart = raw;

    // Try to split artist and title
    // Try to split artist and title
    if (raw.includes(' - ')) {
        [songPart, artistPart] = raw.split(' - ', 2);
    } else if (raw.includes('-')) {
        [songPart, artistPart] = raw.split('-', 2);
    }


    // Trim and limit length
    artistPart = artistPart.trim().slice(0, 30);  // Max 30 characters
    songPart = songPart.trim().slice(0, 40);      // Max 40 characters


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
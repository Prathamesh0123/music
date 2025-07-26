const express = require('express');
const ytdl = require('@distube/ytdl-core');
const ytSearch = require('yt-search');
const { Writable } = require('stream');
const Song = require('../models/songs');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

router.post('/upload', async (req, res) => {
    const { search } = req.query;
    if (!search) return res.status(400).json({ message: 'Song name required' });

    try {
        // ✅ STEP 1: Search YouTube using yt-search
        console.log('🔍 Searching song metadata on YouTube...');
        const searchResult = await ytSearch(search);
        const songInfo = searchResult.videos[0];
        if (!songInfo) return res.status(404).json({ message: 'No song found' });

        const { title, author: { name: artist }, image: thumbnail, videoId } = songInfo;
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const safeTitle = title.replace(/[^a-zA-Z0-9 \-\[\]\u0A80-\uFFFF]/g, '').substring(0, 50).trim();
        console.log(safeTitle);
        //step 1.5 retun alredy existing song no need to download again
        const existingSong = await Song.findOne({title:safeTitle,artist});

        if(existingSong && existingSong.audioUrl){
            console.log('song Alredy exist');
            return res.status(200).json(existingSong);
        }
        // ✅ STEP 2: Save metadata to MongoDB
        console.log('📝 Saving title, artist, and thumbnail in MongoDB...');
        const newSong = new Song({ title:safeTitle, artist, thumbnail ,videoId});
        console.log(newSong);
        const savedSong = await newSong.save();

        // ✅ STEP 3: Download audio using ytdl-core into memory
        console.log('🎧 Downloading and processing song stream...');
        const chunks = [];
        const memoryStream = new Writable({
            write(chunk, encoding, callback) {
                chunks.push(chunk);
                callback();
            }
        });

        const audioStream = ytdl(videoUrl, {
            filter: 'audioonly',
            quality: 'highestaudio',
            highWaterMark: 1 << 25 // prevent memory issues
        });

        audioStream.pipe(memoryStream);

        await new Promise((resolve, reject) => {
            audioStream.on('end', resolve);
            audioStream.on('error', reject);
        });

        const audioBuffer = Buffer.concat(chunks);

        // ✅ STEP 4: Upload to Supabase
        console.log('☁️ Uploading audio to Supabase Storage...');
        const fileName = `${safeTitle}-${Date.now()}.mp3`;

        const { data, error } = await supabase
            .storage
            .from(process.env.SUPABASE_BUCKET)
            .upload(fileName, audioBuffer, {
                contentType: 'audio/mpeg'
            });

        if (error) return res.status(500).json({ message: 'Upload failed', error });

        // ✅ STEP 5: Get public URL
        console.log('🔗 Getting public link from Supabase...');
        const { data: publicUrlData } = supabase
            .storage
            .from(process.env.SUPABASE_BUCKET)
            .getPublicUrl(fileName);

        const audioUrl = publicUrlData.publicUrl;

        // ✅ STEP 6: Update DB with URL
        console.log('✅ Saving public link in MongoDB...');
        savedSong.audioUrl = audioUrl;
        await savedSong.save();
        console.log('✅ Done');
        res.status(200).json(savedSong);

    } catch (err) {
        console.error('❌ Error:', err.message);
        res.status(500).json({ message: 'Something went wrong', error: err.message });
    }
});


router.post('/getGeneralSong',async(req,res)=>{
    try{
    const ids = req.body.ids;//array of ids
    if(!Array.isArray(ids)) return res.status(400).json({message:'ids must pass in Array'});
    
    const songs = await Song.find({videoId:{ $in: ids }});
    res.json(songs);
    console.log(songs);
    }catch(err){
        res.status(500).json({message:'internal server issue'});
    }
});
module.exports = router;

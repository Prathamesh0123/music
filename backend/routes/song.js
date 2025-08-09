const express = require('express');
const ytdl = require('@distube/ytdl-core');
const ytSearch = require('yt-search');
const { Writable } = require('stream');
const Song = require('../models/songs');
const { createClient } = require('@supabase/supabase-js');
const authMiddleware = require('../config/authMidelware');
const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const User = require('../models/User');


function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function downloadAudioWithRetry(videoUrl, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
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
                highWaterMark: 1 << 25
            });

            audioStream.pipe(memoryStream);

            await new Promise((resolve, reject) => {
                audioStream.on('end', resolve);
                audioStream.on('error', reject);
            });

            return Buffer.concat(chunks); // ✅ Success
        } catch (err) {
            if (err.statusCode === 429 && i < retries - 1) {
                console.log(`⚠ Rate limit hit, retrying in 5s... Attempt ${i + 1}`);
                await delay(5000);
            } else {
                throw err;
            }
        }
    }
}


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
        // const chunks = [];
        // const memoryStream = new Writable({
        //     write(chunk, encoding, callback) {
        //         chunks.push(chunk);
        //         callback();
        //     }
        // });

        // const audioStream = ytdl(videoUrl, {
        //     filter: 'audioonly',
        //     quality: 'highestaudio',
        //     highWaterMark: 1 << 25 // prevent memory issues
        // });

        // audioStream.pipe(memoryStream);

        // await new Promise((resolve, reject) => {
        //     audioStream.on('end', resolve);
        //     audioStream.on('error', reject);
        // });

        // const audioBuffer = Buffer.concat(chunks);
        const audioBuffer = await downloadAudioWithRetry(videoUrl);

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
        if(err.statusCode == 429 || err?.response?.status == 429){
            console.error('🚫 Rate limit hit: 429 Too Many Requests',err);

        }
        // console.error('❌ Full error:', err); // full details in Render logs
        res.status(500).json({
            message: err.message || 'Something went wrong',
            details: err?.response || err  // pass original details
        });
    }
});


router.post('/getGeneralSong',async(req,res)=>{
    try{
    const ids = req.body.ids;//array of ids
    if(!Array.isArray(ids)) return res.status(400).json({message:'ids must pass in Array'});
    
    const songs = await Song.find({videoId:{ $in: ids }});
    res.json(songs);
    }catch(err){
        res.status(500).json({message:'internal server issue'});
    }
});

router.post('/addToPlaylist', authMiddleware, async (req, res) => {
    const { newSong, playListName } = req.body;
    const { id } = req.user;
    if (!newSong || !newSong.songId || !playListName) {
        return res.status(400).json({ message: 'Invalid song or playlist name' });
    }

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(400).json({ message: 'Invalid user' });
        }

        const playList = user.playList.find(p => p.title.toLowerCase() === playListName.toLowerCase());

        if (!playList) {
            user.playList.push({
                title: playListName,
                thumbnail: newSong.thumbnail,
                songs: [newSong]
            });
        } else {
            const songExist = playList.songs.find(s => s.songId === newSong.songId);
            if (songExist) {
                return res.status(409).json({ message: 'Song already in the playlist!!!' });
            }

            playList.songs.push(newSong);

            if (playList.songs.length === 1) {
                playList.thumbnail = newSong.thumbnail;
            }
        }

        await user.save();
        res.status(200).json({ message: 'Song added to playlist' });

    } catch (err) {
        console.log(err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/getPlayListData',authMiddleware,async(req,res)=>{
    const {id} = req.user;
    const user = await User.findById(id);//it will conver string id into mongooes objectId
    try{

        if(!user){
            return res.status(401).json({message:'invalid user'});
        }

        res.status(200).json({
            message:'Data recive playlist',
            data:user.playList
        });
    }catch(err){
        console.log('err',err.message);
        res.status(500).json({message:'internal server issue'});
    }
})

router.post('/getSinglePlayList',authMiddleware,async(req,res)=>{
    const {id} = req.user;
    const {playListName} = req.body;
    console.log(id);
    const user = await User.findById(id);
    console.log(playListName);
    try{
        if(!user){
            return res.status(400).json({message:'invalid user!!!'});
        }
        const playList = user.playList.find(t => t.title == playListName);
        if(!playList){
            return res.status(401).json({message:"playlist not found"});
        }
        const songs = playList.songs;
        // console.log(songs);
        res.status(200).json(
            {
                message:"data fetched initial ",
                data:songs
            }
        );
    }catch(err){
        console.log('Invernal server issue ',err.message);
        res.status(500).json({message:"internal server issue"});
    }
});

router.post('/delteFromPlaylist',authMiddleware,async(req,res)=>{
    const {id} = req.user;
    const {playListName,songId} = req.body

    if (!playListName || !songId) {
        return res.status(400).json({ message: 'Playlist name and Song ID are required' });
    }
    try{
        // 1 find the user 
        const user = await User.findById(id);
        if(!user){
            return res.status(400).json({message: 'user not found'});
        }

        //finding specific playlist
        const playlistIndex = user.playList.findIndex(p => p.title.toLowerCase() == playListName.toLowerCase())
        if(playlistIndex == -1){
            return res.status(400).json({message:'Play list not found'});
        }
        // Get a reference to the playlist
        const playList = user.playList[playlistIndex];
        const initialSongCount = playList.songs.length;

        // filter out song is to be deleted 
        playList.songs = playList.songs.filter(song => song.songId != songId);

        //cheking song actually removed
        if (playList.songs.length === initialSongCount) {
            return res.status(404).json({ message: 'Song not found in this playlist' });
        }

        // edge case 
        if (playList.songs.length > 0) {
            // If songs remain, update the playlist thumbnail to the new first song's thumbnail
            playList.thumbnail = playList.songs[0].thumbnail;
        }

        // 7. updated user document
        await user.save();
        res.status(200).json({ message: 'Song removed successfully' });
    }catch(err){
        console.log(err.message);
        res.status(500).json({ message: 'Internal server error' })
    }
})

router.get('/search',async(req,res)=>{
    try{
        const searchTerm = req.query.name;
        console.log(searchTerm);
        if(!searchTerm){
            return res.json([]);
        }

        //query for atlas
        const songs = await Song.aggregate([
            {
                $search:{
                    "text":{
                        "query": searchTerm,
                        "path":["title","artist"],//the field to search,
                        "fuzzy":{
                        "maxEdits":1 // this allow 1 charachter typos!
                        }
                    }
                }
            },{
                "$limit":20 //max return 20 stoping sending so much data for common word like love 
            }
        ]);
        res.status(200).json(songs);
    }catch(err){
        console.log(err);
        console.log(err.message);
        res.status(500).json({message:'internal server issue'});
    }
});

module.exports = router;

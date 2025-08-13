const express = require('express');
const ytdl = require('@distube/ytdl-core');
const ytSearch = require('yt-search');
const { exec } = require("child_process");
const util = require("util");
// const fetch = require("node-fetch");
const ytdlp = require("yt-dlp-exec");
const path = require('path');

// ... inside your /upload route ...
const cookiesPath = path.join(__dirname, '..', 'cookie.text');
const Song = require('../models/songs');
const { createClient } = require('@supabase/supabase-js');
const authMiddleware = require('../config/authMidelware');
const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const User = require('../models/User');
const webshareProxies = [
    { host: "23.95.150.145", port: 6114, username: "klsrvszm", password: "nzpi2ch2z46k" },
    { host: "45.38.107.97", port: 6014, username: "klsrvszm", password: "nzpi2ch2z46k" },
    { host: "64.137.96.74", port: 6641, username: "klsrvszm", password: "nzpi2ch2z46k" },
    { host: "104.222.161.211", port: 6343, username: "klsrvszm", password: "nzpi2ch2z46k" },
    { host: "107.172.163.27", port: 6543, username: "klsrvszm", password: "nzpi2ch2z46k" },
    { host: "136.0.207.84", port: 6661, username: "klsrvszm", password: "nzpi2ch2z46k" },
    { host: "142.147.128.93", port: 5593, username: "klsrvszm", password: "nzpi2ch2z46k" },
    { host: "198.23.239.134", port: 6540, username: "klsrvszm", password: "nzpi2ch2z46k" },
    { host: "207.244.217.165", port: 6712, username: "klsrvszm", password: "nzpi2ch2z46k" },
    // Add the 10th proxy from your list here if you wish
];
router.post("/upload", async (req, res) => {
  try {
    const { search } = req.query;
    if (!search) {
      return res.status(400).json({ error: "Song name required" });
    }

    console.log(`🔍 Searching YouTube for: "${search}"`);
    const searchResult = await ytSearch(search);

    if (!searchResult.videos.length) {
      return res.status(404).json({ error: "No results found" });
    }

    const video = searchResult.videos[0];
    const videoId = video.videoId;
    let shortTitle = video.title.length > 50 
    ? video.title.slice(0, 50) + "..." 
    : video.title;

    console.log(`🎵 Found: ${shortTitle} (${video.videoId})`);
    // console.log(`🎯 Found: ${video.title} (${videoId})`);

    // Check if already exists in Mongo
    const existingSong = await Song.findOne({ videoId });
    if (existingSong) {
      console.log("✅ Song already exists in DB");
      return res.status(200).json(existingSong);
    }

    // Get direct audio stream URL via yt-dlp
    const randomProxy = webshareProxies[Math.floor(Math.random() * webshareProxies.length)];
    const proxyUrl = `http://${randomProxy.username}:${randomProxy.password}@${randomProxy.host}:${randomProxy.port}`;

    console.log(`🔄 Using proxy: ${randomProxy.host}:${randomProxy.port}`);

    // 3. Get direct audio stream URL via yt-dlp, passing the proxy URL in the options
    console.log("📥 Fetching audio URL with yt-dlp via proxy...");
    
    // The first argument is now the direct YouTube URL, NOT the worker URL
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;

    const audioStreamUrl = (
      await ytdlp(youtubeUrl, {
        f: "bestaudio",
        g: true,
        // This is the crucial part: tell yt-dlp to use your proxy
        proxy: proxyUrl, 
        cookies:cookiesPath
      })
    ).trim();
    // console.log("📥 Fetching audio URL with yt-dlp...");
    // const workerUrl = `https://cloudflare-proxy.prathmeshbatane4.workers.dev?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}`
    // console.log(workerUrl);
    // const audioStreamUrl = (
    // // await ytdlp(`https://www.youtube.com/watch?v=${videoId}`, {
    // //     f: "bestaudio",
    // //     g: true
    // // })
    // // ).trim();
    // // console.log(workerUrl)
    // await ytdlp(workerUrl, {
    //     f: "bestaudio",
    //     g: true
    // })
    // ).trim();

    // Download audio to buffer
    const audioRes = await fetch(audioStreamUrl);
    const audioBuffer = Buffer.from(await audioRes.arrayBuffer());

    if (audioBuffer.length === 0) {
      throw new Error("Download failed, buffer is empty.");
    }

    console.log(`☁️ Audio buffer created (${(audioBuffer.length / 1024 / 1024).toFixed(2)} MB). Uploading to Supabase...`);

    // Upload to Supabase
    const fileName = `${videoId}.mp3`;
    const { error: uploadError } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .upload(fileName, audioBuffer, {
        contentType: "audio/mpeg",
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Supabase upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .getPublicUrl(fileName);
    const publicAudioUrl = publicUrlData.publicUrl;

    // Save to MongoDB
    const newSong = await Song.create({
      title: shortTitle,
      artist: video.author.name,
      thumbnail: video.thumbnail,
      videoId,
      audioUrl: publicAudioUrl,
    });

    console.log("💾 Song saved to MongoDB!");
    res.status(201).json(newSong);

  } catch (err) {
    console.error("❌ Error in /upload route:", err);
    res.status(500).json({ error: err.message });
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

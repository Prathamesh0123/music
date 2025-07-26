const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User')  
const authMiddleware = require('../config/authMidelware');

router.post('/checkSession',authMiddleware,(req,res)=>{
    res.status(200).json({message:'valid user!!!'});
});

router.post('/register',async (req,res)=>{
    try{
        const {name,email,password} = req.body;
        const userExist = await User.findOne({email});
        if(userExist){
            return res.status(409).json({message:'user alredy exist with email address!!!'}); 
        }

        const newUser = await User.create({name,email,password});
        res.status(201).json({ message: 'User created', userId: newUser._id });
    }catch(err){
        console.log(err);
        res.status(500).json({message:'somthin went wrong!!!'});
        
    }
});

router.post('/login',async(req,res)=>{
    const {email,password} = req.body;  

    const user = await User.findOne({email});

    if(!user){
        return res.status(404).json({message:'user not exist signup'});
    }

    if(password != user.password){
        return res.status(401).json({message:'wrong credentials'});
    }

    const getToken = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'10h'});
    res.status(200).json(
        {
            message:'user logged in',
            token : getToken
        }
    );
});

router.post('/uploadImage',authMiddleware, async (req, res) => {
  const { imageUrl } = req.body;
  const UserId = req.user.id;
  // ✅ Find user by _id
  const validUser = await User.findById(UserId);

  if (!validUser) {
    return res.status(401).json({ message: 'Invalid user' });
  }

  // ✅ Update profile image URL
  await User.updateOne(
    { _id: UserId },
    { userProfileUrl: imageUrl }
  );

  res.status(200).json({ message: 'URL stored in DB' });
});

router.get('/userData',authMiddleware,async(req,res)=>{
    const {id} = req.user;
    // console.log(id);
    const user = await User.findOne({_id:id});
    if(!user){
        return res.status(401).json({message:'Invalid user'});
    }

    //for now sending whole user data
    res.status(200).json(
        {
            message:'data fetched....',
            data:user
        }
    )
});

router.put('/updatename',authMiddleware,async(req,res)=>{
    const {name} = req.body;
    const {id} = req.user;
    
    const userExist = await User.findById({_id:id});
    if(!userExist){
        return res.status(401).json({message:'user not found'});
    }
    try{
        await User.updateOne(
            {_id:id},
            {name:name}
        )

        res.status(200).json({message:'username updated'});
    }catch(err){
        res.status(500).json({message:'internal server issue'});
    }
});

router.put('/updatemail',authMiddleware,async(req,res)=>{   
    const {email} = req.body;
    const {id} = req.user;

    const user = await User.findById({_id:id});
    if(!user){
        return res.status(401).json({message:'inavalid user'});
    }
    
    try{
        await User.updateOne(
            {_id:id},
            {email:email}
        )
        
        res.status(200).json({message:'email updated'});
    }catch(err){
        res.status(500).json({message:'internal server issue'});
    }
});
module.exports = router;
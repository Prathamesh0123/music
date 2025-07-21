const jwt = require('jsonwebtoken');

const authMiddleware = (req,res,next)=>{
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({message:'Autherzation header missing'});
    }

    const token = authHeader.split(' ')[1];
    try{
        const decode = jwt.verify(token,process.env.JWT_SECRET);
        req.user = decode;
        console.log(decode);
        next();
    }catch(err){
        return res.status(401).json({message:'Token expired'});
    }
}

module.exports = authMiddleware;
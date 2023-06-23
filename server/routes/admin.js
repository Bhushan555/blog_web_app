const express=require('express');
const router=express.Router();
const Post=require('../models/Post')
const User=require('../models/User')
const adminLayout="../views/layouts/admin";
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken')
const jwtSecret=process.env.JWT_SECRET

//chcek login
const authMiddleware=(req,res,next)=>{
    const token=req.cookies.token;
    if(!token){
        return res.status(401).json({message:"unauthorized"});
    }
    try{
        const decoded=jwt.verify(token,jwtSecret);
        req.userId=decoded.userId;
        next()
    }
    catch(error){
    
            return res.status(401).json({message:"unauthorized"});
    }
}

//login page
router.get('/admin',(req,res)=>{
    const pageInfo={
        title:"Login",
        description:"Login page"
    }
    res.render('admin/login',{layout:adminLayout,pageInfo})
})

//login check
router.post('/admin',async(req,res)=>{
    try{
        const {username,password}=req.body;
        const user=await User.findOne({username});
        if(!user){
            return res.status(401).json({message:"Invalid Credintials"});
        }
        const isPasswordValid=await bcrypt.compare(password,user.password);
        if(!isPasswordValid){
            return res.status(401).json({message:"Invalid Credintials"});
        }
        const token=jwt.sign({userId:user._id},jwtSecret)
        res.cookie('token',token,{httpOnly:true});
        res.redirect('/dashboard');
    }
    catch(error){
        console.log(error)
    }
})

//register page
router.post('/register',async(req,res)=>{
    try{
        const {username,password}=req.body;
        const hashedPassword = await bcrypt.hash(password,10);
        try{
            const user=await User.create({username,password:hashedPassword});
            res.status(201).json({message:"user created",user})
        }catch(error){
            if(error.code===11000){
                res.status(409).json({message:"User already in use"});
            }
            res.status(500).json({message:"Internal Server Error"});    
        }
    }
    catch(error){
        console.log(error)
    }
})

//dashboard
router.get('/dashboard',authMiddleware,async(req,res)=>{
    const pageInfo={
        title:"Login",
        description:"Login page"
    }
    const data=await Post.find();
    res.render('admin/dashboard',{layout:adminLayout,pageInfo,data})
})

//add-post
router.get('/add-post',authMiddleware,(req,res)=>{
    const pageInfo={
        title:"Add post",
        description:"Add post page"
    }
    
    res.render('admin/add-post',{layout:adminLayout,pageInfo})
})

//Add new post
router.post('/add-post',authMiddleware,async(req,res)=>{
    console.log(req.body);    
    try{
        const newPost={
            title:req.body.title,
            body:req.body.body
        }
        await Post.create(newPost);
        res.redirect('/dashboard');
    }
    catch(error){
        console.log(error);
    }
})

module.exports=router;
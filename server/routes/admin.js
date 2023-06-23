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
        res.redirect('/admin')
        return res.status(401).json({message:"unauthorized"});
    }
    try{
        const decoded=jwt.verify(token,jwtSecret);
        req.userId=decoded.userId;
        next()
    }
    catch(error){
            res.redirect('/admin')
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
            res.redirect('/admin')
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
        title:"Dashboard",
        description:"dashboard page"
    }
  
    let perPage=5;
    let page=req.query.page || 1;
    const data=await Post.aggregate([{$sort:{createdAt:-1}}])
    .skip(perPage*page-perPage)
    .limit(perPage)
    .exec();
    const count = await Post.count();
    const nextpage=page+1;
    const hasNextpage=nextpage<=Math.ceil(count/perPage);
    res.render('admin/dashboard',
    {
    layout:adminLayout,
    pageInfo,
    data,
    nextPage:hasNextpage?nextpage:null
    });
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

//edit-post Get
router.get('/edit-post/:id',authMiddleware,async(req,res)=>{
    console.log(req.body);    
    try{
        const pageInfo={
            title:"Edit post",
            description:"Edit post page"
        }
        const data= await Post.findOne({_id:req.params.id});
        res.render('admin/edit-post',{
            pageInfo,
            layout:adminLayout,
            data
        })
       
    }
    catch(error){
        console.log(error);
    }
})

//edit-post request
router.put('/edit-post/:id',authMiddleware,async(req,res)=>{  
    try{
       await Post.findByIdAndUpdate(req.params.id,{
        title:req.body.title,
        body:req.body.body,
        updatedAt:Date.now()
       });
       res.redirect(`/edit-post/${req.params.id}`)
    }
    catch(error){
        console.log(error);
    }
})

//delete post
router.delete('/delete-post/:id',authMiddleware,async(req,res)=>{  
    try{
       await Post.deleteOne({_id:req.params.id});
       res.redirect('/dashboard');
    }
    catch(error){
        console.log(error);
    }
})

//logout
router.get('/logout',async(req,res)=>{  
    try{
       res.clearCookie('token')
       res.redirect('/');
    }
    catch(error){
        console.log(error);
    }
})

//get register
router.get('/register-page',authMiddleware,async(req,res)=>{  
    try{
        const pageInfo={
            title:"Register",
            description:"Register page"
        }
       res.render('admin/register',{layout:adminLayout,pageInfo});
    }
    catch(error){
        console.log(error);
    }
})

module.exports=router;
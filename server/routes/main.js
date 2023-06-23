const express=require('express');
const router=express.Router();
const Post=require('../models/Post')

//home page
router.get('/',async (req,res)=>{
    try{
        const pageInfo={
            title:"Home",
            description:"Home page",
            currentRoute:'/'
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
        res.render('index',
        {
        pageInfo,
        data,
        nextPage:hasNextpage?nextpage:null
        });
    }
    catch(error){
        console.log(error);
    }

})

//post page
router.get('/post/:id',async(req,res)=>{
   
    try{
        const pid=req.params.id;
        const data=await Post.findById(pid);
        const pageInfo={
            title:data.title,
            description:"Post page"
        }
        res.render('post',{pageInfo,data});
    }
    catch(error){
        console.log(error);
    }
})

//search
router.post('/search',async(req,res)=>{

    try{
        const pageInfo={
            title:"Search",
            description:"Search page"
        }
        let searchTerm=req.body.searchTerm;
        const searchNoSpeacialChar = searchTerm.replace(/[^a-zA-Z0-9]/g,"");
        const data=await Post.find({
            $or:[
                {title:{$regex:new RegExp(searchNoSpeacialChar,'i')}},
                {body:{$regex:new RegExp(searchNoSpeacialChar,'i')}}
            ]
        })
        res.render('search',{pageInfo,data});
    }
    catch(error){
        console.log(error);
    }
   
    // console.log(searchTerm)
    // res.send(searchTerm)
})

//about page
router.get('/about',(req,res)=>{
    const pageInfo={
        title:"Search",
        description:"Post page",
        currentRoute:'/about'
    }
    res.render('about',{pageInfo})
})

//contact page
router.get('/contact',(req,res)=>{
    const pageInfo={
        title:"Contact",
        description:"Contact page",
        currentRoute:'/contact'
    }
    res.render('contact',{pageInfo})
})

module.exports=router;
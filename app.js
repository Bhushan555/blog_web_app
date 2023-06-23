require('dotenv').config();
const express=require('express');
const app=express();
const mainRoutes=require('./server/routes/main');
const adminRoutes=require('./server/routes/admin');
const expressLayouts = require('express-ejs-layouts');
const connectDB=require('./server/config/db');
const cookieParser=require('cookie-parser');
const mongoStore=require('connect-mongo');
const session=require('express-session');
const methodOverride=require('method-override');



app.use(express.static('public'));
app.use(methodOverride('_method'));
app.use(expressLayouts);
app.set('layout','./layouts/main');
app.set('view engine','ejs');

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cookieParser());

app.use(session({
secret:'my-secret',
resave:false,
saveUninitialized:true,
store:mongoStore.create({
    mongoUrl:process.env.MONGODB_URI
}),  
}))



app.use('/',mainRoutes)
app.use('/',adminRoutes)

port=8000 || process.env.PORT;


connectDB(()=>{
    app.listen(port,()=>{
        console.log(`app is listening on port ${port}`);
    })
})

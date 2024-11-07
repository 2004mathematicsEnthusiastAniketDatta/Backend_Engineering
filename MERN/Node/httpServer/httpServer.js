//express creates an HTTP server only
"use strict";
const express=require('express');
const morgan=require('morgan');
const app=express()
app.use(morgan('dev')) // logger middleware for http -> morgan
//express contains all the necessary stuff to create an express server
//express() enables you to call and access the various stuffs within express
app.set("view engine",'ejs')
//custom middleware
app.use((req,res,next)=>{
    console.log("This is a middleware");
    // res.send("MIDDLEWARE");
    //logic
    const a=2
    const b=3
    console.log(a+b);
    return next()
    
})
app.get('/',(req,res,next)=>{
    const a=5;
    const b=10;
    console.log(a+b);
    next()
    
},(req,res)=>{
    res.render('index')
})
app.get('/about',(req,res)=>{
    res.send('About Page')
})
app.get('/profile',(req,res)=>{
    res.send('Profile Page')
})
app.get('/cart',(req,res)=>{
    res.send('Cart Page')
})
app.listen(8888)

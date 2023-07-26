const express = require("express")
const app = express()
const bodyparser = require('body-parser')
const exhbs  = require('express-handlebars')
const dbo = require('./db')
const ObjectID = dbo.ObjectID;

app.engine('hbs',exhbs.engine({layoutsDir:'views/',defaultLayout:'main',extname:'hbs'}))
app.set('view engine','hbs')

app.set('views','views');

app.use(bodyparser.urlencoded({ extended: true }));

app.get("/",async(request,response)=>{
    let database =await dbo.getDatabase();
    const collection = database.collection('books')
    const cursor = collection.find({})
    let books =await cursor.toArray()


    let message = ''
    let edit_id,edit_book;

    if(request.query.edit_id){
        edit_id = request.query.edit_id
        edit_book = await collection.findOne({_id:new ObjectID(edit_id)})
    }

    if(request.query.delete_id){
        await collection.deleteOne({_id:new ObjectID(request.query.delete_id)})
        return response.redirect('/?status=3')
    }
    switch(request.query.status){
        case '1':
            message = "Inserted Succesfully"
            break;
        case '2':
            message = 'Updated Seccesfully'
            break;
        case '3':
            message = 'Deleted Succesfully'
            break;
        default:
            break;
    }
    
    response.render('main',{message,books,edit_id,edit_book})
})

app.post('/store_book',async(request,response)=>{
    let database = await dbo.getDatabase();
    const collection = database.collection('books');
    let book = {title:request.body.title,author : request.body.author}
    await collection.insertOne(book);
    return response.redirect('/?status=1')
})
app.post('/update_book/:edit_id',async(request,response)=>{
    let database = await dbo.getDatabase();
    const collection = database.collection('books');
    let book = {title:request.body.title,author : request.body.author}
    let edit_id = request.params.edit_id
    await collection.updateOne({_id:new ObjectID(edit_id)},{$set:book});
    return response.redirect('/?status=2')
})

app.listen(3040,()=>{console.log('listening to 8000 port');})
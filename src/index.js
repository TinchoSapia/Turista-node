const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.listen(port, () => {
    console.log(`Corriendo en puerto: ${port}`)
});

app.get('/api/user/:userId', (req,res) => {
    res.send(200, {user})    
});

app.set('/api/user/:userId', (req,res) =>{
    console.log(req.body)
    res.send(200, {message: `user recibido`})
});
app.put('/api/user/:userId', (req,res) =>{
    
});
app.delete('/api/user/:userId', (req,res) =>{
    
});

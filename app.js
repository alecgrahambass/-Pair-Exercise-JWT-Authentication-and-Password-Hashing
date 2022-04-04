const express = require('express');
const app = express();
app.use(express.json());
const { models: { User }} = require('./db');
const path = require('path');

app.get('/', (req, res)=> res.sendFile(path.join(__dirname, 'index.html')));

app.post('/api/auth', async(req, res, next)=> {
  try {
    const user = await User.authenticate(req.body);
    if(!user) res.sendStatus(404);
    const token = await user.generateToken();
    res.send(token);
    // res.send({ 
    //   token: await 
    //   User.authenticate(req.body)
    // });
  }
  catch(ex){
    next(ex);
  }
});

app.get('/api/auth', async(req, res, next)=> {
  try {
    const token = req.headers.authorization;
    const user = await User.byToken(token);
    req.user = user;
    res.send(req.user);
  }
  catch(ex){
    next(ex);
  }
});

app.use((err, req, res, next)=> {
  console.log(err);
  res.status(err.status || 500).send({ error: err.message });
});

module.exports = app;
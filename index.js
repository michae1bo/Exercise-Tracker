const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose');

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({
  extended: true
}));

// parse application/json
app.use(express.json());

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', async function(req, res) {
  let jsonResponse = await ExerciseTracker.findOne({username: req.body.username}, {log: 0, count: 0, __v: 0});
  if (jsonResponse === null) {
    const user = new ExerciseTracker({
      username: req.body.username,
      count: 0,
      log: []
    });
    await user.save();
    jsonResponse = await ExerciseTracker.findOne({username: req.body.username}, {log: 0, count: 0, __v: 0})
  };
  res.json(jsonResponse);
});

app.get('/api/users', async function(req, res) {
  const users = await ExerciseTracker.find({}, {log: 0, count: 0, __v: 0});
  res.send(users);
});

app.post('/api/users/:_id/exercises', async function (req, res) {
  const description = req.body.description;
  const duration = parseInt(req.body.duration);
  const date = (req.body.date !== "") ? new Date(req.body.date) : new Date();
  const dateString = date.toDateString();
  if (dateString === "Invalid Date") {
    res.json({error: "Invalid Date"});
  } else {
    const user = await ExerciseTracker.findById(req.params._id);
    if (user === null) {
      res.json({error: "No user with that id"});
    } else {
      user.log.push({description: description, duration: duration, date: date});
      user.count = user.log.length;
      await user.save();
      res.json({
        _id: user._id,
        username: user.username,
        date: dateString,
        duration: duration,
        description: description
      });
    }
  }
});

app.get('/api/users/:_id/logs', async function (req, res) {
  const user = await ExerciseTracker.findById(req.params._id, {__v: 0});
  if (user === null) {
    res.json({error: "No user with that id"});
  } else {
    const jsonResponse = {_id: user._id, count: user.count, log: []};
    for(let i = 0; i < user.log.length; i++) {
      const currentLog = {description: user.log[i].description, duratron: user.log[i].duration, date: user.log[i].date.toDateString()};
      jsonResponse.log.push(currentLog);
    }
    
    res.json(jsonResponse);
  }
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})



mongoose.connect(process.env.MONGO_URI);



const exerciseTrackerSchema = new mongoose.Schema({
  username: String,
  count: Number,
  log: [{
    description: String,
    duration: Number,
    date: Date,
    _id: false
  }]
});
const ExerciseTracker = mongoose.model('ExerciseTracker', exerciseTrackerSchema);
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
  console.log(req.body.username);
  let jsonResponse = await ExerciseTracker.findOne({username: req.body.username});
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
  res.json({userList: users});
});



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
    date: String
  }]
});
const ExerciseTracker = mongoose.model('ExerciseTracker', exerciseTrackerSchema);
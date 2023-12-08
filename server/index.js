const path = require('path');
const express = require("express");
const bodyParser = require("body-parser");
const { fileURLToPath } = require('url');

const PORT = process.env.PORT || 3001;

const app = express();
app.use(express.static(path.resolve(__dirname, '../client/build')));
app.use(bodyParser.json());

var currAlarm = "";
var currSnooze = 10;
var currFile = "";

app.get('/all-settings', (req, res) => {
    res.json({
        alarm: currAlarm,
        snooze: currSnooze,
        wav: currFile
    });
  });

app.post('/snooze', (req, res) => {
    currSnooze = parseInt(req.body.snooze);
    message = 'Snooze time saved successfully: ' + currSnooze
    res.send(message);
});

app.post('/alarm', (req, res) => {
    currAlarm = req.body.alarm;
    console.log(currAlarm);
    message = 'Alarm time saved successfully: ' + currAlarm
    res.send(message);
});

app.post('/wav', (req, res) => {
    currFile = req.body.wav.path;
    console.log(currFile);
    message = 'WAV file saved successfully: ' + currFile
    res.send(message);
});

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
  
app.listen(PORT, () => {
console.log(`Server listening on ${PORT}`);
});
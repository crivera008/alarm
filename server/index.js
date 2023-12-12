const axios = require('axios');
const path = require('path');
const express = require("express");
const cors = require('cors');
const bodyParser = require("body-parser");
const multer = require('multer');
const fs = require('fs');

const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  },
  destination: (req, file, cb) => {
    const uploadFolder = path.join(__dirname, '/uploads/');
    if (!fs.existsSync(uploadFolder)) {
      fs.mkdirSync(uploadFolder);
    }
    const existingFiles = fs.readdirSync(uploadFolder);
    if (existingFiles.length > 0) {
      existingFiles.forEach(existingFile => {
        const filePath = path.join(uploadFolder, existingFile);
        fs.unlinkSync(filePath);
      });
    }
    cb(null, uploadFolder);
  },
})

const upload = multer({ 
    storage: storage, 
    limits: { fileSize: 50 * 1000 * 1000 }
});

const PORT = process.env.PORT || 3001;

const app = express();
app.use(express.static(path.resolve(__dirname, '../client/build')));
app.use(cors());
app.use(bodyParser.json());

var currAlarm = "";
var currSnooze = 10;
var currFileName = "";
var weather_code;
var max_temp;
var min_temp;

function in_seconds(time) {
    var [hours, minutes] = time.split(':');
    hours2 = parseInt(hours);
    minutes2 = parseInt(minutes);
    const d = new Date();
    var currDay = d.getDate();
    month = d.getMonth() + 1
    var date_string = d.getFullYear() + "-" + month + "-" + currDay + "T" + hours + ":" + minutes + ":00.000"
    console.log(date_string);
    var d2 = new Date(date_string); 
    alarm_secs = Math.floor(d2 / 1000);
    curr_secs = Math.floor((Date.now() - (5 * 60 * 60 * 1000)) / 1000)
    if (alarm_secs < curr_secs) {
        alarm_secs += 24 * 60 * 60;
    }
    return alarm_secs;
}

app.get('/all-settings-user', (req, res) => {
    res.json({
        alarm: currAlarm,
        snooze: currSnooze,
        songname: currFileName
    });
  });

app.get('/all-settings', (req, res) => {
    res.json({
        alarm: in_seconds(currAlarm),
        snooze: currSnooze,
        songname: currFileName,
        secs: Math.floor((Date.now() - (5 * 60 * 60 * 1000)) / 1000)
    });
  });

  app.get('/download-wav', (req, res) => {
    const uploadFolder = path.join(__dirname, '/uploads/');
    const file = fs.readdirSync(uploadFolder)[0];
    res.sendFile(path.join(uploadFolder, file));
  });

app.get('/weather', (req, res) => {
    const url = "http://api.open-meteo.com/v1/forecast?latitude=41.82682&longitude=-71.402931&daily=weather_code,temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&timezone=America%2FNew_York&forecast_days=1";
    axios.get(url).then(response => {
        weather_code = response.data.daily.weather_code[0];
        max_temp = Math.round(response.data.daily.temperature_2m_max[0]);
        min_temp = Math.round(response.data.daily.temperature_2m_min[0]);
    })
    .catch(error => console.error('Error retrieving weather data: ', error));
    res.json({
        code: weather_code,
        max: max_temp,
        min: min_temp
    });
  });

app.post('/snooze', (req, res) => {
    currSnooze = parseInt(req.body.snooze);
    message = 'Snooze time saved successfully: ' + currSnooze
    res.send(message);
});

app.post('/song-selection', (req, res) => {
  console.log(req.body);
  currFileName = req.body.song;
  message = "Selected song: " + res.body.song;
  res.send(message);
});

app.post('/alarm', (req, res) => {
    currAlarm = req.body.alarm;
    console.log(currAlarm);
    message = 'Alarm time saved successfully: ' + currAlarm;
    res.send(message);
});

app.post('/upload', upload.single('file'), 
    (req, res) => {
    console.log(req.file);
    currFileName = req.file.filename;
  })

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
  
app.listen(PORT, () => {
console.log(`Server listening on ${PORT}`);
});
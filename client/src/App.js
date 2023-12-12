import './App.css';
import React, { useState, useEffect } from "react";
import Popup from 'react-popup';
import axios from 'axios';

function App() {
  const [currSnooze, setCurrSnooze] = useState(0)
  const [currAlarm, setCurrAlarm] = useState('')
  const [alarmTime, setAlarmTime] = useState('')
  const [snoozeDuration, setSnoozeDuration] = useState(10)
  const [file, setFile] = useState()
  const [tempFileName, setTemp] = useState()
  const [uploadedFile, setUploadedFile] = useState()
  const [currSong, setCurrSong] = useState()

  useEffect(() => {
    axios.get('/all-settings-user')
    .then(response => {
      setSnoozeDuration(response.data.snooze);
      setAlarmTime(response.data.alarm);
      setUploadedFile(response.data.songname);
  })
    .catch(error => console.error('Error fetching result: ', error));
}, []);

  const handleTimeChange = (e) => {
    setCurrAlarm(e.target.value)
  }

  const handleDropdownChange = (e) => {
    setCurrSnooze(Number(e.target.value))
  }

  const handleSongDropdownChange = (e) => {
    setCurrSong(e.target.value)
  }

  const handleSubmit = () => {
    setSnoozeDuration(currSnooze);
    axios.post('/snooze', { snooze: currSnooze })
      .then(function (response) {
        console.log(response.data);
      })
      .catch(function (error) {console.error('Error saving result:', error.response.data)});
  }

  const handleSongSubmit = () => {
    setUploadedFile(currSong);
    axios.post('/song-selection', { song: currSong })
      .then(function (response) {
        console.log(response.data);
      })
      .catch(function (error) {console.error('Error saving result:', error.response.data)});
  }

  const handleSetAlarm = async () => {
    if (!tooSoon()) {
      setAlarmTime(currAlarm)
      axios.post('/alarm', { alarm: currAlarm })
      .then(function (response) {
        console.log(response.data);
      })
      .catch(function (error) {console.error('Error saving result:', error.response.data)});
    } else {
      Popup.alert('Alarm time cannot be in the next 10 minutes!')
    }
  }

  const upload = () => {
    console.log("FORM DATA: " + tempFileName);
    const formData = new FormData()
    formData.append('file', file)
    axios.post('/upload', formData )
    .then(response => console.log("Wav: " + response.data))
    .catch(error => console.error('Error saving result:', error.response.data));
    setUploadedFile(tempFileName);
  }

  function calcTime(time) {
    const timeSplit = time.split(":")
    var hours = parseInt(timeSplit[0])
    var minutes = timeSplit[1]
    var meridian = ''
    if (hours > 12) {
      meridian = 'PM'
      hours -= 12
    } else if (hours < 12) {
      meridian = 'AM'
      hours = hours
      if (hours == 0) {
        hours = 12
      }
    } else {
      meridian = 'PM'
    }
    return hours + ':' + minutes + ' ' + meridian
  }

  const tooSoon = () => {
    if (!currAlarm) {
      return false
    }
    const now = new Date()
    const alarm = new Date(`${now.toDateString()} ${currAlarm}`)
    const minDiff = (alarm - now) / (1000 * 60)
    return minDiff > 0 && minDiff <= 10
  }

  return (
    <div className='page'>
      <Popup />
      <div className='top'>
        <p className='smallText' id='top'>NEXT WAKE UP...</p>
        <p className='biggestText'>{alarmTime ? calcTime(alarmTime) : 'None'}</p>
      </div>
      <div className='cards'>
        <div className='card'>
          <p className='smallText'>ALARM TIME</p>
          <div>
        <input
          type="time"
          id="alarmTime"
          value={currAlarm}
          onChange={handleTimeChange}
        />
      <button onClick={handleSetAlarm}>Set</button>
      </div>
          <p id="alarm">Alarm: <strong>{alarmTime ? calcTime(alarmTime) : "No alarm set!"}</strong></p>
        </div>
        <div className='card'>
          <p className='smallText'>SONG SELECTION</p>
          <input id="wavSelect" type="file" accept='audio/wav' onChange={(e) => {setFile(e.target.files[0]); setTemp(e.target.value.replace(/.*[\/\\]/, ''));}}></input>
          <button type="button" onClick={upload}>Upload</button>
          <select id='songTime' value={currSong} onChange={handleSongDropdownChange}>
          {["MULAN.wav", "HOTTOG~1.wav", "PARTY.wav"].map((value) => (
            <option className='test' key={value} value={value}>
              {value}
            </option>  
          ))}
          </select>
          <button type="submit" onClick={handleSongSubmit}>Set</button>
          <div className='currentSetting'>
          Current song: <strong>{uploadedFile}</strong>
        </div>
        </div>
        <div className='card'>
          <p className='smallText'>SNOOZE DURATION</p>
          <div>
        <select id='snoozeTime' value={currSnooze} onChange={handleDropdownChange}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
            <option className='test' key={value} value={value}>
              {value}
            </option>  
          ))}
        </select> minutes
      <button type="submit" onClick={handleSubmit}>Set</button>
      </div>
        <div className='currentSetting'>
          Snooze duration: <strong>{snoozeDuration} min</strong>
        </div>
        </div>
      </div>
    </div>
  )
}

export default App

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
  startBtn.addEventListener("click", function () {
    startBtn.style.display = "none";
    totalStart = Date.now();
    getPosition();
  });
}

/*Variables holding element for manipulation and listening on events */
let startBtn = document.querySelector("#startBtn");
let contentDiv = document.querySelector("#read");
let gpsTime = document.querySelector("#gps-time");
let callTime = document.querySelector("#call-time");
let writeTime = document.querySelector("#write-time");
let readTime = document.querySelector("#read-time");
let testTime = document.querySelector("#test-time");
let testComp = document.querySelector("#tests-amount");
let totalTime = document.querySelector("#time-total");

/*Variables holding avg and such*/
let avgGps = 0;
let avgCall = 0;
let avgWrite = 0;
let avgRead = 0;
let avgTest = 0;
let timeTotal = 0;

let timeGpsStart;
let timeGpsEnd;
let callStart;
let callEnd;
let writeStart;
let writeEnd;
let readStart;
let readEnd;
let testStart;
let testEnd;
let totalStart;
let totalEnd;

/*Varaibles holding information from or to the API */
let url = "http://api.openweathermap.org/data/2.5/weather?q=karlstad&appid=";
let apiKey = "0a1f28160441e5c001ce09d46c862fxx";
let latitude = "";
let longitude = "";
let completeUrl = "";

/*Variables regarding the file */
var type = window.TEMPORARY;
var size = 5 * 1024 * 1024;
let fileName = "demo.txt";
let jsonObject;
let stringFromFile = "";

/*Controll Variables*/
let timesRun = 0;
let maxTimes = 35;

/*Get the GPS coordinates*/
function getPosition() {
  testStart = Date.now();
  timeGpsStart = Date.now();
  navigator.geolocation.getCurrentPosition(onSuccess, onError, {
    maximumAge: 1,
    timeout: 5000,
    enableHighAccuracy: true,
  });
}

var onSuccess = function (position) {
  latitude = position.coords.latitude;
  longitude = position.coords.longitude;
  timeGpsEnd = Date.now();
  avgGps += timeGpsEnd - timeGpsStart;
  completeUrl =
    "https://api.openweathermap.org/data/2.5/weather?lat=" +
    latitude +
    "&lon=" +
    longitude +
    "&units=metric&appid=" +
    apiKey;
  getWeather();
};

function onError(error) {
  alert("code: " + error.code + "\n" + "message: " + error.message + "\n");
}

/*Get GPS-coordinates ends */

/*Call the API */
function getWeather() {
  callStart = Date.now();
  fetch(completeUrl)
    .then((res) => res.json())
    .then((data) => {
      jsonObject += JSON.stringify(data);
      if (timesRun == 0) {
        callEnd = Date.now();
        avgCall += callEnd - callStart;
        writeStart = Date.now();
        createFile();
      } else {
        callEnd = Date.now();
        avgCall += callEnd - callStart;
        writeStart = Date.now();
        writeFile();
      }
    })
    .catch((err) => {
      throw err;
    });
}
/*Call the API ends */

/*Write to file*/
function createFile() {
  window.requestFileSystem(type, size, successCallback, errorCallback);

  function successCallback(fs) {
    fs.root.getFile(
      fileName,
      { create: true, exclusive: true },
      function (fileEntry) {
        writeFile();
      },
      errorCallback
    );
  }
}

function writeFile() {
  window.requestFileSystem(type, size, successCallback, errorCallback);

  function successCallback(fs) {
    fs.root.getFile(
      fileName,
      {},
      function (fileEntry) {
        fileEntry.createWriter(function (fileWriter) {
          fileWriter.onwriteend = function (e) {
            writeEnd = Date.now();
            avgWrite += writeEnd - writeStart;
            readStart = Date.now();
            readFile();
          };
          fileWriter.onerror = function (e) {
            alert("Write failed: " + e.toString());
          };
          var blob = new Blob([jsonObject], {
            type: "text/plain",
          });
          fileWriter.write(blob);
        }, errorCallback);
      },
      errorCallback
    );
  }
}
/*Write to file ends*/

/*Read from file*/
function readFile() {
  window.requestFileSystem(type, size, successCallback, errorCallback);

  function successCallback(fs) {
    fs.root.getFile(
      fileName,
      {},
      function (fileEntry) {
        fileEntry.file(function (file) {
          var reader = new FileReader();
          reader.onloadend = function (e) {
            stringFromFile += this.result;
            readEnd = Date.now();
            avgRead += readEnd - readStart;
            updateText();
          };
          reader.readAsText(file);
        }, errorCallback);
      },
      errorCallback
    );
  }
}
/*Read from file ends*/

/*Update the text*/
function updateText() {
  timesRun++;

  gpsTime.innerHTML = avgGps / timesRun;
  callTime.innerHTML = avgCall / timesRun;
  writeTime.innerHTML = avgWrite / timesRun;
  readTime.innerHTML = avgRead / timesRun;
  testComp.innerHTML = timesRun;
  contentDiv.innerHTML += stringFromFile;
  totalTime.innerHTML = (Date.now() - totalStart) / 1000;

  testEnd = Date.now();
  avgTest += testEnd - testStart;

  testTime.innerHTML = avgTest / timesRun;

  if (timesRun < maxTimes) {
    getPosition();
  } else {
    totalEnd = Date.now();
    timeTotal = totalEnd - totalStart;
    totalTime.innerHTML = timeTotal / 1000;
  }
}
/*Update the text ends*/

function errorCallback(error) {
  alert("ERROR: " + error.code);
}

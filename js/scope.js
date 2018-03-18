//-----HTML Message-----//
var noteElem = document.getElementById("note");
var pitchElem = document.getElementById("pitch");
var graphElem = document.getElementById("graph");
var listElem = document.getElementById("noteList");
var state = document.getElementById("state");

function error() {
  replaceMessage("<font color=\"red\">disabled</font> (see below for details)");
}

function success() {
  replaceMessage("<font color=\"green\">enabled</font>");
}

function replaceMessage(el) {
  state.innerHTML = state.innerHTML.replace(
    state.innerHTML, "microphone is " + el);
}

//-----Record Audio-----//
var context = new (window.AudioContext || window.webkitAudioContext)();
var analyser = context.createAnalyser();
var frequencyData;

function successCallback(stream) {
  microphone = context.createMediaStreamSource(stream);
  microphone.connect(analyser);

  //yummy feedback
  //microphone.connect(context.destination);

  frequencyData = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(frequencyData);

  success();
}


//-----Configure Mic-----//
navigator.getUserMedia = navigator.getUserMedia ||
navigator.webkitGetUserMedia ||
navigator.mozGetUserMedia;
navigator.getUserMedia({audio:true}, successCallback, error);

var octave;
var cents;
var noteName;

//-----Compile Audio-----//
function compileFreq(frequency) {
  var noteNames = ["A","A#","B","C","C#","D","D#","E","F","F#","G","G#"];
  var linear = Math.log(frequency/440.0) / Math.log(2) + 4.0;
  octave = Math.floor(linear);
  cents = 1200 * (linear - octave);
  var noteNum = Math.floor(cents / 100) % 12;
  cents -= noteNum*100;
  if (cents > 50)
  {
    cents -= 100;
    if (++noteNum > 11) noteNum -= 12;
  }

  noteName = noteNames[noteNum];

  if(noteName != "A" && noteName != "A#" && noteName != "B")
    octave++;

  //cents.toFixed(0);
}

var buflen = 2048;
var buf = new Float32Array(buflen);

var MIN_SAMPLES = 0;  // will be initialized when AudioContext is created.

function autoCorrelate(buf, sampleRate) {
  var SIZE = buf.length;
  var MAX_SAMPLES = Math.floor(SIZE/2);
  var best_offset = -1;
  var best_correlation = 0;
  var rms = 0;
  var foundGoodCorrelation = false;
  var correlations = new Array(MAX_SAMPLES);

  for (var i=0;i<SIZE;i++) {
    var val = buf[i];
    rms += val*val;
  }
  rms = Math.sqrt(rms/SIZE);
  if (rms<0.01) // not enough signal
    return -1;

  var lastCorrelation=1;
  for (var offset = MIN_SAMPLES; offset < MAX_SAMPLES; offset++) {
    var correlation = 0;

    for (var i=0; i<MAX_SAMPLES; i++) {
      correlation += Math.abs((buf[i])-(buf[i+offset]));
    }
    correlation = 1 - (correlation/MAX_SAMPLES);
    correlations[offset] = correlation;
    if ((correlation>0.9) && (correlation > lastCorrelation)) {
      foundGoodCorrelation = true;
      if (correlation > best_correlation) {
        best_correlation = correlation;
        best_offset = offset;
      }
    } 
    else if (foundGoodCorrelation) {
      var shift = (correlations[best_offset+1] - correlations[best_offset-1])/correlations[best_offset];  
      return sampleRate/(best_offset+(8*shift));
    }
    lastCorrelation = correlation;
  }
  if (best_correlation > 0.01)
    return sampleRate/best_offset;

  return -1;
}

function updateUI() {
  analyser.getFloatTimeDomainData(buf);
  pitch = autoCorrelate(buf, context.sampleRate);

  if(pitch > -1) {
    compileFreq(pitch);
    pitchElem.innerText = Math.round(pitch)+"hz";
    var full = noteName+"<sub>"+octave+"</sub>";
    noteElem.innerHTML = full;
    addNote(full);
  }

  // else {
  //   noteElem.innerHTML = "--";
  //   pitchElem.innerText = "----";
  // }

  //prevent flickering by defaulting
  setTimeout(function()
  {
    requestAnimationFrame(updateUI);
  }, 100);
}


//-----Bar Graph-----//
analyser.fftSize = 512;
var bufferLength = analyser.frequencyBinCount;
var dataArray = new Uint8Array(bufferLength);
var canvas = graphElem;
var canvasCtx = canvas.getContext("2d");

var WIDTH = 400;
var HEIGHT = 150;

canvas.width = WIDTH;
canvas.height = HEIGHT;

canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

function draw() {
  drawVisual = requestAnimationFrame(draw);

  analyser.getByteFrequencyData(dataArray);

  //set canvas color
  canvasCtx.fillStyle = "#212121";

  canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

  //shifts the bar *unit* to account for low freq
  var barWidth = (WIDTH / bufferLength) * 2.7;
  var barHeight;
  var x = 0;

  for(var i = 0; i < bufferLength; i++) {
    barHeight = dataArray[i]/2;

    canvasCtx.fillStyle = "rgb("+255+", "+barHeight+", "+i*2+")";
    canvasCtx.fillRect(x, 0, barWidth, barHeight - (HEIGHT / 6));

    x += barWidth + 1;
  }
}


//-----Note List-----//
function addNote(noteString) {
  listElem.innerHTML += " "+noteString;
}

draw();
requestAnimationFrame(updateUI);
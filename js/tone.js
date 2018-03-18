var context, oscillator;
var canPlay = false;

(function init(g) {
  try {
    context = new (g.AudioContext || g.webkitAudioContext);
    oscillator = context.createOscillator();
    oscillator.frequency.value = null;
    oscillator.connect(context.destination);
    oscillator.start(0);
  } 
  catch (e) {
    document.getElementById("warning").innerHTML = "Your browser does not support WebAudio playback"
  }
}(window));

var octave;
var cents;
var noteName;

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
}

$("#frequency").on("input", function() {
  var frequency = document.getElementById("frequency").value;
  document.getElementById("slider").value = frequency;
  update(frequency);
})

function update(frequency) {
  if(frequency > 0 && frequency != null) {
    document.getElementById("frequency").value = frequency;
    compileFreq(frequency);
    document.getElementById("note").value = noteName;
    document.getElementById("octave").value = octave;

    if(canPlay)   
      startOsc(frequency);

    else
      stopOsc();
  }

  else {
    document.getElementById("frequency").value = "";
    document.getElementById("note").value = "-";
    document.getElementById("octave").value = "-";
  }
}

function startOsc(frequency) {
  oscillator.connect(context.destination);
  oscillator.frequency.value = frequency;
}
function stopOsc(){
  oscillator.disconnect(context.destination);
}

function changeWave(wave) {
  oscillator.type = wave;
}

function press()
{
  var freq = document.getElementById("slider").value;

  if(canPlay){
    document.getElementById("play-button").innerHTML = "PLAY";
    canPlay = false;
  }

  else {
    document.getElementById("play-button").innerHTML = "STOP";
    canPlay = true;
  }

  update(freq);
}

$(document).ready(function() {document.getElementById("slider").defaultValue = 262;});
update(262);
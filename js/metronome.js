var canvas = document.getElementById("nome");
var button = document.getElementById("play-button");
var ctx = canvas.getContext("2d");
var radius = canvas.height/2;

var playSound = false;

bpmElem = document.getElementById("bpm");
beatsElem = document.getElementById("beats");

setBPM(120);

beatsElem.value = 4;
var beats = beatsElem.value;

var klack = document.getElementById("klack");
var pop = document.getElementById("pop");

ctx.translate(radius,radius);
radius *= .9;

setInterval(drawNome, 0);

function press() {
	if(playSound) {
		playSound = false;
		button.innerHTML = "PLAY";
	}
	else {
		playSound = true;
		button.innerHTML = "MUTE";
	}
}

function play(audio) {
	if(audio == "klack")
		klack.play();
	else if(audio == "pop") {
		pop.play();
	}
}

function setBPM (beats) {
	if(beats >= 0 && beats <= 400 && beats != null)
	{
		bpm = beats;
		bpmElem.value = bpm;
	}
	else
		bpmElem.value = "";
}

$("#bpm").on("input", function() {
	var bpm = bpmElem.value;
	setBPM(bpm);
})

$("#beats").on("input", function() {
	if(beatsElem.value >= 0 && beatsElem.value != 1 && beatsElem.value != null)
		beats = beatsElem.value;
})

function drawNome () {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	drawFace(ctx, radius);
	drawInvervals(ctx, 10, radius, bpm);

	var now = new Date();
	var time = now.getSeconds() + (now.getMilliseconds()/1000);

	time *= Math.PI/30;
	drawHand(ctx, time, radius*0.02);

	var msInMinute = 60000;
	var msTotal = (now.getSeconds()*1000) + now.getMilliseconds();

	var errorRate = 100;

	if(playSound) {
		if(msTotal % (msInMinute/bpm) < errorRate) {
			if(msTotal % (msInMinute/(bpm/beats)) < errorRate)
				play("pop");
			else
				play("klack");
		}
	}
}

function drawFace(ctx, radius) {
	var grad;
	ctx.beginPath();
	ctx.arc(0, 0, radius, 0, 2*Math.PI);
	ctx.fillStyle = "white";
	ctx.fill();
	grad = ctx.createRadialGradient(0,0,radius*0.9, 0,0,radius*1.05);
	grad.addColorStop(0, "#333");
	grad.addColorStop(0.5, "white");
	grad.addColorStop(1, "#333");
	ctx.strokeStyle = grad;
	ctx.lineWidth = radius*0.1;
	ctx.stroke();
	ctx.beginPath();
	ctx.arc(0, 0, radius*0.05, 0, 2*Math.PI);
	ctx.fillStyle = "#333";
	ctx.fill();
}

function drawInvervals(ctx, length, radius, number) {
	ctx.lineWidth = 2;

	for (var i = number; i >= 0; i--) {

		tempLength = length;

		if(i % beats == 0)
			tempLength *= 2;

		ctx.save();
		ctx.beginPath();
		ctx.translate(0, 0);
		var angle = (i * (360/number)) * Math.PI/180;
		ctx.rotate(angle);
		ctx.translate(0, -radius*0.95);

		ctx.moveTo(0, 0);
		ctx.lineTo(0, tempLength);
		ctx.stroke();
		ctx.closePath();
		ctx.restore();
	}
}

function drawHand (ctx, pos, width) {
	ctx.beginPath();
	ctx.lineWidth = width;
	ctx.lineCap = "round";
	ctx.moveTo(0,0);
	ctx.rotate(pos);
	ctx.lineTo(0, -radius);
	ctx.stroke();
	ctx.rotate(-pos);
}

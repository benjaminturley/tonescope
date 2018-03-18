var ctx = new AudioContext();
var bufferSize = 2 * ctx.sampleRate,
noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate),
output = noiseBuffer.getChannelData(0);

for (var i = 0; i < bufferSize; i++) {
	output[i] = Math.random() * 2 - 1;
}

var whiteNoise = ctx.createBufferSource();
whiteNoise.buffer = noiseBuffer;
whiteNoise.loop = true;
whiteNoise.start(0);

whiteNoise.connect(ctx.destination);
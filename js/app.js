var App = function () {
	// Initializer
	this.audioContext = new AudioContext();
	this.masterVolume = this.audioContext.createGain();

	this.filter = this.audioContext.createBiquadFilter();
	this.filter.type = 'lowpass';
	this.filter.frequency.value = 800;

	this.filterControl = document.createElement('input');
	this.filterControl.type = 'range';
	this.filterControl.min = '0';
	this.filterControl.max = '2500';

	this.masterVolumeControl = document.createElement('input');
	this.masterVolumeControl.type = 'range';
	this.masterVolumeControl.min = '0';
	this.masterVolumeControl.max = '10';

	new this.controlParameter(this.masterVolumeControl, this.masterVolume.gain, 'value', function (a) { return parseInt(a); });
	new this.controlParameter(this.filterControl, this.filter.frequency, 'value', function (a) { return parseInt(a); });

	document.body.appendChild(this.filterControl);
	document.body.appendChild(this.masterVolumeControl);

	this.masterVolume.connect(this.filter);
	this.filter.connect(this.audioContext.destination);
	this.drones = [];
}

App.prototype.controlParameter = function (controller, target, parameterName, converter) {
	var _this = this;
	this.converter = converter || function (x) {return x;};
	target[parameterName] = this.converter(controller.value);

	controller.addEventListener('input', function (e) {
		target[parameterName] = _this.converter(this.value);
	})
}

var OscillatorControlPanel = function () {
	var panel = document.createElement('div');
	panel.classList.add('oscillator');

	var waveTypes = ['sine', 'sawtooth', 'triangle', 'square'];
	var type = document.createElement('select');
	for (var i = 0; i < waveTypes.length; ++i) {
		var opt = document.createElement('option');
		opt.value = waveTypes[i];
		opt.innerHTML = waveTypes[i];
		type.appendChild(opt);
	}

	var frequency = document.createElement('input');
	frequency.setAttribute('type', 'range');
	frequency.setAttribute('min', '50');
	frequency.setAttribute('max', '600');

	var detune = document.createElement('input');
	detune.setAttribute('type', 'range');
	detune.setAttribute('min', '-50');
	detune.setAttribute('max', '50');

	var gain = document.createElement('input');
	gain.setAttribute('type', 'range');
	gain.setAttribute('min', '0');
	gain.setAttribute('max', '10');
	gain.setAttribute('step', '0.01')

	panel.appendChild(type);
	panel.appendChild(frequency);
	panel.appendChild(detune);
	panel.appendChild(gain);

	return {
		el : panel,
		frequency : frequency,
		type : type,
		detune : detune,
		gain : gain
	}
}

App.prototype.DroneUI = function () {
	this.container = document.createElement('div');
	this.osc1Control = new OscillatorControlPanel();

	document.body.appendChild(this.osc1Control.el);
}

var Drone = function (app) {
	this.ui = new app.DroneUI();
	this.ctx = app.audioContext || new AudioContext();

	this.osc1 = this.ctx.createOscillator();
	this.gain = this.ctx.createGain();

	new app.controlParameter(this.ui.osc1Control.frequency, this.osc1.frequency, 'value', function (a) { return parseInt(a); });
	new app.controlParameter(this.ui.osc1Control.type, this.osc1, 'type');
	new app.controlParameter(this.ui.osc1Control.detune, this.osc1.detune, 'value', function (a) { return parseInt(a) });
	new app.controlParameter(this.ui.osc1Control.gain, this.gain.gain, 'value', function (a) { return parseInt(a) });
	
	this.osc1.connect(this.gain);
	this.gain.connect(app.masterVolume);
	this.osc1.start(0);
}

App.prototype.addDrone = function () {
	this.drones.push(new Drone(this));
}

window.APP = window.APP || new App();

window.addEventListener('keyup', function (e) {
	if (e.keyCode === 68) {
		APP.addDrone();
	}
})
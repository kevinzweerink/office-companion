var App = function () {
	// Initializer
	this.audioContext = new AudioContext();
	this.masterVolume = this.audioContext.createGain();

	this.filter = this.audioContext.createBiquadFilter();
	this.filter.type = 'lowpass';
	this.filter.frequency.value = 10000;

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

	panel.appendChild(type);
	panel.appendChild(frequency);
	panel.appendChild(detune);

	return {
		el : panel,
		frequency : frequency,
		type : type,
		detune : detune
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
	new app.controlParameter(this.ui.osc1Control.frequency, this.osc1.frequency, 'value', function (a) { return parseInt(a); });
	new app.controlParameter(this.ui.osc1Control.type, this.osc1, 'type');
	new app.controlParameter(this.ui.osc1Control.detune, this.osc1.detune, 'value', function (a) { return parseInt(a) });

	this.osc1.connect(app.masterVolume);
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
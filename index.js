const Tank = require('./lib/tankutility').TankUtilityAPI;
var Service, Characteristic;

module.exports = function (homebridge) {
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;
	homebridge.registerAccessory("homebridge-tank-utility", "TankUtility", TankUtilityAccessory);
}

function TankUtilityAccessory(log, config) {
	// Get data from the config file
	this.name = config["name"];
	this.username = config["username"];
	this.password = config["password"];

	// Configure the Tank Utility API
	this.tankAPI = new Tank(this.username, this.password, log);
	this.tankAPI.getDevices();

	// Setup the service
	this.propaneService = new Service.HumiditySensor(this.name);
	this.propaneService
		.getCharacteristic(Characteristic.CurrentRelativeHumidity)
		.on('get', this.getState.bind(this));

	// Additional info about the service
	this.informationService = new Service.AccessoryInformation();
	this.informationService
		.setCharacteristic(Characteristic.Manufacturer, "Tank Utility")
		.setCharacteristic(Characteristic.SerialNumber, "000-000-00")
		.setCharacteristic(Characteristic.Model, "WiFi Propane Gauge");
}

TankUtilityAccessory.prototype.getState = function (callback) {
	var tankAPI = this.tankAPI;

	// Get the propane level, setting the value using the callback
	this.tankAPI.getPropaneLevel(function () {
		callback(null, tankAPI.level);
	});
}

TankUtilityAccessory.prototype.getServices = function () {
	return [this.informationService, this.propaneService];
}
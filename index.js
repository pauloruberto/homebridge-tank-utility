var Service, Characteristic;

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-tank-utility", "TankUtility", TankUtilityAccessory);
}

function TankUtilityAccessory(log, config) {
  this.log = log;

  // Get data from the config file
  this.name = config["name"];

  // Setup the service
  this.service = new Service.HumiditySensor(this.name);
  this.service
      .getCharacteristic(Characteristic.CurrentRelativeHumidity)
      .on('get', this.getState.bind(this));
}

HumidityFileAccessory.prototype.getState = function(callback) {
  callback(null, parseFloat("57.5"));
}

HumidityFileAccessory.prototype.getServices = function() {
  return [this.service];
}

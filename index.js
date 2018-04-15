const request = require('request')
var Service, Characteristic;

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-tank-utility", "TankUtility", TankUtilityAccessory);
}

var token = "default";
var devices = [];
var level = 0;

/* Get the TankUtility access token for the provided credentials. */
function getToken(username, password, log) {

  var options = {
      url: 'https://data.tankutility.com/api/getToken',
      auth: {
        user: username,
        password: password
      }
  }

  // Resolve the promise once we return
  return new Promise(resolve => {
    request(options, function (err, res, body) {
        if (err) {
          console.dir(err)
          return
        }

        let json = JSON.parse(body);
        error = json["error"];
        token = json["token"];
        log("Acquired API token.");

        if(error == "invalid credentials"){
          log("Invalid credentials provided. Please check your username and password in the config file.");
        }

        resolve();
      });
  });
}

/* Get the TankUtility devices. */
async function getDevices(username, password, log) {
  // Wait until the token has been acquired before continuing
  const t = await getToken(username, password, log);
  const url = "https://data.tankutility.com/api/devices?token=" + token;

  if(token != "default"){
    request.get(url, function (error, response, body) {
        let json = JSON.parse(body);
        devices = json["devices"];
        log("Discovered Devices: " + body);
    });
  }
}

/* Get the propane level for the associated device. */
async function getPropaneLevel(device, callback) {
  const url = "https://data.tankutility.com/api/devices/" + device + "?token=" + token;

  if(token != "default"){
    request.get(url, function (error, response, body) {
        let json = JSON.parse(body);

        let device = json["device"];
        let lastReading = device["lastReading"];
        level = lastReading["tank"];

        // Callback to actually set the value
        callback();
    });
  }
}

function TankUtilityAccessory(log, config) {
  this.log = log;

  // Get data from the config file
  this.name = config["name"];
  this.username = config["username"];
  this.password = config["password"];

  // Discover TankUtility devices
  getDevices(this.username, this.password, this.log);

  // Setup the service
  this.service = new Service.HumiditySensor(this.name);
  this.service
      .getCharacteristic(Characteristic.CurrentRelativeHumidity)
      .on('get', this.getState.bind(this));
}

TankUtilityAccessory.prototype.getState = function(callback) {
  // Get the propane level, actually setting the value using the callback
  getPropaneLevel(devices[0], function() {callback(null, level);});
}

TankUtilityAccessory.prototype.getServices = function() {
  return [this.service];
}

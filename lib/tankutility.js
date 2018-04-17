const request = require('request')

class TankUtilityAPI {

	/* Create a new occurance of the TankUtilityAPI */
	constructor(username, password, log) {
		this.username = username;
		this.password = password;
		this.log = log;

		this.devices = [];
		this.level = 0;
		this.readTime = 0;
		this.token = null;
		this.credentials_valid = true;
	}

	/* Get the TankUtility access token for the provided credentials. */
	getToken() {
		const api = this;

		var options = {
			url: 'https://data.tankutility.com/api/getToken',
			auth: {
				user: api.username,
				password: api.password
			}
		}

		// Resolve the promise once we return
		return new Promise(resolve => {
			request(options, function (error, response, body) {
				if (error) {
					api.log("An unexpected error has occured: " + error);
					api.token = null;
					resolve();
					return
				}

				let json = JSON.parse(body);

				if (json["error"] == "invalid credentials") {
					api.log("** WARNING ** Invalid credentials provided, check username and password in config.json");
					api.credentials_valid = false;
					api.token = null;
					resolve();
					return
				}

				api.token = json["token"];
				api.log("Acquired API token.");
				resolve();
			});
		});
	}

	/* Get the TankUtility devices. */
	async getDevices() {
		const api = this;

		// Wait until the token has been acquired before continuing
		const t = await api.getToken();
		const url = "https://data.tankutility.com/api/devices?token=" + api.token;

		if (api.credentials_valid) {
			request.get(url, function (error, response, body) {
				if (error) {
					api.log("An unexpected error has occured: " + error);
					return
				}

				let json = JSON.parse(body);
				let statusCode = json["statusCode"];

				if (statusCode) {
					api.handleStatusCode(statusCode);
					return;
				}

				api.devices = json["devices"];
				api.log("Discovered " + api.devices.length + " devices.");
			});
		}
	}

	/* Get the propane level for the associated device. */
	async getPropaneLevel(callback) {
		const api = this;

		// Ensure that valid credentials have been provided
		if (!api.credentials_valid) {
			callback();
			return;
		}

		// Ensure that a valid token is held
		if (api.token == null) {
			const t = await api.getToken();
		}

		const url = "https://data.tankutility.com/api/devices/" + api.devices[0] + "?token=" + api.token;

		request.get(url, function (error, response, body) {
			if (error) {
				api.log("An unexpected error has occured: " + error);
				return
			}

			let json = JSON.parse(body);
			let statusCode = json["statusCode"];

			if (statusCode) {
				api.handleStatusCode(statusCode);
				return;
			}

			let device = json["device"];
			let lastReading = device["lastReading"];

			// Check if a new reading has occured
			if (api.readTime != lastReading["time_iso"]) {
				api.level = lastReading["tank"];
				api.readTime = lastReading["time_iso"];
				api.log(device["name"] + " updated the tank level to " + api.level + " at " + api.readTime);
			}

			api.log.debug("DEBUG: Acquired tank level for " + device["name"] + ": " + api.level);

			// Callback to set the value within HomeKit
			callback();
		});
	}

	/* Handle the status code provided. */
	handleStatusCode(statusCode) {
		switch (statusCode) {
			case 400:
				this.log("API Error 400: Bad Request");
				break;

			case 401:
				this.log("Invalid API key, fetching a new one.");
				this.token = null;
				this.getToken();
				break;

			case 403:
				this.log("API Error 403: The device requested is not assigned to your account");
				break;

			case 404:
				this.log("API Error 404: The specified device could not be found.");
				break;

			case 405:
				this.log("API error 405: Method Not Allowed");
				break;

			case 406:
				this.log("API error 406: Not Acceptable");
				break;

			case 410:
				this.log("API error 410: The requested tank has been removed from the server. Please restart HomeBridge.");
				break;

			case 429:
				this.log("API error 429: Too many requests!");
				break;

			case 500:
				this.log("API error 500: There is a problem with the Tank Utility server. Try again later.");
				break;

			case 503:
				this.log("API error 503: Tank Utility servers are down for maintanance. Try again later.");
				break;

			default:
				this.log("An unexpected error occured. Please report the following status code: " + statusCode);
		}
	}
}

module.exports = {
	TankUtilityAPI: TankUtilityAPI
};
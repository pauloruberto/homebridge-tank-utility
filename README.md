# homebridge-tank-utility

<img src="https://i.imgur.com/NoovT90.png" align="center" alt="Logos">

This plugin allows you to view your TankUtility propane level within HomeKit. The level is exposed as a Humidity sensor, allowing you to view the percentage from 0-100.

## Prerequisites
Before installing homebridge-tank-utility, make sure that you have succesfully installed [Homebridge](https://github.com/nfarina/homebridge#installation).

## Installing
`npm install -g homebridge-tank-utility`

## Updating
`npm update -g homebridge-tank-utility`

## Sample Config
Simply enter your username and password used to log into the [TankUtility portal](https://app.tankutility.com/#!/login).
```js
"accessories": [{
  "accessory": "TankUtility",
  "name": "TankUtility",
  "username": "your_username",
  "password": "your_account_password"
}]
```

## Acknowledgments
* Thanks to the folks over at TankUtility for exposing the [API](http://apidocs.tankutility.com) that lets this happen

# Bridges

Bridges are [modules](modules.md) that allow IOTDB to connect to Things, to actually
make them do things / get readings.

## Use

If you want to use a Bridge, just `use` it

    const iotdb = require("iotdb")
    iotdb.use("homestar-wemo")

and it will import the module. After you&apos;ve imported the module, you can then connect
to _Models_, which will get you access to the individual things. 

    const things = iotdb.connect("WeMoSwitch")

# Available Bridges
## Class A - Working, use me

### [homestar-ble](https://github.com/dpjanes/homestar-ble)

Control and monitor [Bluetooth Low Energy](https://en.wikipedia.org/wiki/Bluetooth_low_energy) devices.

### [homestar-denon-avr](https://github.com/dpjanes/homestar-denon-avr)

Control [Denon Audio Visual Receivers](https://usa.denon.com/us/product/hometheater/receivers)

### [homestar-feed](https://github.com/dpjanes/homestar-feed)

Get data from Atom / RSS feeds.

### [homestar-ifttt](https://github.com/dpjanes/homestar-ifttt)

Send commands to [IFTTT](https://ifttt.com/), receive messages from IFTTT. Uses the Maker channel.

### [homestar-johnny-five](https://github.com/dpjanes/homestar-johnny-five)

Control and monitor Arduino devices using Firmata / Johnny-Five.

### [homestar-hue](https://github.com/dpjanes/homestar-hue)

Control [Philip Hue](http://www2.meethue.com/en-ca/) Lights

### [homestar-itach-ir](https://github.com/dpjanes/homestar-itach-ir)

Control IR Devices using [iTach IR](http://www.globalcache.com/products/itach/wf2irspecs/) controller

### [homestar-knx](https://github.com/dpjanes/homestar-knx)

Control [KNX](https://en.wikipedia.org/wiki/KNX_(standard)) devices. 

### [homestar-lifx](https://github.com/dpjanes/homestar-lifx)

Control [LIFX](http://www.lifx.com/) Lights

### [homestar-metar](https://github.com/dpjanes/homestar-metar)

Pull [METAR](https://en.wikipedia.org/wiki/METAR) weather observations from around the globe.
This can generate quite a bit of test data if you need it.

### [homestar-openweathermap](https://github.com/dpjanes/homestar-openweathermap)

Get [OpenWeatherMap](http://openweathermap.org/) current weather observation and forecasts.

### [homestar-lg-smart-tv](https://github.com/dpjanes/homestar-lg-smart-tv)

Control [LG Smart TVs](http://www.lg.com/us/experience-tvs/smart-tv).

### [homestar-nest](https://github.com/dpjanes/homestar-nest)

Control Google [Nest](https://nest.com/ca/) devices.

### [homestar-particle](https://github.com/dpjanes/homestar-particle)

Control [Particle.io](https://www.particle.io/) boards.

### [homestar-rest](https://github.com/dpjanes/homestar-rest)

Control via HTTP REST APIs.

### [homestar-runner](https://github.com/dpjanes/homestar-runner)

Monitor the status of an IOTDB or Home☆Star installation itself.
Very reflexive!

### [homestar-smartthings](https://github.com/dpjanes/homestar-smartthings)

Control Samsung [SmartThings](https://www.smartthings.com/) devices. 

### [homestar-tcp](https://github.com/dpjanes/homestar-tcp)

Control [TCP Connnected](http://www.tcpi.com/) Lights.

### [homestar-wemo](https://github.com/dpjanes/homestar-wemo)

Control Belkin [WeMo](http://www.wemo.com/) Switches and other devices.

Although we&apos;ve put this as Class A, some of the odder devices - e.g. Crockpot -
have not been tested yet.

## Class B - Working, but may have gaps

### [homestar-chromecast](https://github.com/dpjanes/homestar-chromecast)

Control [Google Chromecast](https://www.google.com/intl/en_ca/chromecast/?utm_source=chromecast.com).

This works OK but some of the underlying node modules are flaky.

### [homestar-command](https://github.com/dpjanes/homestar-command)

Control Node.JS code or Shell commands.
This works, but it would be nice for them to be able to do things like
send back data.

### [homestar-samsung-smart-tv](https://github.com/dpjanes/homestar-samsung-smart-tv)

## Class C - Need a lot of TLC

### [homestar-null](https://github.com/dpjanes/homestar-null)
### [homestar-littlebits](https://github.com/dpjanes/homestar-littlebits)
### [homestar-sonos](https://github.com/dpjanes/homestar-sonos)

## Class D - Stubs or Not Working

### [homestar-alexa](https://github.com/dpjanes/homestar-alexa)

This was the code for this 
[https://www.hackster.io/dpjanes/home-star-aws-iot-amazon-echo-07319c](https://www.hackster.io/dpjanes/home-star-aws-iot-amazon-echo-07319c).
Not actively maintained, something better coming soon.

### [homestar-coap](https://github.com/dpjanes/homestar-coap)
### [homestar-ecobee](https://github.com/dpjanes/homestar-ecobee)
### [homestar-insteon](https://github.com/dpjanes/homestar-insteon)
### [homestar-plugfest](https://github.com/dpjanes/homestar-plugfest)
### [homestar-squeezebox](https://github.com/dpjanes/homestar-squeezebox)
### [homestar-wink](https://github.com/dpjanes/homestar-wink)

-------------

### [homestar-gpio](https://github.com/dpjanes/homestar-gpio)

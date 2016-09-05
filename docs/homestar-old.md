# Home☆Star

# About

Home☆Star is three things:

* it's the command line management utilities for [IOTDB](https://github.com/dpjanes/node-iotdb)
* it makes a web interface / API to your Things (if you want it)
* it's a naming convention for all IOTDB Bridges, e.g. homestae-hue

To find out more

* [Read about Home☆Star](https://github.com/dpjanes/node-iotdb/blob/master/docs/homestar.md)
* [Read about installing Home☆Star](https://github.com/dpjanes/node-iotdb/blob/master/docs/homestar.md) 

# Installation and Configuration

TL;DR:

    $ npm install -g homestar    ## may require sudo
    $ homestar setup

# Use

Code to set all lights to red:

    const iotdb = require("iotdb")
    iotdb.use("homestar-hue");

    iotdb.connect("HueLight").set(":color", "red");

## What is it?

<img src="https://raw.githubusercontent.com/dpjanes/iotdb-homestar/master/docs/HomeStar.png" align="right" />

IOTDB / Home☆Star is an Open Source IoT Platform / API in Node.JS. I'd tell you it's the _best_ IoT Platform, but I hope you can discover this for yourself.

IOTDB makes it _really_ easy to script / monitor the Internet of Things. 
Really easy. Like super easy.

Home☆Star is the interface bit. Home☆Star makes web pages, APIs, "cookbooks" and controls access to IOTDB running on a particular machine.
It also provides the command line interface for configuring IOTDB.

## What does it work with? 

Well potentially: anything.

Currently, WeMos of all sorts, Philips Hue Lights, TCP Lighting, Pins on your Raspberry Pi, Bluetooth Low Energy thingies, Sonos, Chromecasts, LittleBits, LG TVs, Denon AVRs, and more….

## What does it run on?

Anything that Node.JS runs on.

We develop on Mac and test on Raspberry Pis, Linux boxes and Intel Edisons (so far). 
The Home☆Star project also presents an API on your LAN, so you don't necessarily have to use Node.JS to work with IOTDB.

## IOTDB v. Home☆Star

* **Home☆Star** is the "management" part - it handles the HTML user interface, presenting the RESTful API, hooking into notifications systems like MQTT or FireBase, and installing and configuring IOTDB related modules.
* **IOTDB** is the "core" - it's a small Node.JS library that orchestrates making all your different things work together.

## What's the Clever Bit?

There's a lot of neat ideas that have gone into IOTDB - we'll get to them elsewhere in this documentation. But the foremost: **we don't need to have an "IoT Standard" if we can systematically describe what Things actually do**.

In other words, IOTDB implements a **Semantic Metastandard**.

Still confused? Consider the following:

* I can turn on and off the lights
* I can turn on and off the stove
* I can turn on and off the heating
* I can turn on and off a hair dryer

There's a common concept here: "I can turn Thing X on or off". 
IOTDB says "hey, let's do all the hard bits in code so the end programmer only has to do":

	thing.set(":on", true);
	
or 

	thing.set(":on", false);
	
<i>Aside: <code>":on"</code> is a shorthand for "the universal concept of turning a Thing on or off". You can see the formal definition here:
[iot-purpose:on](https://iotdb.org/pub/iot-purpose.html#on)</i>.

Here's another example, of doing the _same_ action to different Things:

* I can change the color of a Philips Hue Light to "red"
* I can change the color of a LIFX Light to "red"
* I can change the color of a RGB LED to "red".

A programmer using IOTDB only has to do…

	thing.set(":color", "red")
	
…to make this happen. 

Of course, _something_ actually has to do the work. 
IOTDB manages this all behind the scenes in something called a **Bridge**, which provides a standard way of discovering, configuring and manipulating Things. 
Normally as a programmer you do not have to worry about how Bridges work, unless you're adding a new type of Thing to IOTDB.


## What does it look like?

IOTDB looks like any other Node.JS program! 

The Home☆Star user interface is brought up by this command…

    $ homestar runner | homestar pretty

…and it opens a web page that looks like this:

<p><img src="https://github.com/dpjanes/iotdb-homestar/blob/master/docs/HomeStar-Cookbooks.png" />

<p><img src="https://github.com/dpjanes/iotdb-homestar/blob/master/docs/HomeStar-Things.png" />

Home☆Star also presents an API that you can see by navigating to:

	http://<local-ip>:11802/api

## Installation

### Install Node.JS

You'll need to have Node.JS installed on your computer.
I can't help you there, see http://nodejs.org/download/

There is an assumption here you know Node.JS at least a little bit!
If you don't, it's not too difficult to get going with it.

### Install Home☆Star

    $ sudo npm install -g homestar
    $ homestar setup

As it's running, you'll see that it identifies your current location (based on IP) and sets up a few UUIDs.

After it finishes, note:

* the folder <code>./node_modules</code> contains a number of <code>iotdb*</code> modules
* the folder <code>./.iotdb</code> has a file <code>./.iotdb/keystore.json</code> in it - have a look at it! You should see some familiar data

### Install some modules

Home☆Star by itself does very little. 
To make it do something useful, you have to install "modules", which are basically just plug-ins.

The most common modules are **Bridges** which - as you know from above - encapsulate how to talk to some Thing or another.

Here's how you make your Home☆Star / IOTDB installation talk to WeMos.

	$ homestar install homestar-wemo
	
Need to talk to something else? See [docs/modules.md](docs/modules.md) for a list of current modules.

### Run your first IOTDB program

Create a program <code>wemo.js</code> with the following contents:

	iotdb = require('iotdb')
	iot = iotdb.iot()
	things = iot.connect()
	things.set(':on', true)
	
Run it as follows

	$ node wemo.js
	
And _voila_, all your WeMo Sockets will turn on.

### Wah, I don't have a WeMo Socket!

Every one of our modules project on GitHub has a <code>samples</code> folder. 
You'll especially want to look at samples with <code>iotdb</code> in the name (the other samples are for "stand-alone" projects).

Here's your links - go explore!

* [homestar-ble](https://github.com/dpjanes/homestar-ble)
* [homestar-chromecast](https://github.com/dpjanes/homestar-chromecast)
* [homestar-denon-avr](https://github.com/dpjanes/homestar-denon-avr)
* [homestar-feed](https://github.com/dpjanes/homestar-feed)
* [homestar-gpio](https://github.com/dpjanes/homestar-gpio)
* [homestar-hue](https://github.com/dpjanes/homestar-hue)
* [homestar-lg-smart-tv](https://github.com/dpjanes/homestar-lg-smart-tv)
* [homestar-lifx](https://github.com/dpjanes/homestar-lifx)
* [homestar-littlebits](https://github.com/dpjanes/homestar-littlebits)
* [homestar-null](https://github.com/dpjanes/homestar-null)
* [homestar-rest](https://github.com/dpjanes/homestar-rest)
* [homestar-smart-things](https://github.com/dpjanes/homestar-smart-things)
* [homestar-sonos](https://github.com/dpjanes/homestar-sonos)
* [homestar-tcp](https://github.com/dpjanes/homestar-tcp)
* [homestar-wemo](https://github.com/dpjanes/homestar-wemo)
* [homestar-wink](https://github.com/dpjanes/homestar-wink)

Remember you can install any of these by <code>homestar install [name]</code>!



## More
### Architecture

Here's the architecture of a typical IOTDB program:


	+----------------+
	| Your Code      |
	+----------------+
	| Thing Arrays   |
	+----------------+
	| Thing          |
	+----------------+
	| Model          |
	+----------------+
	| Bridge         |
	+----------------+
	| Native Code    |
	+----------------+
	

* Your Code: as per above, e.g. <code>thing.set(":on", false)</code>
* Thing Arrays: handles deferred operations
* Thing: manages ID and Bands for an individual Thing
* Model: maps semantic operations (":on" → false) to what the Bridge actually does (maybe e.g. "power=0")
* Bridge: handles discovery and configuration. When Things are actually discovered, it handles moving the "istate" of data into IOTDB and the "ostate" of data to the actual Thing. The "istate" is the "actual" state of a Thing, the "ostate" is what we want it to be.
* Native Code: typically, a Node.JS library

When working with Transporters the stack looks like this:


	+----------------+
	| Native Code    |
	+----------------+
	| Other Trans.   |
	+----------------+
	| IOTDB Trans.   |
	+----------------+
	| Thing Arrays   |
	+----------------+
	| Thing          |
	+----------------+
	| Model          |
	+----------------+
	| Bridge         |
	+----------------+
	| Native Code    |
	+----------------+


Where the top "Native Code" is HTML, MQTT, FireBase, a database and so forth. If this isn't clear, don't worry about it. 
Home☆Star handles this for most instances where you'll need this. 

### Other concepts

Here's a few other interesting concepts from IOTDB. 

* **Bridge** - a standard way of interfacing to Things in Node.JS. Actually works mostly independently of IOTDB and can be used stand-alone.
* **Deferred Operations** - Node.JS typically uses lots of callbacks: you wait for something to be ready, get a notification, then do stuff. In IOTDB you typically say "do this operation" and when the Thing becomes available it is then performed.
* **Transporters** - a lot of really common and useful operations can done simply by modelling it by moving band data around. For example, Home☆Star's HTML interface is made by a "HTML Transporter" being connected to a "IOTDB Transporter".
* **Stores** - (a work in progress) a variation of Transporters that moves data in bulk to a data store
* **Transmogrifiers** - (a work in progress) we can e.g. make a Fahrenheit temperature sensor look like a Celsius one, so as a programmer you don't have to worry about incompatible data sets.


## Contributing

### 

## Additional Documentation

### Read these three in order

* [Install Instructions](docs/install.md)
* [Adding new IOTDB Modules](docs/modules.md) - to support your particular devices
* [Configuration](docs/configure.md) - customizing to your need

### Additional

* [Module Management](docs/command-install.md) - technical details
* Discuss [https://plus.google.com/communities/108112460238486371606](https://plus.google.com/communities/108112460238486371606)

### Updates

* [IOTDB 0.6.X](docs/IOTDB-0.6.md) - what's changed

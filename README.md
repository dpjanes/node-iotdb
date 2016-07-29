# node-iotdb

<img src="https://raw.githubusercontent.com/dpjanes/iotdb-homestar/master/docs/HomeStar.png" align="right" />

A Node.JS platform for semantically control all your Things. 
100% test coverage.

## Hello, World

### Install IOTDB

	$ npm install iotdb
	

### Turn WeMo on or off

	const iotdb = require("iotdb");
	
	things = iotdb.connect("WeMoSocket");
	things.set(":on", true)
	things.set(":on", false)
	
N.B. 
* <code>:on</code> is the "semantic" term that universally means "turn/is something on or off". It expands to <code>iot-purpose:on</code> which in turn expands to the URL <code>https://iotdb.org/pub/iot-purpose#on</code>.

### Wait for a WeMo to change state

	const iotdb = require("iotdb");
	
	things = iotdb.connect("WeMoSocket");
	things.on("istate", thing => {
		console.log("istate", thing.state("istate"));
		console.log("on", thing.get(":on"));
	})

N.B. 
* <code>istate</code> is the actual current state of the Thing. In IOTDB a Thing may have many states associated with it, called <i>bands</i>.

## What do we mean by Semantics?


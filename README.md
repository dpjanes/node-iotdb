# node-iotdb

<img src="https://raw.githubusercontent.com/dpjanes/iotdb-homestar/master/docs/HomeStar.png" align="right" />

A Node.JS platform for semantically control all your Things. 
100% test coverage.

**Node.JS 6 or higher is required!**

# Hello, World

## Install IOTDB

	$ npm install iotdb
	
## Turn WeMo on or off

	const iotdb = require("iotdb");
    iotdb.use("homestar-wemo");
	
	things = iotdb.connect("WeMoSocket");
	things.set(":on", true)
	things.set(":on", false)
	
N.B. 
* you must have installed the NPM package <code>homestar-wemo</code>
* <code>:on</code> is the "semantic" term that universally means "turn/is something on or off". It expands to <code>iot-purpose:on</code> which in turn expands to the URL <code>https://iotdb.org/pub/iot-purpose#on</code>.

## Wait for a WeMo to change state

	const iotdb = require("iotdb");
    iotdb.use("homestar-wemo");
	
	things = iotdb.connect("WeMoSocket");
	things.on("istate", thing => {
		console.log("istate", thing.state("istate"));
		console.log("on", thing.get(":on"));
	})

N.B. 
* <code>istate</code> is the actual current state of the Thing. In IOTDB a Thing may have many states associated with it, called <i>bands</i>.

# Documentation

We are in the process of collecting all the documents into this project. 

Start here:
* [https://github.com/dpjanes/node-iotdb/tree/master/docs](https://github.com/dpjanes/node-iotdb/tree/master/docs)

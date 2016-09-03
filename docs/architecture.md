# Architecture

Here&apos;s the architecture of a typical IOTDB program:

	+----------------+
	| Your Code      |
	+----------------+
	| ThingSet       | node-iotdb/thing_set.js
	+----------------+
	| Thing          | iotdb-thing/thing.s
	+----------------+
	| ThingManager   | node-iotdb/thing_manager.js
	+----------------+
	| Bridge         | homestar-*/*Bridge.js
	+----------------+
	| Native Code    |
	+----------------+
	
## Your Code

    const iotdb = require("iotdb")
    iotdb.use("homestar-wemo")

    const things = iotdb.connect("WeMoSocket")
    things.set(":on", true);

## ThingSet

A ThingSet manages many Things at once. 
The 'clever' bit about ThingSet is that it *defers* commands.
For example, when you do 

    thing.set(":on", true)

It&apos;s almost certain **that the WeMo Socket has not been discovered yet**.
The ThingSet will issue the command once the Thing has been discovered.

ThingSets can chain creation and can filter for specific results.

    iotdb
        .connect("WeMoSocket")
        .connect("WeMoInsight")
        .with_zone("David's Living Room")

See the [source code here](https://github.com/dpjanes/node-iotdb/blob/master/thing_set.js)
for more operations.

## Thing

## ThingManager

## Bridge

## Native Code

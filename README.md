Node-IOTDB
=
The Internet of Things Database

**THIS IS BEING OVERHAULED: BACK 2015-03**

IOTDB provides an open way of describing Things, Sensors ... 
Internet of Things devices ... semantically.

What do we mean by "semantically"? 
Your TV can be turned on and off. 
A Hue Lightbulb cab be turned on and off.
Your toaster can be turned on and off.

Even though the _mechanism_ for turning these things on and off
are entirely different, the concept is the same. IOTDB gives this a standard name
[iot-attribute:on](https://iotdb.org/pub/iot-attribute.html#on). 

IOTDB is (mostly) language independent. To demo the power
of semantic concepts, we've created Node-IOTDB.
Node-IOTDB is a Node package that makes it very easy to control and monitor the Internet of Things. 
We've tested with devices such WeMos, Hues, Electric Imps, Arduinos, and so forth.

For example, to turn off all the toasters (!) using Node IOTDB

    iot
        .things()
        .with_tag(":appliance.toaster")
        .set(":on", false)

Or just turn off everything

    iot
        .things()
        .set(":on", false)

To get started, read the documentation here

[https://iotdb.org/docs/node/getting-started](https://iotdb.org/docs/node/getting-started)

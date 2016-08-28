# Thing

The Module [iotdb-thing](https://github.com/dpjanes/iotdb-thing) is 
the API for implementing a Thing.
It is based around the concept of [bands](bands.md) and
understands how to _semantically_ manipulate the `istate` and `ostate`
bands using the Thing&apos;s Model in the `model` band.

# Creation

For the most part, Thing objects will be created for you and you just
manipulate them as per below.

## IOTDB

In this example, `things` will be populated with the various 
WeMo things as they are found.

    const iotdb = require("iotdb")
    iotdb.use("homestar-wemo")

    iotdb.connect("WeMoSocket")
    iotdb.connect("WeMoInsight")

    const things = iotdb.things()


## Standalone

You can just create Thing objects from band data:

    const thing_maker = require("iotdb-thing").thing;
    const thing_1 = thing_maker.make()
    const thing_2 = thing_maker.make({
        "model": …,
        "meta": …,
        "istate": …,
        "ostate": …,
        "connection": …,
    });

# Working with Data

## Bands

### ostate

The **ostate** is used to manipulate a thing - it&apos;s the **output state**.

get the ostate

    const ostate_1 = thing_1.band("ostate");

see the current values 

    const d = ostate_1.state();

set a value semantically

    const promise = ostate_1.set(":on", true);

set a value non-semantically

    const promise = ostate_1.set("power", true);

change a whole bunch of values (non-semantic). Note that
`update` is always non-semantic, it&apos;s dealing the raw underlying data.

    const promise = ostate_1.update({
        "power": true,
        "level": 50,
    })

### istate

The **istate** is used to current the current readings from a thing - it&apos;s the **input state**.

Get the istate object

    const istate_1 = thing_1.band("istate");

See the current values 

    const d = istate_1.state();

Get a particular value semantically. `first` and `list`
guarentee a non-array or an array respectively, `get`
just returns what is there

    const is_on_get = istate_1.get(":on")
    const is_on_first = istate_1.first(":on")
    const is_on_list = istate_1.list(":on")

Get a particular value non-semantically

    const is_on_get = istate_1.get("powered")
    const is_on_first = istate_1.first("powered")
    const is_on_list = istate_1.list("powered")

Listen for a change semantically

    istate_1.on(":on", function(_thing, _band, _new_value) {
    });

Listen for a change non-semantically

    istate_1.on("powered", function(_thing, _band, _new_value) {
    });

## Paramaterized Data

Because we have a strong idea of data types, you can parameterize
values being passed into things; and you can coerce output values.

### Helper functions parametization

    ostate_1.set("level", 50, iotdb.as.percent());
    ostate_1.set("level", .5, iotdb.as.unit());
    ostate_1.set("temperature", 22, iotdb.as.celsius());

### Coercing output value

    istate_1.get("temperature", iotdb.as.celsius());

### Getting type definitions

This will return a semantic description describing this 
particular **attribute** of the Thing.

    thing_1.attribute("temperature")

or with a coercion

    thing_1.attribute("temperature", iotdb.as.celsius());


# Installation

## Easy Way

Do:

    $ npm install iotdb
    $ npm install homestar-wemo

Then:

    const iotdb = require("iotdb")
    iotdb.use("homestar-wemo")

    const things = iotdb.connect("WeMoSocket")
    things.set(":on", true);

## HomeStar Way

Optional. This gives you some CLI tools for managing your installation,
and allows certain [Bridges](./bridges.md) to automatically `use`d.

See the [documentation here](./homestar.md).

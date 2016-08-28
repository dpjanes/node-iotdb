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

    $ npm install -g homestar ## may require sudo
    $ homestar setup

This will create the following:

    * `boot/index.js` - sample code
    * `.iotdb/keystore.json` - settings

It will also install `iotdb` and some other useful modules.
If you install using HomeStar:

    $ homestar install homestar-wemo

Then you don&apos;t need to do `use()`:

    const iotdb = require("iotdb")

    const things = iotdb.connect("WeMoSocket")
    things.set(":on", true);

It does this by adding the following configuration
to `.iotdb/keystore.json`:

    {
        "modules": {
            "homestar-wemo": "/Users/davidjanes/iotdb/iot/homestar-wemo"
        }
    }



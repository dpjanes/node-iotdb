# Home☆Star

Home☆Star is three things:

* it&apos;s the command line management utilities for [IOTDB](https://github.com/dpjanes/node-iotdb)
* it makes a web interface / API to your Things (if you want it)
* it&apos;s a naming convention for all IOTDB Bridges, e.g. `homestae-hue`

# Installation

Make sure to review the normal [install](./install.md) docs

This gives you some CLI tools for managing your installation,
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

# Use
## Web Interface

To run the web interface

    $ homestar runner

You&apos;ll want to edit the file `boot/index.js` to add your Things.
If you haven&apos;t installed any Things yet, see [Bridges](https://github.com/dpjanes/node-iotdb/blob/master/docs/bridges.md).

## Setup

This only needs to be run once.

    $ homestar setup

It will:

    * set up the `./boot` folder, so you can define whatever Things you want to be loaded into `homestar runner`
    * set up the `./.iotdb` folder, for local configuration
    * install in `./node_modules` all IOTDB modules needed

## Update

This will pull new version of HomeStar and IOTDB modules in `./node_modules`.

    $ homestar update

## Configuration

Some Bridges (code that talks to Things) require configuration, e.g. to do pairing,
adding API keys, etc.. If this is so, it will be mentioned in the README for the Bridge module.

e.g. here&apos;s how you do it

    $ homestar configure homestar-hue

## Settings

This will modify values in `./.iotdb/keystore.json`, the local configuration.

e.g.

    homestar set browser 0                      ## don&apos;t open the browser
    homestar set name "name for this system"

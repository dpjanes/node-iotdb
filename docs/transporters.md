# Transporters

# About

In the IOTDB "worldview", Things are modelled as a collection of JSON dictionaries, called **[Bands](bands.md)**.
If you have all the Bands of a Thing, you have a complete representation of the Thing.

Typical Bands are:

* **model** the semantic model that explains the **istate** and **ostate** Bands
* **istate** the *input state*, that is the current state of a Thing
* **ostate** the *output state*, the state we want a Thing to transition to
* **meta** the Thing&apos;s metadata, e.g. its name, its manufacturer
* **connection** the Thing&apos;s connection status

A Transporter is a collection of all the Band data for some group of [Things](thing.md).
Note that though transporters don&apos;t use these Thing objects, it&apos;s really
easy to create Things from transporters using `all` or `one`.

## Why?

Transporters are designed to plug together like Legos, to move data around. 

The most important Transporter is the [IOTDB Transporter](https://github.com/dpjanes/iotdb-transport-iotdb),
which wraps up all the data from an IOTDB installation, e.g. all the Things
on reachable from a computer.

Here&apos;s something things you can do:

* tell a [MQTT Transporter](https://github.com/dpjanes/iotdb-transport-mqtt) to `monitor` a IOTDB Transporter, so that all changes to
  the IOTDB Transporter go to the MQTT transporter, and all requests
  sent to the MQTT Transporter update the IOTDB Transporter
* simlar for [CoAP Transporter](https://github.com/dpjanes/iotdb-transport-coap)
* tell a [Express Transporter](https://github.com/dpjanes/iotdb-transport-express) to `use` a IOTDB Transporter as a data source,
  such that an API is exported to IOTDB in a couple of lines of code

Our intention is to develop more Transporters for popular data stores.

# API

These APIs use [Reactive Extentsions](https://github.com/Reactive-Extensions/RxJS).

## Standard Methods

For these Standard Methods, all Transporters guarantee that every
time `onNext` is called, the payload will be a new shallow clone
of the argument `d`, with new / requested data layered on top.

So it&apos;s safe to pass in data using your own keys, and it&apos;s safe to
modify the results you get out (within the bounds of shallow clones).

### list(d)

Returns observable that will `onNext` every `thing.id`, then `onCompleted`.

### added(d)

Returns observable that will `onNext` every time a new `thing.id` is found.
`onCompleted` is normally never called.

### updated(d)

Returns observable that will `onNext` every time a change is seen.
`thing.id` and `thing.band` are delivered, `thing.value` may not be.
`onCompleted` is normally never called.

The results can be restricted by using `d.id`; or `d.id` and `d.band`

### put(d)

Update a Thing&apos;s band. `d.id`, `d.band` and `d.value` are all required.

After a successful update, `onNext` is called with a updated value, then `onCompleted`.

If the update fails, `onError` will be called with an appropriate error code.

### get(d)

Get a Thing&apos;s band&apos;s value. `d.id`, `d.band` are required.
`thing.id`, `thing.band` and `thing.value` are delivered.

### bands(d)

Get the bands for a Thing. `d.id`

## Helper Methods

### all(d)

Will iterate through each Thing with all its bands in one dictionary.

### one(d)

Similar to `all` but will only return the Thing matching `d.id`

## Binding Methods

### use(source\_transport, d)
### monitor(source\_transport, d)

# Access Transporter

This Transport can be to control what items can be read fro
or written to. 

Note that at this time there&apos;s no support for controlling
what can be seen in the `value`. It&apos;s all or nothing.

Here&apos;s an example that will deny access to `ThingB`.
In the case of `list`, `updated` and `added` it will
be as if the Thing never existed. `get` and `bands`
will observe the error.

    const base = require("iotdb-transport");
    const errors = require("iotdb-errors");
    const access_transporter = base.access.make({
        check_read: d => {
            if (d.id === "ThingB") {
                return new errors.AccessDenied()
            }
        }
    });

You can use `check_write` to control access to `put`.

# Transporters

* [iotdb-transport](https://github.com/dpjanes/iotdb-transport) - base classes
* [iotdb-transport-express](https://github.com/dpjanes/iotdb-transport-express)
* [iotdb-transport-fs](https://github.com/dpjanes/iotdb-transport-fs)
* [iotdb-transport-iotdb](https://github.com/dpjanes/iotdb-transport-iotdb)
* [iotdb-transport-memory](https://github.com/dpjanes/iotdb-transport-memory)
* [iotdb-transport-mqtt](https://github.com/dpjanes/iotdb-transport-mqtt)
* [iotdb-transport-null](https://github.com/dpjanes/iotdb-transport-null)
* [iotdb-transport-redis](https://github.com/dpjanes/iotdb-transport-redis)

## In Progress

These need some (or a lot!) of work

* [iotdb-transport-coap](https://github.com/dpjanes/iotdb-transport-coap)
* [iotdb-transport-firebase](https://github.com/dpjanes/iotdb-transport-firebase)
* [iotdb-transport-pubnub](https://github.com/dpjanes/iotdb-transport-pubnub)

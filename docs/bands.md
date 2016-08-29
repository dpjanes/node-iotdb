# Bands

In IOTDB, a Thing is a collection of **bands**, which are simply JSON-like dictionaries. 

# Bands
## `model`

This is a semantic model written in JSON-LD, describing the values in `ostate` and `istate`.
You can see an example of a Model in JSON-LD [here for a WeMo Switch](https://github.com/dpjanes/homestar-wemo/blob/master/models/we-mo-socket.json).

Models are typically written in IoTQL. 
[Here&apos; the IoTQL Model for the WeMo Switch](https://github.com/dpjanes/homestar-wemo/blob/master/models/WeMoSocket.iotql). 
You&apos;ll note this is much more compact.

## `meta`

    {
        "@context": "https://iotdb.org/pub/iot",
        "iot:facet": [
            "iot-facet:plug",
            "iot-facet:switch"
        ],
        "iot:model-id": "we-mo-socket",
        "iot:thing-id": "urn:iotdb:t:sArvozfc:092qoWwd",
        "iot:vendor.model": "Socket",
        "iot:vendor.type": "urn:Belkin:device:controllee:1",
        "schema:description": "Belkin WeMo Socket",
        "schema:manufacturer": "http://www.belkin.com/",
        "schema:name": "WeMo Socket"
    }

## `istate`

The `istate` for a WeMo Socket looks like this:

    {
        "on": true
    }

Indicating the device is on. 
If you look at the Model above, you&apos;ll see see an `iot:atttribute` that describes this.

## `ostate`

The `ostate` for a WeMo Switch looks like this:

    {
        "on": null
    }

Indicating there is no command currently being executed. 
If you want to turn of the socket, write this to the band:

    {
        "on": false
    }

Once the socket has changed state, it will revert.

## `connection`

## `transient`

# See Also

* [Interoperability with Standardless IoT](http://www.slideshare.net/dpjanes/2015-04-global-io-t-day-wien-interoperability-with-stanardless-iot)
* [What a Thing API Should Look Like](http://www.slideshare.net/dpjanes/what-a-thing-api-should-look-like-global-iot-day)

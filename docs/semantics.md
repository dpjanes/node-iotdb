# IOTDB

IOTDB is an Open Source project, started in 2013, to describe the Things in the Internet of Things using semantics. It is explicitly built on top of Schema.org and JSON-LD.

The "core ideas" of IOTDB are:

* we describe Things by semantically annotating the data associated with the Thing
* Things have many different bands of data associated with them, e.g. the metadata, the actual state, etc.
* our description is built from atomic elements, ones that cannot be meaningfully subdivided further.
* our descriptions are built be composition of those atomic elements,
* our descriptions are extensible / open ended, meaning we can freely add in elements from other Semantic ontologies, such as SAREF or Project Haystack
* Things are what they say they are, something is a Switch if it says its a switch; it is up to the client to manipulate the switch based on information exposed in the data model
* Things do what they say they do, something can be turned on or off if they present an attribute of iot:purpose iot-purpose:on
* where possible, we should be descriptive not prescriptive, i.e. describing what people are doing, not how they should do
* descriptions should be true, e.g. oneIoTa models brightness as a value between 0 and 100. This inaccurately models a light that can be on, off or half-brightness only
* semantic specifications should be written using W3C semantic tools, specifically Linked Data, e.g. the definition of temperature in Celsius should be a Hyperlink, not "C" or "celsius" or "org.something.temperatureunit.celsius" or some other magic word (e.g. like IPSO)

IOTDB&apos;s belief is that if a semantic spec is written correctly, it should be possible to write other specs (e.g. oneIoTa, Iotivity, Bluetooth profiles, &c) using the terms of this spec; it will act as a Rosetta Stone between different IoT worlds.
For example, consider FIWARE&apos;s data for Observed Weather. IOTDB takes the approach that we use the data as-is, and create a "model" that describes it JSON-LD

    {
        "temperature": 9.2,
        "source": "http://www.aemet.es",
        "windDirection": "Este",
        "address": {
            "addressLocality": "Valladolid",
            "addressCountry": "ES"
        },
        "dateObserved": "2016-03-14T16:00:00",
        "pressure": 930,
        "windSpeed": 7,
        "type": "WeatherObserved",
        "relativeHumidity": 0.47,
        "precipitation": 0,
        "pressureTendency": -1.3
    }

IOTDB would describe the temperature and humidity something like (pseudocode ahead):

    @id #temperature
    schema:name "temperature"
    schema:description: "observed temperature"
    iot:purpose iot-purpose:temperature
    iot:type iot:type.number
    iot:unit iot-unit:temperature.si.celsius
    iot:sensor true
    iot:actuator false

    @id #humidity
    schema:name "humidity"
    schema:description: "observed humidity"
    iot:purpose iot-purpose:humidity
    iot:type iot:type.number
    iot:unit iot-unit:math.fraction.unit
    iot:minimum 0
    iot:maximum 1
    iot:sensor true
    iot:actuator false

IOTDB&apos;s models would also allow the windDirection of Este to be mapped to 90 degrees or some other more appropriate universal semantic terminology. Because we have a semantic vocabulary, we can easily do things like "give me the temperature in Fahrenheit" even though it&apos;s measured in Celsius; or "turn the light to 60% brightness" even though the underlying device works from 0 to 1.

IOTDB has four semantic vocabularies:

* iot: - core vocabulary
* iot-purpose: - the "purpose" of the data of thing, e.g. measuring temperature, changing the channel, and so forth. This vocabulary was developed interoperating with actual Things (links below)
* iot-facet: - what things do, e.g. are they switches, are they part of the HVAC system, and so forth
* iot-unit: - units of measure, but things like QUDT are probably better if in the SI world

Of particular interest to Schema.org is the iot-purpose: vocabulary, which describes what is being sensed or actuated. For example:

* iot-purpose:color - as an actuator, set the color (e.g. like a Philips Hue); as a sensor, what the color actually is
* iot-purpose:frequency - sensed / actuate frequency
* iot-purpose:on - is the device on or off; turn it on (or off)
* iot-purpose:open - is the door, or shutter, or whatever open or close; open or close it
* iot-purpose:volume - the current volume, change the volume


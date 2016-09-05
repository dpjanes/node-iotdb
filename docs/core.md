# Core Ideas

The "core ideas" of IOTDB are:

* we describe Things by semantically annotating the _data associated with the Thing_
* Things have many different _bands_ of data associated with them, e.g. the metadata, the actual state, etc.
* our description is built from _atomic_ elements, ones that cannot be meaningfully subdivided further. 
* our descriptions are built be _composition_ of those atomic elements,
* our descriptions are _extensible / open ended_, meaning we can freely add in elements from other Semantic ontologies, such as SAREF or [Project Haystack](http://project-haystack.org/)
* Things _are what they say they are_, something is a Switch if it says its a switch; it is up to the client to manipulate the switch based on information exposed in the data model
* Things _do what they say they do_, something can be turned on or off if they present an attribute of `iot:purpose` `iot-purpose:on`
* where possible, we should be _descriptive_ not _prescriptive_, i.e. describing what people _are_ doing, not how they _should_ do
* descriptions should be _true_, e.g. oneIoTa models [brightness](http://oneiota.org/revisions/1746) as a value between 0 and 100. This inaccurately models a light that can be on, off or half-brightness only
* _semantic specifications_ should be written using W3C semantic tools, specifically _Linked Data_, e.g. the definition of temperature in Celsius should be a Hyperlink, not "C" or "celsius" or "org.something.temperatureunit.celsius" or some other magic word (e.g. like [IPSO](https://github.com/IPSO-Alliance/pub))


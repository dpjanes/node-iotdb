2# The Atomic Theory of Internet of Things Interoperability

# Introduction

There are many proposed and operational standards for the Internet of Things, many if not all now promising "semantic interoperability". 
In surveying these these standards, we note that there's a large similarity in the concepts used, but a wide variance in what is actually possible to be modelled and how they are formally described.

We believe it is possible to use a common "meta-standard" to formally describe all these various standards. 
This meta-standard would consists of "atomic" concepts, that is, concepts that cannot be reasonably subdivided further into deeper ones. 

In our conference paper, we will:

* demonstrate how current standards cannot be expressed in terms of each other, 
* demonstrate that we can create atomic concepts that completely cover the capabilities of existing standards,
* demonstrate that this "atomic description" of each standard can create high (but not perfect) fidelity interoperability between the various standards, and
* argue that the number of atomic concepts is actually reasonably small to cover the capabilities of most Things and Standards.

We call this "Atomic Theory of Internet of Things Interoperability". 

# Brightness Survey

In this section, we will show how a number of different standards organizations define the concept of **brightness** for lighting. This is by no means a _complete_ survey, there's almost certainly more definitions we could find. However, this should be enough to illustrate our point.

## AllJoyn

https://git.allseenalliance.org/cgit/interfaces.git/tree/interfaces/org.alljoyn.SmartSpaces.Operation/Brightness-v1.md?h=e29ad65f0b4dba6bc35060d7a6464cc6ee537c14

Here's the (slightly edited) definition AllJoyn brightness: 

    | Type                  | double  
    | Access                | readwrite                                                             
    | Annotation            | org.alljoyn.Bus.Type.Min = 0.0                                        
    | Annotation            | org.alljoyn.Bus.Type.Max = 1.0    
                                            
    Holds the current brightness value of the device.
    * The minimum value of 0.0 indicates that zero light is emitted by that device.
    * The maximum value of 1.0 indicates the maximum amount of light is emitted by that device.

## OneIoTa

http://oneiota.org/revisions/1746

Here's the oneIoTa definition of brightness:

    This resource describes the brightness of a light or lamp.    
        brightness is an integer showing the current brightness level as a quantized representation in the range 0-100.        A brightness of 0 is the minimum for the resource.
        A brightness of 100 is the maximum for the resource.
        

## IPSO Light Control

http://technical.openmobilealliance.org/tech/profiles/IPSO/3311.xml

Here's the IPSO definition of a "dimmer", also specified as `/3311/*/5851`

    <Item ID="5851">
        <Name>Dimmer</Name>
        <Operations>RW</Operations>
        <MultipleInstances>Single</MultipleInstances>
        <Mandatory>Optional</Mandatory>
        <Type>Integer</Type>
        <RangeEnumeration>0-100</RangeEnumeration>
        <Units>%</Units>
        <Description>
        This resource represents a light dimmer setting, which has an Integer value between 0 and 100 as a percentage.
        </Description>
    </Item>
 
## Project HayStack

http://project-haystack.org/tag/lights

Here's Project HayStack's definition:
    
    lights: primary actuator point indicating whether the lights are commanded on/off. The lights point must be either a binary point (on/off) or a numeric point if dimmable (0% to 100%). A lightsGroup must have one or more of these points.
    
## SAREF

http://ontology.tno.nl/saref/
https://w3id.org/saref#LevelControlFunction

Here's the SAREF definition of something that can control brightness. Note that SAREF is much looser that the other standards we are surveying here, but also that it's much more flexible in that we can "drop it in" to other descriptions because of their use of Linked Data and this flexibility.

	rdfs:comment
	 An actuating function that allows to do level adjustments of an actuator in a certain range (e.g., 0%-100%), such as dimming a light or set the speed of an electric motor.
    
    saref:has command
	* saref:Step up command
	* saref:Step down command
	* saref:Set relative level command
	* saref:Set absolute level command


## UniversAAL

http://ontology.universaal.org/Lighting.ttl

Here's UniversAAL definition of brightness:

    [
    a owl:Restriction ;
    owl:cardinality "1"^^xsd:nonNegativeInteger ;
    owl:onProperty :srcBrightness
    ] ,
    [
    a owl:Restriction ;
    owl:allValuesFrom [
        a owl:Class ;
        owl:withRestrictions (
        [
            xsd:minInclusive "0"^^xsd:int
        ]
        [
            xsd:maxInclusive "100"^^xsd:int
        ]
        ) ;
        owl:onDatatype xsd:int
    ] ;
    owl:onProperty :srcBrightness
    ] ,


# Discussion

The first thing to note is number of broad similarities:

* all are talking about **brightness** (obviously)
* most specify a data type
* most specify a range, though not the same range
* some specify commands / actions / actuation, in most it is implicit
* some explicitly restrict sending one value of brightness, assumably it is implicit in all the others
* some use Linked Data, others use domain-specific magic words (e.g. "org.alljoyn.Bus.Type.Max")

Next, we'll note that if we handed this ask a task to a programmer "can you translate from A to B?" it would be fairly straightforward (if not a little tedious) to move between these various systems. Of course, our goal here is to demonstrate something stronger: that with the right description, we can automate translation.

Next, we'll note that there's not always 100% fidelity in translation: AllJoyn can describe brightnesses that cannot be expressed in IPSO (e.g. 0.105). 

Finally, we'll note that none of standards (except perhaps SAREF) can necessarily model correctly "the real world". For example, consider a lamp that has three brightnesses, off, half-bright, and fully-on. IPSO would express these brightnesses as 0, 50 and 100. But what does a brightness of 40 mean for this thing? 

# An Atomic Description Example 

Here's our proposed Atomic description of AllJoyn's brightness:

	schema:name "brightness"
	schema:description "Holds the current brightness value of the device"
	iot:purpose iot-purpose:brightness
	iot:type iot:type.number
	iot:minimum 0
	iot:maximum 1
	iot:sensor true
	iot:actuator false

Terms are described in Linked Data, two namespaces specified `iot:` and `iot-purpose:`. The meaning of all the terms should be evident, though we will expand this further in our final conference paper.

The one thing we are _not_ describing here "how do we get this 'on the wire'", to fully automate translation. Further investigation should be done, but our belief that the language for describing how to get data into a specific system is probably very specific to that system! 

In our conference paper, we will describe the other standards in similar terms, and also discuss how this would be extended to other concepts used in the Internet of Things.
 





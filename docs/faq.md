# Models
## How to get all the attributes of a thing?

    thing.attributes()

## How to get all the attribute keys?

    thing.attributes().map(_.id.code.from.attribute)

# Bands
## How to get an event for when a thing becomes unreachable?

For one Thing:

    thing
        .band("connection")
        .on("iot:reachable", (thing, band, is_reachable) => {
            console.log("+", "thing", thing.thing_id(), "reachable", thing.reachable());
        })

For many Things - note that this may be triggered on other events,
because it&apos;s granular on any change to `connection`

    things
        .on("connection", (thing, band, is_reachable) => {
            console.log("+", "thing", thing.thing_id(), "reachable", thing.reachable());
        })

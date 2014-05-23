## Fools.frameOfReference

Fools.frameOfReference creates a system to enable translation of point values between different coordinate systems.
It was initially created to amoratize the coordinate system differences between Leap.js points and the screen but it
can be used to reconcile screen-to-unity, screen-to-THREE, or any other systems in which the scale of measurements
may be different, some axes may be reversed, etc.

A frame is created by calling `var frame = Fools.FrameOfReference();`. There are no arguments, and it is not a class
definition -- it is a factory function.


### Creating a spacial Definition (Def)

Once you have your frame you can define one or more spatial definitions.

``` javascript

var frame = Fools.frameOfReference();

var defSmallWindow = frame.addDef('smallWindow', {
axes: {
x: [0, 200],
y: [0 150]
}
});

var defLargeWindow = frame.addDef('largeWindow', {
x: [0, 500],
y: [0, 300]
}
});

```

### Translating between definitions

You can translate between frames of reference by using the frame.translate(fromDefName, toDefName, data);

``` jaavscript

var smallToLarge = frame.translate('smallWindow, 'largeWindow', {x: 100, y: 75});
// smallToLarge is now {x: 250, y: 150}

var largeToSmall = frame.translate('largeWindow, 'smallWindow', {x: 500, y: 300});
// largeToSmall = {x: 200, y: 150}

```

It also accepts arrays -- but always returns objects;

``` jaavscript

var smallToLarge = frame.translate('smallWindow, 'largeWindow', [100, 75]);
// smallToLarge is now {x: 250, y: 150}

var largeToSmall = frame.translate('largeWindow, 'smallWindow', [500, 300]);
// largeToSmall = {x: 200, y: 150}

```

### Utility Functions

There are several methods of definition objects (retuned by `frame.addDef(...)` or `frame.def('name')`).

* **def.min()** returns the minimum corner of the space
* **def.center()** returns the cenrer of the space
* **def.max()** returns the maximum corner of the space.
* **def.normalize(input, clamp[optional])** takes native units and returns an object in the 0..1 range.
* **def.denormalize(input)** takes an object with properties in the 0..1 range and returns an object in native space
* **frame.normalizedToOrigin(input)** takes an object in the 0..1 range and returns an object in the -1..1 range.

### Templates

There are a few built-in templates for spatial ranges which will fill out a definition with predefined ranges.
`var screenDef = frame.addDef(template: 'screenDom'})` is a special reference system that will work in the browser
to define a coordinate system based on the window's innerHeight/Width. Once `Fools.FOR_watchResize()` is called,
any definitions based on that template will be continually updated based on the current size of the screen.

Three other templates, 'leapLeft', 'leapRight', and 'leapMiddle' also exist and are custom tuned to take in coordinates
from left and right hands from the Leap Motion Controller.

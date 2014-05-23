
## Fools.all

Fools.all calls each function in its roster with the input value. They are called in order
and any errors emitted by a function are trapped and emitted as one composite error.

Like `until` there is a `my_all.last(last_fn)` method that is always done after the added methods.

Fools.all is (barring errors) functionally identical to map.

```javsacript
var my_all = Fools.all(fn_a, fn_b, fn_c...)
```

and/or

```javascript
var my_all = Fools.all().add(fn_a).add(fn_b).add(fn_c)...

```

## Fools.each

`each` has a set of tests and true is returned when all of the tests pass.

It is the equivalent of `_.every`.

``` javascript

    var each = Fools.each()
        .add(_.isNumber)
        .add(function (n) {
            return n > 0
        })
        .add(function (n) {
            return !(n % 2)
        });


    _.each(['g', -4, 0, 1, 2, 3, 4, {}], function(n){
        console.log('"%s" is positive odd number: %s', n, each(n));
    });

    /**
     "g" is positive odd number: false
     "-4" is positive odd number: false
     "0" is positive odd number: false
     "1" is positive odd number: false
     "2" is positive odd number: true
     "3" is positive odd number: false
     "4" is positive odd number: true
     "[object Object]" is positive odd number: false
     */

 ```

## Fools.fork(test:{function}, if_true: {function (optional)}, if_false: {function (optional)}) : function

Fork is functionally identical to the "if" (or a ? b : c) statement.

Fork takes one function that returns true or false and calls the second function (with the original argument)
if the first result is true, and the third function if the first function returns false.

```javascript
var my_fork = Fools.fork(test, if_true_fn, if_else_fn)
```

or

``` javascript

var my_fork = Fools.Fork(test).then(if_true_fn).else(if_false_fn)
```

returns a function that can be called repeatedly with arguments; whether or not the true test is passed determines
whether the true function or the false function is called (also, with those arguments).

Note because `Fools.fork` returns a function (not an instance) you can nest forks for a binary branching
expert system.

You can also call `my_fork.err(on_err_fn)` to create an error trapping function that receives any errors emitted by
the test or either of its branches.

### Example

```javascript

function if_odd(n){
    return (n % 2);
}

function ifPositive(n){
    return n > 0;
}

var test = Fools.fork(ifPositive)
    .then(
    Fools.fork(if_odd)
        .then(function(n){ return 2 * n})
        .else(_.identity) // if even
).else(function(){ return 0; }); // if not positive

console.log(_.map(_.range(-5, 6), test));
// result: [ 0, 0, 0, 0, 0, 0, 2, 2, 6, 4, 10 ]

```
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

## Fools.gauntlet : {function}

Gauntlet is similar to until in that a series of tests are run until one of them is true.
Unlike until, gauntlet returns an arbitrary value from the truthy test -- the return value of the test function
is not related to the truthiness of the test.
Gauntlet calls a series of tests on an input until one of them is true, and returns that tests' result.

In order for a function to both return true/false and return the maximum range of results, the
tests are passed a second parameter, isGood; call this method to validate the result.

``` javascript
   var bot_loc = {x: 0, y: 2};

        var min_x = 0;
        var max_x = 2;
        var min_y = 0;
        var max_y = 2;

        var gauntlet = Fools.gauntlet()
            .add(function (input, good) {

                if (bot_loc.y > min_y) {
                    good();
                    bot_loc.y -= 1;
                }
                return 'N';

            }).add(function (input, good) {
                if (bot_loc.x < max_x) {
                    good();
                    bot_loc.x += 1;
                }
                return 'E';
            });

        gauntlet.if_last = function () {
            return '0';
        };

        it ('should move north', function(){
            gauntlet().should.eql('N');
            bot_loc.should.eql({x: 0, y: 1});
        });

        it ('should move north again', function(){
            gauntlet().should.eql('N');
            bot_loc.should.eql({x: 0, y: 0});
        });

        it('should move east', function(){
            gauntlet().should.eql('E');
            bot_loc.should.eql({x: 1, y: 0});
        });

        it('should move east again', function(){
            gauntlet().should.eql('E');
            bot_loc.should.eql({x: 2, y: 0});
        });

        it('should not move', function(){
            gauntlet().should.eql('0');
            bot_loc.should.eql({x: 2, y: 0});
        });
  ```
## Fools.loop(iterator(iter: {Object}) : {function}): {function}

This is a method of walking a multidimensional matrix. The loop function has a similar profile to reduce:
it takes a memo argument that is passed as the second argument to the iterator (the first being an amalgam
of the dimensions being walked.

Use of a memo / the return value of loop is optional.

``` javascript
console.log(
    Fools.loop(function(iter, memo){
        memo.push(_.clone(iter));
        return memo;
    })
        .dim('i', -1, 1)
        .dim('j', -1, 1)([])
);

/** responds

 [ { i: -1, j: -1 },
 { i: 0, j: -1 },
 { i: 1, j: -1 },
 { i: -1, j: 0 },
 { i: 0, j: 0 },
 { i: 1, j: 0 },
 { i: -1, j: 1 },
 { i: 0, j: 1 },
 { i: 1, j: 1 } ]

 */

```

note -- the iterator is an object that is changed from iteration to iteration -- saving its value requires
use of clone or some similar method of extracting the values of the iter parameter.
## Fools.pairs

Fools.pairs takes two arrays (sets) and returns matched pairs, where the first array element is a member of the first set
and the second element is a member of the second set. (or, if multi-matching is possible, an array of all matching members
of the second set.)

Pairing is reductive -- once a member of set two is paired, is is removed as a candidadate. So, while (if multi is true)
one element of set one can match many elements of set two, each element of set two can match one (or zero) elements
of set one.

## Fools.pipe

Fools.pipe calls each function added to it in order, passing the result of the last function to the next one.
## Fools.range

Range is a function that takes a value and executes a function over it depending on where it falls in a
numeric range of possible values. It is useful for examples to take a range of values and sorting them into bins.

Range is configured by calling `.add(min_value, result_function)` multiple times to define how you want to respond
to a value that is >= the min but less than all larger min_values set. `min_value` can be any numeric value.

the `.add_min` and `.add_max` methods allow for handling values outside the defined range.

note - the handler for the last bracket is never called; use `.add_max` to handle the last bracket.

``` javascript

    var negatives = [];
    var positives = [];
    var small = 0;
    var large = 1;

    var range = Fools.range()
        .add(-10, function (n) {
            negatives.push(n);
        })
        .add(0, function (n) {
            positives.push(n)
        })
        .add(11, function () {
            large++;
        })
        .add_min(function () {
            small++;
        })
        .add_max(function () {
            throw new Error('never called');
        });

    // call range 1000 times.
    _.each(_.range(0, 1000), function () {
        // call range with a random value in the -15 ... 15 range.
        range(Math.round(Math.random() * 30 - 15));
    });

    console.log('small: %s', small);
    console.log('large: %s', large);

    console.log('negatives: %s', _.sortBy(negatives, _.identity));
    console.log('positives: %s', _.sortBy(positives, _.identity));

    /**
     results similar to
     small: 150
     large: 165
     negatives: -10,-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,-9,-9,-9,-9,-9,-9,-9,-9,-9,-9,-9,-9,-9,-9,-9,-9,-9,-9,-9,-9,-9,-9,-9,-9,-9,-9,-9,-9,-9,-9,-9,-9,-9,-8,-8,-8,-8,-8,-8,-8,-8,-8,-8,-8,-8,-8,-8,-8,-8,-8,-8,-8,-8,-8,-8,-8,-8,-8,-8,-8,-8,-8,-8,-8,-8,-8,-8,-8,-8,-8,-8,-8,-7,-7,-7,-7,-7,-7,-7,-7,-7,-7,-7,-7,-7,-7,-7,-7,-7,-7,-7,-7,-7,-7,-7,-7,-6,-6,-6,-6,-6,-6,-6,-6,-6,-6,-6,-6,-6,-6,-6,-6,-6,-6,-6,-6,-6,-6,-6,-6,-6,-6,-6,-6,-6,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-4,-4,-4,-4,-4,-4,-4,-4,-4,-4,-4,-4,-4,-4,-4,-4,-4,-4,-4,-4,-4,-4,-4,-4,-4,-4,-4,-4,-4,-4,-4,-4,-4,-4,-4,-4,-3,-3,-3,-3,-3,-3,-3,-3,-3,-3,-3,-3,-3,-3,-3,-3,-3,-3,-3,-3,-3,-3,-3,-3,-3,-3,-3,-3,-3,-3,-3,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1
     positives: 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10

     */

 ```

## Fools.until

Fools executes its test one by one until one of them fails.

you can stack any number of functions in Fools.until chains.
For any given input, the functions are called in order until one of them returns true.

until returns the *index* of the function that retrned true;

You can force a given function to be executed last by calling `my_until.last(last_fn)`.

Errors can be trapped as with fork.

If **no function returns true**, until throws an error -- and that error will NOT be trapped by
your error trapper.

```javsacript
var my_until = Fools.until(fn_a, fn_b, fn_c...)
```

and/or

```javascript
var my_until = Fools.until().add(fn_a).add(fn_b).add(fn_c)...

```

### Example

``` javascript

var Fools = require('./../fools');
var _ = require('lodash');

var until = Fools.until()
    .add(function (n) {
        return !_.isNumber(n);
    })
    .add(function (n) {
        return n < 0
    })
    .add(function (n) {
        return (n % 2);
    })
    .add(function(n){
        return true;
    });

_.each(['g', -4, 0, 1, 2, 3, 4, {}], function (n) {
    var index =  until(n);
    if ( index == 3){
        console.log('%s is a positive even number', n);
    } else {
        console.log('"%s" failed at test: %s', n, index);
    }
});

/**
 "g" failed at test: 0
 "-4" failed at test: 1
 0 is a positive even number
 "1" failed at test: 2
 2 is a positive even number
 "3" failed at test: 2
 4 is a positive even number
 "[object Object]" failed at test: 0
 */

 ```
## Fools.rate

`rate` is a very specialized method to rank items on a weighted curve; it keeps a database
in closure that allows you to poll for the best and worst candidates.

You configure the rate function by adding properties to be considered, using the `prop` method:

``` javascript

    function letterToNumber(grade){
        switch(grade){
             case 'A':
                return 4;
             break;

             case 'B':
                return 3;
             break;

             case 'F':
                return 0;
             break;

             default:
                return 0;
         }
     }

    rate.prop('science') // returns the science rating unfiltered
    rate.prop('science', letterToNumber) // returns the numeric value of a letter grade
    rate.prop('science', null, 2) // returns 2 * the value of the grade
    rate.prop('science', letterToNumber, 2) returns 2 * the numeric value of a letter grade

```

Calling `rate(target)` returns a numeric rating of a target.
calling `rate.add(target)` adds the target to an internal collection for the purpose
of enabling the `best()`, `select(min, max)`, and `worst()` methods.

Here are some examples of the rate system in action:

``` javascript

    var util = require('util');

    var rate = Fools.rate()
        .prop('brains')
        .prop('looks', null, 5);

    var peter = {brains: 2, looks: 8, birth_year: 2014 - 45, name: 'Peter Griffin'};
    var lois = {brains: 6, looks: 12, birth_year: 2014 - 43, name: 'Lois Griffin'};
    var stewie = {brains: 14, looks: 5, birth_year: 2014 - 2, name: 'Stewie Griffin'};
    var brian = {brains: 8, looks: 6, birth_year: 2014 - 8, name: 'Brian Griffin'};
    var meg = {brains: 4, looks: 3, birth_year: 2014 - 16, name: 'Meg Griffin'};

    console.log(' ----------- rating (looks biased) --------- ');

    _.each([peter, lois, stewie, brian, meg], function (item) {
        console.log('rating of %s: %s', item.name, rate(item));
        console.log('   (%s * 5 + %s) / %s', item.looks, item.brains, rate.scale());
        rate.add(item);
    });

    var best = (rate.best());
    console.log('best: %s (%s)', best.data.name, best.rating);

    var worst = (rate.worst());
    console.log('worst: %s (%s)', worst.data.name, worst.rating);

    console.log(' ----------- rating (brains biased) --------- ');

    var rate2 = Fools.rate()
        .prop('brains', null, 5)
        .prop('looks');

    _.each([peter, lois, stewie, brian, meg], function (item) {
        console.log('rating of %s: %s', item.name, rate2(item)); // echoes the rating but doesn't record the candidate
        rate2.add(item); // records the candidate for relative comparison
    });

     best = (rate2.best());
    console.log('best: %s (%s)', best.data.name, best.rating);

     worst = (rate2.worst());
    console.log('worst: %s (%s)', worst.data.name, worst.rating);

    console.log(' ----------- rating (age biased) --------- ');

    var rate2 = Fools.rate()
        .prop('brains', null, 2)
        .prop('birth_year', function(birth_year){
            return 2014 - birth_year
        }, 3)
        .prop('looks');

    _.each([peter, lois, stewie, brian, meg], function (item) {
        console.log('rating of %s: %s', item.name, rate2(item)); // echoes the rating but doesn't record the candidate
        console.log('   (%s * 2 + %s  * 3 + %s) / %s',
            item.brains,
          2014 - item.birth_year,
            item.looks,
            rate.scale());
        rate2.add(item); // records the candidate for relative comparison
    });

    best = (rate2.best());
    console.log('best: %s (%s)', best.data.name, best.rating);

    worst = (rate2.worst());
    console.log('worst: %s (%s)', worst.data.name, worst.rating);

```
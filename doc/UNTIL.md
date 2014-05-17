
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
This is an attempt to use the promise pattern to create functional rules system in Javascript.

Each of the classes take one or more functions as constructor arguments and return a function.
The resulting function always takes a single argument.

## Why?

Ordinary functions and logic flow structures are immutable; once a function is defined it is a closed system.
Foools components can be adjusted on the fly; you can change the fork's 'then' clause at any time, or it's
else clause.

It is also very easy to load process structures from configuration files, and compose them with each other.

## Fools.fork

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

Note because `Fools.fork` returns a function (not an instance) you can nest forks indefinately for a binary branching
expert system.

You can also call `my_fork.err(on_err_fn)` to create an error trapping function that recieves any errors emitted by
the test or either of its branches.

## Fools.until

```javsacript
var my_until = Fools.until(fn_a, fn_b, fn_c...)
```

and/or

```javascript
var my_until = Fools.until().add(fn_a).add(fn_b).add(fn_c)...

```

Unlike the binary fork, you can stack any number of functions in Fools.until chains.
For any given input, the functions are called in order until one of them returns true.

You can force a given function to be executed last by calling `my_until.last(last_fn)`.

Errors can be trapped as with fork.

If no function returns true, until throws an error -- and that error will NOT be trapped by
your error trapper.

## Fools.all

```javsacript
var my_all = Fools.all(fn_a, fn_b, fn_c...)
```

and/or

```javascript
var my_all = Fools.all().add(fn_a).add(fn_b).add(fn_c)...

```

Fools.all calls each function in its roster with the input value. They are called in order
and any errors emitted by a function are trapped and emitted as one composite error.

Like `until` there is a `my_all.last(last_fn)` method that is always done after the added methods.

## Fools.gauntlet

Gauntlet is similar to unitl in that a series of tests are run until one of them is true.
Unlike until, gauntlet returns an arbitrary value from the truthy test.
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

## Error trapping

Each Fools function has an optional error function that will trap (most) errors in execution
and respond to the output error. The result of the error trapper is returned in the place that the
original function is called. Note, no effort is made by Fools to determine which context the
error came from -- if that is improtant, you will want to catch and pipe errors yourself and add
context hints to them.

To add error handling to a fools function call `fools_function.err(function(err){...})`.
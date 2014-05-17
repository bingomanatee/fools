
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
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
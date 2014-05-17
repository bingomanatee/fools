var Fools = require('./../fools');
var _ = require('lodash');

console.log(
    Fools.loop(function(iter, memo){ memo.push(_.clone(iter)); return memo})
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
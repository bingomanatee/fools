var tap = require('tap');
var fools = require('./../fools');
var _ = require('underscore');

tap.test('fools', function (ft) {

    ft.test('until', function (ut) {

        var positive = 0;
        var whole = 0;
        var zero = 0;
        var negative = 0;
        var errors = 0;
        var reached_end = false;
        var until_nums = fools.until().add(function (n) {
            if (!_.isNumber(n)) {
                throw new Error('not a number');
            }
        }).add(function (n) {
                if (n == 0) {
                    ++zero;
                    ++positive;
                    return true;
                }
            }).add(function (n) {
                if (n > 0) {
                    ++positive;
                    ++whole;
                    return true;
                }
            }).add(function (n) {
                if (n < 0) {
                    ++negative;
                    return true;
                }
            }).
            err(function (e) {
                console.log('adding an error for ', e);
                ++errors;
            });

        until_nums(1)(0)(5)(-1)('foo');

        ut.equal(positive, 3, 'three positive numbers');
        ut.equal(whole, 2, 'two whole numbers');
        ut.equal(negative, 1, 'one negative number');
        ut.equal(zero, 1, 'one zero');
        ut.equal(errors, 1, 'one error');

        ut.end();
    });

    ft.test('and', {skip: 0}, function (atst) {

        var right = 0;
        var left = 0;
        var up = 0;
        var down = 0;

        var q = fools.all().add(function (c) {
            if (c.x >= 0) {
                ++right;
            }
        }).add(function (c) {
                if (c.x < 0) {
                    ++left;
                }
            }).add(function (c) {
                if (c.y >= 0) {
                    ++up;
                }
            }).add(function (c) {
                if (c.y < 0) {
                    ++down;
                }
            });

        q({x: 2, y: -1})({x: -4, y: -4})({x: 4, y: 4})({x: -4, y: -4})({x: 4, y: -4});

        atst.equal(right, 3, 'three right side');
        atst.equal(left, 2, 'two left side');
        atst.equal(up, 1, 'one up side');
        atst.equal(down, 4, 'four down side');

        atst.end();
    });

    ft.test('fork', function (fork_test) {

        fork_test.test('simple fork', function (sf) {

            var positive = 0;
            var negative = 0;
            var errors = 0;

            var if_positive = fools.fork(function (n) {
                if (!_.isNumber(n)) {
                    var e = new Error('non numeric input');
                    e.data = n;
                    throw e;
                }
                return n >= 0;

            }).then(function () {
                    ++positive;
                }).else(function () {
                    ++negative;
                }).err(function () {
                    ++errors
                });

            if_positive(1)(0)(5)(-1)('foo');

            sf.equal(positive, 3, 'three positive numbers');
            sf.equal(negative, 1, 'one negative number');
            sf.equal(errors, 1, 'one error');
            sf.end();
        });

        fork_test.test('compound fork', function (cf) {

            var whole = 0;
            var zero = 0;
            var negative = 0;
            var errors = 0;

            var if_positive = fools.fork(function (n) {
                if (!_.isNumber(n)) {
                    var e = new Error('non numeric input');
                    e.data = n;
                    throw e;
                }
                return n >= 0;

            }).then(
                    fools.fork(function (n) {
                        return n > 0;
                    }).then(function () {
                            ++whole;
                        }).else(function () {
                            ++zero;
                        })

                ).else(function () {
                    ++negative;
                }).err(function () {
                    ++errors
                });

            if_positive(1)(0)(5)(-1)('foo');

            cf.equal(whole, 2, 'two whole numbers');
            cf.equal(negative, 1, 'one negative number');
            cf.equal(zero, 1, 'one zero');
            cf.equal(errors, 1, 'one error');
            cf.end();
        });

        fork_test.end();

    });
    ft.end();
});
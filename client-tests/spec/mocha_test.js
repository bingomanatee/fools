describe('fools', function () {

    describe('fork', function () {

        describe('simple fork', function () {

            var positive = 0;
            var negative = 0;
            var errors = 0;

            var if_positive = Fools.fork(function (n) {
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

            it('should have three positive number', function () {
                assert.equal(positive, 3, 'three positive numbers');
            });

            it('should have one negative number', function () {
                assert.equal(negative, 1, 'one negative number');
            })

            it('should have one error', function () {
                assert.equal(errors, 1, 'one error');
            });
        });

        describe('compound fork', function () {

            var whole = 0;
            var zero = 0;
            var negative = 0;
            var errors = 0;

            var if_positive = Fools.fork(function (n) {
                if (!_.isNumber(n)) {
                    var e = new Error('non numeric input');
                    e.data = n;
                    throw e;
                }
                return n >= 0;

            }).then(
                    Fools.fork(function (n) {
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

            it('should have two hole numbers', function () {
                assert.equal(whole, 2, 'two whole numbers');
            });

            it('should have one negative number', function () {
                assert.equal(negative, 1, 'one negative number');
            })

            it('should have one error', function () {
                assert.equal(errors, 1, 'one error');
            });

            it('should have one zero', function () {
                assert.equal(zero, 1, 'one zero');
            });
        });
    });

    describe('all', function () {

        var right = 0;
        var left = 0;
        var up = 0;
        var down = 0;

        var q = Fools.all().add(function (c) {
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

        it('should have three right sides', function () {
            assert.equal(right, 3, 'three right side');
        })

        it('should have two left sides', function () {
            assert.equal(left, 2, 'two left side');
        });

        it('should have one up side', function () {
            assert.equal(up, 1, 'one up side');
        });

        it('should have four down side', function () {
            assert.equal(down, 4, 'four down side');
        });

    });

    describe('until', function () {

        var positive = 0;
        var whole = 0;
        var zero = 0;
        var negative = 0;
        var errors = 0;
        var reached_end = false;
        var until_nums = Fools.until().add(function (n) {
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
                ++errors;
            });

        until_nums(1)(0)(5)(-1)('foo');

        it('should have 3 positive numbers', function () {
            assert.equal(positive, 3, 'three positive numbers');
        })

        it('should have 2 whole number', function () {

            assert.equal(whole, 2, 'two whole numbers');
        })

        it('should hace 1 negative number', function () {

            assert.equal(negative, 1, 'one negative number');
        });

        it('should hae one zero', function () {

            assert.equal(zero, 1, 'one zero');
        });

        it('should have one error', function () {
            assert.equal(errors, 1, 'one error');
            assert
        });

    })
});
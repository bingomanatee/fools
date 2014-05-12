function gauntlet() {

    /**
     *
     * if no test is valid, then gauntlet will throw an error.
     *
     * test functions have the profile
     *
     * testFn(input, isGood)
     *
     * if the test is positive, call isGood();
     *
     * The result of gauntlet will be the output of the first test function
     * for which isGood is called.
     *
     * @param input
     * @returns {*}
     * @constructor
     */

    var out = function Gauntlet(input) {
        try {
            for (var i = 0; i < out.tests.length; ++i) {
                var good = false;
                function isGood(){
                    good = true;
                }
                var result = out.tests[i](input, isGood);
                if (good) {
                    return result;
                }
            }
        } catch (err) {
            if (out.if_error) {
                return out.if_error(err);
            } else {
                throw err;
            }
        }

        if (out.if_last) {
            return out.if_last(input);
        } else {
            throw 'All tests failed';
        }
    };

    out.tests = [];

    Fools.util.add.add(out);
    Fools.util.add.err(out);
    Fools.util.add.run(out);
    for (var i = 0; i < arguments.length; ++i) {
        out.add(arguments[i]);
    }

    return out;
}

Fools.gauntlet = gauntlet;
function range() {

    var out = function Range(input) {

        try {
            var value = out.filter ? out.filter(input) : input;
            if (value < out.brackets[0]) {
                if (out.min) {
                    return typeof(out.min) == 'function' ? out.min(value, input) : out.min
                } else {
                    var error = new Error('below minimum bracket');
                    error.data = input;
                    error.value = value;
                    throw error;
                }
            } else if (value >= out.brackets[out.brackets.length - 1] && out.max) {
                return typeof(out.max) == 'function' ? out.max(value, input) : value;
            } else {
                for (var i = 0; i < out.brackets.length; ++i) {
                    var bracket_value = out.brackets[i];
                    var next_bracket = out.brackets[i + 1];
                    if ((value < next_bracket) && (value >= bracket_value )) {
                        var result = _.last(_.compact(out.outcomes.slice(0, i + 1)));
                        if (typeof result == 'function') {
                            return result(value, input, bracket_value, next_bracket);
                        } else {
                            return result;
                        }
                    }
                }

                if (out.max){
                    return (typeof this.max == 'function') ? this.max(value, input) : this.max;
                }

                var range_error = new Error('No brackedted result found');
                range_error.value = value;
                range_error.input = input;
                throw range_error;
            }
        }
        catch (err) {
            if (out.if_error) {
                return out.if_error(err)
            } else {
                throw err;
            }
        }

    };

    out.outcomes = [];
    out.brackets = [];

    out.add = function (value, outcome) {
        out.brackets.push(value);
        out.outcomes.push(outcome);
        return out;
    };

    out.add_min = function (outcome) {
        out.min = outcome;
        return out;
    };

    out.add_max = function (outcome) {
        out.max = outcome;
        return out;
    };

    out.add_filter = function (filter) {
        out.filter = filter;
        return out;
    };

    Fools.util.add.err(out);
    Fools.util.add.run(out);
    for (var i = 0; i < arguments.length; ++i) {
        out.add(arguments[i]);
    }

    return out;
}

Fools.range = range;
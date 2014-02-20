var Fools = {
    util: {
        math: {
              sum: function(){
                  var args = _.filter(_.toArray(arguments), _isNumber);
                  return _.reduce(args, function(o, v){ return o + v}, 0);
              }
        },
        add: {
            last: function (out) {
                out.last = function (fn) {
                    out.last_fn = fn;
                    return out;
                }
            },

            run: function (out) {
                out.run = function (input, pipe) {
                    var output = out(input);
                    if (pipe) {
                        pipe(output);
                    }
                    return out;
                }
            },

            err: function (out) {
                out.err = function (fn) {
                    out.if_error = fn;
                    return out;
                }
            },

            add: function (out) {
                out.add = function (test) {
                    out.tests.push(test);
                    return out;
                };
                return out;
            }
        }
    }
};


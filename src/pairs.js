function pairs(test, multi) {

    if (!test) {
        test = function (a, b) {
            return a === b;
        }
    }

    var out = function Pairs(setOne, setTwo) {
        setOne = setOne.slice(0);
        setTwo = setTwo.slice(0);

        var pairs = [];

        if (!(_.isArray(setOne) && _.isArray(setTwo))) {
            throw ('comparators must be arrays;')
        }

        if (!(setOne.length && setTwo.length)) {
            // console.log('one of the arrays is empty -- returning empty array');
            return [];
        }

        _.each(setOne, function (oneItem) {
            var matches = [];
            var complete = false;
            var finds = [];

            for (var i = 0; i < setTwo.length && !complete; ++i) {
                var candidate = setTwo[i];
                if (test(oneItem, candidate)) {
                    finds.push(i);
                    matches.push(candidate);
                    if (!multi) {
                        complete = true;
                    }
                }
            }

            finds.reverse();
            for (var f = 0; f < finds.length; ++f){
                setTwo.splice(finds[f],1);
            }

            if (matches.length) {
                if (multi) {
                    pairs.push([oneItem, matches])
                }
                else {
                    pairs.push([oneItem, _.first(matches)]);
                }
            }
        });

        return pairs;
    };

    return out;
}

Fools.pairs = pairs;
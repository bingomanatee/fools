function pairs(test) {

    if (!test){
        test = function(a, b){
            return a === b;
        }
    }

    var out = function Pairs(setOne, setTwo ) {
        setOne = setOne.slice(0);
        setTwo = setTwo.slice(0);

        var pairs =[];

        if (!(_.isArray(setOne) && _.isArray(setTwo))){
            throw ('comparators must be arrays;')
        }

        if (!(setOne.length && setTwo.length)){
           // console.log('one of the arrays is empty -- returning empty array');
            return [];
        }

        _.each(setOne, function(oneItem){
            var foundAt = -1;
            for (var i = 0; i < setTwo.length && (foundAt == -1); ++i){
                var candidate =  setTwo[i];
                if (test(oneItem, candidate)){
                    foundAt = i;
                } else  {
                  //  console.log('failed comparison %s -- %s', oneItem, candidate)
                }
            }

            if (foundAt != -1){
                pairs.push([oneItem, setTwo[foundAt]]);
                setTwo.splice(foundAt, 1);
            } else {
               // console.log('cannot match %s', oneItem);
            }
        });

        return pairs;
    };

    return out;
}

Fools.pairs = pairs;
## Fools.gauntlet : {function}

Gauntlet is similar to until in that a series of tests are run until one of them is true.
Unlike until, gauntlet returns an arbitrary value from the truthy test -- the return value of the test function
is not related to the truthiness of the test.
Gauntlet calls a series of tests on an input until one of them is true, and returns that tests' result.

In order for a function to both return true/false and return the maximum range of results, the
tests are passed a second parameter, isGood; call this method to validate the result.

``` javascript
   var bot_loc = {x: 0, y: 2};

        var min_x = 0;
        var max_x = 2;
        var min_y = 0;
        var max_y = 2;

        var gauntlet = Fools.gauntlet()
            .add(function (input, good) {

                if (bot_loc.y > min_y) {
                    good();
                    bot_loc.y -= 1;
                }
                return 'N';

            }).add(function (input, good) {
                if (bot_loc.x < max_x) {
                    good();
                    bot_loc.x += 1;
                }
                return 'E';
            });

        gauntlet.if_last = function () {
            return '0';
        };

        it ('should move north', function(){
            gauntlet().should.eql('N');
            bot_loc.should.eql({x: 0, y: 1});
        });

        it ('should move north again', function(){
            gauntlet().should.eql('N');
            bot_loc.should.eql({x: 0, y: 0});
        });

        it('should move east', function(){
            gauntlet().should.eql('E');
            bot_loc.should.eql({x: 1, y: 0});
        });

        it('should move east again', function(){
            gauntlet().should.eql('E');
            bot_loc.should.eql({x: 2, y: 0});
        });

        it('should not move', function(){
            gauntlet().should.eql('0');
            bot_loc.should.eql({x: 2, y: 0});
        });
  ```
var should = require('should');
var Fools = require('./../fools');
var _ = require('lodash');
var util = require('util');

describe('Fools', function() {

    describe('frameOfReference', function() {

        var frame, screenDef, unityDef, threeDef;

        before(function() {
            frame = Fools.frameOfReference();

            screenDef = frame.addDef('screen', {template: 'screenDom'}); // in the node context will have x width 0f 1024, y height of 768
            unityDef = frame.addDef('unity', {axes: {x: [-200, 200], y: [-50, 100], z: [100, 300]}, clamp: true }); // a three d environment in a unity game where the player space is 200 x 100 x 50
            threeDef = frame.addDef('three', {axes: {x: [0, 300], y: [0, 400], z: [0, 800]}, reversed: ['y']}); // a three d environment for a THREE.JS game - y is flipped, relative to Unity
        });

        describe('denormalize', function() {

            describe('basic denormalization', function() {

                describe('unity', function() {

                    it('should denormalize an origin -- array', function() {
                        frame.denormalize('unity', [0, 0, 0]).should.eql({x: -200, y: -50, z: 100});
                    });

                    it('should denormalize an origin -- object', function() {
                        frame.denormalize('unity', {x: 0, y: 0, z: 0}).should.eql({x: -200, y: -50, z: 100});
                    });

                    it('should denormalize an maximum -- array', function() {
                        frame.denormalize('unity', [1, 1, 1]).should.eql({x: 200, y: 100, z: 300});
                    });

                    it('should denormalize an maximum -- object', function() {
                        frame.denormalize('unity', {x: 1, y: 1, z: 1}).should.eql({x: 200, y: 100, z: 300});
                    });

                    it('should denormalize an center -- array', function() {
                        frame.denormalize('unity', [0.5, 0.5, 0.5]).should.eql({ x: 0, y: 25, z: 200 });
                    });

                    it('should denormalize an center -- object', function() {
                        frame.denormalize('unity', {x: 0.5, y: 0.5, z: 0.5}).should.eql({ x: 0, y: 25, z: 200 });
                    });

                });

                describe('three', function() {

                    it('should denormalize an origin -- array', function() {
                        frame.denormalize('three', [0, 0, 0]).should.eql({ x: 0, y: 400, z: 0 });
                    });

                    it('should denormalize an origin -- object', function() {
                        frame.denormalize('three', {x: 0, y: 0, z: 0}).should.eql({ x: 0, y: 400, z: 0 });
                    });

                    it('should denormalize an maximum -- array', function() {
                        frame.denormalize('three', [1, 1, 1]).should.eql({ x: 300, y: 0, z: 800 });
                    });

                    it('should denormalize an maximum -- object', function() {
                        frame.denormalize('three', {x: 1, y: 1, z: 1}).should.eql({ x: 300, y: 0, z: 800 });
                    });

                    it('should denormalize an center -- array', function() {
                        frame.denormalize('three', [0.5, 0.5, 0.5]).should.eql({ x: 150, y: 200, z: 400 });
                    });

                    it('should denormalize an center -- object', function() {
                        frame.denormalize('three', {x: 0.5, y: 0.5, z: 0.5}).should.eql({ x: 150, y: 200, z: 400 });
                    });
                })

            });

        });

        describe('normalize', function() {

            describe('screen denormalization', function(){

                it ('should denormalize a screen coordinate', function(){
                    frame.normalize('screen', {x: 0, y:0}).should.eql({x: 0, y: 1});

                });


            })

            describe('basic normalization', function() {
                it('should normalize at the zero coordinate -- object', function() {

                    unityDef.normalize({x: -200, y: -50, z: 100}).should.eql({x: 0, y: 0, z: 0}, 'testing for unityFrame at origin');
                })
                it('should normalize at the zero coordinate -- array', function() {

                    frame.normalize('unity', [-200, -50, 100]).should.eql({x: 0, y: 0, z: 0}, 'testing for unityFrame at origin -- array input');
                })
                it('should normalize at the center coordinate -- object', function() {

                    frame.normalize('unity', {x: 0, y: 25, z: 200}).should.eql({x: 0.5, y: 0.5, z: 0.5}, 'testing for UnityFrame at center');
                })
                it('should normalize at the center coordinate -- array', function() {

                    unityDef.normalize([0, 25, 200]).should.eql({x: 0.5, y: 0.5, z: 0.5}, 'testing for UnityFrame at center -- array input');
                });

                it('should normalize at the max coordinate -- object', function() {
                    unityDef.normalize({x: 200, y: 100, z: 300}).should.eql({x: 1, y: 1, z: 1}, 'testing for UnityFrame at maximum');
                });

                it('should normalize at the max coordinate -- array', function() {
                    unityDef.normalize([200, 100, 300]).should.eql({x: 1, y: 1, z: 1}, 'testing for UnityFrame at center -- array input');
                });
            });

            describe('normalization with reversed axes', function() {
                it('should reverse the y axis value', function() {
                    threeDef.normalize({x: 0, y: 0, z: 0}).should.eql({x: 0, y: 1, z: 0});
                });
            });

            describe('allows for missing dimensions', function() {
                it('should allow for absent dimension -- object', function() {
                    unityDef.normalize({x: -200, z: 100}).should.eql({x: 0, y: 0, z: 0});
                });

                it('should allow for absent dimensions -- array', function() {
                    unityDef.normalize([-200, -50]).should.eql({x: 0, y: 0, z: 0});
                })
            });

            describe('clamping', function() {

                describe('default values', function() {
                    it('should allow for dimensions default clamp setting of true', function() {
                        unityDef.normalize({x: -400, y: -400, z: -400}).should.eql({x: 0, y: 0, z: 0});
                    });

                    it('should allow for dimensions default clamp setting of false', function() {
                        threeDef.normalize({x: -300, y: 800, z: -800}).should.eql({x: -1, y: -1, z: -1});
                    });
                });

                describe('overrides', function() {

                    it('should allow for dimensions override clamp setting of true', function() {
                        threeDef.normalize({x: -300, y: 800, z: -800}, true).should.eql({x: 0, y: 0, z: 0});
                    });

                    it('should allow for dimensions override clamp setting of false', function() {
                        unityDef.normalize({x: -600, y: -200, z: -100}, false).should.eql({x: -1, y: -1, z: -1});
                    });
                })
            })

        });

        describe('normalize and denormalize inverse', function() {
            var mins = [], centers = [], maxs = [];

            before(function() {
                _.each(['screen', 'unity', 'three'], function(defName) {
                    mins.push({
                        name: defName,
                        value: frame.def(defName).min()
                    });

                    maxs.push({
                        name: defName,
                        value: frame.def(defName).min()
                    });

                    centers.push({
                        name: defName,
                        value: frame.def(defName).center()
                    })
                });

            });

            describe('normalize identity', function() {

                it('min denorm norm', function() {

                    _.each(mins, function(nv) {
                        var startValue = _.clone(nv.value);
                        var identity = frame.denormalize(nv.name, frame.normalize(nv.name, nv.value));
                        //  console.log('denorm(norm(%s)) == %s', util.inspect(startValue), util.inspect(identity));
                        startValue.should.eql(identity);
                    });
                });

                it('centers denorm norm', function() {

                    _.each(centers, function(nv) {
                        var startValue = _.clone(nv.value);
                        var identity = frame.denormalize(nv.name, frame.normalize(nv.name, nv.value));
                        //  console.log('denorm(norm(%s)) == %s', util.inspect(startValue), util.inspect(identity));
                        startValue.should.eql(identity);
                    });
                });

                it('maxs denorm norm', function() {

                    _.each(maxs, function(nv) {
                        var startValue = _.clone(nv.value);
                        var identity = frame.denormalize(nv.name, frame.normalize(nv.name, nv.value));
                        //  console.log('maxs(norm(%s)) == %s', util.inspect(startValue), util.inspect(identity));
                        startValue.should.eql(identity);
                    });
                });

            })

        });

        describe('translation', function() {
            var screenMin, screenCenter, screenMax;
            var unityMin, unityCenter, unityMax;
            var threeMin, threeCenter, threeMax;

            before(function() {
                screenMin = screenDef.min();
                screenCenter = screenDef.center();
                screenMax = screenDef.max();

                unityMin = unityDef.min();
                unityCenter = unityDef.center();
                unityMax = unityDef.max();

                threeMin = threeDef.min();
                threeCenter = threeDef.center();
                threeMax = threeDef.max();
            });

            describe('reflection API', function() {
                it('should have a screenMin of [0, 0]', function() {
                    screenMin.should.eql({x: 0, y: 0});
                });

                it('should have a screenMax of [640, 480]', function(){
                    screenMax.should.eql({x: 1024, y: 768 });
                });

                it('should have a unityMin of [-200, -50, 100]', function(){
                    unityMin.should.eql({x: -200, y: -50, z: 100});
                })

                it('should have a unityMax of [200, 100, 300]', function(){
                    unityMax.should.eql({x: 200, y: 100, z: 300});
                })
            });

            describe('translate screen to unity,', function() {

                describe('should translate unity min from screen min',
                    function() {
                        // since we are translating from a frame of reference without a z value we only compare x and y
                        it('should have the right value for translated x', function() {
                            frame.translate('screen', 'unity', screenMin).x.should.eql(unityMin.x);
                        });

                        it('should have the right value for translated y', function() {
                            // we take the max because of the flipping of dimensions of the y axis in the screen
                            frame.translate('screen', 'unity', screenMin).y.should.eql(unityMax.y);
                        });
                    });

                describe('should translate unity max from screen max',
                    function() {
                        // since we are translating from a frame of reference without a z value we only compare x and y
                        it('should have the right value for translated x', function() {
                            frame.translate('screen', 'unity', screenMax).x.should.eql(unityMax.x);
                        });

                        it('should have the right value for translated y', function() {
                            // we take the min because of the flipping of dimensions of the y axis in the screen
                            frame.translate('screen', 'unity', screenMax).y.should.eql(unityMin.y);
                        });
                    });
            });

            describe('translate screen to three,', function() {

                describe('should translate three min from screen min',
                    function() {
                        // since we are translating from a frame of reference without a z value we only compare x and y
                        it('should have the right value for translated x', function() {
                            frame.translate('screen', 'three', screenMin).x.should.eql(threeMin.x);
                        });

                        it('should have the right value for translated y', function() {
                            // both the screen and three have inverted y, so there should be no flipping
                            frame.translate('screen', 'three', screenMin).y.should.eql(threeMin.y);
                        });
                    });

                describe('should translate three max from screen max',
                    function() {
                        // since we are translating from a frame of reference without a z value we only compare x and y
                        it('should have the right value for translated x', function() {
                            frame.translate('screen', 'three', screenMax).x.should.eql(threeMax.x);
                        });

                        it('should have the right value for translated y', function() {
                            // we take the min because of the flipping of dimensions of the y axis in the screen
                            frame.translate('screen', 'three', screenMax).y.should.eql(threeMax.y);
                        });
                    });
            });
        })
    });
});

var should = require('should');
var Fools = require('./../fools');
var _ = require('lodash');
var util = require('util');

describe('Fools', function() {

    describe('frameOfReference', function() {
        describe('danielsCoordinateSystem', function() {
            var frame, leapLeft, leapRight, screenDef;
            var screenMin, screenCenter, screenMax;
            var leftMin, leftCenter, leftMax;
            var rightMin, rightCenter, rightMax;

            before(function() {
                frame = Fools.frameOfReference();

                leapLeft = frame.addDef('leapLeft', {
                    axes: {
                        x: [-125, 40],
                        y: [180, 250],
                        z: [-80, 110]
                    },
                    dimensions: ['x', 'y', 'z']
                });

                leapRight = frame.addDef('leapRight', {
                    axes: {
                        x: [-40, 125],
                        y: [108, 250],
                        z: [-80, 110]
                    }
                });

                screenDef = frame.addDef('screen', {template: 'screenDom'});

                screenMin = screenDef.min();
                screenCenter = screenDef.center();
                screenMax = screenDef.max();

                leftMin = leapLeft.min();
                leftCenter = leapLeft.center();
                leftMax = leapLeft.max();

                rightMin = leapRight.min();
                rightCenter = leapRight.center();
                rightMax = leapRight.max();
            });

            describe('reflection API', function() {
                it('should have a screenMin of [0, 0]', function() {
                    screenMin.should.eql({x: 0, y: 0});
                });

                it('should have a screenMax of [640, 480]', function() {
                    screenMax.should.eql({x: 1024, y: 768 });
                });

                it('should have a leftMin of [-125, 180, -80]', function() {
                    leftMin.should.eql({x: -125, y: 180, z: -80});
                });

                it('should have a leftCenter of { x: -42.5, y: 215, z: 15 } ', function() {
                    leftCenter.should.eql({ x: -42.5, y: 215, z: 15 });
                });

                it('should have a leftMax of { x: 40, y: 250, z: 110 }', function() {
                    leftMax.should.eql({ x: 40, y: 250, z: 110 });
                });

                it('should have a rightMin of { x: -40, y: 108, z: -80 }', function() {
                    rightMin.should.eql({ x: -40, y: 108, z: -80 });
                });

                it('should have a rightCenter of { x: 42.5, y: 179, z: 15 } ', function() {
                    rightCenter.should.eql({ x: 42.5, y: 179, z: 15 });
                });

                it('should have a rightMax of { x: 125, y: 250, z: 110 }', function() {
                    rightMax.should.eql({ x: 125, y: 250, z: 110 });
                });
            });

            describe ('left hand to screen', function(){

                it('should translate the center of the left hand region to the center of the screen', function(){
                    frame.translate('leapLeft', 'screen', leftCenter).should.eql(screenCenter);
                });

                it('should translate the center of the right hand region to the center of the screen', function(){
                    frame.translate('leapRight', 'screen', rightCenter).should.eql(screenCenter);
                });

            })

        });
    });

});

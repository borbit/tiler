function dummyTiles() {
    return [
        [-1, -1, $('<div class="tile _0">0</div>')],
        [0,  -1, $('<div class="tile _1">1</div>')],
        [1,  -1, $('<div class="tile _2">2</div>')],
        
        [-1, 0, $('<div class="tile _3">3</div>')],
        [0,  0, $('<div class="tile _4">4</div>')],
        [1,  0, $('<div class="tile _5">5</div>')],
        
        [-1, 1, $('<div class="tile _6">6</div>')],
        [0,  1, $('<div class="tile _7">7</div>')],
        [1,  1, $('<div class="tile _8">8</div>')]
    ];
}
                  
function createTiler(options) {
    var syncs = 0;
    var hNumber = 0;
    
    var element = $('<div></div>').tiler($.extend({}, {
        x: 0, y: 0,
        height: 100,
        width: 100,
        capture: 1,
        size: 100,
        
        holder: function() {
            var holder = $('<div/>');
            holder.addClass('holder _' + hNumber);
            holder.html(hNumber);
            hNumber++
            
            return holder;
        },
        sync: function(options, callback) {
            if (syncs++ == 0) {
                callback(dummyTiles());
            }
        }
    }, options));
    
    element.appendTo(document.body)
    
    return element;
}

module('Initialization');

test('widget is present', function() {
    var element = createTiler();
    ok(element.jquery);
    element.remove();
});

test('element has class "tilerViewport"', function() {
    var element = createTiler();
    ok(element.hasClass('tilerViewport'));
    element.remove();
});

test('"binder" is appended to the element', function() {
    var element = createTiler();
    var children = element.children();
    equals(children.length, 1);
    element.remove();
});

test('"binder" has class "tilerBinder"', function() {
    var element = createTiler();
    var children = element.children();
    ok($(children[0]).hasClass('tilerBinder'));
    element.remove();
});

test('"binder" position is absolute', function() {
    var element = createTiler();
    var children = element.children();
    equals($(children[0]).css('position'), 'absolute');
    element.remove();
});

test('"binder" has correct size', function() {
    var element = createTiler({size: 100, capture: 2});
    var binder = element.find('.tilerBinder');
    
    equals(binder.width(), 500);
    equals(binder.height(), 500);
    
    element.remove();
});

test('"binder" has correct position', function() {
    var element = createTiler({size: 100, capture: 2});
    var binder = element.find('.tilerBinder');
    
    equals(binder.css('top'), '-200px');
    equals(binder.css('left'), '-200px');
    
    element.remove();
});

module('Options');

test('initial values', function() {
    var element = $('<div/>').tiler();
    
    equals(element.tiler('option', 'width'), null);
    equals(element.tiler('option', 'height'), null);
    equals(element.tiler('option', 'binderClass'), 'tilerBinder');
    equals(element.tiler('option', 'viewportClass'), 'tilerViewport');
    equals(element.tiler('option', 'size'), null);
    equals(element.tiler('option', 'capture'), 2);
    equals(element.tiler('option', 'holder'), null);
    equals(element.tiler('option', 'sync'), null);
    equals(element.tiler('option', 'x'), 0);
    equals(element.tiler('option', 'y'), 0);
});

module('Behavior');

test('passed element\'s width is applied', function() {
    var expected = 200;
    var element = createTiler({width: expected});
    
    equals(element.width(), expected);
    
    element.remove();
});

test('passed element\'s height is applied', function() {
    var expected = 200;
    var element = createTiler({height: expected});
    
    equals(element.height(), expected);
    
    element.remove();
});

test('sync callback is called after initialization', function() {
    var spy = sinon.spy();
    var element = createTiler({sync: spy});
    
    ok(spy.calledOnce)
    
    element.remove();
});

test('holder callback is called after initialization', function() {
    var stub = sinon.stub().returns($('<div/>'));
    var element = createTiler({holder: stub});
    
    equal(stub.callCount, 9);
    
    element.remove();
});

test('sync callback is called with correct arguments', function() {
    var spy = sinon.spy();
    var element = createTiler({sync: spy});
    var expected = [[-1, -1], [0, -1], [1, -1],
                    [-1,  0], [0,  0], [1,  0],
                    [-1,  1], [0,  1], [1,  1]];
    
    deepEqual(spy.args[0][0], {
        coords: {x: 0, y: 0},
        tosync: expected,
        removed: []
    });
    
    ok($.isFunction(spy.args[0][1]));
    
    element.remove();
});

test('binder is filled by holders, holders have correct position', 9, function() {
    var element = createTiler({sync: function() {}});
    
    deepEqual(element.find('.holder._0').position(), {top: 0, left: 0});
    deepEqual(element.find('.holder._1').position(), {top: 0, left: 100});
    deepEqual(element.find('.holder._2').position(), {top: 0, left: 200});
    
    deepEqual(element.find('.holder._3').position(), {top: 100, left: 0});
    deepEqual(element.find('.holder._4').position(), {top: 100, left: 100});
    deepEqual(element.find('.holder._5').position(), {top: 100, left: 200});
    
    deepEqual(element.find('.holder._6').position(), {top: 200, left: 0});
    deepEqual(element.find('.holder._7').position(), {top: 200, left: 100});
    deepEqual(element.find('.holder._8').position(), {top: 200, left: 200});
    
    element.remove();
});

test('binder is filled by holders after it was dragged on a distance more then it size', function() {
    var element = createTiler();
    var binder = element.tiler('binder');

    binder.css('left', -1000)
          .css('top', -1000)
          .trigger('dragstop');
    
    equal(binder.find('.tile').length, 0);
    equal(binder.find('.holder').length, 9);
    
    element.remove();
});

test('binder is filled by tiles #1', function() {
    var element = createTiler();

    equal(element.find('.holder').length, 0);
    
    deepEqual(element.find('.tile._0').position(), {top: 0, left: 0});
    deepEqual(element.find('.tile._1').position(), {top: 0, left: 100});
    deepEqual(element.find('.tile._2').position(), {top: 0, left: 200});
    
    deepEqual(element.find('.tile._3').position(), {top: 100, left: 0});
    deepEqual(element.find('.tile._4').position(), {top: 100, left: 100});
    deepEqual(element.find('.tile._5').position(), {top: 100, left: 200});
    
    deepEqual(element.find('.tile._6').position(), {top: 200, left: 0});
    deepEqual(element.find('.tile._7').position(), {top: 200, left: 100});
    deepEqual(element.find('.tile._8').position(), {top: 200, left: 200});
    
    element.remove();
});

test('binder is filled by tiles #2', 3, function() {
    var element = createTiler({
        holder: null,
        sync: function(options, callback) {
            callback([
                [-1, -1, $('<div class="tile _0"></div>')],
                [0, 0, $('<div class="tile _1"></div>')],
                [1, 1, $('<div class="tile _2"></div>')]
            ]);
        }
    });
    
    deepEqual(element.find('.tile._0').position(), {top: 0, left: 0});
    deepEqual(element.find('.tile._1').position(), {top: 100, left: 100});
    deepEqual(element.find('.tile._2').position(), {top: 200, left: 200});
    
    element.remove();
});

// tiles is not synced and "holder" options is not passed
test('binder is not filled by tiles and holders', function() {
    var element = createTiler({sync: function() {}, holder: null});
    
    equal(element.find('.holder').length, 0);
    equal(element.find('.tile').length, 0);
    
    element.remove();
});

module('Binder dragging');

test('correct position changing #1', function() {
    var element = createTiler({capture: 2});
    var binder = element.tiler('binder');
    
    binder.css('left', -100);
    binder.css('top', -100);
    binder.trigger('dragstop');
    
    equal(binder.css('left'), '-200px');
    equal(binder.css('top'), '-200px');
    
    element.remove();
});

test('correct position changing #2', function() {
    var element = createTiler({capture: 2});
    var binder = element.tiler('binder');
    
    binder.css('left', -150);
    binder.css('top', -100);
    binder.trigger('dragstop');
    
    equal(binder.css('left'), '-150px');
    equal(binder.css('top'), '-200px');
    
    element.remove();
});

test('correct position changing #3', function() {
    var element = createTiler({capture: 2});
    var binder = element.tiler('binder');
    
    binder.css('left', -100);
    binder.css('top', -150);
    binder.trigger('dragstop');
    
    equal(binder.css('left'), '-200px');
    equal(binder.css('top'), '-150px');
    
    element.remove();
});

test('correct position changing #4', function() {
    var element = createTiler({capture: 2});
    var binder = element.tiler('binder');
    
    binder.css('left', -300);
    binder.css('top', -300);
    binder.trigger('dragstop');
    
    equal(binder.css('left'), '-200px');
    equal(binder.css('top'), '-200px');
    
    element.remove();
});

test('correct position changing #5', function() {
    var element = createTiler({capture: 2});
    var binder = element.tiler('binder');
    
    binder.css('left', -250);
    binder.css('top', -300);
    binder.trigger('dragstop');
    
    equal(binder.css('left'), '-250px');
    equal(binder.css('top'), '-200px');
    
    element.remove();
});

test('correct position changing #6', function() {
    var element = createTiler({capture: 2});
    var binder = element.tiler('binder');
    
    binder.css('left', -300);
    binder.css('top', -250);
    binder.trigger('dragstop');
    
    equal(binder.css('left'), '-200px');
    equal(binder.css('top'), '-250px');
    
    element.remove();
});

test('correct position changing #7', function() {
    var element = createTiler({capture: 2});
    var binder = element.tiler('binder');
    
    binder.css('left', -230).css('top', -230).trigger('dragstop');
    binder.css('left', -270).css('top', -270).trigger('dragstop');
    binder.css('left', -300).css('top', -300).trigger('dragstop');
    
    equal(binder.css('left'), '-200px');
    equal(binder.css('top'), '-200px');
    
    element.remove();
});

test('correct position changing #8', function() {
    var element = createTiler({capture: 2});
    var binder = element.tiler('binder');
    
    binder.css('left', -320).css('top', -320).trigger('dragstop');
    
    equal(binder.css('left'), '-220px');
    equal(binder.css('top'), '-220px');
    
    binder.css('left', -300).css('top', -300).trigger('dragstop');
    
    equal(binder.css('left'), '-200px');
    equal(binder.css('top'), '-200px');
    
    element.remove();
});

test('correct position changing #9', function() {
    var element = createTiler();
    var binder = element.tiler('binder');
    
    binder.css('left', -1000).css('top', -1000).trigger('dragstop');
    
    deepEqual(binder.position(), {left: -100, top: -100});
        
    element.remove();
});

// dragging from top to bottom and from left to right
test('tiles are removed #1', function() {
    var element = createTiler();
    var binder = element.tiler('binder');
    
    binder.css('left', 0);
    binder.css('top', 0);
    binder.trigger('dragstop');
        
    equal(binder.find('.tile').length, 4);
    equal(binder.find('.tile._2').length, 0);    
    equal(binder.find('.tile._5').length, 0);
    equal(binder.find('.tile._8').length, 0);
    equal(binder.find('.tile._6').length, 0);
    equal(binder.find('.tile._7').length, 0);
    
    element.remove();
});

// dragging from top to bottom and from left to right
test('tiles are removed #2', function() {
    var synced = false;
    var element = createTiler({
        holder: null,
        sync: function(options, callback) {
            if (synced) { return };
            
            callback([
                [-1, -1, $('<div class="tile _0"></div>')],
                [0, 0, $('<div class="tile _1"></div>')],
                [1, 1, $('<div class="tile _2"></div>')]
            ]);
            
            synced = true;
        }
    });
    
    var binder = element.tiler('binder');
    
    binder.css('left', 0);
    binder.css('top', 0);
    binder.trigger('dragstop');
        
    equal(binder.find('.tile').length, 2);
    equal(binder.find('.tile._2').length, 0);    
    equal(binder.find('.tile._0').length, 1);
    equal(binder.find('.tile._1').length, 1);
    
    element.remove();
});

// dragging from top to bottom and from left to right
test('tiles are removed #2', function() {
    var synced = false;
    var element = createTiler({
        holder: null,
        sync: function(options, callback) {
            if (synced) { return };
            
            callback([
                [-1, 0, $('<div class="tile _0"></div>')],
                [0, 0, $('<div class="tile _1"></div>')],
                [1, 0, $('<div class="tile _2"></div>')]
            ]);
            
            synced = true;
        }
    });
    
    var binder = element.tiler('binder');
    
    binder.css('left', 0);
    binder.css('top', 0);
    binder.trigger('dragstop');
        
    equal(binder.find('.tile').length, 2);
    equal(binder.find('.tile._2').length, 0);    
    equal(binder.find('.tile._0').length, 1);
    equal(binder.find('.tile._1').length, 1);
    
    element.remove();
});

// dragging from bottom to top and from right to left
test('tiles are removed #3', function() {
    var element = createTiler();
    var binder = element.tiler('binder');
    
    binder.css('left', -200);
    binder.css('top', -200);
    binder.trigger('dragstop');
        
    equal(binder.find('.tile').length, 4);
    equal(binder.find('.tile._0').length, 0);
    equal(binder.find('.tile._1').length, 0);    
    equal(binder.find('.tile._2').length, 0);
    equal(binder.find('.tile._3').length, 0);
    equal(binder.find('.tile._6').length, 0);
    
    element.remove();
});

// dragging from bottom to top and from right to left
test('tiles are removed #4', function() {
    var synced = false;
    var element = createTiler({
        holder: null,
        sync: function(options, callback) {
            if (synced) { return };
            
            callback([
                [-1, -1, $('<div class="tile _0"></div>')],
                [0, 0, $('<div class="tile _1"></div>')],
                [1, 1, $('<div class="tile _2"></div>')]
            ]);
            
            synced = true;
        }
    });
    
    var binder = element.tiler('binder');
    
    binder.css('left', -200);
    binder.css('top', -200);
    binder.trigger('dragstop');
        
    equal(binder.find('.tile').length, 2);
    equal(binder.find('.tile._0').length, 0);
    equal(binder.find('.tile._1').length, 1);    
    equal(binder.find('.tile._2').length, 1);
    
    element.remove();
});

// dragging from bottom to top and from right to left
test('tiles are removed #5', function() {
    var synced = false;
    var element = createTiler({
        holder: null,
        sync: function(options, callback) {
            if (synced) { return };
            
            callback([
                [-1, 0, $('<div class="tile _0"></div>')],
                [0, 0, $('<div class="tile _1"></div>')],
                [1, 0, $('<div class="tile _2"></div>')]
            ]);
            
            synced = true;
        }
    });
    
    var binder = element.tiler('binder');
    
    binder.css('left', -200);
    binder.css('top', -200);
    binder.trigger('dragstop');
        
    equal(binder.find('.tile').length, 2);
    equal(binder.find('.tile._0').length, 0);
    equal(binder.find('.tile._1').length, 1);    
    equal(binder.find('.tile._2').length, 1);
    
    element.remove();
});

test('tiles are moved (top and left)', function() {
    var element = createTiler();
    var binder = element.tiler('binder');
    
    binder.css('left', 0);
    binder.css('top', 0);
    binder.trigger('dragstop');
    
    deepEqual(binder.find('.tile._0').position(), {left: 100, top: 100});
    deepEqual(binder.find('.tile._1').position(), {left: 200, top: 100});
    deepEqual(binder.find('.tile._3').position(), {left: 100, top: 200});
    deepEqual(binder.find('.tile._4').position(), {left: 200, top: 200});
    
    element.remove();
});

test('tiles are moved (bottom and right)', function() {
    var element = createTiler();
    var binder = element.tiler('binder');
    
    binder.css('left', -200);
    binder.css('top', -200);
    binder.trigger('dragstop');
    
    deepEqual(binder.find('.tile._4').position(), {left: 0, top: 0});
    deepEqual(binder.find('.tile._5').position(), {left: 100, top: 0});
    deepEqual(binder.find('.tile._7').position(), {left: 0, top: 100});
    deepEqual(binder.find('.tile._8').position(), {left: 100, top: 100});
        
    element.remove();
});

test('holders are inserted on empty space (top and left)', function() {
    var element = createTiler();
    var binder = element.tiler('binder');
        
    binder.css('left', 0);
    binder.css('top', 0);
    binder.trigger('dragstop');
    
    deepEqual(binder.find('.holder._9').position(), {left: 0, top: 0});
    deepEqual(binder.find('.holder._10').position(), {left: 100, top: 0});
    deepEqual(binder.find('.holder._11').position(), {left: 200, top: 0});
    deepEqual(binder.find('.holder._12').position(), {left: 0, top: 100});
    deepEqual(binder.find('.holder._13').position(), {left: 0, top: 200});
    
    element.remove();
});

test('holders are inserted on empty space (bottom and right)', function() {
    var element = createTiler();
    var binder = element.tiler('binder');
    
    binder.css('left', -200);
    binder.css('top', -200);
    binder.trigger('dragstop');
    
    deepEqual(binder.find('.holder._9').position(), {left: 200, top: 0});
    deepEqual(binder.find('.holder._10').position(), {left: 200, top: 100});
    deepEqual(binder.find('.holder._11').position(), {left: 0, top: 200});
    deepEqual(binder.find('.holder._12').position(), {left: 100, top: 200});
    deepEqual(binder.find('.holder._13').position(), {left: 200, top: 200});
    
    element.remove();
});

module('"sync"');

test('coordinates of removed tiles are passed (top and left)', function() {
    var calls = 0;
    var element = createTiler({
        sync: function(options, callback) {
            if (++calls == 1) {
                callback(dummyTiles());
            }
            if (calls == 2) {
                deepEqual(options.removed, [[-1, -1], [0, -1], [1, -1], [-1, 0], [-1, 1]]);
            }
        }
    });
    
    var binder = element.tiler('binder');
    binder.css('left', -200);
    binder.css('top', -200);
    binder.trigger('dragstop');
    
    element.remove();
});

test('coordinates of removed tiles are passed (bottom and right)', function() {
    var calls = 0;
    var element = createTiler({
        sync: function(options, callback) {
            if (++calls == 1) {
                callback(dummyTiles());
            }
            if (calls == 2) {
                deepEqual(options.removed, [[1,-1],[1, 0],[-1, 1],[0, 1],[1, 1]]);
            }
        }
    });
    
    var binder = element.tiler('binder');
    binder.css('left', 0);
    binder.css('top', 0);
    binder.trigger('dragstop');
    
    element.remove();
});

module('"binder" method');

test('returns reference to the "binder"', function() {
    var element = createTiler();
    var binder = element.tiler('binder');
    
    ok(binder.hasClass('tilerBinder'));
    
    element.remove();
});

module('"refresh" method');

test('binder is resized after viewport is resized', function() {
    var calls = 0;
    var element = createTiler({
        sync: function(options, callback) {
            if (++calls == 1) {
                callback(dummyTiles());
            }
        }
    });
    
    var binder = element.tiler('binder');
    
    element.height(200);
    element.width(200);
    element.tiler('refresh');
    
    equal(binder.height(), 400);
    equal(binder.width(), 400);
    
    element.remove();
});

test('holders are inserted after viewport size is increased', function() {
    var calls = 0;
    var element = createTiler({
        sync: function(options, callback) {
            if (++calls == 1) {
                callback(dummyTiles());
            }
        }
    });
    
    var binder = element.tiler('binder');
    
    element.height(200);
    element.width(200);
    element.tiler('refresh');
    
    deepEqual(binder.find('.holder._9').position(),  {left: 300, top: 0});
    deepEqual(binder.find('.holder._10').position(), {left: 300, top: 100});
    deepEqual(binder.find('.holder._11').position(), {left: 300, top: 200});
    deepEqual(binder.find('.holder._12').position(), {left: 0, top: 300});
    deepEqual(binder.find('.holder._13').position(), {left: 100, top: 300});
    deepEqual(binder.find('.holder._14').position(), {left: 200, top: 300});
    deepEqual(binder.find('.holder._15').position(), {left: 300, top: 300});
    
    element.remove();
});

test('tiles are synced and inserted after viewport size is increased', function() {
    var newDummyTiles = [
        [2, -1, $('<div class="tile _9">9</div>')],
        [2, 0,  $('<div class="tile _10">10</div>')],
        [2, 1,  $('<div class="tile _11">11</div>')],
        [-1, 2, $('<div class="tile _12">12</div>')],
        [0, 2,  $('<div class="tile _13">13</div>')],
        [1, 2,  $('<div class="tile _14">14</div>')],
        [2, 2,  $('<div class="tile _15">15</div>')]
    ];
                      
    var calls = 0;
    var element = createTiler({
        capture: 1,
        sync: function(options, callback) {
            if (++calls == 1) {
                callback(dummyTiles());
            }
            if (calls == 2) {
                callback(newDummyTiles);
            }
        }
    });
    
    var binder = element.tiler('binder');
    
    element.height(200);
    element.width(200);    
    element.tiler('refresh');
    
    deepEqual(binder.find('.tile._9').position(),  {left: 300, top: 0});
    deepEqual(binder.find('.tile._10').position(), {left: 300, top: 100});
    deepEqual(binder.find('.tile._11').position(), {left: 300, top: 200});
    deepEqual(binder.find('.tile._12').position(), {left: 0, top: 300});
    deepEqual(binder.find('.tile._13').position(), {left: 100, top: 300});
    deepEqual(binder.find('.tile._14').position(), {left: 200, top: 300});
    deepEqual(binder.find('.tile._15').position(), {left: 300, top: 300});
    
    element.remove();
});

test('tiles are removed after viewport size is decreased', function() {
    var dummyTiles = [
        [-1, -1, $('<div class="tile _0">1</div>')],
        [0, -1, $('<div class="tile _1">2</div>')],
        [1, -1, $('<div class="tile _2">3</div>')],
        [2, -1, $('<div class="tile _3">4</div>')],
        [-1, 0, $('<div class="tile _4">5</div>')],
        [0,  0, $('<div class="tile _5">6</div>')],
        [1,  0, $('<div class="tile _6">7</div>')],
        [2,  0, $('<div class="tile _7">8</div>')],
        [-1, 1, $('<div class="tile _8">9</div>')],
        [0,  1, $('<div class="tile _9">10</div>')],
        [1,  1, $('<div class="tile _10">11</div>')],
        [2,  1, $('<div class="tile _11">12</div>')],
        [-1, 2, $('<div class="tile _12">13</div>')],
        [0,  2, $('<div class="tile _13">14</div>')],
        [1,  2, $('<div class="tile _14">15</div>')],
        [2,  2, $('<div class="tile _15">16</div>')]];
    
    var calls = 0;
    var element = createTiler({
        height: 200,
        width: 200,
        sync: function(options, callback) {
            calls++;
            if (calls == 1) {
                callback(dummyTiles);
            }
        }
    });
    
    element.height(100);
    element.width(100);
    element.tiler('refresh');
    
    ok(!element.find('.tile._3').length);
    ok(!element.find('.tile._7').length);
    ok(!element.find('.tile._11').length);
    ok(!element.find('.tile._12').length);
    ok(!element.find('.tile._13').length);
    ok(!element.find('.tile._14').length);
    ok(!element.find('.tile._15').length);
    
    element.remove();
});

test('"sync" method is called with correct "toSync" data after viewport size is increased', 1, function() {
    var expected = [[2, -1], [2, 0], [2, 1], [-1, 2], [0, 2], [1, 2], [2, 2]];
                      
    var calls = 0;
    var element = createTiler({
        sync: function(options) {
            if (++calls == 2) {
                deepEqual(options.tosync, expected);
            }
        }
    });
    
    element.height(200);
    element.width(200);
    
    element.tiler('refresh');    
    element.remove();
});

module('"position" method');

test('resets binder position', function() {
    var element = createTiler();
    var binder = element.tiler('binder');
    
    binder.css('left', -150);
    binder.css('top', -150);
    
    element.tiler('position', 0, 0)
    
    deepEqual(binder.position(), {top: -100, left: -100});

    element.remove();
});

test('syncs missing tiles', 1, function() {
    var calls = 0;
    var element = createTiler({
        sync: function(options, callback) {
            if (++calls == 1) {
                callback(dummyTiles());
            }
            if (calls == 2) {
                deepEqual(options.tosync, [[2, 0],[2, 1],[0, 2],[1, 2],[2, 2]]);
            }
        }
    });
    
    element.tiler('position', 1, 1);
    element.remove();
});

test('removes unnecessary tiles', 1, function() {
    var calls = 0;
    var element = createTiler({
        sync: function(options, callback) {
            if (++calls == 1) {
                callback(dummyTiles());
            }
            if (calls == 2) {
                deepEqual(options.removed, [[-1, -1],[0, -1],[1, -1],[-1, 0],[-1, 1]]);
            }
        }
    });
    
    element.tiler('position', 1, 1);
    element.remove();
});

module('"reload" method');

test('syncs all tiles', 1, function() {
    var calls = 0;
    var element = createTiler({
        sync: function(options, callback) {
            if (++calls == 1) {
                callback(dummyTiles());
            }
            if (calls == 2) {
                deepEqual(options.tosync, [[-1, -1], [0, -1], [1, -1], [-1,  0],
                    [0,  0], [1,  0], [-1,  1], [0,  1], [1,  1]]);
            }
        }
    });
    
    element.tiler('reload');
    element.remove();
});

test('removes all tiles', function() {
    var element = createTiler();
    element.tiler('reload');
    
    equal(element.find('.tile').length, 0);
    
    element.remove();
});

test('doesn\'t remove all tiles if "silent" option is passed', function() {
    var element = createTiler();
    element.tiler('reload', {silent: true});
    
    equal(element.find('.tile').length, 9);
    
    element.remove();
});

test('replaces old tiles with new if "silent" option is passed', function() {
    var calls = 0;
    var element = createTiler({
        sync: function(options, callback) {
            if (++calls == 1) {
                callback(dummyTiles());
            }
            if (calls == 2) {
                callback([
                    [-1, -1, $('<div class="newTile">0</div>')],
                    [0,  -1, $('<div class="newTile">1</div>')],
                    [1,  -1, $('<div class="newTile">2</div>')],
                    [-1, 0, $('<div class="newTile">3</div>')],
                    [0,  0, $('<div class="newTile">4</div>')],
                    [1,  0, $('<div class="newTile">5</div>')],
                    [-1, 1, $('<div class="newTile">6</div>')],
                    [0,  1, $('<div class="newTile">7</div>')],
                    [1,  1, $('<div class="newTile">8</div>')]
                ]);
            }
        }
    });
    
    element.tiler('reload');
    
    equal(element.find('.tile').length, 0);
    equal(element.find('.newTile').length, 9);
    
    element.remove();
});
module('Initialization');

var dummyOptions = {
    height: 100,
    width: 100,
    size: 100,
    capture: 1,
    x: 0, y: 0
};

var dummyTiles = [{x: -1, y: -1, data: 0}, {x: 0, y: -1, data: 1}, {x: 1, y: -1, data: 2},
                  {x: -1, y:  0, data: 3}, {x: 0, y:  0, data: 4}, {x: 1, y:  0, data: 5},
                  {x: -1, y:  1, data: 6}, {x: 0, y:  1, data: 7}, {x: 1, y:  1, data: 8}];
                  
function createTiler(options) {
    var pNumber = 0, tNumber = 0, syncs = 0;
    
    return $('<div></div>').tiler($.extend({}, dummyOptions, {
        holder: function() {
            return $('<div class="holder _' + pNumber + '">' + pNumber++ + '</div>');
        },
        tile: function(data) {
            return $('<div class="tile _' + tNumber + '">' + tNumber++ + '</div>');
        },
        sync: function(toSync, callback) {
            if (syncs++ == 0) {
                callback(dummyTiles);
            }
        }
    }, options)).appendTo(document.body);
}

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
    var element = $('<div></div>').tiler();
    
    equals(element.tiler('option', 'width'), null, 'width');
    equals(element.tiler('option', 'height'), null, 'height');
    equals(element.tiler('option', 'binderClass'), 'tilerBinder', 'binderClass');
    equals(element.tiler('option', 'viewportClass'), 'tilerViewport', 'viewportClass');
    equals(element.tiler('option', 'size'), null, 'size');
    equals(element.tiler('option', 'capture'), 2, 'capture');
    equals(element.tiler('option', 'sync'), null, 'sync');
    equals(element.tiler('option', 'tile'), null, 'tile');
    equals(element.tiler('option', 'holder'), null, 'holder');
    equals(element.tiler('option', 'x'), 0, 'x');
    equals(element.tiler('option', 'y'), 0, 'y');
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

test('sync callback is called after initialization', 1, function() {
    var element = createTiler({sync: function() {
        ok(true, 'sync is called');
    }});
    
    element.remove();
});

test('holder callback is called after initialization', 9, function() {
    var calls = 1;
    var element = createTiler({holder: function() {
        ok(true, 'holder is called ' + calls + 'time');
        return $('<div class="holder"></div>')
    }});
    
    element.remove();
});

test('sync callback is called with correct arguments', 2, function() {
    var expected = [{x: -1, y: -1}, {x: 0, y: -1}, {x: 1, y: -1},
                    {x: -1, y:  0}, {x: 0, y:  0}, {x: 1, y:  0},
                    {x: -1, y:  1}, {x: 0, y:  1}, {x: 1, y:  1}];
                    
    var element = createTiler({sync: function(toSync, callback) {
        deepEqual(toSync, expected, 'first argument is an array of coordinates for tiles to sync');
        ok($.isFunction(callback), 'second argument is a callback to call after tiles synced');
    }});
    
    element.remove();
});

test('tile callback is called with correct arguments', 9, function() {
    var calls = 0;
    var element = createTiler({
        tile: function(data) {
            deepEqual(data, dummyTiles[calls++].data);
            return $('<div class="tile">' + data + '</div>');
        }
    });
    
    element.remove();
});

test('binder is filled by holders #1', 18, function() {
    var number = 0;
    var element = createTiler({
        sync: function(toSync, callback) {
            setTimeout(function() { callback(dummyTiles); })
        }
    });
    
    var coords = [{top: 0, left: 0},   {top: 0, left: 100},   {top: 0, left: 200},
                  {top: 100, left: 0}, {top: 100, left: 100}, {top: 100, left: 200},
                  {top: 200, left: 0}, {top: 200, left: 100}, {top: 200, left: 200}];
    
    element.find('.holder').each(function(i, holder) {
        var index = $(holder).html();
        equal($(holder).css('top'), coords[index].top + 'px');
        equal($(holder).css('left'), coords[index].left + 'px');
    });
    
    element.remove();
});

test('binder is filled by holders #2', function() {
    var element = createTiler();
    
    var coords = [{top: 0, left: 0},   {top: 0, left: 100},   {top: 0, left: 200},
                  {top: 100, left: 0}, {top: 100, left: 100}, {top: 100, left: 200},
                  {top: 200, left: 0}, {top: 200, left: 100}, {top: 200, left: 200}];
                  
    var binder = element.find('.tilerBinder');

    binder.css('left', -1000).css('top', -1000).trigger('dragstop');
    
    equal(binder.find('.tile').length, 0);
    equal(binder.find('.holder').length, 9);
    
    element.remove();
});

test('binder is filled by tiles and holders are removed', 19, function() {
    var coords = [{top: 0, left: 0},   {top: 0, left: 100},   {top: 0, left: 200},
                  {top: 100, left: 0}, {top: 100, left: 100}, {top: 100, left: 200},
                  {top: 200, left: 0}, {top: 200, left: 100}, {top: 200, left: 200}];
    
    var element = createTiler();
    
    equal(element.find('.tilerBinder .holder').length, 0);
    
    element.find('.tilerBinder .tile').each(function(i, tile) {
        var index = $(tile).html();
        equal($(tile).css('top'), coords[index].top + 'px');
        equal($(tile).css('left'), coords[index].left + 'px');
    });
    
    element.remove();
});

test('binder is filled by tiles, holders are not present', 19, function() {
    var coords = [{top: 0, left: 0},   {top: 0, left: 100},   {top: 0, left: 200},
                  {top: 100, left: 0}, {top: 100, left: 100}, {top: 100, left: 200},
                  {top: 200, left: 0}, {top: 200, left: 100}, {top: 200, left: 200}];
    
    var element = createTiler({holder: null});
    
    equal(element.find('.tilerBinder .holder').length, 0);
    
    element.find('.tilerBinder .tile').each(function(i, tile) {
        var index = $(tile).html();
        equal($(tile).css('top'), coords[index].top + 'px');
        equal($(tile).css('left'), coords[index].left + 'px');
    });
    
    element.remove();
});

test('binder dragging -> correct position changing #1', function() {
    var element = createTiler({capture: 2});
    var binder = element.find('.tilerBinder');
    
    binder.css('left', -100);
    binder.css('top', -100);
    binder.trigger('dragstop');
    
    equal(binder.css('left'), '-200px');
    equal(binder.css('top'), '-200px');
    
    element.remove();
});

test('binder dragging -> correct position changing #2', function() {
    var element = createTiler({capture: 2});
    var binder = element.find('.tilerBinder');
    
    binder.css('left', -150);
    binder.css('top', -100);
    binder.trigger('dragstop');
    
    equal(binder.css('left'), '-150px');
    equal(binder.css('top'), '-200px');
    
    element.remove();
});

test('binder dragging -> correct position changing #3', function() {
    var element = createTiler({capture: 2});
    var binder = element.find('.tilerBinder');
    
    binder.css('left', -100);
    binder.css('top', -150);
    binder.trigger('dragstop');
    
    equal(binder.css('left'), '-200px');
    equal(binder.css('top'), '-150px');
    
    element.remove();
});

test('binder dragging -> correct position changing #4', function() {
    var element = createTiler({capture: 2});
    var binder = element.find('.tilerBinder');
    
    binder.css('left', -300);
    binder.css('top', -300);
    binder.trigger('dragstop');
    
    equal(binder.css('left'), '-200px');
    equal(binder.css('top'), '-200px');
    
    element.remove();
});

test('binder dragging -> correct position changing #5', function() {
    var element = createTiler({capture: 2});
    var binder = element.find('.tilerBinder');
    
    binder.css('left', -250);
    binder.css('top', -300);
    binder.trigger('dragstop');
    
    equal(binder.css('left'), '-250px');
    equal(binder.css('top'), '-200px');
    
    element.remove();
});

test('binder dragging -> correct position changing #6', function() {
    var element = createTiler({capture: 2});
    var binder = element.find('.tilerBinder');
    
    binder.css('left', -300).css('top', -250).trigger('dragstop');
    
    equal(binder.css('left'), '-200px');
    equal(binder.css('top'), '-250px');
    
    element.remove();
});

test('binder dragging -> correct position changing #7', function() {
    var element = createTiler({capture: 2});
    var binder = element.find('.tilerBinder');
    
    binder.css('left', -230).css('top', -230).trigger('dragstop');
    binder.css('left', -270).css('top', -270).trigger('dragstop');
    binder.css('left', -300).css('top', -300).trigger('dragstop');
    
    equal(binder.css('left'), '-200px');
    equal(binder.css('top'), '-200px');
    
    element.remove();
});

test('binder dragging -> correct position changing #8', function() {
    var element = createTiler({capture: 2});
    var binder = element.find('.tilerBinder');
    
    binder.css('left', -320).css('top', -320).trigger('dragstop');
    
    equal(binder.css('left'), '-220px');
    equal(binder.css('top'), '-220px');
    
    binder.css('left', -300).css('top', -300).trigger('dragstop');
    
    equal(binder.css('left'), '-200px');
    equal(binder.css('top'), '-200px');
    
    element.remove();
});

test('binder dragging -> correct position changing #9', function() {
    var element = createTiler();
    var binder = element.find('.tilerBinder');
    
    binder.css('left', -1000).css('top', -1000).trigger('dragstop');
    
    deepEqual(binder.position(), {left: -100, top: -100});
        
    element.remove();
});

test('binder dragging -> tiles are removed (top and left)', function() {
    var calls = 0;
    var element = createTiler({
        capture: 1,
        sync: function(toSync, callback) {
            if (calls++ == 0) {
                callback(dummyTiles);
            }
        }
    });
    var binder = element.find('.tilerBinder');
    
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

test('binder dragging -> tiles are removed (bottom and right)', function() {
    var calls = 0;
    var element = createTiler({
        capture: 1,
        sync: function(toSync, callback) {
            if (calls++ == 0) {
                callback(dummyTiles);
            }
        }
    });
    
    var binder = element.find('.tilerBinder');
    
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

test('binder dragging -> tiles are moved (top and left)', function() {
    var calls = 0;
    var element = createTiler({
        capture: 1,
        sync: function(toSync, callback) {
            if (calls++ == 0) {
                callback(dummyTiles);
            }
        }
    });
    var binder = element.find('.tilerBinder');
    
    binder.css('left', 0);
    binder.css('top', 0);
    binder.trigger('dragstop');
    
    deepEqual(binder.find('.tile._0').position(), {left: 100, top: 100});
    deepEqual(binder.find('.tile._1').position(), {left: 200, top: 100});
    deepEqual(binder.find('.tile._3').position(), {left: 100, top: 200});
    deepEqual(binder.find('.tile._4').position(), {left: 200, top: 200});
    
    element.remove();
});

test('binder dragging -> tiles are moved (bottom and right)', function() {
    var calls = 0;
    var element = createTiler({
        capture: 1,
        sync: function(toSync, callback) {
            if (calls++ == 0) {
                callback(dummyTiles);
            }
        }
    });
    var binder = element.find('.tilerBinder');
    
    binder.css('left', -200);
    binder.css('top', -200);
    binder.trigger('dragstop');
    
    deepEqual(binder.find('.tile._4').position(), {left: 0, top: 0});
    deepEqual(binder.find('.tile._5').position(), {left: 100, top: 0});
    deepEqual(binder.find('.tile._7').position(), {left: 0, top: 100});
    deepEqual(binder.find('.tile._8').position(), {left: 100, top: 100});
        
    element.remove();
});

test('binder dragging -> holders are inserted on empty space (top and left)', function() {
    var calls = 0;
    var element = createTiler({
        capture: 1,
        sync: function(toSync, callback) {
            if (calls++ == 0) {
                callback(dummyTiles);
            }
        }
    });
    var binder = element.find('.tilerBinder');
        
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

test('binder dragging -> holders are inserted on empty space (bottom and right)', function() {
    var calls = 0;
    var element = createTiler({
        capture: 1,
        sync: function(toSync, callback) {
            if (calls++ == 0) {
                callback(dummyTiles);
            }
        }
    });
    var binder = element.find('.tilerBinder');
    
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

test('"refresh" method -> binder is resized after viewport is resized', function() {
    var calls = 0;
    var element = createTiler({
        capture: 1,
        sync: function(toSync, callback) {
            calls++;
            if (calls == 1) {
                callback(dummyTiles);
            }
        }
    });
    
    var binder = element.find('.tilerBinder');
    
    element.height(200);
    element.width(200);
    element.tiler('refresh');
    
    equal(binder.height(), 400);
    equal(binder.width(), 400);
    
    element.remove();
});

test('"refresh" method -> holders are inserted after viewport size is increased', function() {
    var calls = 0;
    var element = createTiler({
        capture: 1,
        sync: function(toSync, callback) {
            calls++;
            if (calls == 1) {
                callback(dummyTiles);
            }
        }
    });
    
    var binder = element.find('.tilerBinder');
    
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

test('"refresh" method -> tiles are synced and inserted after viewport size is increased', function() {
    var newDummyTiles = [{x: 2, y:  -1, data: 3}, {x: 2, y:  0, data: 7}, {x: 2, y:  1, data: 11}, {x: -1, y: 2, data: 12},
                         {x: 0, y: 2, data: 13}, {x: 1, y: 2, data: 14}, {x: 2, y: 2, data: 15}];
                      
    var calls = 0;
    var element = createTiler({
        capture: 1,
        sync: function(toSync, callback) {
            calls++;
            if (calls == 1) {
                callback(dummyTiles);
            }
            if (calls == 2) {
                callback(newDummyTiles);
            }
        }
    });
    
    var binder = element.find('.tilerBinder');
    
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

test('"refresh" method -> "sync" method is called with correct "toSync" data after viewport size is increased', 1, function() {
    var expected = [{x: 2, y:  -1}, {x: 2, y:  0}, {x: 2, y:  1}, {x: -1, y: 2}, {x: 0, y: 2}, {x: 1, y: 2}, {x: 2, y: 2}];
                      
    var calls = 0;
    var element = createTiler({
        capture: 1,
        sync: function(toSync, callback) {
            calls++;
            if (calls == 1) {
                callback(dummyTiles);
            }
            if (calls == 2) {
                deepEqual(toSync, expected);
            }
        }
    });
    
    element.height(200);
    element.width(200);
    
    element.tiler('refresh');    
    element.remove();
});

/*test('"refresh" method -> tiles are removed after viewport size is decreased', function() {
    var dummyTiles = [{x: -1, y: -1, data: 0}, {x: 0, y: -1, data: 1}, {x: 1, y: -1, data: 2}, {x: 2, y:  -1, data: 3},
                      {x: -1, y: 0, data: 4}, {x: 0, y:  0, data: 5}, {x: 1, y:  0, data: 6}, {x: 2, y:  0, data: 7},
                      {x: -1, y: 1, data: 8}, {x: 0, y: 1, data: 9}, {x: 1, y:  1, data: 10}, {x: 2, y:  1, data: 11},
                      {x: -1, y: 2, data: 12}, {x: 0, y: 2, data: 13}, {x: 1, y: 2, data: 14}, {x: 2, y: 2, data: 15}];
    
    var calls = 0;
    var element = createTiler({
        capture: 1,
        height: 200,
        width: 200,
        
        sync: function(toSync, callback) {
            calls++;
            if (calls == 1) {
                callback(dummyTiles);
            }
        }
    });
    
    var binder = element.find('.tilerBinder');
    
    element.height(100);
    element.width(100);
    element.tiler('refresh');
    
    ok(!binder.find('.tile._3').length);
    ok(!binder.find('.tile._7').length);
    ok(!binder.find('.tile._11').length);
    ok(!binder.find('.tile._12').length);
    ok(!binder.find('.tile._13').length);
    ok(!binder.find('.tile._14').length);
    ok(!binder.find('.tile._15').length);
    
    element.remove();
});*/
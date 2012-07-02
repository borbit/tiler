function dummyTiles() {
  return [
    [-1, -1, $('<div class="tile _0">0</div>')],
    [ 0, -1, $('<div class="tile _1">1</div>')],
    [ 1, -1, $('<div class="tile _2">2</div>')],

    [-1, 0, $('<div class="tile _3">3</div>')],
    [ 0, 0, $('<div class="tile _4">4</div>')],
    [ 1, 0, $('<div class="tile _5">5</div>')],

    [-1, 1, $('<div class="tile _6">6</div>')],
    [ 0, 1, $('<div class="tile _7">7</div>')],
    [ 1, 1, $('<div class="tile _8">8</div>')]
  ];
}

function createTiler(options) {
  var element = $('<div/>').appendTo(document.body);
  element.css('height', (options && options.height) || 100);
  element.css('width', (options && options.width) || 100);

  var tiler = new Tiler(element, $.extend({}, {
    x: 0, y: 0, tileSize: 100, margin: 1
  }, options));

  return tiler;
}

module('Initialization');

// "element" passed as a jQuery element
test('"grid" is appended to the element #1', function() {
  var element = $('<div/>');
  var tiler = new Tiler(element, {sync: $.noop});
  
  ok($.contains(element[0], tiler.grid[0]));
  equals(element.children().length, 1);
});

// "element" passed as a DOM element
test('"grid" is appended to the element #2', function() {
  var element = document.createElement('div');
  var tiler = new Tiler(element, {sync: $.noop});
  
  ok($.contains(element, tiler.grid[0]));
  equals($(element).children().length, 1);
});

test('"grid" position is absolute', function() {
  var tiler = createTiler();
  equals(tiler.grid.css('position'), 'absolute');
  tiler.element.remove();
});

test('"grid" has correct size', function() {
  var tiler = createTiler({size: 100, margin: 2});
  equals(tiler.grid.width(), 500);
  equals(tiler.grid.height(), 500);
  tiler.element.remove();
});

test('"grid" has correct position', function() {
  var tiler = createTiler({size: 100, margin: 2});
  equals(tiler.grid.css('top'), '-200px');
  equals(tiler.grid.css('left'), '-200px');
  tiler.element.remove();
});

module('Options');

test('initial values', function() {
  ok(Tiler.defaults.tileSize === null);
  ok(Tiler.defaults.fetch === null);
  equals(Tiler.defaults.margin, 2);
  equals(Tiler.defaults.x, 0);
  equals(Tiler.defaults.y, 0);
});

module('"fetch" callback');

test('is called with correct arguments #1', function() {
  var spy = sinon.spy();
  var tiler = createTiler({fetch: spy});
  
  tiler.refresh();
  
  var expRemoved = [];
  var expToFetch = [[-1, -1], [0, -1], [1, -1],
                   [-1,  0], [0,  0], [1,  0],
                   [-1,  1], [0,  1], [1,  1]];
  
  
  deepEqual(spy.args[0][0], expToFetch);
  deepEqual(spy.args[0][1], expRemoved);

  tiler.element.remove();
});

// grid is dragged (top and left)
test('is called with correct arguments #2', function() {
  var spy = sinon.spy();
  var tiler = createTiler({fetch: spy});

  tiler.refresh();
  tiler.show(dummyTiles());
  tiler.grid.css({top: -200, left: -200});
  tiler.refresh();

  var expRemoved = [[-1, -1], [0, -1], [1, -1], [-1, 0], [-1, 1]];
  var expToFetch = [[2, 0], [2, 1], [0, 2], [1, 2], [2, 2]];

  deepEqual(spy.args[1][0], expToFetch);
  deepEqual(spy.args[1][1], expRemoved);

  tiler.element.remove();
});

// grid is dragged (bottom and right)
test('is called with correct arguments #3', function() {
  var spy = sinon.spy();
  var tiler = createTiler({fetch: spy});
  
  tiler.refresh();
  tiler.show(dummyTiles());
  tiler.grid.css({top: 0, left: 0});
  tiler.refresh();

  var expRemoved = [[1, -1], [1, 0], [-1, 1], [0, 1], [1, 1]];
  var expToFetch = [[-2, -2], [-1, -2], [0, -2], [-2, -1], [-2, 0]];

  deepEqual(spy.args[1][0], expToFetch);
  deepEqual(spy.args[1][1], expRemoved);

  tiler.element.remove();
});

test('is called with correct arguments after viewport size is increased', function() {
  var spy = sinon.spy();
  var tiler = createTiler({fetch: spy});
  
  tiler.refresh();
  tiler.show(dummyTiles());
  tiler.element.height(200);
  tiler.element.width(200);
  tiler.refresh();

  var expRemoved = [];
  var expToFetch = [[2, -1], [2, 0], [2, 1], [-1, 2], [0, 2], [1, 2], [2, 2]];

  deepEqual(spy.args[1][0], expToFetch);
  deepEqual(spy.args[1][1], expRemoved);

  tiler.element.remove();
});

test('is called with correct arguments after viewport size is reduced', function() {
  var spy = sinon.spy();
  var tiles = dummyTiles();
  var tiler = createTiler({height: 200, width: 200, fetch: spy});
  

  tiles.push([2, -1, $('<div/>')]);
  tiles.push([2,  0, $('<div/>')]);
  tiles.push([2,  1, $('<div/>')]);
  tiles.push([-1, 2, $('<div/>')]);
  tiles.push([0,  2, $('<div/>')]);
  tiles.push([1,  2, $('<div/>')]);
  tiles.push([2,  2, $('<div/>')]);
  
  tiler.refresh();
  tiler.show(tiles);
  tiler.element.height(100);
  tiler.element.width(100);
  tiler.refresh();

  var expRemoved = [[2, -1], [2, 0], [2, 1], [-1, 2], [0, 2], [1, 2], [2, 2]];
  var expToFetch = [];

  deepEqual(spy.args[1][0], expToFetch);
  deepEqual(spy.args[1][1], expRemoved);

  tiler.element.remove();
});

module('"show" method');

// Tiles are provided as jQuery objects
test('"grid" is filled by tiles #1', function() {
  var tiler = createTiler();
  
  tiler.refresh();  
  tiler.show(dummyTiles());

  deepEqual(tiler.element.find('.tile._0').position(), {top: 0, left: 0});
  deepEqual(tiler.element.find('.tile._1').position(), {top: 0, left: 100});
  deepEqual(tiler.element.find('.tile._2').position(), {top: 0, left: 200});
  deepEqual(tiler.element.find('.tile._3').position(), {top: 100, left: 0});
  deepEqual(tiler.element.find('.tile._4').position(), {top: 100, left: 100});
  deepEqual(tiler.element.find('.tile._5').position(), {top: 100, left: 200});
  deepEqual(tiler.element.find('.tile._6').position(), {top: 200, left: 0});
  deepEqual(tiler.element.find('.tile._7').position(), {top: 200, left: 100});
  deepEqual(tiler.element.find('.tile._8').position(), {top: 200, left: 200});
  deepEqual(tiler.element.find('.tile').length, 9);

  tiler.element.remove();
});

// Tiles are provided as DOM elements
test('"grid" is filled by tiles #2', function() {
  var tiler = createTiler();
  
  tiler.refresh();
  tiler.show([
    [-1, -1, $('<div class="tile _0"></div>').get(0)],
    [ 0,  0, $('<div class="tile _1"></div>').get(0)],
    [ 1,  1, $('<div class="tile _2"></div>').get(0)]
  ]);
  
  deepEqual(tiler.element.find('.tile._0').position(), {top: 0, left: 0});
  deepEqual(tiler.element.find('.tile._1').position(), {top: 100, left: 100});
  deepEqual(tiler.element.find('.tile._2').position(), {top: 200, left: 200});
  deepEqual(tiler.element.find('.tile').length, 3);

  tiler.element.remove();
});

test('"grid" is filled by tiles #3', function() {
  var tiler = createTiler();
  
  tiler.refresh();
  tiler.show([
    [-1, -1, $('<div class="tile _0"></div>')],
    [ 0,  0, $('<div class="tile _1"></div>')],
    [ 1,  1, $('<div class="tile _2"></div>')]
  ]);

  deepEqual(tiler.element.find('.tile._0').position(), {top: 0, left: 0});
  deepEqual(tiler.element.find('.tile._1').position(), {top: 100, left: 100});
  deepEqual(tiler.element.find('.tile._2').position(), {top: 200, left: 200});
  deepEqual(tiler.element.find('.tile').length, 3);

  tiler.element.remove();
});

test('"grid" is filled by tiles #4',  function() {
  var tiler = createTiler();
  
  tiler.refresh();
  tiler.show([
    [-1, -1, $('<div class="tile _0"></div>')],
    [ 1,  1, $('<div class="tile _2"></div>')]
  ]);

  deepEqual(tiler.element.find('.tile._0').position(), {top: 0, left: 0});
  deepEqual(tiler.element.find('.tile._2').position(), {top: 200, left: 200});
  deepEqual(tiler.element.find('.tile').length, 2);

  tiler.element.remove();
});
 
test('"grid" is filled by tiles #5',  function() {
  var tiler = createTiler();
  
  tiler.refresh();
  tiler.show(-1, -1, $('<div class="tile _0"></div>'));
  tiler.show( 1,  1, $('<div class="tile _2"></div>'));

  deepEqual(tiler.element.find('.tile._0').position(), {top: 0, left: 0});
  deepEqual(tiler.element.find('.tile._2').position(), {top: 200, left: 200});
  deepEqual(tiler.element.find('.tile').length, 2);

  tiler.element.remove();
});

test('"grid" is filled by tiles #6',  function() {
  var tiler = createTiler();
  
  tiler.refresh();
  tiler.show([
    [-1, -1, [$('<div class="t _0"></div>'), $('<div class="t _1"></div>')]],
    [ 1,  1, [$('<div class="t _2"></div>'), $('<div class="t _2"></div>')]]
  ]);

  deepEqual(tiler.element.find('_0').position(), {top: 0, left: 0});
  deepEqual(tiler.element.find('_1').position(), {top: 0, left: 0});
  deepEqual(tiler.element.find('_2').position(), {top: 200, left: 200});
  deepEqual(tiler.element.find('_3').position(), {top: 200, left: 200});
  deepEqual(tiler.element.find('.t').length, 4);

  tiler.element.remove();
});

test('"grid" is filled by tiles #7',  function() {
  var tiler = createTiler();
  
  tiler.refresh();
  tiler.show(-1, -1, [$('<div class="t _0"></div>'), $('<div class="t _1"></div>')]);
  tiler.show( 1,  1, [$('<div class="t _2"></div>'), $('<div class="t _2"></div>')]);

  deepEqual(tiler.element.find('_0').position(), {top: 0, left: 0});
  deepEqual(tiler.element.find('_1').position(), {top: 0, left: 0});
  deepEqual(tiler.element.find('_2').position(), {top: 200, left: 200});
  deepEqual(tiler.element.find('_3').position(), {top: 200, left: 200});
  deepEqual(tiler.element.find('.t').length, 4);

  tiler.element.remove();
});

module('"refresh" method');

test('grid position changed #1', function() {
  var tiler = createTiler({margin: 2});
  
  tiler.refresh();
  tiler.grid.css({top: -100, left: -100});
  tiler.refresh();

  deepEqual(tiler.grid.position(), {top: -200, left: -200});

  tiler.element.remove();
});

test('grid position changed #2', function() {
  var tiler = createTiler({margin: 2});
  
  tiler.refresh();
  tiler.grid.css({top: -100, left: -150});
  tiler.refresh();

  deepEqual(tiler.grid.position(), {top: -200, left: -150});

  tiler.element.remove();
});

test('grid position changed #3', function() {
  var tiler = createTiler({margin: 2});
  
  tiler.refresh();
  tiler.grid.css({top: -150, left: -100});
  tiler.refresh();

  deepEqual(tiler.grid.position(), {top: -150, left: -200});

  tiler.element.remove();
});

test('grid position changed #4', function() {
  var tiler = createTiler({margin: 2});
  
  tiler.refresh();
  tiler.grid.css({top: -300, left: -300});
  tiler.refresh();

  deepEqual(tiler.grid.position(), {top: -200, left: -200});

  tiler.element.remove();
});

test('grid position changed #5', function() {
  var tiler = createTiler({margin: 2});
  
  tiler.refresh();
  tiler.grid.css({top: -300, left: -250});
  tiler.refresh();

  deepEqual(tiler.grid.position(), {top: -200, left: -250});

  tiler.element.remove();
});

test('grid position changed #6', function() {
  var tiler = createTiler({margin: 2});
  
  tiler.refresh();
  tiler.grid.css({top: -250, left: -300});
  tiler.refresh();

  deepEqual(tiler.grid.position(), {top: -250, left: -200});

  tiler.element.remove();
});

test('grid position changed #7', function() {
  var tiler = createTiler({margin: 2});
  
  tiler.refresh();

  tiler.grid.css({left: -230, top: -230}); tiler.refresh();
  tiler.grid.css({left: -270, top: -270}); tiler.refresh();
  tiler.grid.css({left: -300, top: -300}); tiler.refresh();

  deepEqual(tiler.grid.position(), {top: -200, left: -200});

  tiler.element.remove();
});

test('grid position changed #8', function() {
  var tiler = createTiler({margin: 2});
  
  tiler.refresh();
  tiler.grid.css({left: -320, top: -320});
  tiler.refresh();

  deepEqual(tiler.grid.position(), {top: -220, left: -220});

  tiler.grid.css({left: -300, top: -300});
  tiler.refresh();

  deepEqual(tiler.grid.position(), {top: -200, left: -200});

  tiler.element.remove();
});

test('grid position changed #9', function() {
  var tiler = createTiler();
  
  tiler.refresh();
  tiler.grid.css({left: -1000, top: -1000});
  tiler.refresh();
  
  deepEqual(tiler.grid.position(), {left: -100, top: -100});
  
  tiler.element.remove();
});

// dragging from top to bottom and from left to right
test('unnecessary tiles are removed #1', function() {
  var tiler = createTiler();
  
  tiler.refresh();
  tiler.show(dummyTiles());
  tiler.grid.css({left: 0, top: 0});
  tiler.refresh();

  equal(tiler.grid.find('.tile').length, 4);
  equal(tiler.grid.find('.tile._2').length, 0);
  equal(tiler.grid.find('.tile._5').length, 0);
  equal(tiler.grid.find('.tile._8').length, 0);
  equal(tiler.grid.find('.tile._6').length, 0);
  equal(tiler.grid.find('.tile._7').length, 0);

  tiler.element.remove();
});

// dragging from top to bottom and from left to right
test('unnecessary tiles are removed #2', function() {
  var tiler = createTiler();
  
  tiler.refresh();
  tiler.show([
    [-1, -1, $('<div class="tile _0"></div>')],
    [ 0,  0, $('<div class="tile _1"></div>')],
    [ 1,  1, $('<div class="tile _2"></div>')]
  ]);

  tiler.grid.css({left: 0, top: 0});
  tiler.refresh();

  equal(tiler.grid.find('.tile._2').length, 0);
  equal(tiler.grid.find('.tile._0').length, 1);
  equal(tiler.grid.find('.tile._1').length, 1);
  equal(tiler.grid.find('.tile').length, 2);

  tiler.element.remove();
});

// dragging from top to bottom and from left to right
test('unnecessary tiles are removed #3', function() {
  var tiler = createTiler();
  
  tiler.refresh();
  tiler.show([
    [-1, 0, $('<div class="tile _0"></div>')],
    [ 0, 0, $('<div class="tile _1"></div>')],
    [ 1, 0, $('<div class="tile _2"></div>')]
  ]);

  tiler.grid.css({left: 0, top: 0});
  tiler.refresh();

  equal(tiler.grid.find('.tile._2').length, 0);
  equal(tiler.grid.find('.tile._0').length, 1);
  equal(tiler.grid.find('.tile._1').length, 1);
  equal(tiler.grid.find('.tile').length, 2);

  tiler.element.remove();
});

// dragging from bottom to top and from right to left
test('unnecessary tiles are removed #4', function() {
  var tiler = createTiler();
  
  tiler.refresh();
  tiler.show(dummyTiles());
  tiler.grid.css({left: -200, top: -200});
  tiler.refresh();

  equal(tiler.grid.find('.tile._0').length, 0);
  equal(tiler.grid.find('.tile._1').length, 0);
  equal(tiler.grid.find('.tile._2').length, 0);
  equal(tiler.grid.find('.tile._3').length, 0);
  equal(tiler.grid.find('.tile._6').length, 0);
  equal(tiler.grid.find('.tile').length, 4);

  tiler.element.remove();
});

// dragging from bottom to top and from right to left
test('unnecessary tiles are removed #5', function() {
  var tiler = createTiler();
  
  tiler.refresh();
  tiler.show([
    [-1, -1, $('<div class="tile _0"></div>')],
    [ 0,  0, $('<div class="tile _1"></div>')],
    [ 1,  1, $('<div class="tile _2"></div>')]
  ]);

  tiler.grid.css({left: -200, top: -200});
  tiler.refresh();

  equal(tiler.grid.find('.tile._0').length, 0);
  equal(tiler.grid.find('.tile._1').length, 1);
  equal(tiler.grid.find('.tile._2').length, 1);
  equal(tiler.grid.find('.tile').length, 2);

  tiler.element.remove();
});

// dragging from bottom to top and from right to left
test('unnecessary tiles are removed #6', function() {
  var fetched = false;
  var tiler = createTiler();
  
  tiler.refresh();
  tiler.show([
    [-1, 0, $('<div class="tile _0"></div>')],
    [ 0, 0, $('<div class="tile _1"></div>')],
    [ 1, 0, $('<div class="tile _2"></div>')]
  ]);

  tiler.grid.css({left: -200, top: -200});
  tiler.refresh();

  equal(tiler.grid.find('.tile._0').length, 0);
  equal(tiler.grid.find('.tile._1').length, 1);
  equal(tiler.grid.find('.tile._2').length, 1);
  equal(tiler.grid.find('.tile').length, 2);

  tiler.element.remove();
});

test('unnecessary tiles are removed #7', function() {
  var dummyTiles = [
    [-1, -1, $('<div class="tile _0">1</div>')],
    [ 0, -1, $('<div class="tile _1">2</div>')],
    [ 1, -1, $('<div class="tile _2">3</div>')],
    [ 2, -1, $('<div class="tile _3">4</div>')],
    [-1,  0, $('<div class="tile _4">5</div>')],
    [ 0,  0, $('<div class="tile _5">6</div>')],
    [ 1,  0, $('<div class="tile _6">7</div>')],
    [ 2,  0, $('<div class="tile _7">8</div>')],
    [-1,  1, $('<div class="tile _8">9</div>')],
    [ 0,  1, $('<div class="tile _9">10</div>')],
    [ 1,  1, $('<div class="tile _10">11</div>')],
    [ 2,  1, $('<div class="tile _11">12</div>')],
    [-1,  2, $('<div class="tile _12">13</div>')],
    [ 0,  2, $('<div class="tile _13">14</div>')],
    [ 1,  2, $('<div class="tile _14">15</div>')],
    [ 2,  2, $('<div class="tile _15">16</div>')]
  ];

  var tiler = createTiler();

  tiler.refresh();
  tiler.show(dummyTiles);

  tiler.element.height(100);
  tiler.element.width(100);
  tiler.refresh();

  ok(!tiler.element.find('.tile._3').length);
  ok(!tiler.element.find('.tile._7').length);
  ok(!tiler.element.find('.tile._11').length);
  ok(!tiler.element.find('.tile._12').length);
  ok(!tiler.element.find('.tile._13').length);
  ok(!tiler.element.find('.tile._14').length);
  ok(!tiler.element.find('.tile._15').length);

  tiler.element.remove();
});

// dragging from bottom to top and from right to left
test('unnecessary tiles are removed #6', function() {
  var fetched = false;
  var tiler = createTiler();
  
  tiler.refresh();
  tiler.show([
    [-1, 0, [$('<div class="t _00"></div>'), $('<div class="t _01"></div>')]],
    [ 0, 0, [$('<div class="t _10"></div>'), $('<div class="t _11"></div>')]],
    [ 1, 0, [$('<div class="t _20"></div>'), $('<div class="t _21"></div>')]]
  ]);

  tiler.grid.css({left: -200, top: -200});
  tiler.refresh();

  equal(tiler.grid.find('_00').length, 0);
  equal(tiler.grid.find('_01').length, 0);
  equal(tiler.grid.find('_10').length, 1);
  equal(tiler.grid.find('_11').length, 1);
  equal(tiler.grid.find('_20').length, 1);
  equal(tiler.grid.find('_21').length, 1);
  equal(tiler.grid.find('.t').length, 4);

  tiler.element.remove();
});

test('visible tiles are moved (top and left, single)', function() {
  var tiler = createTiler();
  
  tiler.refresh();
  tiler.show(dummyTiles());
  tiler.grid.css({left: 0, top: 0});
  tiler.refresh();

  deepEqual(tiler.grid.find('.tile._0').position(), {left: 100, top: 100});
  deepEqual(tiler.grid.find('.tile._1').position(), {left: 200, top: 100});
  deepEqual(tiler.grid.find('.tile._3').position(), {left: 100, top: 200});
  deepEqual(tiler.grid.find('.tile._4').position(), {left: 200, top: 200});

  tiler.element.remove();
});

test('visible tiles are moved (top and left, multiple)', function() {
  var tiler = createTiler();
  
  tiler.refresh();
  tiler.show([
    [-1, 0, [$('<div class="t _00"></div>'), $('<div class="t _01"></div>')]],
    [ 0, 0, [$('<div class="t _10"></div>'), $('<div class="t _11"></div>')]],
    [ 1, 0, [$('<div class="t _20"></div>'), $('<div class="t _21"></div>')]]
  ]);

  tiler.grid.css({left: 0, top: 0});
  tiler.refresh();

  deepEqual(tiler.grid.find('_00').position(), {left: 100, top: 200});
  deepEqual(tiler.grid.find('_01').position(), {left: 100, top: 200});
  deepEqual(tiler.grid.find('_10').position(), {left: 200, top: 200});
  deepEqual(tiler.grid.find('_11').position(), {left: 200, top: 200});

  tiler.element.remove();
});

test('visible tiles are moved (bottom and right)', function() {
  var tiler = createTiler();
  
  tiler.refresh();
  
  tiler.show(dummyTiles());
  tiler.grid.css({left: -200, top: -200});
  tiler.refresh();

  deepEqual(tiler.grid.find('.tile._4').position(), {left: 0, top: 0});
  deepEqual(tiler.grid.find('.tile._5').position(), {left: 100, top: 0});
  deepEqual(tiler.grid.find('.tile._7').position(), {left: 0, top: 100});
  deepEqual(tiler.grid.find('.tile._8').position(), {left: 100, top: 100});

  tiler.element.remove();
});

test('visible tiles are moved (bottom and right, multiple)', function() {
  var tiler = createTiler();
  
  tiler.refresh();
  tiler.show([
    [-1, 0, [$('<div class="t _00"></div>'), $('<div class="t _01"></div>')]],
    [ 0, 0, [$('<div class="t _10"></div>'), $('<div class="t _11"></div>')]],
    [ 1, 0, [$('<div class="t _20"></div>'), $('<div class="t _21"></div>')]]
  ]);

  tiler.grid.css({left: -200, top: -200});
  tiler.refresh();

  deepEqual(tiler.grid.find('_10').position(), {left: 0, top: 0});
  deepEqual(tiler.grid.find('_11').position(), {left: 0, top: 0});
  deepEqual(tiler.grid.find('_20').position(), {left: 100, top: 0});
  deepEqual(tiler.grid.find('_21').position(), {left: 100, top: 0});

  tiler.element.remove();
});

test('grid is increased after the viewport is increased', function() {
  var tiler = createTiler();
  
  tiler.refresh();
  tiler.element.height(200);
  tiler.element.width(200);
  tiler.refresh();

  equal(tiler.grid.height(), 400);
  equal(tiler.grid.width(), 400);

  tiler.element.remove();
});

test('grid is reduced after the viewport is reduced', function() {
  var tiler = createTiler({
    height: 200
  , width: 200
  });
  
  tiler.refresh();
  tiler.element.height(100);
  tiler.element.width(100);
  tiler.refresh();

  equal(tiler.grid.height(), 300);
  equal(tiler.grid.width(), 300);

  tiler.element.remove();
});

test('new tiles are shown if they fall within the grid area', function() {
  var newDummyTiles = [
    [ 2, -1, $('<div class="tile _9">9</div>')],
    [ 2,  0, $('<div class="tile _10">10</div>')],
    [ 2,  1, $('<div class="tile _11">11</div>')],
    [-1,  2, $('<div class="tile _12">12</div>')],
    [ 0,  2, $('<div class="tile _13">13</div>')],
    [ 1,  2, $('<div class="tile _14">14</div>')],
    [ 2,  2, $('<div class="tile _15">15</div>')]
  ];

  var tiler = createTiler();
  
  tiler.refresh();
  tiler.show(dummyTiles());

  tiler.element.height(200);
  tiler.element.width(200);

  tiler.refresh();
  tiler.show(newDummyTiles);

  deepEqual(tiler.grid.find('.tile._9').position(), {left: 300, top: 0});
  deepEqual(tiler.grid.find('.tile._10').position(), {left: 300, top: 100});
  deepEqual(tiler.grid.find('.tile._11').position(), {left: 300, top: 200});
  deepEqual(tiler.grid.find('.tile._12').position(), {left: 0, top: 300});
  deepEqual(tiler.grid.find('.tile._13').position(), {left: 100, top: 300});
  deepEqual(tiler.grid.find('.tile._14').position(), {left: 200, top: 300});
  deepEqual(tiler.grid.find('.tile._15').position(), {left: 300, top: 300});

  tiler.element.remove();
});

test('new tiles are not shown if they don\'t fall within the grid area', function() {
  var newDummyTiles = [
    [ 2, -1, $('<div class="tile _9">9</div>')],
    [ 2,  0, $('<div class="tile _10">10</div>')],
    [ 2,  1, $('<div class="tile _11">11</div>')],
    [-1,  2, $('<div class="tile _12">12</div>')],
    [ 0,  2, $('<div class="tile _13">13</div>')],
    [ 1,  2, $('<div class="tile _14">14</div>')],
    [ 2,  2, $('<div class="tile _15">15</div>')]
  ];

  var tiler = createTiler();
  
  tiler.refresh();
  tiler.show(dummyTiles());
  tiler.show(newDummyTiles);

  ok(!tiler.grid.find('.tile._9').length);
  ok(!tiler.grid.find('.tile._10').length);
  ok(!tiler.grid.find('.tile._11').length);
  ok(!tiler.grid.find('.tile._12').length);
  ok(!tiler.grid.find('.tile._13').length);
  ok(!tiler.grid.find('.tile._14').length);
  ok(!tiler.grid.find('.tile._15').length);

  tiler.element.remove();
});

module('"coords" method');

test('resets grid position', function() {
  var tiler = createTiler();
  
  tiler.refresh();
  tiler.grid.css({left: -150, top: -150});
  tiler.coords(0, 0);

  deepEqual(tiler.grid.position(), {top: -100, left: -100});

  tiler.element.remove();
});

test('fetches missing and removes unnecessary tiles', function() {
  var spy = sinon.spy();
  var tiler = createTiler({fetch: spy});
  
  tiler.refresh();
  tiler.show(dummyTiles());
  tiler.coords(1, 1);

  var expRemoved = [[-1, -1], [0, -1], [1, -1], [-1, 0], [-1, 1]];
  var expToFetch = [[2, 0], [2, 1], [0, 2], [1, 2], [2, 2]];

  deepEqual(spy.args[1][0], expToFetch);
  deepEqual(spy.args[1][1], expRemoved);

  tiler.element.remove();
});

test('returns current position if arguments are not passed', function() {
  var expectedX = 100;
  var expectedY = 200;
  var tiler = createTiler({
    x: expectedX
  , y: expectedY
  });

  var coords = tiler.coords();

  equal(coords.x, expectedX);
  equal(coords.y, expectedY);

  tiler.element.remove();
});

module('"reload" method');

test('fetches all tiles #1', function() {
  var spy = sinon.spy();
  var tiler = createTiler({fetch: spy});

  tiler.refresh();
  tiler.show(dummyTiles());
  tiler.reload();

  var expToFetch = [[-1, -1], [0, -1], [1, -1], [-1, 0], [0, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];
  var expRemoved = [];

  deepEqual(spy.args[1][0], expToFetch);
  deepEqual(spy.args[1][1], expRemoved);
  
  tiler.element.remove();
});

test('fetches all tiles #2', function() {
  var spy = sinon.spy();
  var tiler = createTiler({fetch: spy});

  tiler.refresh();
  tiler.reload();

  var expToFetch = [[-1, -1], [0, -1], [1, -1], [-1, 0], [0, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];
  var expRemoved = [];

  deepEqual(spy.args[1][0], expToFetch);
  deepEqual(spy.args[1][1], expRemoved);
  
  tiler.element.remove();
});
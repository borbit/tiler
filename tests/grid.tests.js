module('Grid');

test('inherited from "Row"', function() {
    var grid = new Grid();
    
    ok(grid instanceof Row);
});

test('initialization #1', function() {
    var width = 5;
    var height = 10;
    
    var grid = new Grid(width, height);

    equal(grid.width, width);
    equal(grid.height, height);
});

test('initialization #2', function() {
    var width = 5;
    var height = 10;
    var placeholder = 1;

    var grid = new Grid(width, height, placeholder);
    
    for (var y = height; y--;) {
    for (var x = width; x--;) {
        equal(grid.getCell(x, y), placeholder);
    }}
});

test('"setCell"', function() {
    var grid = new Grid();
    
    grid.setCell(0, 0, 1);
    grid.setCell(1, 0, 2);
    grid.setCell(2, 0, 3);
    
    grid.setCell(0, 1, 4);
    grid.setCell(1, 1, 5);
    grid.setCell(2, 1, 6);
    
    ok(grid.items[0] instanceof Row);
    ok(grid.items[1] instanceof Row);
    
    equal(grid.items[0].items[0], 1);
    equal(grid.items[0].items[1], 2);
    equal(grid.items[0].items[2], 3);
    
    equal(grid.items[1].items[0], 4);
    equal(grid.items[1].items[1], 5);
    equal(grid.items[1].items[2], 6);
});

test('"setCell"', function() {
    var grid = new Grid();
    
    grid.setCell(0, 0, 1);
    grid.setCell(1, 0, 2);
    grid.setCell(2, 0, 3);
    
    grid.setCell(0, 1, 4);
    grid.setCell(1, 1, 5);
    grid.setCell(2, 1, 6);
        
    equal(grid.getCell(0, 0), 1);
    equal(grid.getCell(1, 0), 2);
    equal(grid.getCell(2, 0), 3);
    
    equal(grid.getCell(0, 1), 4);
    equal(grid.getCell(1, 1), 5);
    equal(grid.getCell(2, 1), 6);
});

test('"onCell"', function() {
    var grid = new Grid();
    
    grid.setCell(-3, -1, 1);
    grid.setCell(-2, -1, 2);
    grid.setCell(-1, -1, 3);
    
    grid.setCell(-3, 0, 4);
    grid.setCell(-2, 0, 5);
    grid.setCell(-1, 0, 6);
        
    equal(grid.onCell(0, 0), 1);
    equal(grid.onCell(1, 0), 2);
    equal(grid.onCell(2, 0), 3);
    
    equal(grid.onCell(0, 1), 4);
    equal(grid.onCell(1, 1), 5);
    equal(grid.onCell(2, 1), 6);
});

test('"remove" #1', function() {
    var grid = new Grid();
    
    grid.setCell(0, 0, 1);
    grid.setCell(1, 0, 2);
    grid.setCell(2, 0, 3);
    
    grid.remove(1, 0);
    grid.remove(2, 0);
    
    equal(grid.getCell(0, 0), 1);
    equal(grid.getCell(1, 0), undefined);
    equal(grid.getCell(2, 0), undefined);
});

test('"remove" #2', function() {
    var grid = new Grid();
    
    grid.setCell(0, 0, 1);
    grid.setCell(1, 0, 2);
    grid.setCell(2, 0, 3);
    
    grid.remove(0, 0);
    grid.remove(1, 0);
    grid.remove(2, 0);
    
    equal(grid.get(0), undefined);
});

test('"remove" #3', function() {
    var grid = new Grid();
    
    grid.setCell(0, 0, 1);
    grid.setCell(1, 0, 2);
    grid.setCell(2, 0, 3);
    
    grid.remove(0);
    
    equal(grid.get(0), undefined);
});

test('"remove" #4', function() {
    var grid = new Grid();
    
    grid.setCell(0, 0, 1);
    grid.setCell(1, 0, 2);
    grid.setCell(2, 0, 3);
    
    grid.remove([[1, 0], [2, 0]]);
    
    equal(grid.getCell(0, 0), 1);
    equal(grid.getCell(1, 0), undefined);
    equal(grid.getCell(2, 0), undefined);
});

test('"flatten"', function() {
    var grid = new Grid();
    
    grid.setCell(0, -1, 1);
    grid.setCell(1, -1, 2);
    grid.setCell(2, -1, 3);
    
    grid.setCell(0, 0, 4);
    grid.setCell(1, 0, 5);
    grid.setCell(2, 0, 6);
        
    deepEqual(grid.flatten(), [[1, 0, -1], [2, 1, -1], [3, 2, -1],
            [4, 0, 0], [5, 1, 0], [6, 2, 0]]);
});

test('"related" #1', function() {
    var grid = new Grid();
    
    grid.setCell(0, 0, 1);
    grid.setCell(1, 0, 2);
    grid.setCell(2, 0, 3);
    
    grid.setCell(0, 1, 4);
    grid.setCell(1, 1, 5);
    grid.setCell(2, 1, 6);
    
    grid.setCell(0, 2, 7);
    grid.setCell(1, 2, 8);
    grid.setCell(2, 2, 9);
        
    deepEqual(grid.related(1, 1), [[1, 0, 0], [2, 1, 0], [3, 2, 0],
        [4, 0, 1], [6, 2, 1], [7, 0, 2], [8, 1, 2], [9, 2, 2]]);
});

test('"related" #2', function() {
    var grid = new Grid();
    
    grid.setCell(0, 0, 1);
    grid.setCell(1, 0, 2);
    grid.setCell(2, 0, 3);
    
    grid.setCell(0, 1, 4);
    grid.setCell(1, 1, 5);
    grid.setCell(2, 1, 6);
    
    grid.setCell(0, 2, 7);
    grid.setCell(1, 2, 8);
    grid.setCell(2, 2, 9);
        
    deepEqual(grid.related(1, 0), [[1, 0, 0], [3, 2, 0], [4, 0, 1], [5, 1, 1], [6, 2, 1]]);
});

test('"related" #3', function() {
    var grid = new Grid();
    
    grid.setCell(0, 0, 1);
    grid.setCell(1, 0, 2);
    grid.setCell(2, 0, 3);
    
    grid.setCell(0, 1, 4);
    grid.setCell(1, 1, 5);
    grid.setCell(2, 1, 6);
    
    grid.setCell(0, 2, 7);
    grid.setCell(1, 2, 8);
    grid.setCell(2, 2, 9);
        
    deepEqual(grid.related(1, 2), [[4, 0, 1], [5, 1, 1], [6, 2, 1], [7, 0, 2], [9, 2, 2]]);
});

test('"each"', 9, function() {
    var grid = new Grid();
    var cells = [[0, 0, 1], [1, 0, 2], [2, 0, 3]];
    
    grid.setCell(cells[0][0], cells[0][1], cells[0][2]);
    grid.setCell(cells[1][0], cells[1][1], cells[1][2]);
    grid.setCell(cells[2][0], cells[2][1], cells[2][2]);
    
    var iteration = 0;
    
    grid.each(function(cell, x, y) {
        equal(cell, cells[iteration][2]);
        equal(x, cells[iteration][0]);
        equal(y, cells[iteration][1]);
        iteration++;
    });
});
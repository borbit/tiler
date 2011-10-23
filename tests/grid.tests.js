module('Grid');

test('inherited from "Row"', function() {
    var grid = new Grid();
    
    ok(grid instanceof Row);
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

test('"removeCell" #1', function() {
    var grid = new Grid();
    
    grid.setCell(0, 0, 1);
    grid.setCell(1, 0, 2);
    grid.setCell(2, 0, 3);
    
    grid.removeCell(1, 0);
    grid.removeCell(2, 0);
    
    equal(grid.getCell(0, 0), 1);
    equal(grid.getCell(1, 0), undefined);
    equal(grid.getCell(2, 0), undefined);
});

test('"removeCell" #2', function() {
    var grid = new Grid();
    
    grid.setCell(0, 0, 1);
    grid.setCell(1, 0, 2);
    grid.setCell(2, 0, 3);
    
    grid.removeCell(0, 0);
    grid.removeCell(1, 0);
    grid.removeCell(2, 0);
    
    equal(grid.get(0), undefined);
});

test('"flatten"', function() {
    var grid = new Grid();
    
    grid.setCell(0, -1, 1);
    grid.setCell(1, -1, 2);
    grid.setCell(2, -1, 3);
    
    grid.setCell(0, 0, 4);
    grid.setCell(1, 0, 5);
    grid.setCell(2, 0, 6);
        
    deepEqual(grid.flatten(), [[0, -1, 1], [1, -1, 2], [2, -1, 3],
            [0, 0, 4], [1, 0, 5], [2, 0, 6]]);
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
        
    deepEqual(grid.related(1, 1), [[0, 0, 1], [1, 0, 2], [2, 0, 3],
        [0, 1, 4], [2, 1, 6], [0, 2, 7], [1, 2, 8], [2, 2, 9]]);
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
        
    deepEqual(grid.related(1, 0), [[0, 0, 1], [2, 0, 3], [0, 1, 4], [1, 1, 5], [2, 1, 6]]);
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
        
    deepEqual(grid.related(1, 2), [[0, 1, 4], [1, 1, 5], [2, 1, 6], [0, 2, 7], [2, 2, 9]]);
});
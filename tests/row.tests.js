module('Row');

test('"set" #1', function() {
    var row = new Row();
    
    equal(row.set(0, 0), 0);
    equal(row.set(1, 1), 1);
    equal(row.set(2, 2), 2);
    
    equal(row.items[0], 0);
    equal(row.items[1], 1);
    equal(row.items[2], 2);
    
    equal(row.firstIndex, 0);
    equal(row.lastIndex, 2);
});

test('"set" #2', function() {
    var row = new Row();
    
    row.set(-1, 1);
    row.set(0, 2);
    row.set(1, 3);
    
    equal(row.items[-1], 1);
    equal(row.items[0], 2);
    equal(row.items[1], 3);
    
    equal(row.firstIndex, -1);
    equal(row.lastIndex, 1);
});

test('"set" #3', function() {
    var row = new Row();
    
    row.set(2, 0);
    row.set(3, 1);
    row.set(4, 2);
    
    equal(row.items[2], 0);
    equal(row.items[3], 1);
    equal(row.items[4], 2);
    
    equal(row.firstIndex, 2);
    equal(row.lastIndex, 4);
});

test('"set" #4', function() {
    var row = new Row();
    
    row.set(-3, 0);
    row.set(-2, 1);
    row.set(-1, 2);
    
    equal(row.items[-3], 0);
    equal(row.items[-2], 1);
    equal(row.items[-1], 2);
    
    equal(row.firstIndex, -3);
    equal(row.lastIndex, -1);
});

test('"set" #5', function() {
    var row = new Row();
    
    row.set(4, 2);
    row.set(3, 1);
    row.set(2, 0);
    
    equal(row.items[2], 0);
    equal(row.items[3], 1);
    equal(row.items[4], 2);
    
    equal(row.firstIndex, 2);
    equal(row.lastIndex, 4);
});

test('"set" #6', function() {
    var row = new Row();
    
    row.set(-1, 2);
    row.set(-2, 1);
    row.set(-3, 0);
    
    equal(row.items[-3], 0);
    equal(row.items[-2], 1);
    equal(row.items[-1], 2);
    
    equal(row.firstIndex, -3);
    equal(row.lastIndex, -1);
});

test('"next #1"', function() {
    var row = new Row();
    
    row.set(-1, 1);
    row.set(0, 2);
    row.set(1, 3);
    
    equal(row.next(), 1);
    equal(row.next(), 2);
    equal(row.next(), 3);
    row.rewind();
    equal(row.next(), 1);
    equal(row.next(), 2);
    equal(row.next(), 3);
});

test('"next #2"', function() {
    var row = new Row();
    
    row.set(0, 2);
    row.set(1, 3);
    row.set(-1, 1);
    
    equal(row.next(), 1);
    equal(row.next(), 2);
    equal(row.next(), 3);
    row.rewind();
    equal(row.next(), 1);
    equal(row.next(), 2);
    equal(row.next(), 3);
});

test('"next #3"', function() {
    var row = new Row();
    
    row.set(0, 0);
    row.set(1, 1);
    row.set(2, 2);
    
    row.next();
    row.next();
    row.next();
    
    equal(row.next(), undefined);
});

test('"next #4"', function() {
    var row = new Row();
    
    equal(row.next(), undefined);
});

test('"next #5"', function() {
    var row = new Row();

    row.set(0, 0);
    row.set(2, 1);
    row.set(3, 2);

    equal(row.next(), 0);
    equal(row.next(), 1);
    equal(row.next(), 2);
    equal(row.next(), undefined);
});

test('"get" #1', function() {
    var row = new Row();
    
    row.set(-1, 0);
    row.set(0, 1);
    row.set(1, 2);
    
    equal(row.get(-1), 0);
    equal(row.get(0), 1);
    equal(row.get(1), 2);
});

test('"get" #2', function() {
    var row = new Row();
    
    equal(row.get(0), undefined);
});

test('"first" #1', function() {
    var row = new Row();
    
    row.set(-1, 1);
    row.set(0, 2);
    row.set(1, 3);
    
    equal(row.first(), 1);
});

test('"first" #2', function() {
    var row = new Row();

    equal(row.first(), undefined);
});

test('"first" #3', function() {
    var row = new Row();
    
    row.set(0, 0);
    row.set(1, 1);
    row.set(2, 2);
    
    row.pop();
    row.pop();
    row.pop();
    
    row.set(1, 1);

    equal(row.first(), 1);
});

test('"last" #1', function() {
    var row = new Row();
    
    row.set(-1, 1);
    row.set(0, 2);
    row.set(1, 3);
    
    equal(row.last(), 3);
});

test('"last" #2', function() {
    var row = new Row();
    
    equal(row.last(), undefined);
});

test('"last" #3', function() {
    var row = new Row();
    
    row.set(0, 0);
    row.set(1, 1);
    row.set(2, 2);
    
    row.pop();
    row.pop();
    row.pop();
    
    row.set(1, 1);

    equal(row.last(), 1);
});

test('"count" #1', function() {
    var row = new Row();
    
    row.set(-1, 1);
    row.set(0, 2);
    row.set(1, 3);
    
    equal(row.count(), 3);
});

test('"count" #2', function() {
    var row = new Row();
        
    equal(row.count(), 0);
});

test('"push"', function() {
    var row = new Row();
    
    row.set(0, 0);
    row.set(1, 1);
    row.set(2, 2);
    
    row.push(3);
    
    equal(row.last(), 3);
    equal(row.count(), 4);
});

test('"unshift"', function() {
    var row = new Row();
    
    row.set(0, 0);
    row.set(1, 1);
    row.set(2, 2);
    
    row.unshift(-1);
    
    equal(row.first(), -1);
    equal(row.count(), 4);
});

test('"pop"', function() {
    var row = new Row();
    
    row.set(0, 0);
    row.set(1, 1);
    row.set(2, 2);
    
    equal(row.pop(), 2);
    equal(row.last(), 1);
    equal(row.count(), 2);
});

test('"shift"', function() {
    var row = new Row();
    
    row.set(0, 0);
    row.set(1, 1);
    row.set(2, 2);
    
    equal(row.shift(), 0);
    equal(row.first(), 1);
    equal(row.count(), 2);
});

test('"hasNext" #1', function() {
    var row = new Row();
    
    row.set(0, 0);
    row.set(1, 1);
    row.set(2, 2);
    
    equal(row.hasNext(), true);
    row.next();
    equal(row.hasNext(), true);
    row.next();
    equal(row.hasNext(), true);
    row.next();
    equal(row.hasNext(), false);
});

test('"hasNext" #2', function() {
    var row = new Row();
        
    equal(row.hasNext(), false);
});

test('"hasNext" #3', function() {
    var row = new Row();
    
    row.set(0, 0);
    row.set(1, 1);
    row.set(2, 2);
    
    row.pop();
    row.pop();
    row.pop();
    equal(row.hasNext(), false);
});

test('"hasNext" #4', function() {
    var row = new Row();
    
    row.set(0, 0);
    row.set(1, 1);
    row.set(2, 2);
    
    row.shift();
    row.shift();
    row.shift();
    equal(row.hasNext(), false);
});

test('"on"', function() {
    var row = new Row();
    
    row.set(-1, 0);
    row.set(0, 1);
    row.set(1, 2);
    
    equal(row.on(0), 0);
    equal(row.on(1), 1);
    equal(row.on(2), 2);
});

test('"remove"', function() {
    var row = new Row();
    
    row.set(0, 0);
    row.set(1, 1);
    row.set(2, 2);
    
    equal(row.remove(0), undefined);
    equal(row.remove(1), undefined);
    equal(row.remove(2), undefined);
});
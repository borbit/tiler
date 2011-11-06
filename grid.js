function Grid(width, height, placeholder) {
    this.parent = Row.prototype;
    this.parent.constructor.call(this);
    this.width = width;
    this.height = height;

    for (var y = this.height; y--;) {
    for (var x = this.width; x--;) {
        this.set(x, y, placeholder);
    }}
}

-function() {
    function F() {}
    F.prototype = Row.prototype;
    Grid.prototype = new F();
    Grid.prototype.constructor = Grid;
}();

Grid.prototype.set = function(x, y, cell) {
    if (cell === undefined) {
        return this.parent.set.call(this, x, y);
    }

    return (this.parent.get.call(this, y) ||
            this.parent.set.call(this, y, new Row()))
            .set(x, cell);
};

Grid.prototype.get = function(x, y) {
    if (y === undefined) {
        return this.parent.get.call(this, x);
    }

    return this.parent.get.call(this, y) ?
           this.parent.get.call(this, y).get(x) :
           undefined;
};

Grid.prototype.on = function(xNum, yNum) {
    if (yNum === undefined) {
        return this.parent.on.call(this, xNum);
    }
    
    return this.parent.on.call(this, yNum) ?
           this.parent.on.call(this, yNum).on(xNum) :
           undefined;
};

Grid.prototype.remove = function(x, y) {
    var toRemove = [[x, y]];
    
    if (y === undefined) {
        if (!isNaN(x)) {
            this.parent.remove.call(this, x);
            return;
        }
        if (x.length !== undefined && 
            x.pop !== undefined) {
            toRemove = x;
        }
    }
    
    for (var row, i = toRemove.length; i--;) {
        x = toRemove[i][0]
        y = toRemove[i][1];
        
        if (row = this.get(y)) {
            row.remove(x);
        
            if (!row.count()) { 
                this.parent.remove.call(this, y);
            }
        }
    }
};

Grid.prototype.flatten = function() {
    var result = [];
    
    this.rewind();
    while (this.hasNext()) {
        var y = this.currentIndex;
        var row = this.next().rewind();
        while (row.hasNext()) {
            var x = row.currentIndex;
            var cell = row.next();
            result.push([cell, x, y]);
        }
    }
    
    return result;
};

Grid.prototype.each = function(iterator, context) {
    var list = this.flatten();
    
    for (var i = 0, len = list.length; i < len; i++) {
        iterator.apply(context, list[i]);
    }
};

Grid.prototype.related = function(x, y) {
    var coords = [
        [x-1, y-1], [x, y-1], [x+1, y-1],
        [x-1, y], [x+1, y], [x-1, y+1],
        [x, y+1], [x+1, y+1]
    ];
            
    var related = [];
    
    for (var i = 0; i < 8; i++) {
        var rx = coords[i][0];
        var ry = coords[i][1];
        var cell = this.get(rx, ry);
        
        if (typeof(cell) != 'undefined') {
            related.push([cell, rx, ry]);
        }
    }
    
    return related;
};
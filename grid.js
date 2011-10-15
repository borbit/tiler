function Grid() {
    Row.prototype.constructor.call(this);
}

-function() {
    function F() {}
    F.prototype = Row.prototype;
    Grid.prototype = new F();
    Grid.prototype.constructor = Grid;
}();

Grid.prototype.setCell = function(x, y, cell) {
    return (this.get(y) || this.set(y, new Row())).set(x, cell);
};

Grid.prototype.getCell = function(x, y, cell) {
    return this.get(y) ? this.get(y).get(x) : undefined;
};

Grid.prototype.onCell = function(xNum, yNum, cell) {
    return this.on(yNum) ? this.on(yNum).on(xNum) : undefined;
};
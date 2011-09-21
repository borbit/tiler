(function($) {

$.widget('ui.tiler', {
    options: {
        viewportClass: 'tilerViewport',
        binderClass: 'tilerBinder',
        height: null,
        width: null,
        capture: 2,
        size: null,
        x: 0, y: 0,
        holder: null,
        tile: null,
        sync: null
    },
       
    _create: function() {
        this.tiler = new Tiler(this.element, this.options);
    },
    
    refresh: function() {
        this.tiler.refresh();
    }
});

function Tiler(element, options) {
    this.element = element;
    this.options = options;
    this.tiles = new Row();
    this.x = options.x;
    this.y = options.y;
    
    element.addClass(options.viewportClass);
    
    if (options.width !== null) {
        element.css('width', options.width);
    }
    if (options.height !== null) {
        element.css('height', options.height);
    }
    
    this.initialBinderPosition = {
        left: -(options.size * options.capture),
        top: -(options.size * options.capture)
    };
    
    this.binder = $('<div></div>')
        .addClass(options.binderClass)
        .appendTo(element);
    
    this.binder.css({
        'position': 'absolute',
        'top': this.initialBinderPosition.top,
        'left': this.initialBinderPosition.left
    });
    
    this.rowsCount = this.calcRowsCount();
    this.colsCount = this.calcColsCount();
    this.refreshBinderSize();
    
    this.binder.bind('dragstop', $.proxy(this, 'refresh'));
    this.syncTiles();
}

var Proto = Tiler.prototype;

Proto.calcBinderOffset = function(newPosition) {
    return {
        x: parseInt((newPosition.left - this.initialBinderPosition.left) / this.options.size, 10),
        y: parseInt((newPosition.top - this.initialBinderPosition.top) / this.options.size, 10)
    };
};

Proto.refreshBinderSize = function() {
    this.binder.css({
        'height': this.rowsCount * this.options.size,
        'width': this.colsCount * this.options.size
    });
};

Proto.shiftBinderPosition = function(offset) {
    var position = this.binder.position();
    
    if (offset.y != 0) {
        position.top -= offset.y * this.options.size;
    }
    if (offset.x != 0) {
        position.left -= offset.x * this.options.size;
    }
    
    this.binder.css(position);
};

Proto.refresh = function() {
    var position = this.binder.position();
    var offset = this.calcBinderOffset(position);
    
    this.rowsCount = this.calcRowsCount();
    this.colsCount = this.calcColsCount();

    this.x -= offset.x;
    this.y -= offset.y;
        
    this.removeTiles(offset);
    this.refreshBinderSize();
    
    this.shiftBinderPosition(offset);
    this.shiftTilesPosition(offset);
    this.syncTiles();
};

Proto.removeTiles = function(offset) {
    if (offset.y > 0) {
        this.removeBottomTiles(Math.abs(offset.y));
    } else if (offset.y < 0) {
        this.removeTopTiles(Math.abs(offset.y));
    }
    if (offset.x > 0) {
        this.removeRightTiles(Math.abs(offset.x));
    } else if (offset.x < 0) {
        this.removeLeftTiles(Math.abs(offset.x));
    }
};

Proto.removeTopTiles = function(cnt) {
    var all = this.tiles.count();
    for (var i = 0; i < cnt && i < all; i++) {
        var first = this.tiles.shift().rewind();
        while (first.hasNext()) {
            first.next().remove();
        }
    }
};

Proto.removeBottomTiles = function(cnt) {
    var all = this.tiles.count();
    for (var i = 0; i < cnt && i < all; i++) {
        var last = this.tiles.pop().rewind();
        while (last.hasNext()) {
            last.next().remove();
        }
    }
};

Proto.removeLeftTiles = function(cnt) {
    this.tiles.rewind();
    while (this.tiles.hasNext()) {
        var row = this.tiles.next();
        var all = row.count();
        for (var i = 0; i < cnt && i < all; i++) {
            row.shift().remove();
        }
    }
};

Proto.removeRightTiles = function(cnt) {
    this.tiles.rewind();
    while (this.tiles.hasNext()) {
        var row = this.tiles.next();
        var all = row.count();
        for (var i = 0; i < cnt && i < all; i++) {
            row.pop().remove();
        }
    }
};

Proto.shiftTilesPosition = function(offset) {
    this.tiles.rewind();
    while (this.tiles.hasNext()) {
        var row = this.tiles.next().rewind();
        while (row.hasNext()) {
            var tile = row.next();
            var position = tile.position();
            tile.css('left', position.left + this.options.size * offset.x);
            tile.css('top', position.top + this.options.size * offset.y);
        }
    }
};

Proto.getTilesToSync = function() {
    var toSync = [], op = this.options;

    for(var y = this.y - op.capture, i = this.rowsCount; i--; y++) {
    for(var x = this.x - op.capture, j = this.colsCount; j--; x++) {
        if (!this.tiles.get(y) || !this.tiles.get(y).get(x)) {
            toSync.push({x: x, y: y});
        }
    }}
    
    return toSync;
};

Proto.syncTiles = function() {
    var tiles = this.getTilesToSync();
    
    if (tiles.length < 0) {
        return;
    }
    
    if ($.isFunction(this.options.holder)) {
        this.showHolders(tiles);
    }
    if ($.isFunction(this.options.sync)) {
        this.options.sync(tiles, $.proxy(this, 'showTiles'));
    }
};

Proto.showTiles = function(tiles) {
    var fragment = document.createDocumentFragment();
    
    for(var i = 0, l = tiles.length; i < l; i++) {
        var x = tiles[i].x;
        var y = tiles[i].y;
        
        if (y < this.y - this.options.capture || y > this.y - this.options.capture + this.rowsCount ||
            x < this.x - this.options.capture || x > this.x - this.options.capture + this.colsCount) {
            return;
        }
        
        var row = (this.tiles.get(y) || this.tiles.set(y, new Row()));
        var tile = this.options.tile(tiles[i].data);
        fragment.appendChild(tile.get(0));
        
        if (row.get(x)) {
            row.get(x).remove();
        }
        row.set(x, tile);
    }
    
    this.binder.append(fragment);
    this.arrangeTiles();
};

Proto.showHolders = function(tiles) {
    var fragment = document.createDocumentFragment();
    
    for(var i = 0, l = tiles.length; i < l; i++) {
        var holder = this.options.holder();
        var x = tiles[i].x; 
        var y = tiles[i].y;
        
        fragment.appendChild(holder.get(0));
        
        var row = (this.tiles.get(y) || this.tiles.set(y, new Row()));
        row.set(x, holder);
    }
    
    this.binder.append(fragment);
    this.arrangeTiles();
};

Proto.arrangeTiles = function() {
    this.tiles.rewind();
    for (var y = 0; this.tiles.hasNext(); y++) {
        var row = this.tiles.next().rewind();
        for (var x = 0; row.hasNext(); x++) {
            row.next().css({
                'position': 'absolute',
                'left': x * this.options.size,
                'top': y * this.options.size
            });
        }
    }
};

Proto.calcColsCount = function() {
    var width = this.element.width();
    var op = this.options;
    if (width && op.size) {
        return Math.ceil(width / op.size) + op.capture * 2;
    }
    return 0;
};

Proto.calcRowsCount = function() {
    var height = this.element.height();
    var op = this.options;
    if (height && op.size) {
        return Math.ceil(height / op.size) + op.capture * 2
    }
    return 0;
};

})(jQuery);
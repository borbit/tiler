// ┌──────────────────────────────────────────────────────────────┐ //
// | jQuery widget to display infinite content as a grid of tiles | //
// ├──────────────────────────────────────────────────────────────┤ //
// | Copyright (c) 2011 Serge Borbit (serge.borbit@gmail.com)     | //
// └──────────────────────────────────────────────────────────────┘ //

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
    },
    
    binder: function() {
        return this.tiler.binder;
    }
});

function Tiler(element, options) {
    this.element = element;
    this.options = options;
    this.tiles = new Grid();
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
    this.calcPerimeterCoords();
    this.refreshBinderSize();
    
    this.binder.bind('dragstop', $.proxy(this, 'refresh'));
    this.syncTiles(this.getTilesToSync());
}

var Proto = Tiler.prototype;

Proto.calcBinderOffset = function(newPosition) {
    return {
        x: parseInt((newPosition.left - this.initialBinderPosition.left) / this.options.size, 10),
        y: parseInt((newPosition.top - this.initialBinderPosition.top) / this.options.size, 10)
    };
};

Proto.refreshBinderSize = function() {
    this.binder.height(this.rowsCount * this.options.size);
    this.binder.width(this.colsCount * this.options.size);
};

Proto.shiftBinderPosition = function(offset) {
    var position = this.binder.position();
    if (offset.y != 0) { position.top -= offset.y * this.options.size; }
    if (offset.x != 0) { position.left -= offset.x * this.options.size; }
    this.binder.css(position);
};

Proto.refresh = function() {
    var position = this.binder.position();
    var offset = this.calcBinderOffset(position);
    
    this.rowsCount = this.calcRowsCount();
    this.colsCount = this.calcColsCount();

    this.x -= offset.x;
    this.y -= offset.y;
        
    var removed = this.removeTiles(offset);
    var tosync = this.getTilesToSync();
    
    this.refreshBinderSize();
    this.calcPerimeterCoords();
    this.shiftBinderPosition(offset);
    this.shiftTilesPosition(offset);
    this.syncTiles(tosync, removed);
};

Proto.removeTiles = function(offset) {
    var removed = [];
    
    if (offset.y > 0) {
        $.merge(removed, this.removeBottomTiles(Math.abs(offset.y)));
    } else if (offset.y < 0) {
        $.merge(removed, this.removeTopTiles(Math.abs(offset.y)));
    }
    if (offset.x > 0) {
        $.merge(removed, this.removeRightTiles(Math.abs(offset.x)));
    } else if (offset.x < 0) {
        $.merge(removed, this.removeLeftTiles(Math.abs(offset.x)));
    }
    
    return removed;
};

Proto.removeTopTiles = function(cnt) {
    var all = this.tiles.count()
      , y = this.perimeter.y1
      , removed = [];
    
    for (var i = 0, first; i < cnt && i < all; i++, y++) {
        if (first = this.tiles.get(y)) {
            first.rewind();
        
            while (first.hasNext()) {
                var x = first.currentIndex;
                var tile = first.next();
                removed.push([x, y]);
                tile.remove();
                first.remove(x)
            }
        }
    }
    return removed;
};

Proto.removeBottomTiles = function(cnt) {
    var all = this.tiles.count()
      , y = this.perimeter.y2
      , removed = [];
    
    for (var i = 0, last; i < cnt && i < all; i++, y--) {
        if (last = this.tiles.get(y)) {
            last.rewind();
            
            while (last.hasNext()) {
                var x = last.currentIndex;
                var tile = last.next();
                removed.push([x, y]);
                tile.remove();
                last.remove(x);
            }
        }
    }
    return removed;
};

Proto.removeLeftTiles = function(cnt) {
    var removed = [];
    this.tiles.rewind();
    
    while (this.tiles.hasNext()) {
        
        var x = this.perimeter.x1
          , y = this.tiles.currentIndex
          , row = this.tiles.next()
          , all = row.count();
        
        for (var i = 0; i < cnt && i < all; i++, x++) {
            if (tile = row.get(x)) {
                removed.push([x, y]);
                tile.remove();
                row.remove(x);
            }
        }
    }
    return removed;
};

Proto.removeRightTiles = function(cnt) {
    var removed = [];
    this.tiles.rewind();
    
    while (this.tiles.hasNext()) {
        
        var x = this.perimeter.x2
          , y = this.tiles.currentIndex
          , row = this.tiles.next()
          , all = row.count();
        
        for (var i = 0, tile; i < cnt && i < all; i++, x--) {
            if (tile = row.get(x)) {
                removed.push([x, y]);
                tile.remove();
                row.remove(x);
            }
        }
    }
    return removed;
};

Proto.shiftTilesPosition = function(offset) {
    this.tiles.each(function(tile) {
        var position = tile.position();
        tile.css({'left': position.left + this.options.size * offset.x,
                  'top': position.top + this.options.size * offset.y});
    }, this);
};

Proto.getTilesToSync = function() {
    var toSync = [], op = this.options;
    for(var y = this.y - op.capture, i = this.rowsCount; i--; y++) {
    for(var x = this.x - op.capture, j = this.colsCount; j--; x++) {
        if (!this.tiles.get(x, y)) {
            toSync.push([x, y]);
        }
    }}
    return toSync;
};

Proto.syncTiles = function(tosync, removed) {
    removed = removed || [];
    
    if (tosync.length == 0) { return; }

    if ($.isFunction(this.options.holder)) {
        this.showHolders(tosync); }
    if ($.isFunction(this.options.sync)) {
        this.options.sync({
            tosync: tosync
          , removed: removed
          , coords: {x: this.x, y: this.y}
        }, $.proxy(this, 'showTiles')); 
    }
};

Proto.showTiles = function(tiles) {
    var fragment = document.createDocumentFragment();
    
    for(var i = 0, l = tiles.length; i < l; i++) {
        var x = tiles[i][0];
        var y = tiles[i][1];
        
        if (y < this.y - this.options.capture || y > this.y - this.options.capture + this.rowsCount ||
            x < this.x - this.options.capture || x > this.x - this.options.capture + this.colsCount) {
            return;
        }

        var tile = tiles[i][2];
        fragment.appendChild(tile.get(0));
        
        if (this.tiles.get(x, y)) {
            this.tiles.get(x, y).remove(); }
            
        this.tiles.set(x, y, tile);
    }
    
    this.binder.append(fragment);
    this.arrangeTiles();
};

Proto.showHolders = function(tiles) {
    var fragment = document.createDocumentFragment();
    
    for(var i = 0, l = tiles.length; i < l; i++) {
        var holder = this.options.holder();
        var x = tiles[i][0]; 
        var y = tiles[i][1];
        
        fragment.appendChild(holder.get(0));
        this.tiles.set(x, y, holder);
    }
    
    this.binder.append(fragment);
    this.arrangeTiles();
};

Proto.arrangeTiles = function() {
    var size = this.options.size;
    var perimeter = this.perimeter;
    
    this.tiles.each(function(tile, x, y) {
        tile.css({
            'position': 'absolute',
            'left': (x - perimeter.x1) * size,
            'top': (y - perimeter.y1) * size
        });
    });
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

Proto.calcPerimeterCoords = function() {
    var x1 = this.x - this.options.capture;
    var y1 = this.y - this.options.capture;
    
    this.perimeter = {
        x1: x1, y1: y1,
        x2: x1 + this.colsCount - 1,
        y2: y1 + this.rowsCount - 1
    };
};

})(jQuery);
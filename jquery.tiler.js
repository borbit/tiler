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
    var removed = [];
    var all = this.tiles.count();
    
    for (var i = 0; i < cnt && i < all; i++) {
        
        var y = this.tiles.firstIndex;
        var first = this.tiles.shift().rewind();
        
        while (first.hasNext()) {
            var x = first.currentIndex;
            first.next().remove();
            removed.push([x, y]);
        }
    }
    return removed;
};

Proto.removeBottomTiles = function(cnt) {
    var removed = [];
    var all = this.tiles.count();
    
    for (var i = 0; i < cnt && i < all; i++) {
        
        var y = this.tiles.lastIndex;
        var last = this.tiles.pop().rewind();
        
        while (last.hasNext()) {
            var x = last.currentIndex;
            last.next().remove();
            removed.push([x, y]);
        }
    }
    return removed;
};

Proto.removeLeftTiles = function(cnt) {
    var removed = [];
    this.tiles.rewind();
    
    while (this.tiles.hasNext()) {
        
        var y = this.tiles.currentIndex;
        var row = this.tiles.next();
        var all = row.count();
        
        for (var i = 0; i < cnt && i < all; i++) {
            var x = row.firstIndex;
            row.shift().remove();
            removed.push([x, y]);
        }
    }
    return removed;
};

Proto.removeRightTiles = function(cnt) {
    var removed = [];
    this.tiles.rewind();
    
    while (this.tiles.hasNext()) {
        
        var y = this.tiles.currentIndex;
        var row = this.tiles.next();
        var all = row.count();
        
        for (var i = 0; i < cnt && i < all; i++) {
            var x = row.lastIndex;
            row.pop().remove();
            removed.push([x, y]);
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
    
    if (tosync.length == 0) {
        return; }
        
    if ($.isFunction(this.options.holder)) {
        this.showHolders(tosync); }
    if ($.isFunction(this.options.sync)) {
        this.options.sync(tosync, removed, $.proxy(this, 'showTiles')); }
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
        
        var tile = this.options.tile(tiles[i][2], x, y);
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
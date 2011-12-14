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
    
    position: function(x, y) {
        this.tiler.changePosition(x, y);
    },
    
    binder: function() {
        return this.tiler.binder;
    },
    
    x: function() {
        return this.tiler.x;
    },
    
    y: function() {
        return this.tiler.y;
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
    
    this.binder = $('<div></div>')
        .bind('dragstop', $.proxy(this, 'refresh'))
        .css('position', 'absolute')
        .addClass(options.binderClass)
        .appendTo(element);
    
    this.init();
    
    this.syncTiles(this.getTilesToSync());
}

var Proto = Tiler.prototype;

Proto.init = function() {
    this.initialBinderPosition = {
        left: -(this.options.size * this.options.capture),
        top: -(this.options.size * this.options.capture)
    };
    
    this.binder.css({
        left: this.initialBinderPosition.left,
        top: this.initialBinderPosition.top
    });
    
    this.rowsCount = this.calcRowsCount();
    this.colsCount = this.calcColsCount();
    this.calcPerimeterCoords();
    this.refreshBinderSize();
};

Proto.changePosition = function(x, y) {
    var offset = {
        x: this.x - x,
        y: this.y - y
    };
    
    this.x = x;
    this.y = y;
    
    this.shiftTilesPosition(offset);
    
    var toRemove = this.getTilesToRemove(offset);
    var removed = this.removeTiles(toRemove);
    var toSync = this.getTilesToSync();
    
    this.init();
    this.syncTiles(toSync, removed);
};

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
    
    var toRemove = this.getTilesToRemove(offset);
    var removed = this.removeTiles(toRemove);
    var tosync = this.getTilesToSync();
    
    this.refreshBinderSize();
    this.calcPerimeterCoords();
    this.shiftBinderPosition(offset);
    this.shiftTilesPosition(offset);
    this.syncTiles(tosync, removed);
    
    this.element.trigger('refreshed', {x: this.x, y: this.y});
};

Proto.removeTiles = function(coords) {
    var removed = [];
    
    for (var i = 0, tile; i < coords.length; i++) {
        var x = coords[i][0];
        var y = coords[i][1];
        
        if (tile = this.tiles.get(x, y)) {
            this.tiles.remove(x, y);
            removed.push([x, y]);
            tile.remove();
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

Proto.getTilesToRemove = function(offset) {
    var toRemove = []
      , offsetY = Math.abs(offset.y)
      , offsetX = Math.abs(offset.x);
    
    if (offset.y > 0) {
        for (var y = this.perimeter.y2, i = 0; i < offsetY && i < this.rowsCount; i++, y--) {
        for (var x = this.perimeter.x1; x <= this.perimeter.x2; x++) {
            toRemove.push([x, y]);
        }}
    } else if (offset.y < 0) {
        for (var y = this.perimeter.y1, i = 0; i < offsetY && i < this.rowsCount; i++, y++) {
        for (var x = this.perimeter.x1; x <= this.perimeter.x2; x++) {
            toRemove.push([x, y]);
        }}
    }
    if (offset.x > 0) {
        for (var y = this.perimeter.y1; y <= this.perimeter.y2; y++) {
        for (var x = this.perimeter.x2, i = 0; i < offsetX && i < this.colsCount; i++, x--) {
            toRemove.push([x, y]);
        }}
    } else if (offset.x < 0) {
        for (var y = this.perimeter.y1; y <= this.perimeter.y2; y++) {
        for (var x = this.perimeter.x1, i = 0; i < offsetX && i < this.colsCount; i++, x++) {
            toRemove.push([x, y]);
        }}
    }
    
    return toRemove;
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
        
        if (y < this.perimeter.y1 || y > this.perimeter.y2 ||
            x < this.perimeter.x1 || x > this.perimeter.x2) {
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
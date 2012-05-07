/*    
  Tiler 0.1.0
  
  Library for the displaying of an infinite content
  as a grid of tiles. For more info visit:
  https://github.com/borbit/tiler/
  
  Copyright (c) 2011-2012 Serge Borbit <serge.borbit@gmail.com>
  
  Licensed under the MIT license
*/

(function($) {

/*$.widget('ui.tiler', {
  options: ,
     
  _create: function() {
    this.tiler = new Tiler(this.element, this.options);
  },
  
  refresh: function() {
    this.tiler.refresh();
  },
  
  position: function(x, y) {
    this.tiler.changePosition(x, y);
  },
  
  reload: function(options) {
    this.tiler.reload(options);
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
});*/

function Tiler(element, options) {
  this.options = options = $.extend({}, Tiler.defaults, options);
  this.tiles = new Grid();
  this.element = element;
  this.x = options.x;
  this.y = options.y;

  element.addClass(options.viewportClass);
  
  if (options.width !== null) {
    element.css('width', options.width);
  }
  if (options.height !== null) {
    element.css('height', options.height);
  }
  
  this.binder = $('<div/>')
      .bind('dragstop', $.proxy(this, 'refresh'))
      .css('position', 'absolute')
      .addClass(options.binderClass)
      .appendTo(element);
  
  this.updateBinderPosition();
  this.updateSizingProperties();
  this.syncTiles(this.getTilesCoordsToSync());
}

Tiler.defaults = {
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
};

var Proto = Tiler.prototype;

Proto.updateBinderPosition = function() {
  this.initialBinderPosition = {
    left: -(this.options.size * this.options.capture),
    top: -(this.options.size * this.options.capture)
  };
  
  this.binder.css({
    'left': this.initialBinderPosition.left
  , 'top': this.initialBinderPosition.top
  });
};

Proto.updateSizingProperties = function() {
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
  this.updateBinderPosition();
  this.updateSizingProperties();
  
  var toRemove = this.getHiddenTilesCoords();
  var removed = this.removeTiles(toRemove);
  var toSync = this.getTilesCoordsToSync();
  
  this.syncTiles(toSync, removed);
};

Proto.calcBinderOffset = function(newPosition) {
  return {
    x: parseInt((newPosition.left - this.initialBinderPosition.left) / this.options.size, 10)
  , y: parseInt((newPosition.top - this.initialBinderPosition.top) / this.options.size, 10)
  };
};

Proto.refreshBinderSize = function() {
  this.binder.height(this.rowsCount * this.options.size);
  this.binder.width(this.colsCount * this.options.size);
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
  
  this.x -= offset.x;
  this.y -= offset.y;
  
  this.updateSizingProperties();
  
  var toRemove = this.getHiddenTilesCoords();
  var removed = this.removeTiles(toRemove);
  var tosync = this.getTilesCoordsToSync();
  
  this.shiftBinderPosition(offset);
  this.shiftTilesPosition(offset);
  this.syncTiles(tosync, removed);
  
  this.element.trigger('refreshed', {x: this.x, y: this.y});
};

Proto.reload = function(options) {
  var all = this.getAllTilesCoords();
  var existing = this.tiles.coords();
  
  if (options && options.silent) {
    this.syncTiles(all);
  } else {
    this.removeTiles(existing);
    this.syncTiles(all, existing);
  }
};

Proto.removeTiles = function(coords) {
  var removed = [];
  
  for (var i = 0, tile; i < coords.length; i++) {
    var x = coords[i][0];
    var y = coords[i][1];
    
    this.tiles.get(x, y).remove();
    this.tiles.remove(x, y);
    removed.push([x, y]);
  }
  
  return removed;
};

Proto.shiftTilesPosition = function(offset) {
  this.tiles.each(function(tile) {
    var position = tile.position();
    tile.css({
      'left': position.left + this.options.size * offset.x
    , 'top': position.top + this.options.size * offset.y
    });
  }, this);
};

Proto.getTilesCoordsToSync = function() {
  var toSync = [];
  var op = this.options;
  var all = this.getAllTilesCoords();
  var x, y;
    
  for(var i = 0, l = all.length; i < l; i++) {
    x = all[i][0];
    y = all[i][1];
    
    if (!this.tiles.get(x, y)) {
      toSync.push([x, y]);
    }
  }
  return toSync;
};

Proto.getHiddenTilesCoords = function() {
  var coords = [];
  var self = this;
  
  this.tiles.each(function(tile, x, y) {
    if (y < self.perimeter.y1 || y > self.perimeter.y2 ||
        x < self.perimeter.x1 || x > self.perimeter.x2) {
      coords.push([x, y]);
    }
  });
  return coords;
};

Proto.getAllTilesCoords = function() {
  var coords = [];
  
  for(var y = this.perimeter.y1; y <= this.perimeter.y2; y++) {
  for(var x = this.perimeter.x1; x <= this.perimeter.x2; x++) {
    coords.push([x, y]);
  }}
  return coords;
};

Proto.syncTiles = function(tosync, removed) {
  if (tosync.length == 0) {
    return;
  }
  if ($.isFunction(this.options.holder)) {
    this.showHolders(tosync);
  }
  if ($.isFunction(this.options.sync)) {
    this.options.sync({
      coords: {x: this.x, y: this.y}
    , removed: removed || []
    , tosync: tosync
    }, $.proxy(this, 'showTiles')); 
  }
};

Proto.showTiles = function(tiles) {
  var fragment = document.createDocumentFragment();
  
  for(var i = 0, l = tiles.length; i < l; i++) {
    var x = tiles[i][0];
    var y = tiles[i][1];
    var tile = tiles[i][2];
    
    if (y < this.perimeter.y1 || y > this.perimeter.y2 ||
        x < this.perimeter.x1 || x > this.perimeter.x2) {
      continue;
    }
    
    fragment.appendChild(tile.get(0));
    
    if (this.tiles.get(x, y)) {
      this.tiles.get(x, y).remove();
    }  
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
      'position': 'absolute'
    , 'left': (x - perimeter.x1) * size
    , 'top': (y - perimeter.y1) * size
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
    x1: x1, y1: y1
  , x2: x1 + this.colsCount - 1
  , y2: y1 + this.rowsCount - 1
  };
};

window.Tiler = Tiler;

})(jQuery);
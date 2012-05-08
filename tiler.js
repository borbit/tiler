/*    
  Tiler 0.1.0
  
  Library for the displaying of an infinite content
  as a grid of tiles. For more info visit:
  https://github.com/borbit/tiler/
  
  Copyright (c) 2011-2012 Serge Borbit <serge.borbit@gmail.com>
  
  Licensed under the MIT license
*/

(function($) {
  
/*
 Constructor
 @param {jQuery object} element
 @param {object} options
*/
function Tiler(element, options) {
  // Initializing options by Extending the default by custom
  this.options = $.extend({}, Tiler.defaults, options);
  
  // Tiles elements will be saved here
  this.tiles = new Grid();
  
  // Saving the viewport element as a property
  this.element = element;
  
  // Current coordinates of the top left visible tile
  this.x = this.options.x;
  this.y = this.options.y;
  
  // Creating the binder element that will contain tiles
  // and appending it to the viewport element
  this.binder = $('<div/>')
      .bind('dragstop', $.proxy(this, 'refresh'))
      .css('position', 'absolute')
      .appendTo(element);
  
  // Calculate rows/cols count
  this.calcGridSize();
  
  // Calculate coordinates of corner tiles
  this.calcCornersCoords();
  
  // Arrange binder element
  this.setBinderPosition();
  this.setBinderSize();
  
  // Initial tiles syncing
  this.syncTiles(this.getTilesCoordsToSync());
}

Tiler.defaults = {
  tileSize: null
, holder: $.noop
, sync: $.noop
, capture: 2
, x: 0, y: 0
};

var Proto = Tiler.prototype;

/*
 Sets the initial binder's position
 @api private
*/
Proto.setBinderPosition = function() {
  this.initialBinderPosition = {
    left: -(this.options.tileSize * this.options.capture),
    top: -(this.options.tileSize * this.options.capture)
  };
  
  this.binder.css({
    left: this.initialBinderPosition.left
  , top: this.initialBinderPosition.top
  });
};

/*
 Changes current position of the grid (top left visible tile),
 rerenders grid regarding the new position and syncs tiles
 @param {Number} x
 @param {Number} y
 @api public
*/
Proto.changePosition = function(x, y) {
  var offset = {
    x: this.x - x,
    y: this.y - y
  };
  
  this.x = x;
  this.y = y;
  
  this.shiftTilesPosition(offset);
  
  this.calcGridSize();
  this.calcCornersCoords();
  
  this.setBinderPosition();
  this.setBinderSize();
  
  var toRemove = this.getHiddenTilesCoords();
  var removed = this.removeTiles(toRemove);
  var toSync = this.getTilesCoordsToSync();
  
  this.syncTiles(toSync, removed);
};

/*
 Calculates the binder's offset (how many tiles were hidden by x/y coords)
 regarding the initial and new (absolute) position of the binder element
 @param {Object} - newPosition {top: {Number}, left: {Number}}
 @return {Object} - offset {x: {Number}, y: {Number}}
 @api private
*/
Proto.calcBinderOffset = function(newPosition) {
  return {
    x: parseInt((newPosition.left - this.initialBinderPosition.left) / this.options.tileSize, 10)
  , y: parseInt((newPosition.top - this.initialBinderPosition.top) / this.options.tileSize, 10)
  };
};

/*
 Sets binder's size regarding the grid's size and tile's size
 @api private
*/
Proto.setBinderSize = function() {
  this.binder.height(this.rowsCount * this.options.tileSize);
  this.binder.width(this.colsCount * this.options.tileSize);
};

/*
 Shifts the binder's position (absolute) regarding the passed offset
 @param {Object} offset - {x: {Number}, y: {Number}}
 @api private
*/
Proto.shiftBinderPosition = function(offset) {
  var position = this.binder.position();
  
  if (offset.y != 0) {
    position.top -= offset.y * this.options.tileSize;
  }
  if (offset.x != 0) {
    position.left -= offset.x * this.options.tileSize;
  }
  
  this.binder.css(position);
};

/*
 Refreshes the grid. This method should be called to sync absent and
 remove hidden tiles after viewport size is changed or binder was dragged,
 also in case if not all tiles are present after the sync and you have to
 sync absent tiles only.
 @api public
*/
Proto.refresh = function() {
  var position = this.binder.position();
  var offset = this.calcBinderOffset(position);
  
  this.x -= offset.x;
  this.y -= offset.y;
  
  this.calcGridSize();
  this.calcCornersCoords();
  this.setBinderSize();
  
  var toRemove = this.getHiddenTilesCoords();
  var removed = this.removeTiles(toRemove);
  var tosync = this.getTilesCoordsToSync();
  
  this.shiftBinderPosition(offset);
  this.shiftTilesPosition(offset);
  this.syncTiles(tosync, removed);
};

/*
 Removes and than syncs all tiles on the grid
 @api public
*/
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

/*
 Removes tiles by passed coordinates
 @param {Array} coords - [[x1, y1], [x2, y2], ...]
 @api private
*/
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

/*
 @api private
*/
Proto.shiftTilesPosition = function(offset) {
  this.tiles.each(function(tile) {
    var position = tile.position();
    tile.css({
      'left': position.left + this.options.tileSize * offset.x
    , 'top': position.top + this.options.tileSize * offset.y
    });
  }, this);
};

/*
 @api private
*/
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

/*
 @api private
*/
Proto.getHiddenTilesCoords = function() {
  var coords = [];
  var self = this;
  
  this.tiles.each(function(tile, x, y) {
    if (y < self.corners.y1 || y > self.corners.y2 ||
        x < self.corners.x1 || x > self.corners.x2) {
      coords.push([x, y]);
    }
  });
  return coords;
};

/*
 @api private
*/
Proto.getAllTilesCoords = function() {
  var coords = [];
  
  for(var y = this.corners.y1; y <= this.corners.y2; y++) {
  for(var x = this.corners.x1; x <= this.corners.x2; x++) {
    coords.push([x, y]);
  }}
  return coords;
};

/*
 @api private
*/
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

/*
 Shows tiles
 @param {Array} tiles - array of coordinates [[x1, y1, elem1], [x2, y2, elem2], ...]
 @api private
*/
Proto.showTiles = function(tiles) {
  var fragment = document.createDocumentFragment();
  
  for(var i = 0, l = tiles.length; i < l; i++) {
    var x = tiles[i][0];
    var y = tiles[i][1];
    var tile = tiles[i][2];
    
    if (y < this.corners.y1 || y > this.corners.y2 ||
        x < this.corners.x1 || x > this.corners.x2) {
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

/*
 Shows placeholders
 @param {Array} tiles - array of coordinates [[x1, y1], [x2, y2], ...]
 @api private
*/
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

/*
 Arranges tiles position in the binder element
 @api private
*/
Proto.arrangeTiles = function() {
  var size = this.options.tileSize;
  var corners = this.corners;
  
  this.tiles.each(function(tile, x, y) {
    tile.css({
      'position': 'absolute'
    , 'left': (x - corners.x1) * size
    , 'top': (y - corners.y1) * size
    });
  });
};

/*
 Calculate grid columns count
 @return {Number}
 @api private
*/
Proto.calcColsCount = function() {
  var width = this.element.width();
  var op = this.options;
  
  if (width && op.tileSize) {
    return Math.ceil(width / op.tileSize) + op.capture * 2;
  }
  return 0;
};

/*
 Calculate grid rows count
 @return {Number}
 @api private
*/
Proto.calcRowsCount = function() {
  var height = this.element.height();
  var op = this.options;
  
  if (height && op.tileSize) {
    return Math.ceil(height / op.tileSize) + op.capture * 2
  }
  return 0;
};

/*
 Calculate and sets the current grid size (rows/cols)
 @api private
*/
Proto.calcGridSize = function() {
  this.rowsCount = this.calcRowsCount();
  this.colsCount = this.calcColsCount();
};

/*
 Calculate and sets coordinates of current corner tiles
 @api private
*/
Proto.calcCornersCoords = function() {
  var x1 = this.x - this.options.capture;
  var y1 = this.y - this.options.capture;
  
  this.corners = {
    x1: x1, y1: y1
  , x2: x1 + this.colsCount - 1
  , y2: y1 + this.rowsCount - 1
  };
};

window.Tiler = Tiler;

})(jQuery);
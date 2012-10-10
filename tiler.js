/**
 * Tiler 0.2.0
 *
 * Library for creating of endless tile-based grid.
 * For more info visit: https://github.com/borbit/tiler/
 *
 * (c) 2011-2012 Serge Borbit <serge.borbit@gmail.com>
 *
 * Licensed under the MIT license
 */

(function($) {

/**
 * Constructor
 *
 * @param {jQuery|DOM} element
 * @param {Object} options
 */
function Tiler(element, options) {
  // Initializing options by Extending the default by custom
  this.options = $.extend({}, Tiler.defaults, options)

  // Tiles elements will be saved here
  this.tiles = new Grid()

  // Saving the viewport element as a property
  this.element = element.jquery ? element : $(element)

  // Current and initial (starting) coordinates of the top left visible tile
  this.x = this.initX = this.options.x
  this.y = this.initY = this.options.y

  // Offset of the binder element (in tiles) from the latest refresh
  this.binderOffsetX = 0
  this.binderOffsetY = 0

  // Creating the binder element that will contain the grid element
  // and will be used as a linking block for the moving (dragging).
  // Appending it to the viewport element. 
  this.binder = $('<div/>').css('position', 'absolute').appendTo(element)

  // Creating the grid element that will contain tiles. Appending it to the viewport element. 
  this.grid = $('<div/>').css({'position': 'absolute'}).appendTo(this.binder)

  this.calcRowsColsCount()
  this.calcCornersCoords()

  // Arrange elements
  this.setBinderPosition()
  this.setGridPosition()
}

/**
 * Default options
 */
Tiler.defaults = {
  fetch: null
, tileSize: null
, margin: 2
, x: 0, y: 0
}

var Proto = Tiler.prototype

/**
 * Sets the initial binder position
 *
 * @api private
 */
Proto.setBinderPosition = function() {
  this.binder.css({left: 0, top: 0})
}

/**
 * Sets the initial grid position
 *
 * @api private
 */
Proto.setGridPosition = function() {
  this.grid.css({left: 0, top: 0})
}

/**
 * Calculates binder offset in tiles regarding the initial and
 * new (absolute) position of the binder element
 *
 * @return {Object} offset {x: {Number}, y: {Number}}
 * @api private
 */
Proto.calcBinderOffset = function() {
  var pos = this.binder.position()
  var tileSize = this.options.tileSize

  var offsetLeft = pos.left - this.binderOffsetX * tileSize
  var offsetTop = pos.top - this.binderOffsetY * tileSize

  return {
    x: Math.abs(offsetLeft) >= tileSize ? ~~(offsetLeft / tileSize) : 0
  , y: Math.abs(offsetTop) >= tileSize ? ~~(offsetTop / tileSize) : 0
  }
}

/**
 * Removes tiles that don't fall within the current grid area and fetches absent
 * tiles. Call this method if the binder was dragged/moved or viewport size is changed,
 * also in case unless all tiles are present after the fetch and you have to fetch
 * absent tiles only.
 * 
 * @api public
 */
Proto.refresh = function() {
  var offset = this.calcBinderOffset()
  
  this.x -= offset.x
  this.y -= offset.y

  this.binderOffsetX += offset.x
  this.binderOffsetY += offset.y

  this.calcRowsColsCount()
  this.calcCornersCoords()

  var removed = this.getHiddenTilesCoords()
  var tofetch = this.getTilesCoordsToFetch()

  if (removed.length) {
    this.remove(removed)
  }
  if (tofetch.length || removed.length) {
    this.fetchTiles(tofetch, removed)
  }
}

/**
 * Refetches all tiles that fall within the grid area
 *
 * @api public
 */
Proto.reload = function() {
  this.fetchTiles(this.getAllTilesCoords(), [])
}

/**
 * If arguments are passed - changes current grid coordinates (top left visible tile)
 * and fetches/removes tiles as in the same way as `refresh` method does. If method
 * is called without arguments - returns current grid coordinates.
 *
 * @param {Number} x
 * @param {Number} y
 * @return {Object}
 * @api public
 */
Proto.coords = function(x, y) {
  if (!arguments.length) {
    return {x: this.x, y: this.y}
  }
  
  this.x = x
  this.y = y

  this.calcRowsColsCount()
  this.calcCornersCoords()

  this.setBinderPosition()
  this.setGridPosition()

  var removed = this.getHiddenTilesCoords()
  var tofetch = this.getTilesCoordsToFetch()
    
  this.remove(removed)
  this.fetchTiles(tofetch, removed)
}

/**
 * Shows tiles
 *
 * show(x, y, tile)
 * @param {Number} x
 * @param {Number} y
 * @param {jQuery|DOM|Array} elems
 * 
 * show(tiles)
 * @param {Array} tiles [
 *   [x1, y1, el1|[el1,e2]]
 * , [x2, y2, el2|[el3,e4]]
 * , ...]
 * 
 * @api public
 */
Proto.show = function(x, y, elems) {
  var fragment = document.createDocumentFragment()
  var tiles = $.isArray(x) ? x : [[x, y, elems]]

  var tileSize = this.options.tileSize
  var initX = this.initX
  var initY = this.initY
  var elems

  for(var i = 0, l = tiles.length; i < l; i++) {
    x = tiles[i][0]
    y = tiles[i][1]

    if (y < this.corners.y1 || y > this.corners.y2 ||
        x < this.corners.x1 || x > this.corners.x2) {
      continue
    }

    elems = tiles[i][2]
    elems = $.isArray(elems) ? elems : [elems]
    elems = $.map(elems, function(elem) {
      return elem.jquery ? elem : $(elem)
    })

    $.each(elems, function(i, elem) {
      fragment.appendChild(elem.get(0))

      elem.css({
        position: 'absolute'
      , left: (x - initX) * tileSize
      , top: (y - initY) * tileSize
      })
    })

    this.remove(x, y)
    this.tiles.set(x, y, elems)
  }

  this.grid.append(fragment)
}

/**
 * Removes tiles in passed coordinates
 *
 * remove(x, y)
 * @param {Number} x
 * @param {Number} y
 * 
 * remove(coords)
 * @param {Array} coords [[x1, y1], [x2, y2], ...]
 *
 * @api private
 */
Proto.remove = function(x, y) {
  var coords = $.isArray(x) ? x : [[x, y]]

  for (var i = 0, l = coords.length; i < l; i++) {
    x = coords[i][0]
    y = coords[i][1]

    var present = this.tiles.get(x, y)

    if (present) {
      this.tiles.remove(x, y)
      $.each(present, function(i, elem) {
        elem.remove()
      })
    }
  }
}

/**
 * Returns array of tiles coordinates that should be present on a grid
 *
 * @return {Array} [[x1, y1], [x2, y2], ...]
 * @api private
 */
Proto.getTilesCoordsToFetch = function() {
  var tofetch = []
    , all = this.getAllTilesCoords()
    , x, y

  for(var i = 0, l = all.length; i < l; i++) {
    x = all[i][0]
    y = all[i][1]

    if (!this.tiles.get(x, y)) {
      tofetch.push([x, y])
    }
  }
  return tofetch
}

/**
 * Returns array of tiles coordinates which coordinates don't fall
 * within the grid area. Method is used to determine which tiles were
 * hidden after the grid was dragged or grid position was changed
 *
 * @return {Array} [[x1, y1], [x2, y2], ...]
 * @api private
 */
Proto.getHiddenTilesCoords = function() {
  var coords = []
    , self = this

  this.tiles.each(function(tile, x, y) {
    if (y < self.corners.y1 || y > self.corners.y2 ||
        x < self.corners.x1 || x > self.corners.x2) {
      coords.push([x, y])
    }
  })
  return coords
}

/**
 * Returns array of tiles coordinates which do fall within the grid area.
 *
 * @return {Array} [[x1, y1], [x2, y2], ...]
 * @api private
 */
Proto.getAllTilesCoords = function() {
  var coords = []

  for(var y = this.corners.y1; y <= this.corners.y2; y++) {
  for(var x = this.corners.x1; x <= this.corners.x2; x++) {
    coords.push([x, y])
  }}
  return coords
}

/**
 * Fetches tiles
 *
 * @param {Array} tofetch Array of tiles coordinates that should be fetched
 * @param {Array} removed Array of tiles coordinates that were removed/hidden from the grid
 * @api private
 */
Proto.fetchTiles = function(tofetch, removed) {
  if ($.isFunction(this.options.fetch)) {
    this.options.fetch(tofetch, removed)
  }
}

/**
 * Calculates grid's columns count
 *
 * @return {Number}
 * @api private
 */
Proto.calcColsCount = function() {
  var width = this.element.width()
    , op = this.options

  if (width && op.tileSize) {
    return Math.ceil(width / op.tileSize) + op.margin * 2
  }
  return 0
}

/**
 * Calculates grid's rows count
 *
 * @return {Number}
 * @api private
 */
Proto.calcRowsCount = function() {
  var height = this.element.height()
    , op = this.options

  if (height && op.tileSize) {
    return Math.ceil(height / op.tileSize) + op.margin * 2
  }
  return 0
}

/**
 * Calculates and sets current rows and cols count
 *
 * @api private
 */
Proto.calcRowsColsCount = function() {
  this.rowsCount = this.calcRowsCount()
  this.colsCount = this.calcColsCount()
}

/**
 * Calculates and sets the current corner tiles coordinates
 *
 * @api private
 */
Proto.calcCornersCoords = function() {
  var x1 = this.x - this.options.margin
    , y1 = this.y - this.options.margin

  this.corners = {
    x1: x1, y1: y1
  , x2: x1 + this.colsCount - 1
  , y2: y1 + this.rowsCount - 1
  }
}

window.Tiler = Tiler

})(jQuery)

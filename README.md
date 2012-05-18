# Tiler.JS

Library for working with infinite grid of tiles.

[Demo](http://borbit.github.com/tiler/)

## Dependencies

- [row.js](https://github.com/borbit/row.js)
- [grid.js](https://github.com/borbit/grid.js)
- [jQuery](http://jquery.com/)

## Documentation

### Constructor

```js
new Tiler(element, options);
```

#### element

A `jQuery` or `DOM` element will be used as a viewport for a tiles grid.

#### options

##### `fetch(tofetch, removed)`

This method is called each time the grid is ready to be refreshed or reloaded.

Arguments:

`tofetch` - array of tiles coordinates to show on the grid 

```js
[[x1, y1], [x2, y2], [x3, y3], ...]
```

`removed` - array of tiles coordinates that were removed from the grid

```js
[[x1, y1], [x2, y2], [x3, y3], ...]
```

##### `tileSize`

Tile size in pixels, considering that tile is a square

##### `margin`

Count of extra rows of tiles to be shown behind the viewport perimeter.

Default: `2`

##### `x,y`

Initial coordinates of the top left visible tile which coordinates are also current
coordinates of the grid. Tiler fetches tiles that do fall within the grid area depending
on this coordinates.

Default: `0`
    
### Properties

- *element*
    
    A viewport element. Automatically wrapped in a `jQuery` object if you pass it as a `DOM` element.
    
- *grid*

    A grid element used as a tiles container. Wrapped in a `jQuery` object and appended to the viewport element.

### Methods

- *refresh()*

    Removes tiles that don't fall within the current grid coordinates and fetches absent tiles. Call this
    method if the grid was dragged/moved or viewport size is changed, also in case unless all tiles
    are present after the fetch and you have to fetch absent tiles only.
    
- *reload()*

    Refetches all tiles that fall within the grid coordinates.

- *show()*

    `show(x, y, tile)`
    
    Shows tile in passed coordinates. `tile` can be both `jQuery` or `DOM` element. Tile wont be
    shown if passed coordinates don't fall within the current grid coordinates. If there is already a
    tile in passed coordinates on a grid it will be removed.
    
    `show(tiles)`
    
    As the same behavior as in previous but for array of tiles. Array structure:
    
    ```js
    [[x1, y1, tile1], [x2, y2, tile2], [x3, y3, tile3], ...]
    ```

- *remove()*

    `remove(x, y)`
    
    Removes tile in passed coordinates. Does nothing if there is no tile in passed coordinates.
    
    `remove(coords)`
    
    As the same behavior as in previous but for array of coordinates. Array structure:
    
    ```js
    [[x1, y1], [x2, y2], [x3, y3], ...]
    ```

- *coords([x, y])*
    
    If arguments are passed - changes current grid coordinates (top left visible tile) and fetches/removes
    tiles as in the same way as `refresh` method does. If method is called without arguments - returns
    current grid coordinates `{x: {Number}, y: {Number}}`.

## Using Tiler

1. Include main dependencies on your page.

    ```html
    <script src="http://code.jquery.com/jquery.min.js"></script>
    <script src="https://raw.github.com/borbit/row.js/master/row.js"></script>
    <script src="https://raw.github.com/borbit/grid.js/master/grid.js"></script>
    ```
    
2. Include Tiler after main dependencies.

    ```html
    <script src="tiler.js"></script>
    ```
    
3. Include some library to make grid draggable. I use `draggable` from jQuery UI.

    ```html
    <script src="http://code.jquery.com/ui/1.8.19/jquery-ui.min.js"></script>
    ```

4. Create an instance of `Tiler` passing the element you have to make as a viewport by
first argument and options by second. Don't forget to pass required options `tileSize` and `fetch`.
Like this:

    ```js
    var tiler = new Tiler($('#viewport'), {
      tileSize: 200,
      
      fetch: function(tofetch) {
        
        tofetch.forEach(function(tile) {
          var img = new Image();
          var x = tile[0];
          var y = tile[1];
          
          img.onload = function() {
            tiler.show(x, y, $('<img/>').attr('src', img.src));
          };
          
          img.src = 'image_' + x + '_' + y + '.png';
        });
      }
    });
    
    tiler.refresh();
    ```

5. To make grid draggable just:

    ```js
    tiler.grid.draggable();
    ```

## Tests

Tiler is fully covered by [QUnit](http://docs.jquery.com/QUnit) tests. To run tests
just open the `tests/index.html` in a browser.

## License 

Tiler may be freely distributed under the [MIT license](http://en.wikipedia.org/wiki/MIT_License#License_terms).

Copyright (c) 2011 Serge Borbit &lt;serge.borbit@gmail.com&gt;
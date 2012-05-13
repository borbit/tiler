# Tiler.JS

Library for the displaying of an infinite content as a grid of tiles.

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

A jQuery element will be used as a viewport for a tiles grid.

#### options

- *sync(options, λ)*

    Tiles factory method. Should provide tiles to to show on a grid. It is called right
    after the Tiler initialization, after the grid was dragged or after the `refresh`
    method was called.

    Takes two `arguments`:

    *options*
    
    - `tosync` - array of tiles coordinates to sync
    - `removed` - array of tiles coordinates that were removed from the grid
    - `coords` - current grid coordinates (left top visible tile)

    *callback*

    Tiles should be provided through this callback function.

    Takes one `argument`:

    *tiles*

    ```js
    [[x1, y1, $tile1], [x2, y2, $tile2], ...]
    ```

- *holder()*

    Place holders factory method. Implement this method if place holders should be shown
    instead of actual tiles until they are synced or if actual tiles aren't present. This
    should just return a `jQuery element` to be shown instead of actual tile.

- *tileSize*

    Tile size in pixels, considering that tile is a square

- *capture*

    Count of extra rows of tiles to be shown behind the viewport perimeter.

    Default: `2`

- *x,y*

    Initial coordinates of the top left visible tile which coordinates are also current
    coordinates of the grid. Tiler syncs tiles that do fall within the grid area depending
    on this coordinates.

    Default: `0`
    
### Properties

- *element*
    
    A viewport element is saved as a property.
    
- *grid*

    A `jQuery` element used as a tiles container (it is appended to the viewport element).

### Methods

- *reload()*

    Removes and than resyncs all present tiles.

- *refresh()*

    Removes tiles that don't fall within the current grid coordinates and syncs absent tiles.
    This method is called automatically after the `dragstop` event triggered by the grid element.
    Call this method if grid was dragged in a way that doesn't trigger `dragstop` event or viewport
    size is changed, also in case unless all tiles are present after the sync and you have to sync
    absent tiles only.

- *position(x, y)*

    Changes current grid position (top left visible tile). Renders grid regarding the new position
    and syncs tiles. Returns current postition if arguments aren't passed.

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
first argument and options by second. Don't forget to pass required options `tileSize` and `sync`.
Like this:

    ```js
    var tiler = new Tiler($('#viewport'), {
      tileSize: 200,
      
      sync: function(options, callback) {
        var tosync = options.tosync;
        
        tosync.forEach(function(tile) {
          var img = new Image();
          var x = tile[0];
          var y = tile[1];
          
          img.onload = function() {
            callback([[x, y, $('<img/>').attr('src', img.src)]]);
          };
          
          img.src = 'image_' + x + '_' + y + '.png';
        });
      }
    });
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
# Tiler

Library for the displaying of an infinite content as a grid of tiles.

[Demo](http://borbit.github.com/tiler/)

## Documntation

### Constructor

```js
new Tiler(element, options);
```

#### element

A jQuery element that will be used as a viewport for the tiles grid.

#### options

- *sync*

Tiles factory function. It is called right after the Tiler initialization, after the binder
element was dragged and after the `refresh` method was called.

Takes to `arguments`:

- *options*
    
    - tosync - an array of tiles coordinates to sync
    - removed - array of tiles coordinates that were removed from the grid
    - coords - current grid coordinates (left top visible tile)

- *callback*

Callback function should be called after all "tosync" tiles were built. Built tiles should
be passed through the first argument of this callback.

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
    tiler.binder.draggable();
    ```

## Tests

Tiler is fully covered by [QUnit](http://docs.jquery.com/QUnit) tests. To run tests
just open the `tests/index.html` in a browser.

## License 

Tiler may be freely distributed under the [MIT license](http://en.wikipedia.org/wiki/MIT_License#License_terms).

Copyright (c) 2011 Serge Borbit &lt;serge.borbit@gmail.com&gt;
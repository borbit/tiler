# Tiler

Library for the displaying of an infinite content as a grid of tiles.

[Demo](http://borbit.github.com/tiler/)

## Using Tiler

1. Include main dependencies on your page.

    ```html
    <script src="http://code.jquery.com/jquery.min.js"></script>
    <script src="https://raw.github.com/borbit/row.js/master/row.js"></script>
    <script src="https://raw.github.com/borbit/grid.js/master/grid.js"></script>
    ```
    
2. Include Tiler after main dependencies

    ```html
    <script src="tiler.js"></script>
    ```
    
3. Include some library to make grid draggable. I use `draggable` from jQuery UI

    ```html
    <script src="http://code.jquery.com/ui/1.8.19/jquery-ui.min.js"></script>
    ```

4. Create an instance of `Tiler` passing the element you have to make as a viewport by
first argument and options by second. Don't forget to pass required options `tileSize` and `sync`.
Like this:

    ```html
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

    ```html
    tiler.binder.draggable();
    ```

## Tests

Tiler is fully covered by [QUnit](http://docs.jquery.com/QUnit) tests. To run tests
just open the `tests/index.html` in a browser.

## License 

Tiler may be freely distributed under the [MIT license](http://en.wikipedia.org/wiki/MIT_License#License_terms).

Copyright (c) 2011 Serge Borbit &lt;serge.borbit@gmail.com&gt;
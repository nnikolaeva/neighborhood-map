## Neighborhood Map
Interactive application for local business discovery with third-party APIs integration for additional business information.
Technologies used: JavaScript, Knockout JS, jQuery, AJAX, CSS, HTML5, gulp, Google Maps API, Foursquare API.

### How to run

Open http://nnikolaeva.github.io/neighborhood-map.

### How to use
 * Select any item on the map or in the list to view the details about the selected place from Foursquare API and Google Street View.
 * Use the search bar to filter locations in the list and on the map by name or address.

### How to build

The optmized version of the application resides in the dist/ folder. To optimize the app, do the following:

1. In a shell terminal change directory to the project's directory
2. Execute `gulp`
3. `gulpfile.js` will run the following tasks: 
  * lint and minify js files and save them in js directory;
  * minify css files and save them in css directory;
  * compress images and save them in images directory.

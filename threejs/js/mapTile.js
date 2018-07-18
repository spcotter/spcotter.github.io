Math.radians = function(degrees){
  return degrees * Math.PI / 180;
}

Math.degrees = function(radians){
  return radians * 180 / Math.PI;
}

Math.sec = function(x){
  return 1 / Math.cos(x);
}

Math.hypotenuse = function(a,b){
  return Math.sqrt(
    Math.pow(a, 2) + Math.pow(b, 2)
  );
}


var EARTH_RADIUS = 6378137;
var METERS_PER_DEGREE_LATUTUDE = 111133;
var FEET_PER_METER = 3.28084;
var FEET_PER_MILE = 5280.0;
// https://gis.stackexchange.com/questions/12991/how-to-calculate-distance-to-ground-of-all-18-osm-zoom-levels
var altitude = function(latitude, zoom){
  // var EARTH_RADIUS = 6378137; // ( earth radius in meters )
  var C = Math.PI * 2 * EARTH_RADIUS;
  return ( C * Math.cos( latitude ) / Math.pow( 2, zoom + 8 ) );
}

var metersPerPixelLookup = {
  0: 156412,
  1: 78206,
  2: 39103,
  3: 19551,
  4: 9776,
  5: 4888,
  6: 2444,
  7: 1222,
  8: 610.984,
  9: 305.492,
  10: 152.746,
  11: 76.373,
  12: 38.187,
  13: 19.093,
  14: 9.547,
  15: 4.773,
  16: 2.387,
  17: 1.193,
  18: 0.596,
  19: 0.298,
 }

var key = 'wj1FzrjtQMi4rpSpEpM5_g';

var Tile = {


  number: function(lat, lon, zoom){
    var n = 2 ** zoom;
    var x = n * ((lon + 180) / 360);
    var latRadians = Math.radians(lat);
    var y = n * (1 - (Math.log(Math.tan(latRadians) + Math.sec(latRadians)) / Math.PI)) / 2;

    var tile = { x: Math.floor(x), y: Math.floor(y), z: zoom }

    var degrees = Tile.degrees(tile);
    tile.longitude = degrees.longitude;
    tile.latitude = degrees.latitude;

    tile.link = Tile.link(tile);

    return tile;
  },

  degrees: function(tile){
    var n = 2.0 ** tile.z;
    var longitude = tile.x / n * 360.0 - 180.0;
    var latitudeRadians = Math.atan( Math.sinh( Math.PI * (1 - 2 * tile.y / n) ) );
    var latitude = Math.degrees(latitudeRadians);
    return { latitude: latitude, longitude: longitude };
  },

  link: function(tile){
    // /{zoom}/{x}/{y}.png
    // var baseUrl = 'https://cartodb-basemaps-a.global.ssl.fastly.net/light_all';
    // var baseUrl = 'http://a.tile.openstreetmap.us/usgs_large_scale';
    // var baseUrl = 'https://tile.nextzen.org/tilezen/terrain/v1/512/terrarium'

    // return baseUrl + '/' + tile.z + '/' + tile.x + '/' + tile.y + '.png' + '?api_key=' + key;
    var baseUrl = 'https://elevation-tiles-prod.s3.amazonaws.com/terrarium';
    return baseUrl + '/' + tile.z + '/' + tile.x + '/' + tile.y + '.png';

    // https://landsat-pds.s3.amazonaws.com/c1/L8/139/045/LC08_L1TP_139045_20170304_20170316_01_T1/index.html
    // /terrarium/{z}/{x}/{y}.png
    //

  },

  offset: function(tile, offsetX, offsetY){

    var nextTile = { x: tile.x, y: tile.y, z: tile.z };
    nextTile.x += offsetX;
    nextTile.y += offsetY;

    var degrees = Tile.degrees(nextTile);
    nextTile.longitude = degrees.longitude;
    nextTile.latitude = degrees.latitude;

    nextTile.link = Tile.link(nextTile);

    return nextTile;
  },

  grid: function(tile, size){
    console.log('Creating grid of ', size, 'for', tile);
    var grid = [];
    var to = Math.floor((size - 1) / 2);
    console.log('to', to);
    for(var i = -to; i <= to; i ++){
      console.log('i', i);

      for(var j = -to; j <= to; j++){
        console.log('j', j);
        grid.push( Tile.offset(tile, i, j) );
      }
    }
    return grid;
  }

};


var currentLocation = {
  latitude: 40.4406,
  longitude: -79.9959,
};

(function(){
  window.scene = new THREE.Scene();
  window.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1/99, 100000000000000);
  window.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

  renderer.setClearColor(0xffffff);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMapSoft = true;


  window.render = function(){
    renderer.render(scene, camera);
  };


  // grid size
  var grid_color = new THREE.Color(0xdddddd),
      grid_size = 1000*256,
      grid_lines = 256;



  // var spotLight = new THREE.SpotLight(0xffffff);
  // spotLight.castShadow = true;
  // spotLight.shadowBias = 0.0001;
  // spotLight.shadowDarkness = 0.2;
  // spotLight.shadowMapWidth = 2048;
  // spotLight.shadowMapHeight = 2048;
  // spotLight.position.set(15,30,50);

  // scene.add(spotLight);

  var guiControls = new function(){
    // this.age = 0;
    // this.tenure = 0;
  };

  //
  // var datGUI = new dat.GUI();
  // datGUI.add(guiControls, 'age', 0, 100).onFinishChange(function(age){
  //   set_age(age);
  //   render();
  // });

  // datGUI.add(guiControls, 'tenure', 0, 60).onFinishChange(function(tenure){
  //   set_tenure(tenure);
  //   render();
  // });

  THREE.ImageUtils.crossOrigin = 'anonymous';

  var zoom = 14;

  var mpp = metersPerPixelLookup[zoom]
  console.log('metersPerPixel', mpp);

  var tile0 = Tile.number(currentLocation.latitude, currentLocation.longitude, zoom);
  console.log('tile0', tile0);

  var distanceAway = 500;
  var distancePixels = Math.sqrt( Math.pow(distanceAway, 2) + Math.pow(distanceAway, 2) );
  console.log('distancePixels', distancePixels);

  var circleRadius = 20 * FEET_PER_MILE / FEET_PER_METER / mpp;
  console.log('circleRadius', circleRadius);
  var circleGeometry = new THREE.CircleGeometry(circleRadius, 50 );
  var circleMaterial = new THREE.MeshBasicMaterial( { color: 'steelblue' } );
  var circle = new THREE.Mesh( circleGeometry, circleMaterial );
  circle.position.set(distanceAway, -10, distanceAway)
  circle.rotation.x = -0.5 * Math.PI;
  scene.add( circle );

  var textureLoader = new THREE.TextureLoader();
  textureLoader.setCrossOrigin('anonymous');

  var grid = Tile.grid(tile0, );

  grid.forEach(function(t){
    var imageGeometry = new THREE.PlaneBufferGeometry(256, 256)

    var texture = textureLoader.load(t.link, function(){
      console.log('Loaded image');
      render();
    });
    var imageMaterial = new THREE.MeshBasicMaterial({ map : texture });
    var imageMesh = new THREE.Mesh(imageGeometry, imageMaterial);

    imageMesh.position.set((t.x - tile0.x) * 256, 0, (t.y - tile0.y) * 256);
    // console.log('t.x', t.x * 256, 't.y', t.y * 256);
    imageMesh.rotation.x = -0.5 * Math.PI;
    scene.add(imageMesh);
  });

  var cameraHeight = (25000 /  FEET_PER_METER / mpp)
  camera.position.set(distanceAway, cameraHeight, distanceAway);


  var oppositeSide = Math.hypotenuse(distanceAway, distanceAway)
  console.log('oppositeSide', oppositeSide);
  console.log('cameraHeight', cameraHeight);
  console.log('atan', cameraHeight);

  // var d = Math.hypotenuse(c, cameraHeight)
  var groundAngle = Math.degrees( Math.atan(oppositeSide / cameraHeight) )
  console.log('groundAngle', groundAngle);


  // var cameraHeight = 380;


  var distanceFeet = distancePixels * mpp * FEET_PER_METER;
  console.log('distance miles', distanceFeet / FEET_PER_MILE);


  console.log('camera height pixels', cameraHeight);
  console.log('camera height feet', cameraHeight * mpp * FEET_PER_METER);

  scene.position.set(0, 0, 0);

  // camera.rotation.order = 'ZXY';
  camera.lookAt(scene.position);
  console.log('scene.position', scene.position);
  console.log('camera.position', camera.position);
  // camera.rotation.x = deviceRotation.pitch;
  // camera.rotation.y = deviceRotation.roll;
  // camera.rotation.z = deviceRotation.yaw;
  // camera.rotation.x = 1;
  // camera.rotation.y = 0.5;
  // camera.rotation.z = 1;

  var cylinderRadius = (2.87 / 2) / mpp;
  console.log('cylinderRadius', cylinderRadius);
  var cylinderHeight = 39.5 / mpp;
  console.log('cylinderHeight', cylinderHeight);
  var cylinderGeometry = new THREE.CylinderGeometry( cylinderRadius, cylinderRadius, cylinderHeight, 32 );
  var cylinderMaterial = new THREE.MeshBasicMaterial( {color: 'red'} );
  window.cylinder = new THREE.Mesh( cylinderGeometry, cylinderMaterial );
  cylinder.position.set(distanceAway, 10, distanceAway)
  console.log('cylinder.position', cylinder.position);
  scene.add( cylinder );

  // camera.position.set(0,50,0);
  // console.log('camera.position', camera.position);
  // camera.lookAt(cylinder.position);

  window.y_grid = new THREE.GridHelper(grid_size, grid_lines);
  y_grid.setColors('gray', 'gray');
  y_grid.position.set(-128, 0, -128);
  scene.add(y_grid);


  // window.z_grid = new THREE.GridHelper(grid_size, grid_lines);
  // z_grid.setColors('green', 'green');
  // z_grid.rotation.x = -0.5 * Math.PI;
  // z_grid.position.set(tile0.x * 256, 0, tile0.y * 256);
  // scene.add(z_grid);


  // window.x_grid = new THREE.GridHelper(grid_size, grid_lines);
  // x_grid.setColors('red', 'red');
  // x_grid.rotation.z = -0.5 * Math.PI;
  // x_grid.position.set(tile0.x * 256, 0, tile0.y * 256);
  // scene.add(x_grid);


  // var geometry = new THREE.SphereGeometry( 256, 256, 256 );
  // var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
  // var sphere = new THREE.Mesh( geometry, material );
  // sphere.position.set(tile0.x, 0, tile0.y)
  // scene.add( sphere );


  // var axis = new THREE.AxisHelper(100);
  // axis.position.set(tile0.x * 256, 0, tile0.y * 256);
  // scene.add(axis);



  // var graphMesh = new THREE.Mesh( graphGeometry, graphMaterial );

  // scene.add(wireframe);


  var controls = new THREE.TrackballControls( camera );
  // var controls = new THREE.OrbitControls( camera );


  controls.rotateSpeed = 2.0;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.8;

  controls.noZoom = false;
  controls.noPan = false;

  controls.staticMoving = true;
  controls.dynamicDampingFactor = 0.3;

  controls.keys = [ 65, 83, 68 ];

  controls.addEventListener( 'change', render );

  $('#webGL-container').append(renderer.domElement);

  function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

        controls.handleResize();

        render();

      }

      function animate() {

        requestAnimationFrame( animate );
        controls.update();

      }



  window.addEventListener( 'resize', onWindowResize, false );

  render();
  animate();

})();
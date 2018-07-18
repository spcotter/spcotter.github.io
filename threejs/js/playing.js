var altitude = function(latitude, zoom){
  var EARTH_RADIUS = 6378137; // ( earth radius in meters )
  var C = Math.PI * 2 * EARTH_RADIUS;
  return ( C * Math.cos( latitude ) / Math.pow( 2, zoom + 8 ) );
}

var currentLocation = {
  latitude: 40.4406,
  longitude: -79.9959,
};


var zoom = 14;

document.getElementById('altitude').innerText = 'Altitude ' + altitude(currentLocation.latitude, zoom);


window.scene = new THREE.Scene();
window.camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  1/99,
  100000000000000
);
window.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

renderer.setClearColor(0xffffff);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMapSoft = true;

document.getElementById('webGL-container').append(renderer.domElement)


window.render = function(){
  renderer.render(scene, camera);
};

// grid size
var grid_color = new THREE.Color(0xdddddd),
    grid_size = 1000*256,
    grid_lines = 256;


window.grid = new THREE.GridHelper(grid_size, grid_lines);
grid.setColors('gray', 'gray');
grid.position.set(-128, 0, -128);
scene.add(grid);

camera.position.set(currentLocation.longitude, 1000, currentLocation.latitude)




function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
  controls.handleResize();
  render();
}

window.addEventListener( 'resize', onWindowResize, false );


render();


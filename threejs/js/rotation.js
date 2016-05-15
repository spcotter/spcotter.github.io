(function(){
  window.scene = new THREE.Scene();
  window.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  window.renderer = new THREE.WebGLRenderer({ antialias: true });

  renderer.setClearColor(0xffffff);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMapEnabled = true;
  renderer.shadowMapSoft = true;

  var axis = new THREE.AxisHelper(100);
  scene.add(axis);



  var spotLight = new THREE.SpotLight(0xffffff);
  spotLight.castShadow = true;
  spotLight.shadowBias = 0.0001;
  spotLight.shadowDarkness = 0.2;
  spotLight.shadowMapWidth = 2048;
  spotLight.shadowMapHeight = 2048;
  spotLight.position.set(15,30,50);

  scene.add(spotLight);


  camera.position.set(300,300,300);

  camera.lookAt(scene.position);


  window.render = function(){
    renderer.render(scene, camera);
  };


  $('#webGL-container').append(renderer.domElement);

  window.raycaster = new THREE.Raycaster();
  var mouse_start = new THREE.Vector2(),
      mouse_move = new THREE.Vector2(),
      down = false;

  var log = $('.log');

  var mousedown = function(e) {
    down = true;
    mouse_start.x = e.clientX;
    mouse_start.y = e.clientY;
    var t = 'mouse_start:' + mouse_start.x + ',' + mouse_start.y
    console.log(t);
    log.text(t);
  };

  var mouseup = function() {
    down = false;
    var t = 'mouse_up';
    console.log(t);
    log.text(t);
  };

  var mousemove = function( e ) {
    if(!down) return;
    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    mouse_move.x = e.clientX;
    // mouse_move.x = ( e.clientX / window.innerWidth ) * 2 - 1;
    mouse_move.y = e.clientY;   
    // mouse_move.y = - ( e.clientY / window.innerHeight ) * 2 + 1;   

    var t = 'mouse_move: ' + mouse_move.x + ',' + mouse_move.y;
    console.log(t);
    log.text(t);
  }

  window.addEventListener( 'mousedown', mousedown, false );
  window.addEventListener( 'mouseup', mouseup, false );
  window.addEventListener( 'mousemove', mousemove, false );

  var touchstart = function(e) {
    down = true;
    mouse_start.x = e.touches[0].clientX;
    mouse_start.y = e.touches[0].clientY;
    var t = 'mouse_start:' + mouse_start.x + ',' + mouse_start.y
    console.log(t);
    log.text(t);
  };

  var touchend = function() {
    down = false;
    var t = 'mouse_up';
    console.log(t);
    log.text(t);
  };

  var touchmove = function( e ) {
    if(!down) return;
    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    mouse_move.x = e.touches[0].clientX;
    // mouse_move.x = ( e.clientX / window.innerWidth ) * 2 - 1;
    mouse_move.y = e.touches[0].clientY;   
    // mouse_move.y = - ( e.clientY / window.innerHeight ) * 2 + 1;   

    var t = 'mouse_move: ' + mouse_move.x + ',' + mouse_move.y;
    console.log(t);
    log.text(t);
  }

  window.addEventListener( 'touchstart', touchstart, false );
  window.addEventListener( 'touchend', touchend, false );
  window.addEventListener( 'touchmove', touchmove, false );

  render();

})();
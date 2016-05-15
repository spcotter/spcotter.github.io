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
    mouse_start.x = e.touches[0].clientX;
    mouse_start.y = e.touches[0].clientY;
    var t = 'mouse_start:' + mouse_start.x + ',' + mouse_start.y
    console.log(t);
    log.text(t);
  };

  var touchend = function() {
    var t = 'mouse_up';
    console.log(t);
    log.text(t);
  };

  // var touchmove = function( e ) {
  //   if(e.touches.length == 1){
  //     // calculate mouse position in normalized device coordinates
  //     // (-1 to +1) for both components
  //     mouse_move.x = e.touches[0].clientX;
  //     // mouse_move.x = ( e.clientX / window.innerWidth ) * 2 - 1;
  //     mouse_move.y = e.touches[0].clientY;   
  //     // mouse_move.y = - ( e.clientY / window.innerHeight ) * 2 + 1;   

  //     var t = 'touch_move: ' + mouse_move.x + ',' + mouse_move.y;
  //     console.log(t);
  //     log.text(t);
  //   } else {
  //           // calculate mouse position in normalized device coordinates
  //     // (-1 to +1) for both components
  //     mouse_move.x = e.touches[0].clientX;
  //     // mouse_move.x = ( e.clientX / window.innerWidth ) * 2 - 1;
  //     mouse_move.y = e.touches[0].clientY;   
  //     // mouse_move.y = - ( e.clientY / window.innerHeight ) * 2 + 1;   

  //     var t = 'touch_move 1: ' + mouse_move.x + ',' + mouse_move.y + '<br>';
  //     t +='touch_move 2: ' + e.touches[0].clientX + ',' + e.touches[1].clientY;
  //     console.log(t);
  //     log.html(t);
  //   }


  //   e.preventDefault();
  // }



  var touch1 = new THREE.Vector2(),
    touch2 = new THREE.Vector2(),
    touch1Prev = new THREE.Vector2(),
    touch2Prev = new THREE.Vector2(),
    rotV = new THREE.Quaternion(),

    touchDiff = new THREE.Vector2(),
    touchDiffPrev = new THREE.Vector2(),
    touchCentre = new THREE.Vector2(),
    touchCentrePrev = new THREE.Vector2(),
    axis1 = new THREE.Vector3(),
    axis2 = new THREE.Vector3(),
    rot1 = new THREE.Quaternion(),
    rot2 = new THREE.Quaternion(),
    adjq = new THREE.Quaternion();


  var touchmove = function (event) {
    event.preventDefault();
    adjq.copy(scene.quaternion).inverse();
    if ( event.touches.length === 2 ) {
      touch1.set(event.touches[0].pageX, event.touches[0].pageY);
      touch2.set(event.touches[1].pageX, event.touches[1].pageY);

      touchDiff.copy(touch2).sub(touch1);
      touchDiffPrev.copy(touch2Prev).sub(touch1Prev);
      axis1.set(0, 0, 1).applyQuaternion(adjq);
      rot1.setFromAxisAngle(axis1, (Math.atan2(touchDiffPrev.y, touchDiffPrev.x) - Math.atan2(touchDiff.y, touchDiff.x))).normalize();

      touchCentre.copy(touch1).add(touch2).multiplyScalar(.5);
      touchCentrePrev.copy(touch1Prev).add(touch2Prev).multiplyScalar(.5);
      axis2.set(touchCentre.y - touchCentrePrev.y, touchCentre.x - touchCentrePrev.x, 0).applyQuaternion(adjq);
      rot2.setFromAxisAngle(axis2, axis2.length() * rotationSensitivity * 10).normalize();

      scene.quaternion.multiply(rot1.multiply(rot2));
      rotV.multiply(rot1.slerp(adjq.set(0, 0, 0, 1), .9));
      scene.scale.multiplyScalar(touchDiff.length() / touchDiffPrev.length());

      touch1Prev.copy(touch1);
      touch2Prev.copy(touch2)
    }
  }


  window.addEventListener( 'touchstart', touchstart, false );
  window.addEventListener( 'touchend', touchend, false );
  window.addEventListener( 'touchmove', touchmove, false );

  render();

})();
var age_scale = d3.scale.linear()
      .domain([0,1])
      .range([50,100]),
    tenure_scale = d3.scale.linear()
      .domain([0,1])
      .range([0,60]);


var mesh_function = function(u,v){

  var age = age_scale(u),
      tenure = tenure_scale(v),
      logit = -28.93320997,
      vector;

  logit += age * 0.520537481;
  logit += age * age * -0.001971271;
  logit += tenure * 0.366612123;
  logit += tenure * age * -0.004264868;
  logit += tenure * tenure * -0.001450424;
  logit = 1/(1 + Math.exp(-logit));

  vector = new THREE.Vector3(age*2, logit*200, tenure*2);

  return vector;
};



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

  // grid size
  var grid_color = new THREE.Color(0xdddddd),
      grid_size = 100,
      grid_lines = 5;
 
  window.y_grid = new THREE.GridHelper(grid_size, grid_lines);
  y_grid.setColors(grid_color, grid_color);
  y_grid.position.set(grid_size, 0, grid_size);
  scene.add(y_grid);


  window.z_grid = new THREE.GridHelper(grid_size, grid_lines);
  z_grid.setColors(grid_color, grid_color);
  z_grid.rotation.x = -0.5 * Math.PI;
  z_grid.position.set(grid_size, grid_size,0);
  scene.add(z_grid);


  window.x_grid = new THREE.GridHelper(grid_size, grid_lines);
  x_grid.setColors(grid_color,grid_color);
  x_grid.rotation.z = -0.5 * Math.PI;
  x_grid.position.set(0, grid_size, grid_size);
  scene.add(x_grid);

  window.set_age = function(age){
    var x =  2 * age,
        z = z_grid.position.z;
        y = mesh_function(age_scale.invert(age), tenure_scale.invert(z/2)).y;
    
    x_grid.position.x = x;
    y_grid.position.y = y;

    render();
  };


  window.set_tenure = function(tenure){
    var x = x_grid.position.x,
        z =  2 * tenure;
        y = mesh_function(age_scale.invert(x/2), tenure_scale.invert(tenure)).y;
    
    z_grid.position.z = z;
    y_grid.position.y = y;

    render();
  };


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

  var guiControls = new function(){
    this.age = 0;
    this.tenure = 0;
  };


  var datGUI = new dat.GUI();
  datGUI.add(guiControls, 'age', 0, 100);
  datGUI.add(guiControls, 'tenure', 0, 60);

  var segments = 20,
    graphGeometry = new THREE.ParametricGeometry( mesh_function, segments, segments, true ),
    graphMaterial = new THREE.MeshBasicMaterial({ color: 0x4682B4 });


  var graphMesh = new THREE.Mesh( graphGeometry, graphMaterial ),
      wireframe = new THREE.WireframeHelper( graphMesh, 0xdf7c34 );

  scene.add(wireframe);

  // var light = new THREE.PointLight(0xffffff);
  // light.position.set(0,500,0);
  // scene.add(light);


  window.render = function(){
    renderer.render(scene, camera);
  };



  window.camera = camera;

  $('#webGL-container').append(renderer.domElement);

  var down = false;
  var sx = 0,
    y = 0;
        
    window.onmousedown = function(ev) {
        down = true;
        sx = ev.clientX;
        sy = ev.clientY;
    };
    window.onmouseup = function() {
        down = false;
    };
    window.onmousemove = function(ev) {
      ev.preventDefault();

      // console.log(ev)
        if (down) {
            var dx = ev.clientX - sx;
            var dy = ev.clientY - sy;
            scene.rotation.y += dx * 0.01;
            // scene.rotation.z += dy * 0.01;
            camera.position.y += dy;
            sx += dx;
            sy += dy;
          render();

        } 
      }

    function mousewheel( e ) {      
      console.log(e);
      var d = ((typeof e.wheelDelta != "undefined")?(-e.wheelDelta):e.detail);
      d = 10 * ((d>0)?1:-1);


      var cPos = camera.position;
      if (isNaN(cPos.x) || isNaN(cPos.y) || isNaN(cPos.y))
        return;

      var r = cPos.x*cPos.x + cPos.y*cPos.y;
      var sqr = Math.sqrt(r);
      var sqrZ = Math.sqrt(cPos.z*cPos.z + r);


      var nx = cPos.x + ((r==0)?0:(d * cPos.x/sqr));
      var ny = cPos.y + ((r==0)?0:(d * cPos.y/sqr));
      var nz = cPos.z + ((sqrZ==0)?0:(d * cPos.z/sqrZ));

      console.log(nx);
      console.log(ny);
      console.log(nz);

      if (isNaN(nx) || isNaN(ny) || isNaN(nz))
        return;

      cPos.x = nx;
      cPos.y = ny;
      cPos.z = nz;

      render();
  }

  window.raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

function onMouseMove( event ) {

  // calculate mouse position in normalized device coordinates
  // (-1 to +1) for both components

  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;   

}
  setInterval(function(){
    raycaster.setFromCamera( mouse, camera ); 
    console.log(raycaster.ray.origin);
  }, 2000)


window.addEventListener( 'mousemove', onMouseMove, false );

window.requestAnimationFrame(render);



  // document.body.addEventListener( 'mousewheel', mousewheel, false );
  // document.body.addEventListener( 'DOMMouseScroll', mousewheel, false ); // firefox




    render();
  // renderer.render(scene, camera);

})();
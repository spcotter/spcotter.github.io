var retirement_model_formula = function(d){
  var logit = -28.93320997;

  logit += d.age * 0.520537481;

  logit += d.age * d.age * -0.001971271;
  
  logit += d.tenure * 0.366612123;

  logit += d.tenure * d.age * -0.004264868;
  
  logit += d.tenure * d.tenure * -0.001450424;

  return 1/(1 + Math.exp(-logit));
}

var length = (100 - 50 + 1) * (60 - 0 + 1),
    positions = new Float32Array( length * 3 ),
    i3 = 0;

for(var age = 50; age <= 100; age++){
  for(var tenure = 0; tenure <= 60; tenure++){
      // In three.js the z axis is coming out of the screen.
      positions[ i3 + 0 ] = age * 2;
      positions[ i3 + 2 ] = tenure * 2;
      positions[ i3 + 1 ] = retirement_model_formula({ age: age, tenure: tenure }) * 200;
      i3 += 3;
  }
}

(function(){
  window.scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  var renderer = new THREE.WebGLRenderer({ antialias: true });

  renderer.setClearColor(0xffffff);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMapEnabled = true;
  renderer.shadowMapSoft = true;

  var axis = new THREE.AxisHelper(100);
  scene.add(axis);

  // grid size
  var grid_color = new THREE.Color(0xdddddd),
      s = 100;

  var grid = new THREE.GridHelper(s, 50);
  grid.setColors(grid_color,grid_color);
  grid.position.set(s,0,s);
  scene.add(grid);


  grid = new THREE.GridHelper(s, 50);
  grid.setColors(grid_color,grid_color);
  grid.rotation.x = -0.5 * Math.PI;
  grid.position.set(s,s,0);
  scene.add(grid);


  grid = new THREE.GridHelper(s, 50);
  grid.setColors(grid_color,grid_color);
  grid.rotation.z = -0.5 * Math.PI;
  grid.position.set(0,s,s);
  scene.add(grid);

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
    this.rotationX = camera.rotation.x;
    this.rotationY = camera.rotation.y;
    this.rotationZ = camera.rotation.z;

    this.positionX = camera.position.x;
    this.positionY = camera.position.y;
    this.positionZ = camera.position.z;
  };


  var datGUI = new dat.GUI();
  datGUI.add(guiControls, 'rotationX', -Math.PI, Math.PI);
  datGUI.add(guiControls, 'rotationY', -Math.PI, Math.PI);
  datGUI.add(guiControls, 'rotationZ', -Math.PI, Math.PI);

  datGUI.add(guiControls, 'positionX', 40, 600);
  datGUI.add(guiControls, 'positionY', 40, 600);
  datGUI.add(guiControls, 'positionZ', 40, 600);

  // create the point variables
  var pointCount = 1000,
      points = new THREE.BufferGeometry(),
      // texture = e=THREE.ImageUtils.loadTexture('./circle.png'),
      // pMaterial = new THREE.PointsMaterial({map:texture, size: 2});
      uniforms = {
        color: { type: "c", value: new THREE.Color( 0x4682B4 )},
        alpha: { value: 1 }
      },
      shaderMaterial = new THREE.ShaderMaterial( {
        uniforms:       uniforms,
        vertexShader:   document.getElementById( 'vertexshader' ).textContent,
        fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
        transparent:    true
      });



  var sizes = new Float32Array( length * 1 ),
      colors = new Float32Array( length * 3 ),
      color = new THREE.Color();
  // now create the individual points

  for ( var i = 0, i3 = 0; i < length; i ++, i3 += 3 ) {

      // positions[ i3 + 0 ] = Math.random() * 50 - 25;
      // positions[ i3 + 1 ] = Math.random() * 50 - 25;
      // positions[ i3 + 2 ] = Math.random() * 50 - 25;

      // color.setHSL( i / pointCount, 1.0, 0.5 );

      // colors[ i3 + 0 ] = color.r;
      // colors[ i3 + 1 ] = color.g;
      // colors[ i3 + 2 ] = color.b;

      colors[ i3 + 0 ] = 0.5;
      colors[ i3 + 1 ] = 1;
      colors[ i3 + 2 ] = 1;

      // console.log(color.r);

      sizes[ i ] = 20;
    }

  points.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
  points.addAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
  points.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );



  window.points = points;

  // create the point system
  var pointSystem = new THREE.Points(points, shaderMaterial);

  window.pointSystem = pointSystem;
  // add it to the scene
  scene.add(pointSystem);


  // var light = new THREE.PointLight(0xffffff);
  // light.position.set(0,500,0);
  // scene.add(light);


  function render(){
    // camera.rotation.x = guiControls.rotationX;
    // camera.rotation.y = guiControls.rotationY;
    // camera.rotation.z = guiControls.rotationZ;

    // // sphere.rotation.x += 0.05;

    // camera.position.x = guiControls.positionX;
    // camera.position.y = guiControls.positionY;
    // camera.position.z = guiControls.positionZ;


    // requestAnimationFrame(render);
    renderer.render(scene, camera);
  }



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



  document.body.addEventListener( 'mousewheel', mousewheel, false );
  document.body.addEventListener( 'DOMMouseScroll', mousewheel, false ); // firefox




    render();

})();
(function () {
  var renderer = new THREE.WebGLRenderer();

  renderer.setClearColor(new THREE.Color(0xffffff), 1.0);
  renderer.setSize(window.innerWidth, window.innerHeight);

  window.scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

  camera.position.set(-70,40,300);
  camera.lookAt(scene);

  var planeGeometry = new THREE.PlaneGeometry(60,40,1,1),
    planeMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc}),
    plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = 0.5 * Math.PI;
  scene.add(plane);

  var ambientLight = new THREE.AmbientLight(0x0c0c0c);
  scene.add(ambientLight);

  var spotLight = new THREE.SpotLight(0xffffff);
  spotLight.position.set(-40,60,-10);
  scene.add(spotLight);

  $('#webGL-container').append(renderer.domElement);

  var render = function(){
    renderer.render(scene, camera);
  }
  

  window.addCube = function(){
    var cubeSize = Math.ceil(Math.random() * 3),
        cubeGeometry = new THREE.CubeGeometry(cubeSize, cubeSize, cubeSize),
        cubeMaterial = new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }),
        cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

    cube.castShadow = true;
    cube.name = 'cube-' + scene.children.length;

    cube.position.x = -30 + Math.round(Math.random() * planeGeometry.width );
    cube.position.y = Math.round(Math.random() * 5);
    cube.position.z = -20 + Math.round(Math.random() * planeGeometry.height);

    scene.add(cube);
    this.numberOfObjects = scene.children.length;
    render();
  }

  render();

})();
$(function(){
    
    var scene, camera, renderer;
    var controls, guiControls, datGUI;
    var axis, grid, color;
    var cubeGeometry,  torGeometry, textGeometry,  planeGeometry;
    var cubeMaterial, torMaterial, textMaterial,  planeMaterial;
    var cube, torusKnot, text, plane;
    var spotLight;
    var stats;
    var SCREEN_WIDTH, SCREEN_HEIGHT;
    
    function init(){    
        /*creates empty scene object and renderer*/
        scene = new THREE.Scene();
        camera =  new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, .1, 500);
        renderer = new THREE.WebGLRenderer({antialias:true});
        
        renderer.setClearColor(0xdddddd);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMapEnabled= true;
        renderer.shadowMapSoft = true;
        
        /*add controls*/
        controls = new THREE.OrbitControls( camera, renderer.domElement );
        controls.addEventListener( 'change', render );
        
        /*adds helpers*/
        axis =  new THREE.AxisHelper(10);
        scene.add (axis);
        
        grid = new THREE.GridHelper(50, 5);
        color = new THREE.Color("rgb(255,0,0)");
        grid.setColors(color, 0x000000);
        
        scene.add(grid);
        
        /*create cube*/
        cubeGeometry = new THREE.BoxGeometry(5, 5, 5);
        cubeMaterial = new THREE.MeshLambertMaterial({color:0xff3300});
        cube  = new THREE.Mesh(cubeGeometry, cubeMaterial);

        /*create torus knot*/   
        torGeometry = new THREE.TorusKnotGeometry( 3, 1, 64, 64); 
        torMaterial = new THREE.MeshPhongMaterial( { color: 0xffff00 } ); 
        torusKnot = new THREE.Mesh( torGeometry, torMaterial ); 

        /*create text*/ 
        textGeometry = new THREE.TextGeometry('Hello  World', {size:2, height:1}); 
        textMaterial = new THREE.MeshPhongMaterial( { color: 0xff9000 } ); 
        text = new THREE.Mesh( textGeometry, textMaterial );    

        /*create plane*/    
        planeGeometry = new THREE.PlaneGeometry (100,100,100);
        planeMaterial = new THREE.MeshLambertMaterial({color:0xffffff});
        plane = new THREE.Mesh(planeGeometry, planeMaterial);
        
        /*position and add objects to scene*/
        plane.rotation.x = -.5*Math.PI;
        plane.receiveShadow = true; 
        scene.add(plane);
        
        cube.position.x = 2.5;
        cube.position.y = 4;
        cube.position.z = 2.5;
        cube.castShadow = true; 
        scene.add(cube);

        torusKnot.position.x = -15;
        torusKnot.position.y = 6;
        torusKnot.position.z = 2.5;
        torusKnot.castShadow = true;
        scene.add( torusKnot );
        
        text.position.x = 15;
        text.position.y = 6;
        text.position.z = 2.5;
        text.castShadow = true;
        scene.add( text );  
            
        camera.position.x = 40;
        camera.position.y = 40;
        camera.position.z = 40; 
        camera.lookAt(scene.position);
        
        /*datGUI controls object*/
        guiControls = new function(){
            this.rotationX  = 0.0;
            this.rotationY  = 0.0;
            this.rotationZ  = 0.0;
            
            this.lightX = 20;
            this.lightY = 35;
            this.lightZ = 40;
            this.intensity = 1;     
            this.distance = 0;
            this.angle = 1.570;
            this.exponent = 0;
            this.shadowCameraNear = 10;
            this.shadowCameraFar = 100;
            this.shadowCameraFov = 50;
            this.shadowCameraVisible=true;
            this.shadowMapWidth=1028;
            this.shadowMapHeight=1028;
            this.shadowBias=0;
            this.shadowDarkness=0.5;        
            this.target = cube;

        }
        /*adds spot light with starting parameters*/
        spotLight = new THREE.SpotLight(0xffffff);
        spotLight.castShadow = true;
        spotLight.position.set (20, 35, 40);
        spotLight.intensity = guiControls.intensity;        
        spotLight.distance = guiControls.distance;
        spotLight.angle = guiControls.angle;
        spotLight.exponent = guiControls.exponent;
        spotLight.shadowCameraNear = guiControls.shadowCameraNear;
        spotLight.shadowCameraFar = guiControls.shadowCameraFar;
        spotLight.shadowCameraFov = guiControls.shadowCameraFov;
        spotLight.shadowCameraVisible = guiControls.shadowCameraVisible;
        spotLight.shadowBias = guiControls.shadowBias;
        spotLight.shadowDarkness = guiControls.shadowDarkness;
        scene.add(spotLight);

        /*adds controls to scene*/
        datGUI = new dat.GUI();
        
        datGUI.add(guiControls, 'rotationX',0,1);
        datGUI.add(guiControls, 'rotationY',0,1);   
        datGUI.add(guiControls, 'rotationZ',0,1);
        
        datGUI.add(guiControls, 'lightX',-60,180);  
        datGUI.add(guiControls, 'lightY',0,180);    
        datGUI.add(guiControls, 'lightZ',-60,180);
        
        datGUI.add(guiControls, 'target', ['cube', 'torusKnot','text']).onChange(function(){
            if (guiControls.target == 'cube'){
                spotLight.target =  cube;
            }   
            else if (guiControls.target == 'torusKnot'){
                spotLight.target =  torusKnot;
            }   
            else if (guiControls.target == 'text'){
                spotLight.target =  text;
            }
        }); 
        datGUI.add(guiControls, 'intensity',0.01, 5).onChange(function(value){
            spotLight.intensity = value;
        });     
        datGUI.add(guiControls, 'distance',0, 1000).onChange(function(value){
            spotLight.distance = value;
        }); 
        datGUI.add(guiControls, 'angle',0.001, 1.570).onChange(function(value){
            spotLight.angle = value;
        });     
        datGUI.add(guiControls, 'exponent',0 ,50 ).onChange(function(value){
            spotLight.exponent = value;
        });
        datGUI.add(guiControls, 'shadowCameraNear',0,100).name("Near").onChange(function(value){        
            spotLight.shadowCamera.near = value;
            spotLight.shadowCamera.updateProjectionMatrix();        
        });
        datGUI.add(guiControls, 'shadowCameraFar',0,5000).name("Far").onChange(function(value){
            spotLight.shadowCamera.far = value;
            spotLight.shadowCamera.updateProjectionMatrix();
        });
        datGUI.add(guiControls, 'shadowCameraFov',1,180).name("Fov").onChange(function(value){
            spotLight.shadowCamera.fov = value;
            spotLight.shadowCamera.updateProjectionMatrix();
        });
        datGUI.add(guiControls, 'shadowCameraVisible').onChange(function(value){
            spotLight.shadowCameraVisible = value;
            spotLight.shadowCamera.updateProjectionMatrix();
        });
        datGUI.add(guiControls, 'shadowBias',0,1).onChange(function(value){
            spotLight.shadowBias = value;
            spotLight.shadowCamera.updateProjectionMatrix();
        });
        datGUI.add(guiControls, 'shadowDarkness',0,1).onChange(function(value){
            spotLight.shadowDarkness = value;
            spotLight.shadowCamera.updateProjectionMatrix();
        });
    datGUI.close();
    
        $("#webGL-container").append(renderer.domElement);
        /*stats*/
        stats = new Stats();        
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';     
        $("#webGL-container").append( stats.domElement );
        
    }

    function render() {

        cube.rotation.x += guiControls.rotationX;
        cube.rotation.y += guiControls.rotationY;
        cube.rotation.z += guiControls.rotationZ;

        spotLight.position.x = guiControls.lightX;
        spotLight.position.y = guiControls.lightY;
        spotLight.position.z = guiControls.lightZ;
    
    }
    
    function animate(){
        requestAnimationFrame(animate);
        render();
        stats.update();     
        renderer.render(scene, camera);
    }
    
    $(window).resize(function(){


        SCREEN_WIDTH = window.innerWidth;
        SCREEN_HEIGHT = window.innerHeight;

        camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
        camera.updateProjectionMatrix();

        renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );



    });
    init(); 
    animate();
    
}); 
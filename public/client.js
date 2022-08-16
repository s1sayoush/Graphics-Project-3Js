import * as THREE from 'three';
import { OrbitControls } from './jsm/controls/OrbitControls.js';
import Stats from './jsm/libs/stats.module.js';
import { GUI } from './jsm/libs/lil-gui.module.min.js';
import { Water } from './jsm/objects/Water.js';
import { Sky } from './jsm/objects/Sky.js';

import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';


//Load Model

// class House {
//     constructor() {

//         let loader = new GLTFLoader();
//         loader.load("./house/scene.gltf", function (gltf) {
//             scene.add(gltf.scene);
//             this.house=gltf.scene
//         });

//     }
// }

// const house= new House()

let loader = new GLTFLoader();
loader.load("./windmill/scene.gltf", function (gltf) {
    scene.add(gltf.scene);
    house = gltf.scene.children[0];
    animate();
});




// Scene and Camera
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(20, 15, 20);


// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);



// Orbit Control
const controls = new OrbitControls(camera, renderer.domElement);
controls.maxPolarAngle = Math.PI * 0.495;
// controls.target.set(0, 10, 0);
controls.minDistance = 10.0;
controls.maxDistance = 200.0;



// Creating SUN,WATER,SKY
const sun = new THREE.Vector3();

const waterGeometry = new THREE.PlaneBufferGeometry(10000, 10000);
const water = new Water(
    waterGeometry, {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: new THREE.TextureLoader().load('textures/waternormals.jpg', function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    }),
    alpha: 1.0,
    sunDirection: new THREE.Vector3(),
    sunColor: 0xffffff,
    waterColor: 0x001e0f,
    distortionScale: 3.7,
    fog: scene.fog !== undefined
}
);
water.rotation.x = -Math.PI / 2;

scene.add(water);

const sky = new Sky();
sky.scale.setScalar(10000);
scene.add(sky);


// Light interaction
let uniforms = sky.material.uniforms;
uniforms['turbidity'].value = 10;
uniforms['rayleigh'].value = 2;
uniforms['mieCoefficient'].value = 0.005;
uniforms['mieDirectionalG'].value = 0.8;

const parameters = {
    inclination: 0.49,
    azimuth: 0.205
};

const pmremGenerator = new THREE.PMREMGenerator(renderer);

function updateSun() {

    var theta = Math.PI * (parameters.inclination - 0.5);
    var phi = 2 * Math.PI * (parameters.azimuth - 0.5);

    sun.x = Math.cos(phi);
    sun.y = Math.sin(phi) * Math.sin(theta);
    sun.z = Math.sin(phi) * Math.cos(theta);

    sky.material.uniforms['sunPosition'].value.copy(sun);
    water.material.uniforms['sunDirection'].value.copy(sun).normalize();

    scene.environment = pmremGenerator.fromScene(sky).texture;
}

updateSun();


window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}, false);


// window.addEventListener('keydown', function (e) {
//     this.alert(e.key=='ArrowUp');{
//         house.position.y=0.1
//     };
// })




const stats = Stats();
document.body.appendChild(stats.dom);

const gui = new GUI();

const skyFolder = gui.addFolder('Sky');
skyFolder.add(parameters, 'inclination', 0, 0.5, 0.0001).onChange(updateSun);
skyFolder.add(parameters, 'azimuth', 0, 1, 0.0001).onChange(updateSun);
skyFolder.open();

const waterFolder = gui.addFolder('Water');
waterFolder.add(water.material.uniforms.distortionScale, 'value', 0, 8, 0.1).name('distortionScale');
waterFolder.add(water.material.uniforms.size, 'value', 0.1, 10, 0.1).name('size');
waterFolder.open();

function animate() {

    requestAnimationFrame(animate);
    // house.rotation.z += 0.005;


    render();

    stats.update();
}

function render() {
    var time = performance.now() * 0.001;

    water.material.uniforms['time'].value += 1.0 / 60.0;

    renderer.render(scene, camera);
}

animate();
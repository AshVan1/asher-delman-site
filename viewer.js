// Replicates asherdelman.com's react-three-fiber STL viewer in plain three.js
import * as THREE from 'three';
import {STLLoader} from 'three/addons/STLLoader.js';
import {RGBELoader} from 'three/addons/RGBELoader.js';
import {OrbitControls} from 'three/addons/OrbitControls.js';
let hdrP;
const env=r=>(hdrP??=new RGBELoader().loadAsync('assets/venice_sunset_1k.hdr')).then(t=>{const g=new THREE.PMREMGenerator(r);const e=g.fromEquirectangular(t).texture;g.dispose();return e});
const geoCache={};
function mount(el){
  const r=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
  r.setPixelRatio(Math.min(devicePixelRatio,1.5));r.toneMapping=THREE.ACESFilmicToneMapping;r.outputColorSpace=THREE.SRGBColorSpace;
  el.appendChild(r.domElement);
  const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(50,1,.1,100);cam.position.set(0,0,5);
  scene.add(new THREE.AmbientLight(0xffffff,1));
  const d=new THREE.DirectionalLight(0xffffff,2);d.position.set(10,10,5);scene.add(d);
  const p1=new THREE.PointLight(0xffffff,.8,0,0);p1.position.set(-10,-10,-5);scene.add(p1);
  const p2=new THREE.PointLight(0xffffff,1,0,0);p2.position.set(0,10,0);scene.add(p2);
  env(r).then(e=>scene.environment=e);
  const ctl=new OrbitControls(cam,r.domElement);ctl.enablePan=false;ctl.enableZoom=false;
  const speed=parseFloat(el.dataset.speed||.3);let mesh;
  (geoCache[el.dataset.model]??=new STLLoader().loadAsync(el.dataset.model).then(g=>{g.computeVertexNormals();g.center();g.computeBoundingBox();const s=new THREE.Vector3();g.boundingBox.getSize(s);const k=2/(Math.max(s.x,s.y,s.z)||1);g.scale(k,k,k);return g}))
  .then(g=>{mesh=new THREE.Mesh(g,new THREE.MeshPhysicalMaterial({color:'#C0C0C0',metalness:1,roughness:0,reflectivity:1,clearcoat:1,clearcoatRoughness:0,envMapIntensity:2,ior:1.8,transmission:.2,thickness:.8,attenuationDistance:1,attenuationColor:'#ffffff'}));
    mesh.rotation.set(...(el.dataset.rot?JSON.parse(el.dataset.rot):[.5,.8,.2]));mesh.scale.setScalar(parseFloat(el.dataset.scale||1.2));scene.add(mesh);el.classList.add('loaded')});
  const size=()=>{const w=el.clientWidth,h=el.clientHeight;r.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()};
  new ResizeObserver(size).observe(el);size();
  const clock=new THREE.Clock();
  r.setAnimationLoop(()=>{const dt=clock.getDelta();if(mesh)mesh.rotation.y+=dt*speed;ctl.update();r.render(scene,cam)});
}
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting&&!e.target.dataset.on){e.target.dataset.on=1;mount(e.target)}}),{rootMargin:'100px'});
export const observe=root=>root.querySelectorAll('.viewer').forEach(v=>io.observe(v));
observe(document);

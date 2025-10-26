import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';

// 建立場景
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

// 建立相機
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(-15, 10, 12);
camera.lookAt(0, 0, 0);

// 建立渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 加入光源
const light = new THREE.HemisphereLight(0xffffff, 0x444444);
light.position.set(0, 20, 0);
scene.add(light);

// 載入 GLTF 模型
const loader = new GLTFLoader();
loader.load('scene.glb', (gltf) => {
    scene.add(gltf.scene);
}, undefined, (error) => {
    console.error('載入失敗', error);
});

// 軌道控制器
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;

// 加入網格地板
const grid = new THREE.GridHelper(50, 50, 0x333333, 0x333333); // 尺寸與分段可調整
scene.add(grid);

// 視窗大小變更處理
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function createTextSprite(message, parameters = {}) {
    const fontface = parameters.fontface || 'Arial';
    const fontsize = parameters.fontsize || 48;
    const color = parameters.color || 'Yellow';
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    context.font = `${fontsize}px ${fontface} bold`;
    const textWidth = context.measureText(message).width;

    canvas.width = textWidth;
    canvas.height = fontsize * 1.2;
    context.font = `${fontsize}px ${fontface}`;
    context.fillStyle = color;
    context.fillText(message, 0, fontsize);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(canvas.width / 100, canvas.height / 100, 1); // 調整大小
    return sprite;
}

const texts = [
    { message: '8米', position: point(0, 5.4, 9.6) },
    { message: '10米', position: point(-6.5, 5.4, -1) },
    { message: '6米', position: point(-3.5, 5.4, 6.7) },
    { message: '3米', position: point(-5.4, 5.4, -14) },
    { message: '7.5米', position: point(-7, 5.4, -10) },
    { message: '4米', position: point(-2, 6.8, -14) }, // 前
    { message: '4米', position: point(2, 6.8, -14) }, // 後
    { message: '4.2米', position: point(5.8, 6.8, -14) },
];
for (const textDef of texts) { const sprite = createTextSprite(textDef.message); sprite.position.copy(textDef.position); scene.add(sprite); }
const 共用柱子 = createTextSprite('共用柱子', { color: 'red', fontsize: 36 });
共用柱子.position.set(-7.5, 3, -5.5);
scene.add(共用柱子);

const 水槽 = createTextSprite('水槽', { color: 'blue', fontsize: 36 });
水槽.position.set(-6, 4.7, -6.15);
scene.add(水槽);

function createThickLine(p1, p2, width = 5) {
    const positions = [p1.x, p1.y, p1.z, p2.x, p2.y, p2.z];
    const geometry = new LineGeometry();
    geometry.setPositions(positions);

    const material = new LineMaterial({
        color: '#ff0000',
        linewidth: width, // 寬度以像素為單位
    });

    material.resolution.set(window.innerWidth, window.innerHeight); // 必須設定解析度

    const line = new Line2(geometry, material);
    line.computeLineDistances(); // 若要支援虛線
    return line;
}

function point(x, y, z) { return new THREE.Vector3(x, y, z); }

const lines = [
    { start: point(-3.95, 5.1, 9.6), end: point(3.95, 5.1, 9.6) }, // 8米
    { start: point(-7, 5.1, -5.5), end: point(-7, 5.1, 3.5) }, // 10米
    { start: point(-4, 5.1, 3.5), end: point(-4, 5.1, 9.6) }, // 6米
    { start: point(-3.9, 5.1, -14), end: point(-6.8, 5.1, -14) }, // 3米
    { start: point(-7, 5.1, -14), end: point(-7, 5.1, -6.5) }, // 7.5米
    { start: point(-3.5, 5.1, -14), end: point(-3.5, 6.5, -14) }, // 4米字的垂直線(前)
    { start: point(-3.5, 6.5, -14), end: point(-0.1, 6.5, -14) }, // 4米字的水平線(前)
    { start: point(0.1, 6.5, -14), end: point(3.7, 6.5, -14) }, // 4米字的水平線(後)
    { start: point(3.7, 5.1, -14), end: point(3.7, 6.5, -14) }, // 4米字的垂直線(後)
    { start: point(7.75, 3.8, -14), end: point(7.75, 6.5, -14) },
    { start: point(7.75, 6.5, -14), end: point(3.9, 6.5, -14) },
]
for (const lineDef of lines) { const line = createThickLine(lineDef.start, lineDef.end); scene.add(line); }

// 渲染迴圈
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();
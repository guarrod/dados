// Basic Three.js scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);
document.getElementById('container').appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

camera.position.z = 5;

// Pip layouts
const pipLayouts = [
    [], // 0 (not used)
    [[0, 0]], // 1
    [[-0.3, 0.3], [0.3, -0.3]], // 2
    [[-0.3, 0.3], [0, 0], [0.3, -0.3]], // 3
    [[-0.3, 0.3], [0.3, 0.3], [-0.3, -0.3], [0.3, -0.3]], // 4
    [[-0.3, 0.3], [0.3, 0.3], [0, 0], [-0.3, -0.3], [0.3, -0.3]], // 5
    [[-0.3, 0.3], [0.3, 0.3], [-0.3, 0], [0.3, 0], [-0.3, -0.3], [0.3, -0.3]] // 6
];

// Target rotations for each face to be on top
const faceRotations = [
    null, // 0
    { x: 0, y: 0, z: 0 }, // 1 -> face 4
    { x: 0, y: -Math.PI / 2, z: 0 }, // 2 -> face 5
    { x: Math.PI / 2, y: 0, z: 0 }, // 3 -> face 2
    { x: -Math.PI / 2, y: 0, z: 0 }, // 4 -> face 3
    { x: 0, y: Math.PI / 2, z: 0 }, // 5 -> face 1
    { x: Math.PI, y: 0, z: 0 } // 6 -> face 0
];


function createDice() {
    const dice = new THREE.Group();
    const boxGeometry = new RoundedBoxGeometry(1, 1, 1, 2, 0.1);
    const boxMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7, metalness: 0.1 });
    const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
    dice.add(boxMesh);

    const pipGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.02, 16);
    const pipMaterial = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.9, metalness: 0.1 });

    const faceNormals = [
        new THREE.Vector3(0, 0, 1),  // 1 (front)
        new THREE.Vector3(1, 0, 0),  // 2 (right)
        new THREE.Vector3(0, 1, 0),  // 3 (top)
        new THREE.Vector3(0, -1, 0), // 4 (bottom)
        new THREE.Vector3(-1, 0, 0), // 5 (left)
        new THREE.Vector3(0, 0, -1)  // 6 (back)
    ];

    const faceNumbers = [1, 2, 3, 4, 5, 6];

    for (let i = 0; i < 6; i++) {
        const layout = pipLayouts[faceNumbers[i]];
        const normal = faceNormals[i];

        const up = new THREE.Vector3(0, 1, 0);
        if(normal.y === 1 || normal.y === -1) up.set(0,0,normal.y);

        for (const pos of layout) {
            const pip = new THREE.Mesh(pipGeometry, pipMaterial);

            const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
            pip.quaternion.copy(quaternion);

            const position = normal.clone().multiplyScalar(0.5);

            const tangent = new THREE.Vector3().crossVectors(up, normal).normalize();
            if(tangent.length() === 0) {
                tangent.set(1,0,0);
            }
            const bitangent = new THREE.Vector3().crossVectors(normal, tangent).normalize();

            position.add(tangent.multiplyScalar(pos[0]));
            position.add(bitangent.multiplyScalar(pos[1]));
            pip.position.copy(position);
            dice.add(pip);
        }
    }

    return dice;
}


const dice1 = createDice();
dice1.position.x = -1.5;
scene.add(dice1);

const dice2 = createDice();
dice2.position.x = 1.5;
scene.add(dice2);

let isAnimating = false;
let animationQueue = [];

function animateToFace(dice, face) {
    if (isAnimating && animationQueue.length > 1) {
        return;
    }
    animationQueue.push({ dice, face });
    if (isAnimating) return;

    processAnimationQueue();
}

function processAnimationQueue() {
    if (animationQueue.length === 0) {
        isAnimating = false;
        return;
    }
    isAnimating = true;

    const { dice, face } = animationQueue.shift();
    const targetRotation = faceRotations[face];
    const startRotation = new THREE.Quaternion().copy(dice.quaternion);
    const endRotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(targetRotation.x, targetRotation.y, targetRotation.z));

    let duration = 500;
    let startTime = null;

    function animateStep(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);

        THREE.Quaternion.slerp(startRotation, endRotation, dice.quaternion, progress);

        if (progress < 1) {
            requestAnimationFrame(animateStep);
        } else {
            processAnimationQueue();
        }
    }

    requestAnimationFrame(animateStep);
}


let rollCount = 0;
const rollSequence = [
    [1, 2],
    [3, 3],
    [4, 5],
    [6, 4]
];

document.getElementById('rollButton').addEventListener('click', () => {
    const [result1, result2] = rollSequence[rollCount % rollSequence.length];
    rollCount++;

    document.getElementById('result').innerText = `Dado 1: ${result1}, Dado 2: ${result2}`;

    animateToFace(dice1, result1);
    animateToFace(dice2, result2);
});


// Render loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();

// Handle window resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

// --- Configuration ---
const PARTICLE_COUNT = 15000; // Increased count for better density
const PARTICLE_SIZE = 0.25; // Increased size for visibility
const TEXT_STRING = "Merry Christmas\n   to 大王";

// --- Globals ---
let scene, camera, renderer;
let particlesGeometry, particlesMaterial, particlesSystem;
let snowSystem, pinkSystem, bokehSystem;
let targetPositions = [];
let targetColors = [];
let currentShape = 'tree'; // 'text' or 'tree'
let treeGroup; // To rotate the tree
let handX = 0.5; // 0 to 1
let isHandOpen = false;

// --- Initialization ---
try {
    init();
    initMediaPipe();
    animate();
} catch (e) {
    alert("Initialization failed: " + e.message);
    document.getElementById('loading').innerText = "Error: " + e.message;
}

function init() {
    const container = document.getElementById('canvas-container');

    // Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.02);

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 20;
    camera.position.y = 5;

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Lights (for standard materials if used, but particles are unlit usually)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Initialize Particles
    initParticles();
    initBackgroundEffects();

    // Generate Shapes
    generateTextFromCanvas(); // New method using Canvas
    generateTreeShape(); // Default shape

    // Resize Handler
    window.addEventListener('resize', onWindowResize, false);
    
    // Hide loading immediately as we don't wait for font anymore
    document.getElementById('loading').classList.add('hidden');
}

function initParticles() {
    particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);

    // Initial random positions
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 50;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 50;

        colors[i * 3] = 1;
        colors[i * 3 + 1] = 1;
        colors[i * 3 + 2] = 1;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Texture for particle
    const sprite = new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/spark1.png');

    particlesMaterial = new THREE.PointsMaterial({
        size: PARTICLE_SIZE,
        map: sprite,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true,
        opacity: 0.8
    });

    particlesSystem = new THREE.Points(particlesGeometry, particlesMaterial);
    
    // Group to handle rotation of the whole system if needed, 
    // but we specifically want to rotate the TREE.
    // So we'll apply rotation logic in the animate loop.
    scene.add(particlesSystem);

    // Initialize targets to current positions
    for (let i = 0; i < PARTICLE_COUNT * 3; i++) {
        targetPositions.push(positions[i]);
        targetColors.push(colors[i]);
    }
}

function initBackgroundEffects() {
    // 1. Snow
    const snowGeo = new THREE.BufferGeometry();
    const snowCount = 2000;
    const snowPos = new Float32Array(snowCount * 3);
    for(let i=0; i<snowCount; i++) {
        snowPos[i*3] = (Math.random() - 0.5) * 60;
        snowPos[i*3+1] = (Math.random() - 0.5) * 60;
        snowPos[i*3+2] = (Math.random() - 0.5) * 60;
    }
    snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPos, 3));
    const snowMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.2,
        transparent: true,
        opacity: 0.6
    });
    snowSystem = new THREE.Points(snowGeo, snowMat);
    scene.add(snowSystem);

    // 2. Pink Dust (Reduced intensity)
    const pinkGeo = new THREE.BufferGeometry();
    const pinkCount = 500; 
    const pinkPos = new Float32Array(pinkCount * 3);
    for(let i=0; i<pinkCount; i++) {
        pinkPos[i*3] = (Math.random() - 0.5) * 40;
        pinkPos[i*3+1] = (Math.random() - 0.5) * 40;
        pinkPos[i*3+2] = (Math.random() - 0.5) * 40;
    }
    pinkGeo.setAttribute('position', new THREE.BufferAttribute(pinkPos, 3));
    const pinkMat = new THREE.PointsMaterial({
        color: 0xff69b4, // Hot pink
        size: 0.2, 
        transparent: true,
        opacity: 0.2, 
        blending: THREE.AdditiveBlending
    });
    pinkSystem = new THREE.Points(pinkGeo, pinkMat);
    scene.add(pinkSystem);

    // 3. Bokeh Lights (New Atmosphere)
    const bokehGeo = new THREE.BufferGeometry();
    const bokehCount = 50;
    const bokehPos = new Float32Array(bokehCount * 3);
    const bokehCols = new Float32Array(bokehCount * 3);
    
    for(let i=0; i<bokehCount; i++) {
        bokehPos[i*3] = (Math.random() - 0.5) * 80;
        bokehPos[i*3+1] = (Math.random() - 0.5) * 60;
        bokehPos[i*3+2] = -20 + (Math.random() - 0.5) * 20; // Far background
        
        const color = new THREE.Color();
        if (Math.random() > 0.5) color.setHex(0xFFD700); // Gold
        else color.setHex(0xFF0000); // Red
        
        bokehCols[i*3] = color.r;
        bokehCols[i*3+1] = color.g;
        bokehCols[i*3+2] = color.b;
    }
    bokehGeo.setAttribute('position', new THREE.BufferAttribute(bokehPos, 3));
    bokehGeo.setAttribute('color', new THREE.BufferAttribute(bokehCols, 3));
    
    // Create a soft circle texture programmatically or use a sprite
    const bokehMat = new THREE.PointsMaterial({
        size: 2.0,
        vertexColors: true,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    
    bokehSystem = new THREE.Points(bokehGeo, bokehMat);
    scene.add(bokehSystem);
}

// --- Shape Generation ---

function generateTextFromCanvas() {
    // Create a canvas to draw the text
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const width = 512;
    const height = 256;
    canvas.width = width;
    canvas.height = height;

    // Draw Text
    ctx.fillStyle = '#000000'; // Background
    ctx.fillRect(0, 0, width, height);
    
    ctx.fillStyle = '#FFFFFF'; // Text Color
    ctx.font = 'bold 70px "Microsoft YaHei", sans-serif'; // Larger font
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const lines = TEXT_STRING.split('\n');
    const lineHeight = 80;
    const startY = height / 2 - ((lines.length - 1) * lineHeight) / 2;
    
    lines.forEach((line, i) => {
        ctx.fillText(line, width / 2, startY + i * lineHeight);
    });

    // Get Pixel Data
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    const validPixels = [];
    
    for (let y = 0; y < height; y += 2) { // Step 2 for density control
        for (let x = 0; x < width; x += 2) {
            const index = (y * width + x) * 4;
            const r = data[index]; // Red channel (since text is white)
            
            if (r > 128) { // If pixel is bright enough
                validPixels.push({
                    x: (x - width / 2) * 0.12, // Scale up slightly
                    y: -(y - height / 2) * 0.12 // Invert Y
                });
            }
        }
    }
    
    // Map to Particles
    window.textTargetPositions = new Float32Array(PARTICLE_COUNT * 3);
    window.textTargetColors = new Float32Array(PARTICLE_COUNT * 3);
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        // Pick a random valid pixel
        const pixel = validPixels[i % validPixels.length];
        
        // Add some randomness/depth
        window.textTargetPositions[i*3] = pixel.x;
        window.textTargetPositions[i*3+1] = pixel.y;
        window.textTargetPositions[i*3+2] = (Math.random() - 0.5) * 2; // Slight depth
        
        // Metallic Gold/Silver colors - Brighter
        const isGold = Math.random() > 0.5;
        // Use very bright colors for "metallic" shine
        const color = new THREE.Color(isGold ? 0xFFF700 : 0xFFFFFF); 
        
        window.textTargetColors[i*3] = color.r;
        window.textTargetColors[i*3+1] = color.g;
        window.textTargetColors[i*3+2] = color.b;
    }
}

function generateTreeShape() {
    window.treeTargetPositions = new Float32Array(PARTICLE_COUNT * 3);
    window.treeTargetColors = new Float32Array(PARTICLE_COUNT * 3);
    
    // Allocation:
    // 0 - 400: Star (Top)
    // 400 - 1400: Gifts (Bottom)
    // 1400 - End: Tree Layers & Trunk
    
    const starCount = 400;
    const giftCount = 1000;
    const treeCount = PARTICLE_COUNT - starCount - giftCount;
    
    // Scale factor for larger tree
    const S = 1.5; 

    // 1. Star (Top)
    for (let i = 0; i < starCount; i++) {
        // Sphere cluster at top
        const r = Math.random() * 1.5 * S;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = (r * Math.sin(phi) * Math.sin(theta) + 9 * S); // Top of tree
        const z = r * Math.cos(phi);
        
        window.treeTargetPositions[i*3] = x;
        window.treeTargetPositions[i*3+1] = y;
        window.treeTargetPositions[i*3+2] = z;
        
        // Bright Yellow/White
        window.treeTargetColors[i*3] = 1.0; // R
        window.treeTargetColors[i*3+1] = 1.0; // G
        window.treeTargetColors[i*3+2] = 0.5 + Math.random()*0.5; // B (Yellowish)
    }
    
    // 2. Gifts (Bottom)
    for (let i = starCount; i < starCount + giftCount; i++) {
        // Create 3-4 boxes
        const boxIdx = Math.floor(Math.random() * 4);
        let cx, cz, w, h, d, cr, cg, cb;
        
        if (boxIdx === 0) { cx = 4*S; cz = 4*S; w=2*S; h=2*S; d=2*S; cr=1; cg=0; cb=0; } // Red
        else if (boxIdx === 1) { cx = -4*S; cz = 3*S; w=2.5*S; h=1.5*S; d=2*S; cr=0; cg=0; cb=1; } // Blue
        else if (boxIdx === 2) { cx = 2*S; cz = -4*S; w=1.5*S; h=2.5*S; d=1.5*S; cr=1; cg=0.8; cb=0; } // Gold
        else { cx = -3*S; cz = -3*S; w=2*S; h=2*S; d=2*S; cr=0.5; cg=0; cb=0.5; } // Purple
        
        const x = (Math.random() - 0.5) * w + cx;
        const y = (Math.random() - 0.5) * h - 5 * S; // On ground
        const z = (Math.random() - 0.5) * d + cz;
        
        window.treeTargetPositions[i*3] = x;
        window.treeTargetPositions[i*3+1] = y;
        window.treeTargetPositions[i*3+2] = z;
        
        window.treeTargetColors[i*3] = cr;
        window.treeTargetColors[i*3+1] = cg;
        window.treeTargetColors[i*3+2] = cb;
    }
    
    // 3. Tree Layers
    const layers = 4;
    const layerHeight = 3.5 * S;
    const startY = 8 * S; // Below star
    
    for (let i = starCount + giftCount; i < PARTICLE_COUNT; i++) {
        // Distribute particles among layers
        // We want a dense tree.
        
        // Randomly pick a layer or trunk
        const r = Math.random();
        
        if (r < 0.1) {
            // Trunk
            const h = 4 * S;
            const y = Math.random() * h - 6 * S; 
            const radius = 1.0 * S;
            const angle = Math.random() * Math.PI * 2;
            
            window.treeTargetPositions[i*3] = Math.cos(angle) * radius;
            window.treeTargetPositions[i*3+1] = y;
            window.treeTargetPositions[i*3+2] = Math.sin(angle) * radius;
            
            // Brown
            window.treeTargetColors[i*3] = 0.5;
            window.treeTargetColors[i*3+1] = 0.25;
            window.treeTargetColors[i*3+2] = 0.0;
        } else {
            // Leaves
            // Pick a layer 0 to 3
            const layer = Math.floor(Math.random() * layers);
            // Layer 0 is top
            
            // Cone dimensions for this layer
            const topY = startY - layer * 2.5 * S;
            const botY = topY - layerHeight;
            
            const topR = (0.5 + layer * 0.5) * S;
            const botR = (2.5 + layer * 1.5) * S;
            
            // Random height within layer
            const ph = Math.random(); // 0 to 1
            const y = topY - ph * (topY - botY);
            const radius = topR + ph * (botR - topR);
            
            // Spiral/Volume distribution
            const angle = Math.random() * Math.PI * 2;
            // Fill volume slightly
            const rDist = Math.sqrt(Math.random()) * radius; 
            
            window.treeTargetPositions[i*3] = Math.cos(angle) * rDist;
            window.treeTargetPositions[i*3+1] = y;
            window.treeTargetPositions[i*3+2] = Math.sin(angle) * rDist;
            
            // Color: Advanced Green with Ornaments
            const rand = Math.random();
            if (rand > 0.92) {
                // Ornament: Red or Gold
                if (Math.random() > 0.5) {
                    window.treeTargetColors[i*3] = 1.0; window.treeTargetColors[i*3+1] = 0.0; window.treeTargetColors[i*3+2] = 0.0; // Red
                } else {
                    window.treeTargetColors[i*3] = 1.0; window.treeTargetColors[i*3+1] = 0.8; window.treeTargetColors[i*3+2] = 0.0; // Gold
                }
                // Push ornaments to surface
                window.treeTargetPositions[i*3] = Math.cos(angle) * radius;
                window.treeTargetPositions[i*3+2] = Math.sin(angle) * radius;
            } else {
                // Advanced Green: Mix of ForestGreen (0x228B22) and Emerald (0x50C878)
                // R: 0.1-0.3, G: 0.5-0.8, B: 0.2-0.4
                const shade = Math.random();
                window.treeTargetColors[i*3] = 0.1 + shade * 0.1;
                window.treeTargetColors[i*3+1] = 0.5 + shade * 0.3;
                window.treeTargetColors[i*3+2] = 0.2 + shade * 0.1;
                
                // Add "Snow" tips
                if (Math.random() > 0.95) {
                     window.treeTargetColors[i*3] = 1.0;
                     window.treeTargetColors[i*3+1] = 1.0;
                     window.treeTargetColors[i*3+2] = 1.0;
                }
            }
        }
    }
}

// --- MediaPipe ---

function initMediaPipe() {
    const videoElement = document.getElementById('input_video');
    
    const hands = new Hands({locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }});
    
    hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });
    
    hands.onResults(onHandsResults);
    
    const cameraUtils = new Camera(videoElement, {
        onFrame: async () => {
            await hands.send({image: videoElement});
        },
        width: 320,
        height: 240
    });
    cameraUtils.start();
}

function onHandsResults(results) {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        
        // 1. Detect Open vs Closed
        // Simple heuristic: Average distance of finger tips (8, 12, 16, 20) from wrist (0)
        // vs distance of finger bases (5, 9, 13, 17) from wrist.
        
        const wrist = landmarks[0];
        const tips = [8, 12, 16, 20];
        const bases = [5, 9, 13, 17];
        
        let avgTipDist = 0;
        let avgBaseDist = 0;
        
        tips.forEach(idx => {
            const d = Math.hypot(landmarks[idx].x - wrist.x, landmarks[idx].y - wrist.y);
            avgTipDist += d;
        });
        
        bases.forEach(idx => {
            const d = Math.hypot(landmarks[idx].x - wrist.x, landmarks[idx].y - wrist.y);
            avgBaseDist += d;
        });
        
        // If tips are significantly further than bases, hand is open.
        // Threshold is experimental.
        isHandOpen = (avgTipDist / avgBaseDist) > 1.5;
        
        // 2. Detect Position for Rotation
        // x is 0-1.
        handX = landmarks[9].x; // Use middle finger base as center
        
    }
}

// --- Animation ---

function animate() {
    requestAnimationFrame(animate);
    
    const time = Date.now() * 0.001;
    
    // 1. Determine Target State
    let targetPosArray, targetColArray;
    
    if (isHandOpen && window.textTargetPositions) {
        targetPosArray = window.textTargetPositions;
        targetColArray = window.textTargetColors;
        currentShape = 'text';
    } else if (window.treeTargetPositions) {
        targetPosArray = window.treeTargetPositions;
        targetColArray = window.treeTargetColors;
        currentShape = 'tree';
    }
    
    // 2. Update Particles
    if (targetPosArray && targetColArray) {
        const positions = particlesGeometry.attributes.position.array;
        const colors = particlesGeometry.attributes.color.array;
        
        // Rotation logic for Tree
        // If tree, we rotate based on handX
        let rotationY = 0;
        if (currentShape === 'tree') {
            // Map handX (0-1) to rotation (-PI to PI)
            rotationY = (handX - 0.5) * Math.PI * 4; // 2 full turns range
        }
        
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            // Get target for this particle
            let tx = targetPosArray[i*3];
            let ty = targetPosArray[i*3+1];
            let tz = targetPosArray[i*3+2];
            
            // Apply rotation if tree
            if (currentShape === 'tree') {
                const cosR = Math.cos(rotationY + time * 0.5); // Add auto spin too?
                const sinR = Math.sin(rotationY + time * 0.5);
                
                const rx = tx * cosR - tz * sinR;
                const rz = tx * sinR + tz * cosR;
                tx = rx;
                tz = rz;
            }
            
            // Lerp Position
            positions[i*3] += (tx - positions[i*3]) * 0.05;
            positions[i*3+1] += (ty - positions[i*3+1]) * 0.05;
            positions[i*3+2] += (tz - positions[i*3+2]) * 0.05;
            
            // Lerp Color
            colors[i*3] += (targetColArray[i*3] - colors[i*3]) * 0.05;
            colors[i*3+1] += (targetColArray[i*3+1] - colors[i*3+1]) * 0.05;
            colors[i*3+2] += (targetColArray[i*3+2] - colors[i*3+2]) * 0.05;
        }
        
        particlesGeometry.attributes.position.needsUpdate = true;
        particlesGeometry.attributes.color.needsUpdate = true;
    }
    
    // 3. Animate Background
    if (snowSystem) {
        const positions = snowSystem.geometry.attributes.position.array;
        for(let i=0; i<positions.length/3; i++) {
            positions[i*3+1] -= 0.1; // Fall down
            if (positions[i*3+1] < -30) positions[i*3+1] = 30; // Reset
            
            // Wiggle
            positions[i*3] += Math.sin(time + i) * 0.02;
        }
        snowSystem.geometry.attributes.position.needsUpdate = true;
    }
    
    if (pinkSystem) {
        pinkSystem.rotation.y = time * 0.1;
    }

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

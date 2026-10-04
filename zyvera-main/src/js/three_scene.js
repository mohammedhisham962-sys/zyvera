// 3D Cinematic Hero Background - Three.js

let scene, camera, renderer, earthGroup, arcs = [];

function initThreeScene() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    scene = new THREE.Scene();
    
    // Camera setup
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 15;
    camera.position.y = 2;

    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Global Group
    earthGroup = new THREE.Group();
    scene.add(earthGroup);

    // 1. Earth Wireframe Sphere
    const earthRadius = 5;
    const earthGeo = new THREE.SphereGeometry(earthRadius, 32, 32);
    const earthMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        wireframe: true,
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earthMesh);

    // 2. Earth Nodes
    const nodeGeo = new THREE.BufferGeometry();
    const nodeCount = 150;
    const nodePos = new Float32Array(nodeCount * 3);
    for(let i=0; i<nodeCount; i++) {
        const phi = Math.acos(-1 + (2 * i) / nodeCount);
        const theta = Math.sqrt(nodeCount * Math.PI) * phi;
        nodePos[i*3] = earthRadius * Math.cos(theta) * Math.sin(phi);
        nodePos[i*3+1] = earthRadius * Math.sin(theta) * Math.sin(phi);
        nodePos[i*3+2] = earthRadius * Math.cos(phi);
    }
    nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePos, 3));
    const nodeMat = new THREE.PointsMaterial({
        color: 0xff2a5f,
        size: 0.1,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    const earthNodes = new THREE.Points(nodeGeo, nodeMat);
    earthGroup.add(earthNodes);

    // 3. Cyber Attack Arcs (Glowing Splines)
    createAttackArcs(earthRadius);

    // 4. Background Starfield Parallax
    const starsGeo = new THREE.BufferGeometry();
    const starsCount = 500;
    const starsPos = new Float32Array(starsCount * 3);
    for(let i=0; i<starsCount*3; i++) {
        starsPos[i] = (Math.random() - 0.5) * 100;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starsPos, 3));
    const starsMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.1,
        transparent: true,
        opacity: 0.3
    });
    const starField = new THREE.Points(starsGeo, starsMat);
    scene.add(starField);

    // Mouse Parallax Interaction
    let mouseX = 0;
    let mouseY = 0;
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    // Animation Loop
    const clock = new THREE.Clock();
    
    function animate() {
        requestAnimationFrame(animate);
        const time = clock.getElapsedTime();

        // Rotate Earth
        earthGroup.rotation.y += 0.002;
        earthGroup.rotation.x = Math.sin(time * 0.1) * 0.1;

        // Animate Arcs (Draw range)
        arcs.forEach(arc => {
            let drawCount = arc.geometry.drawRange.count;
            if (arc.userData.growing) {
                drawCount += 2;
                if (drawCount > arc.userData.max) arc.userData.growing = false;
            } else {
                arc.geometry.setDrawRange(arc.geometry.drawRange.start + 2, drawCount);
                if (arc.geometry.drawRange.start > arc.userData.max) {
                    arc.geometry.setDrawRange(0, 0);
                    arc.userData.growing = true;
                }
            }
            if (arc.userData.growing) arc.geometry.setDrawRange(0, drawCount);
        });

        // Camera Parallax based on mouse
        camera.position.x += (mouseX * 2 - camera.position.x) * 0.05;
        camera.position.y += (mouseY * 2 + 2 - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function createAttackArcs(radius) {
    for (let i = 0; i < 15; i++) {
        const startLat = (Math.random() - 0.5) * Math.PI;
        const startLon = (Math.random() - 0.5) * 2 * Math.PI;
        const endLat = (Math.random() - 0.5) * Math.PI;
        const endLon = (Math.random() - 0.5) * 2 * Math.PI;

        const startPt = getSphericalPoint(startLat, startLon, radius);
        const endPt = getSphericalPoint(endLat, endLon, radius);
        
        // Midpoint pushed outward
        const midPt = startPt.clone().lerp(endPt, 0.5).normalize().multiplyScalar(radius + 2 + Math.random());
        
        const curve = new THREE.QuadraticBezierCurve3(startPt, midPt, endPt);
        const points = curve.getPoints(50);
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        geo.setDrawRange(0, 0); // Start invisible

        const mat = new THREE.LineBasicMaterial({
            color: 0xef4444, // Red attack lines
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        const line = new THREE.Line(geo, mat);
        line.userData = { max: 50, growing: true };
        arcs.push(line);
        earthGroup.add(line);
    }
}

function getSphericalPoint(lat, lon, radius) {
    return new THREE.Vector3(
        radius * Math.cos(lat) * Math.cos(lon),
        radius * Math.sin(lat),
        radius * Math.cos(lat) * Math.sin(lon)
    );
}

// Auto-init if DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThreeScene);
} else {
    initThreeScene();
}

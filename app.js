// SPECMED Life Sciences - Premium Biotech Design Upgrade
// Visuals: Three.js WebGL particle engines & GSAP Scroll animation hooks

document.addEventListener('DOMContentLoaded', () => {
    setActiveNavLink();
    initDnaHelixHero();
    initGlobalMoleculeBackground();
    initStatsCounters();
    initGSAPScrollAnimations();
    initUIUXEvents();
    initProduct3DViewer();
    initProductFiltersAndSearch();
    initProductDrawer();
});

function setActiveNavLink() {
    let currentPath = window.location.pathname.split('/').pop() || 'index.html';
    // Handle root path / resolving to index.html
    if (currentPath === '') currentPath = 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

window.addEventListener('load', () => {
    if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
    }
});

// ==========================================
// 1. HERO: 3D DNA Particle Helix
// ==========================================
function initDnaHelixHero() {
    const container = document.getElementById('dna-bg-canvas');
    if (!container) return;

    const scene = new THREE.Scene();
    
    // Camera
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 14);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75); // Brighter ambient for light background
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xff6b00, 1.8);
    keyLight.position.set(5, 5, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x94a3b8, 1.2); // Blue-gray fill reflection
    fillLight.position.set(-5, -5, 5);
    scene.add(fillLight);

    // DNA Group (Positioned on the right side statically to avoid overlapping text)
    const dnaGroup = new THREE.Group();
    dnaGroup.position.set(2.0, 0, 0);
    scene.add(dnaGroup);

    // Math Helix Coordinates
    const pointsCount = 35;
    const radius = 2.2;
    const heightSpacing = 0.32;
    const sphereGeo = new THREE.SphereGeometry(0.12, 16, 16);
    
    const sphereMat1 = new THREE.MeshStandardMaterial({ 
        color: 0xff6b00, 
        roughness: 0.1, 
        metalness: 0.8,
        emissive: 0xff6b00,
        emissiveIntensity: 0.25
    });
    
    const sphereMat2 = new THREE.MeshStandardMaterial({ 
        color: 0x334155, // Dark slate/charcoal grey spheres to stand out in light theme
        roughness: 0.15, 
        metalness: 0.8,
        emissive: 0x1e293b,
        emissiveIntensity: 0.1
    });

    const rungMaterial = new THREE.MeshStandardMaterial({
        color: 0x555555,
        roughness: 0.5,
        metalness: 0.4,
        transparent: true,
        opacity: 0.5
    });

    const rungGeoBase = new THREE.CylinderGeometry(0.03, 0.03, 1, 8);

    for (let i = 0; i < pointsCount; i++) {
        const t = i * 0.28;
        const y = (i - pointsCount / 2) * heightSpacing;
        
        // Strand 1 Position
        const x1 = Math.sin(t) * radius;
        const z1 = Math.cos(t) * radius;
        
        // Strand 2 Position
        const x2 = Math.sin(t + Math.PI) * radius;
        const z2 = Math.cos(t + Math.PI) * radius;

        // Build Spheres for Strand 1
        const sphere1 = new THREE.Mesh(sphereGeo, sphereMat1);
        sphere1.position.set(x1, y, z1);
        sphere1.userData = { defaultPos: sphere1.position.clone(), currentOffset: new THREE.Vector3(0, 0, 0) };
        dnaGroup.add(sphere1);

        // Build Spheres for Strand 2
        const sphere2 = new THREE.Mesh(sphereGeo, sphereMat2);
        sphere2.position.set(x2, y, z2);
        sphere2.userData = { defaultPos: sphere2.position.clone(), currentOffset: new THREE.Vector3(0, 0, 0) };
        dnaGroup.add(sphere2);

        // Build Connecting Rungs
        const rung = new THREE.Mesh(rungGeoBase, rungMaterial);
        rung.position.set((x1 + x2) / 2, y, (z1 + z2) / 2);
        
        const start = new THREE.Vector3(x1, y, z1);
        const end = new THREE.Vector3(x2, y, z2);
        const direction = new THREE.Vector3().subVectors(end, start);
        
        rung.scale.set(1, direction.length(), 1);
        rung.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
        rung.userData = { defaultPos: rung.position.clone(), currentOffset: new THREE.Vector3(0, 0, 0) };
        
        dnaGroup.add(rung);
    }

    // Mouse sway removed to keep DNA static on the side

    // Scroll speed tracking
    let scrollSpeedFactor = 1.0;
    window.addEventListener('scroll', () => {
        scrollSpeedFactor = 1.0 + window.scrollY * 0.002;
    });

    // Click scatter interaction
    container.style.cursor = 'pointer';
    container.addEventListener('click', () => {
        dnaGroup.children.forEach(child => {
            if (child.userData && child.userData.currentOffset) {
                // Disperse in random directions
                child.userData.currentOffset.set(
                    (Math.random() - 0.5) * 4.5,
                    (Math.random() - 0.5) * 4.5,
                    (Math.random() - 0.5) * 4.5
                );
            }
        });
    });

    const clock = new THREE.Clock();
    let lastTime = 0;

    // Render loop
    function animate() {
        requestAnimationFrame(animate);
        const elapsed = clock.getElapsedTime();
        const delta = elapsed - lastTime;
        lastTime = elapsed;

        // Decay scroll speed factor back to baseline
        scrollSpeedFactor += (1.0 - scrollSpeedFactor) * 0.05;

        // Rotations modulated by scroll velocity smoothly using delta time
        dnaGroup.rotation.y += delta * 0.2 * scrollSpeedFactor; // Reduced base speed
        dnaGroup.rotation.x = 0; // Removed forward tilt to prevent bottom distortion

        // Update particle offsets for disperse/lerp effect
        dnaGroup.children.forEach(child => {
            if (child.userData && child.userData.defaultPos) {
                child.userData.currentOffset.lerp(new THREE.Vector3(0, 0, 0), 0.06);
                child.position.copy(child.userData.defaultPos).add(child.userData.currentOffset);
            }
        });

        renderer.render(scene, camera);
    }
    animate();

    // Resize Handler
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}

// ==========================================
// 2. BACKGROUND: Global Floating Molecules
// ==========================================
function initGlobalMoleculeBackground() {
    const container = document.getElementById('particles-bg-canvas');
    if (!container) return;

    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Subtle orange lights
    const light = new THREE.DirectionalLight(0xff6b00, 1.4);
    light.position.set(10, 10, 10);
    scene.add(light);

    const fillLight = new THREE.DirectionalLight(0x94a3b8, 1.2); // Light blue fill
    fillLight.position.set(-10, -10, -10);
    scene.add(fillLight);

    // Emitters for floating molecular structures
    const structuresCount = 6;
    const molecularGroups = [];

    const sphereGeo = new THREE.SphereGeometry(0.2, 12, 12);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.25 }); // Faint gray lines for bonds

    for (let s = 0; s < structuresCount; s++) {
        const group = new THREE.Group();
        
        // Random layout
        group.position.set(
            (Math.random() - 0.5) * 35,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 10
        );

        // Generate atoms inside this group
        const atomCount = Math.floor(Math.random() * 3) + 3; // 3 to 5 atoms
        const atoms = [];
        const positions = [];

        const atomMat = new THREE.MeshPhongMaterial({
            color: Math.random() > 0.4 ? 0xff6b00 : 0x64748b, // Darker atoms for light background contrast
            shininess: 90,
            transparent: true,
            opacity: 0.55
        });

        for (let a = 0; a < atomCount; a++) {
            const atom = new THREE.Mesh(sphereGeo, atomMat);
            const size = Math.random() * 0.8 + 0.4;
            atom.scale.setScalar(size);
            
            const px = (Math.random() - 0.5) * 2.5;
            const py = (Math.random() - 0.5) * 2.5;
            const pz = (Math.random() - 0.5) * 2.5;
            atom.position.set(px, py, pz);
            
            group.add(atom);
            atoms.push(atom);
            positions.push(atom.position);
        }

        // Draw chemical bond lines between these atoms
        const lineGeo = new THREE.BufferGeometry();
        const linePositions = [];

        for (let i = 0; i < atoms.length; i++) {
            for (let j = i + 1; j < atoms.length; j++) {
                linePositions.push(positions[i].x, positions[i].y, positions[i].z);
                linePositions.push(positions[j].x, positions[j].y, positions[j].z);
            }
        }

        lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
        const bonds = new THREE.LineSegments(lineGeo, lineMaterial);
        group.add(bonds);

        scene.add(group);
        molecularGroups.push({
            mesh: group,
            floatSpeedX: (Math.random() - 0.5) * 0.003,
            floatSpeedY: (Math.random() - 0.5) * 0.003,
            rotSpeed: (Math.random() - 0.5) * 0.001
        });
    }

    // Scroll parallax coefficient
    let scrollYOffset = 0;
    window.addEventListener('scroll', () => {
        scrollYOffset = window.scrollY * 0.008;
    });

    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const elapsed = clock.getElapsedTime();

        molecularGroups.forEach((mol) => {
            // Drift slowly
            mol.mesh.position.x += mol.floatSpeedX;
            mol.mesh.position.y += mol.floatSpeedY;
            
            // Rotation
            mol.mesh.rotation.y += mol.rotSpeed;
            mol.mesh.rotation.x += mol.rotSpeed * 0.5;

            // Parallax offset
            mol.mesh.position.y -= (scrollYOffset - mol.mesh.position.y) * 0.002;

            // Screen boundary reset check
            if (mol.mesh.position.x > 20) mol.mesh.position.x = -20;
            if (mol.mesh.position.x < -20) mol.mesh.position.x = 20;
            if (mol.mesh.position.y > 15) mol.mesh.position.y = -15;
            if (mol.mesh.position.y < -15) mol.mesh.position.y = 15;
        });

        renderer.render(scene, camera);
    }
    animate();

    // Resize Handler
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}

// ==========================================
// 3. STATS: GSAP Counter Numbers Animate
// ==========================================
function initStatsCounters() {
    gsap.registerPlugin(ScrollTrigger);

    // Target elements: stat-number and agro-stat-number
    const elements = document.querySelectorAll('.stat-number, .agro-stat-number');

    elements.forEach((el) => {
        const text = el.textContent.trim();
        
        // Extract numeric digits using regex, keeping track of symbols
        const match = text.match(/([+\-]?)([\d,.]+)([%Y+]*)/);
        if (!match) return;

        const prefix = match[1] || '';
        const numberVal = parseFloat(match[2].replace(/,/g, ''));
        const suffix = match[3] || '';

        // Temporary tracking variable object
        const counterObj = { val: 0 };

        gsap.to(counterObj, {
            val: numberVal,
            duration: 2.0,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none none'
            },
            onUpdate: () => {
                // Formatting values back with comma separation
                const formattedNum = Math.floor(counterObj.val).toLocaleString('en-US');
                el.textContent = `${prefix}${formattedNum}${suffix}`;
            }
        });
    });
}



// ==========================================
// 5. MOTION: GSAP reveals
// ==========================================
function initGSAPScrollAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // Hero entrance reveal
    const heroTl = gsap.timeline();
    heroTl.from('.hero-tagline', { opacity: 0, y: -20, duration: 0.8, ease: 'power3.out' })
          .from('.hero-title span', { opacity: 0, x: -50, stagger: 0.2, duration: 1.0, ease: 'power3.out' }, '-=0.5')
          .from('.hero-desc', { opacity: 0, y: 20, duration: 0.8, ease: 'power3.out' }, '-=0.6')
          .from('.hero-features-list li', { opacity: 0, y: 15, stagger: 0.15, duration: 0.6, ease: 'power3.out' }, '-=0.5')
          .from('.hero-btns-left', { opacity: 0, y: 20, duration: 0.8, ease: 'power3.out' }, '-=0.5');

    // Reveal generic headers
    const headers = document.querySelectorAll('h2, .badge');
    headers.forEach((h) => {
        gsap.from(h, {
            opacity: 0,
            y: 35,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: h,
                start: 'top 85%',
                toggleActions: 'play none none none'
            }
        });
    });

    // Reveal cultural cards
    gsap.from('.cultural-card', {
        opacity: 0,
        y: 40,
        stagger: 0.2,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '.cultural-grid',
            start: 'top 80%'
        }
    });

    // Reveal segments highlight cards
    gsap.from('.segment-highlight-card', {
        opacity: 0,
        y: 40,
        stagger: 0.25,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '.segments-grid',
            start: 'top 80%'
        }
    });

    // Stagger reveal 18 product cards
    gsap.from('.product-card', {
        opacity: 0,
        y: 30,
        stagger: 0.08,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
            trigger: '.product-catalog-split',
            start: 'top 85%'
        }
    });

    // Bar chart loading heights
    gsap.from('.chart-bar', {
        height: '0%',
        duration: 1.8,
        stagger: 0.3,
        ease: 'power4.out',
        scrollTrigger: {
            trigger: '.bar-chart',
            start: 'top 85%'
        },
        onComplete: () => {
            gsap.to('.bar-value', {
                opacity: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.2,
                ease: 'power2.out'
            });
        }
    });
}

// ==========================================
// 6. UI/UX: Interactions & Header Event Hooks
// ==========================================
function initUIUXEvents() {
    // 1. Sticky Navigation Scroll Class
    window.addEventListener('scroll', () => {
        const header = document.getElementById('header');
        if (header) {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    });

    // 2. Mobile Nav Toggle
    const toggleBtn = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (toggleBtn && navMenu) {
        toggleBtn.addEventListener('click', () => {
            const active = navMenu.classList.toggle('active');
            toggleBtn.classList.toggle('active', active);
        });

        navLinks.forEach((link) => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                toggleBtn.classList.remove('active');
            });
        });
    }

    // 3. Scroll active highlighting link tracking
    const sections = document.querySelectorAll('section');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= (sectionTop - 250)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') && link.getAttribute('href').slice(1) === current) {
                link.classList.add('active');
            }
        });
    });

    // 4. Form Submit action
    const contactForm = document.getElementById('contactForm');
    const modal = document.getElementById('successModal');
    
    if (contactForm && modal) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            modal.style.display = 'flex';
            contactForm.reset();
        });
    }

    window.closeModal = function() {
        if (modal) {
            modal.style.display = 'none';
        }
    };
}

// ==========================================
// 7. PRODUCTS: 3D Bottle Packaging Scene
// ==========================================
function initProduct3DViewer() {
    const container = document.getElementById('product-3d-canvas');
    if (!container) return;

    // scene
    const scene = new THREE.Scene();

    // camera
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 8);

    // renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight1.position.set(5, 10, 7);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight2.position.set(-5, -5, 5);
    scene.add(dirLight2);

    // create main container group for bottle
    const bottleGroup = new THREE.Group();
    scene.add(bottleGroup);

    // 1. Bottle glass body (transparent physical cylinder)
    const glassGeometry = new THREE.CylinderGeometry(1.2, 1.2, 3.2, 32);
    const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.25,
        transmission: 0.9,
        roughness: 0.05,
        metalness: 0.1,
        ior: 1.5,
        thickness: 0.2,
        specularIntensity: 1.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05
    });
    const bottleGlass = new THREE.Mesh(glassGeometry, glassMaterial);
    bottleGroup.add(bottleGlass);

    // 2. Bottle neck
    const neckGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.4, 32);
    const bottleNeck = new THREE.Mesh(neckGeometry, glassMaterial);
    bottleNeck.position.y = 1.8;
    bottleGroup.add(bottleNeck);

    // 3. Bottle cap (metallic or dark plastic cap)
    const capGeometry = new THREE.CylinderGeometry(0.85, 0.85, 0.35, 32);
    const capMaterial = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.2,
        metalness: 0.8
    });
    const bottleCap = new THREE.Mesh(capGeometry, capMaterial);
    bottleCap.position.y = 2.15;
    bottleGroup.add(bottleCap);

    // 4. Bottle label (cylinder slightly larger than bottle body so it sits on top)
    const labelGeometry = new THREE.CylinderGeometry(1.21, 1.21, 1.8, 32, 1, true); // open-ended cylinder
    
    // Label memory canvas
    const labelCanvas = document.createElement('canvas');
    labelCanvas.width = 512;
    labelCanvas.height = 256;
    const ctx = labelCanvas.getContext('2d');

    const labelTexture = new THREE.CanvasTexture(labelCanvas);
    const labelMaterial = new THREE.MeshStandardMaterial({
        map: labelTexture,
        roughness: 0.4,
        metalness: 0.1,
        side: THREE.DoubleSide
    });
    const bottleLabel = new THREE.Mesh(labelGeometry, labelMaterial);
    bottleLabel.position.y = -0.1;
    bottleGroup.add(bottleLabel);

    // 5. Floating pills inside the bottle
    const pillCount = 6;
    const pills = [];
    const pillColors = [0xff6b00, 0xff00b7, 0x00ffaa, 0x00e1ff];

    // Let's create individual pills with different materials and rotations
    for (let i = 0; i < pillCount; i++) {
        const pillGroup = new THREE.Group();
        
        // Randomize colors from our spectrum
        const pColor = pillColors[i % pillColors.length];
        
        // Split color capsule: top half one color, bottom half white
        const upperGeo = new THREE.SphereGeometry(0.18, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const lowerGeo = new THREE.SphereGeometry(0.18, 16, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);

        const activeMat = new THREE.MeshStandardMaterial({
            color: pColor,
            roughness: 0.1,
            metalness: 0.1
        });
        const whiteMat = new THREE.MeshStandardMaterial({
            color: 0xf8fafc,
            roughness: 0.1,
            metalness: 0.1
        });

        // Assemble capsule
        const topCap = new THREE.Mesh(upperGeo, activeMat);
        topCap.position.y = 0.175;
        
        const midCylUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.175, 16), activeMat);
        midCylUpper.position.y = 0.0875;
        
        const midCylLower = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.175, 16), whiteMat);
        midCylLower.position.y = -0.0875;
        
        const botCap = new THREE.Mesh(lowerGeo, whiteMat);
        botCap.position.y = -0.175;

        pillGroup.add(topCap);
        pillGroup.add(midCylUpper);
        pillGroup.add(midCylLower);
        pillGroup.add(botCap);

        // Random starting positions inside the glass bottle
        pillGroup.position.set(
            (Math.random() - 0.5) * 1.2,
            (Math.random() - 0.5) * 2.2,
            (Math.random() - 0.5) * 1.2
        );
        pillGroup.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );

        bottleGroup.add(pillGroup);
        pills.push({
            mesh: pillGroup,
            rotSpeed: {
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02,
                z: (Math.random() - 0.5) * 0.02
            },
            floatSpeed: Math.random() * 0.01 + 0.005,
            floatOffset: Math.random() * Math.PI * 2
        });
    }

    // Function to draw label texture
    function drawLabel(name, category, colorHex) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, labelCanvas.width, labelCanvas.height);

        // Sidebar color strip (drawn on left side of texture to wrap nicely)
        ctx.fillStyle = colorHex;
        ctx.fillRect(0, 0, 24, labelCanvas.height);

        // Clean Pfizer/Apple style grid lines
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 50); ctx.lineTo(labelCanvas.width, 50);
        ctx.moveTo(0, labelCanvas.height - 50); ctx.lineTo(labelCanvas.width, labelCanvas.height - 50);
        ctx.stroke();

        // Draw company watermark
        ctx.fillStyle = 'rgba(0,0,0,0.03)';
        ctx.font = 'bold 36px sans-serif';
        ctx.fillText('SPECMED', 60, 215);

        // Draw brand plus sign logo
        ctx.fillStyle = colorHex;
        ctx.beginPath();
        const px = 420;
        const py = 128;
        const size = 30;
        const thick = 10;
        // horizontal bar
        ctx.fillRect(px - size/2, py - thick/2, size, thick);
        // vertical bar
        ctx.fillRect(px - thick/2, py - size/2, thick, size);

        // Accent rings around logo
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.04)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.stroke();

        // Text content
        // 1. Category Tag
        ctx.fillStyle = colorHex;
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText(category.toUpperCase(), 60, 85);

        // 2. Product Name
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 28px sans-serif';
        let displayName = name;
        if (displayName.length > 20) {
            ctx.font = 'bold 24px sans-serif';
        }
        ctx.fillText(displayName, 60, 130);

        // 3. Clinical details / footer
        ctx.fillStyle = '#64748b';
        ctx.font = 'normal 13px sans-serif';
        ctx.fillText('FORMULATED BY SURGEONS', 60, 160);
        ctx.fillText('NUTRACEUTICAL SUPPLEMENT', 60, 175);
        ctx.fillText('500mg | 60 CAPSULES', 60, 235);

        labelTexture.needsUpdate = true;
    }

    // Custom Photo Elements
    const photoContainer = document.getElementById('product-custom-photo-container');
    const photoWrapper = document.getElementById('product-custom-photo-wrapper');
    const photoInner = document.getElementById('product-custom-photo-inner');
    const customPhoto = document.getElementById('product-custom-photo');

    // Registry of products mapped to custom uploaded images and their scaling factor
    const customPhotos = {
        "ALPHAMULTI": { src: "product_image/ALPHAMULTI.png", scale: 1.33 },
        "COENZFIT Q10": { src: "product_image/COENZFIT Q10.png", scale: 1.26 },
        "COLLAGMED SACHETS": { src: "product_image/COLLAGMED SACHETS.png", scale: 1.11 },
        "COLLAGMED TOTAL": { src: "product_image/COLLAGMED TOTAL.png", scale: 1.2 },
        "CYANOSURE DM": { src: "product_image/CYANOSURE DM.png", scale: 1.29 },
        "CYANOSURE MOM": { src: "product_image/CYANOSURE MOM.png", scale: 1.08 },
        "CYANOSURE ORTHO": { src: "product_image/CYANOSURE ORTHO.png", scale: 0.98 },
        "FEROSPEC": { src: "product_image/FEROSPEC.png", scale: 1.08 },
        "HIO-MT": { src: "product_image/HIO-MT.png", scale: 1.2 },
        "MUCOSHIFA 600": { src: "product_image/MUCOSHIFA 600.png", scale: 1.33 },
        "NUTRAFER": { src: "product_image/NUTRAFER.png", scale: 0.93 },
        "OSTEOSPEC": { src: "product_image/OSTEOSPEC.png", scale: 1.28 },
        "SPEC JOINT": { src: "product_image/SPEC JOINT.png", scale: 1.25 },
        "SPECVITA B12": { src: "product_image/SPECVITA B12.png", scale: 1.1 },
        "TRYCRAN": { src: "product_image/TRYCRAN.png", scale: 1.29 },
        "UNE ORTHO GOLD GEL": { src: "product_image/UNE ORTHO GOLD GEL.png", scale: 1.33 },
        "UNE ORTHOGOLD TH GEL": { src: "product_image/UNE ORTHOGOLD TH GEL.png", scale: 1.33 },
        "ZIIBIOTIC": { src: "product_image/ZIIBIOTIC.png", scale: 1.19 }
    };

    let currentProductName = "";

    // Unified Preview Updater
    function updateProductView(name, category, colorHex, performAnimation) {
        if (currentProductName === name) return;
        currentProductName = name;

        // Query overlay titles
        const titleEl = document.getElementById('bottle-preview-title');
        const categoryEl = document.getElementById('bottle-preview-category');

        if (performAnimation) {
            gsap.to([titleEl, categoryEl], {
                opacity: 0,
                y: -10,
                duration: 0.2,
                onComplete: () => {
                    titleEl.textContent = name;
                    categoryEl.textContent = category;
                    categoryEl.style.color = colorHex;
                    gsap.to([titleEl, categoryEl], {
                        opacity: 1,
                        y: 0,
                        duration: 0.3
                    });
                }
            });
        } else {
            titleEl.textContent = name;
            categoryEl.textContent = category;
            categoryEl.style.color = colorHex;
        }

        if (customPhotos[name]) {
            const photoData = customPhotos[name];
            
            // Dynamically set image source
            customPhoto.src = photoData.src;

            // HIDE 3D Bottle canvas and SHOW Custom product image
            if (performAnimation) {
                gsap.to(container, {
                    opacity: 0,
                    scale: 0.85,
                    duration: 0.4,
                    ease: 'power2.inOut',
                    onComplete: () => {
                        container.style.display = 'none';
                        photoContainer.style.display = 'flex';
                        gsap.fromTo(photoContainer, 
                            { opacity: 0 }, 
                            { opacity: 1, duration: 0.3 }
                        );

                        photoInner.classList.remove('float-animation');
                        gsap.fromTo(customPhoto, 
                            { opacity: 0, scale: (0.75 * photoData.scale) / 2, y: 30, rotationY: -15 }, 
                            { 
                                opacity: 1, 
                                scale: photoData.scale / 2, 
                                y: 0, 
                                rotationY: 0, 
                                duration: 0.8, 
                                ease: 'back.out(1.4)',
                                onComplete: () => {
                                    photoInner.classList.add('float-animation');
                                }
                            }
                        );
                    }
                });
            } else {
                container.style.display = 'none';
                container.style.opacity = '0';
                photoContainer.style.display = 'flex';
                photoContainer.style.opacity = '1';
                
                // Instantly scale and float
                gsap.set(customPhoto, { scale: photoData.scale / 2, x: 0, y: 0, rotationY: 0, opacity: 1 });
                photoInner.classList.add('float-animation');
            }
        } else {
            // SHOW 3D Bottle canvas and HIDE Custom product image
            if (photoContainer.style.display !== 'none') {
                photoInner.classList.remove('float-animation');
                if (performAnimation) {
                    gsap.to(photoContainer, {
                        opacity: 0,
                        duration: 0.3,
                        onComplete: () => {
                            photoContainer.style.display = 'none';
                            container.style.display = 'block';
                            gsap.fromTo(container,
                                { opacity: 0, scale: 0.85 },
                                { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.inOut' }
                            );
                        }
                    });
                } else {
                    photoContainer.style.display = 'none';
                    container.style.display = 'block';
                    container.style.opacity = '1';
                }
            } else {
                container.style.display = 'block';
                container.style.opacity = '1';
            }

            // Draw label & trigger spin
            drawLabel(name, category, colorHex);

            if (performAnimation) {
                gsap.to(bottleGroup.rotation, {
                    y: bottleGroup.rotation.y + Math.PI * 2,
                    duration: 1.4,
                    ease: 'power3.out'
                });
            }
        }
    }
    window.updateProductView = updateProductView;

    // Initialize with first active card
    const firstCard = document.querySelector('.product-card.active');
    let activeColor = '#ff6b00';
    if (firstCard) {
        const name = firstCard.getAttribute('data-name');
        const category = firstCard.getAttribute('data-category');
        const colorAttr = firstCard.getAttribute('data-color');
        activeColor = colorAttr.replace('0x', '#');
        updateProductView(name, category, activeColor, false);
    } else {
        updateProductView('Nutra-Joint Forte', 'Orthopaedics', '#ff6b00', false);
    }

    // Animation variables
    const clock = new THREE.Clock();
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let spinVelocity = 0.005;

    // Handle mouse drag rotations on canvas
    container.addEventListener('mousedown', (e) => {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
    });

    container.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const deltaMove = {
            x: e.clientX - previousMousePosition.x,
            y: e.clientY - previousMousePosition.y
        };

        bottleGroup.rotation.y += deltaMove.x * 0.01;
        bottleGroup.rotation.x += deltaMove.y * 0.01;

        previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    // Mobile touch controls
    container.addEventListener('touchstart', (e) => {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });

    window.addEventListener('touchend', () => {
        isDragging = false;
    });

    container.addEventListener('touchmove', (e) => {
        if (!isDragging) return;

        const deltaMove = {
            x: e.touches[0].clientX - previousMousePosition.x,
            y: e.touches[0].clientY - previousMousePosition.y
        };

        bottleGroup.rotation.y += deltaMove.x * 0.01;
        bottleGroup.rotation.x += deltaMove.y * 0.01;

        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });

    // Render animation loop
    function animate() {
        requestAnimationFrame(animate);
        const elapsed = clock.getElapsedTime();

        // Standard slow drift rotation if not dragging
        if (!isDragging) {
            bottleGroup.rotation.y += spinVelocity;
            // Decay spin velocity back to slow drift speed
            if (spinVelocity > 0.005) {
                spinVelocity *= 0.96;
            } else {
                spinVelocity = 0.005;
            }
            // Gentle rocking motion
            bottleGroup.rotation.x = Math.sin(elapsed * 0.5) * 0.1;
        }

        // Animate floating pills inside
        pills.forEach((pill) => {
            pill.mesh.position.y += Math.sin(elapsed + pill.floatOffset) * 0.003;
            pill.mesh.rotation.x += pill.rotSpeed.x;
            pill.mesh.rotation.y += pill.rotSpeed.y;
            pill.mesh.rotation.z += pill.rotSpeed.z;

            // Keep pills within bottle interior boundaries
            const dist = Math.sqrt(pill.mesh.position.x * pill.mesh.position.x + pill.mesh.position.z * pill.mesh.position.z);
            if (dist > 0.9) {
                pill.mesh.position.x *= 0.9;
                pill.mesh.position.z *= 0.9;
            }
            if (pill.mesh.position.y > 1.3) pill.mesh.position.y = -1.3;
            if (pill.mesh.position.y < -1.3) pill.mesh.position.y = 1.3;
        });

        renderer.render(scene, camera);
    }
    animate();

    // Resize Handler
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });

    // 3D Parallax Tilt for custom photo based on cursor position relative to viewer center
    const viewer = document.querySelector('.product-3d-sticky-viewer');
    
    viewer.addEventListener('mousemove', (e) => {
        if (customPhotos[currentProductName]) {
            const rect = viewer.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            // Compute tilt degrees (max 15 degrees)
            const tiltX = -(y / rect.height) * 15;
            const tiltY = (x / rect.width) * 15;

            gsap.to(photoWrapper, {
                rotateX: tiltX,
                rotateY: tiltY,
                duration: 0.4,
                ease: 'power2.out',
                overwrite: 'auto'
            });
        }
    });

    viewer.addEventListener('mouseleave', () => {
        if (customPhotos[currentProductName]) {
            gsap.to(photoWrapper, {
                rotateX: 0,
                rotateY: 0,
                duration: 0.8,
                ease: 'power2.out',
                overwrite: 'auto'
            });
        }
    });

    // Bind Click Events to Product Cards
    const cards = document.querySelectorAll('.product-card');
    cards.forEach((card) => {
        card.addEventListener('click', () => {
            // Remove active class from all cards
            cards.forEach(c => c.classList.remove('active'));
            // Add active class to clicked card
            card.classList.add('active');

            // Get product data attributes
            const name = card.getAttribute('data-name');
            const category = card.getAttribute('data-category');
            const colorAttr = card.getAttribute('data-color');
            const colorHex = colorAttr.replace('0x', '#');

            updateProductView(name, category, colorHex, true);
        });
    });
}

// ==========================================
// 8. PRODUCT SCIENTIFIC DATABASE & DETAILS
// ==========================================
const productDetailsDatabase = {
    "COLLAGMED SACHETS": {
        composition: "Bioactive Collagen Peptides (Type I & II) + Hyaluronic Acid + Vitamin C",
        ingredients: [
            "Bioactive Collagen Peptides (5000mg)",
            "Hyaluronic Acid (100mg)",
            "Vitamin C (as Ascorbic Acid, 80mg)",
            "Boswellia Serrata Extract (100mg)"
        ],
        dosage: "1 sachet daily dissolved in 150ml of lukewarm water before breakfast, or as directed by your surgeon.",
        uses: [
            "Rebuilds joint cartilage matrix",
            "Promotes synovial joint lubrication",
            "Reduces joint friction and pain",
            "Improves overall mobility and flexibility"
        ],
        citations: [
            "Bello AE, et al. Collagen hydrolysate for the treatment of osteoarthritis and other joint disorders: a review. Curr Med Res Opin. 2006;22(11):2221-32.",
            "Clark KL, et al. 24-Week study on the use of collagen hydrolysate as a dietary supplement in athletes with activity-related joint pain. Curr Med Res Opin. 2008;24(5):1485-96."
        ]
    },
    "COLLAGMED TOTAL": {
        composition: "Collagen Peptides + Glucosamine Sulfate + Chondroitin Sulfate + MSM",
        ingredients: [
            "Hydrolyzed Collagen (Type II, 3000mg)",
            "Glucosamine Sulfate Potassium Chloride (1500mg)",
            "Chondroitin Sulfate Sodium (1200mg)",
            "Methylsulfonylmethane (MSM, 1000mg)",
            "Vitamin D3 (1000 IU)"
        ],
        dosage: "1 tablet or sachet twice daily after meals, or as advised by an orthopaedic specialist.",
        uses: [
            "Advanced structural joint support",
            "Slows joint degradation in osteoarthritis",
            "Enhances cartilage tensile strength",
            "Reduces inflammatory biomarkers (TNF-alpha, IL-6)"
        ],
        citations: [
            "McAlindon TE, et al. Glucosamine and chondroitin for treatment of osteoarthritis: a systematic quality assessment and meta-analysis. JAMA. 2000;283(11):1469-75.",
            "Uebelhart D, et al. Clinical study of chondroitin sulfate in patients with knee osteoarthritis. Osteoarthritis Cartilage. 2004;12(4):269-76."
        ]
    },
    "CYANOSURE ORTHO": {
        composition: "Calcium Carbonate + Vitamin D3 (Cholecalciferol) + Vitamin K2-7 + Zinc + Magnesium",
        ingredients: [
            "Elemental Calcium (as Calcium Carbonate from Organic Source, 500mg)",
            "Vitamin D3 (2000 IU)",
            "Vitamin K2-7 (90mcg)",
            "Magnesium Oxide (100mg)",
            "Zinc Oxide (7.5mg)"
        ],
        dosage: "1 tablet daily with a main meal (preferably dinner for optimal calcium absorption), or as prescribed by your surgeon.",
        uses: [
            "Maximizes bone mineral density (BMD)",
            "Enhances calcium deposition in bones via osteocalcin activation",
            "Prevents arterial calcification",
            "Promotes fracture healing and structural support"
        ],
        citations: [
            "Bischoff-Ferrari HA, et al. Fracture prevention with vitamin D supplementation: a meta-analysis of randomized controlled trials. JAMA. 2005;293(18):2257-64.",
            "Knapen MH, et al. Three-year low-dose clinical study of vitamin K2-7 on bone health. Osteoporosis Int. 2013;24(9):2499-507."
        ]
    },
    "OSTEOSPEC": {
        composition: "Calcium Asparto-Glycinate + Calcitriol + L-Methylfolate + Pyridoxal-5-Phosphate + Methylcobalamin",
        ingredients: [
            "Calcium Asparto-Glycinate (equivalent to Elemental Calcium 250mg)",
            "Calcitriol (0.25mcg)",
            "L-Methylfolate Calcium (1mg)",
            "Pyridoxal-5-Phosphate (3mg)",
            "Methylcobalamin (1500mcg)"
        ],
        dosage: "1 tablet once or twice daily after meals, or as recommended by an endocrinologist or surgeon.",
        uses: [
            "Highly bioavailable organic calcium therapy",
            "Stimulates osteoblast activity for bone remodeling",
            "Regulates calcium homeostatic pathways",
            "Reduces fracture risk in osteoporosis"
        ],
        citations: [
            "Recker RR. Calcium absorption from organic calcium salts. American Journal of Clinical Nutrition. 1985;41(2):254-261.",
            "Gallagher JC, et al. Calcitriol in the treatment of postmenopausal osteoporosis: effect on bone mineral density. Annals of Internal Medicine. 1990;113(9):649-655."
        ]
    },
    "OSTEOTICK TABLET": {
        composition: "Calcium Citrate Maleate + Calcitriol + Zinc + Magnesium",
        ingredients: [
            "Calcium Citrate Maleate (equivalent to Elemental Calcium 250mg)",
            "Calcitriol (0.25mcg)",
            "Magnesium Hydroxide (100mg)",
            "Zinc Sulfate (4mg)"
        ],
        dosage: "1 tablet daily, can be taken with or without food.",
        uses: [
            "Maintains skeletal integrity",
            "Sustained bone mineral restoration",
            "Reduces bone resorption rate in elderly patients",
            "Ideal calcium form for renal calculi risk reduction"
        ],
        citations: [
            "Heller HJ, et al. Pharmacokinetics of calcium citrate maleate versus calcium carbonate. Journal of Clinical Pharmacology. 2000;40(11):1237-1244.",
            "Cranney A, et al. Meta-analysis of calcium and vitamin D for osteoporosis. Endocrine Reviews. 2007;28(6):664-685."
        ]
    },
    "SPEC JOINT": {
        composition: "Undenatured Type II Collagen (UC-II) + Sodium Hyaluronate + Mobilee + Rosehip Extract",
        ingredients: [
            "UC-II Brand Undenatured Type II Collagen (40mg)",
            "Sodium Hyaluronate (80mg)",
            "Rosehip Extract (250mg)",
            "Curcuminoids (95% standard extract, 100mg)"
        ],
        dosage: "1 capsule daily on an empty stomach 30 minutes before breakfast.",
        uses: [
            "Reduces joint stiffness and discomfort",
            "Regulates immune response to joint collagen",
            "Boosts endogenous hyaluronic acid synthesis",
            "Alleviates exercise-induced joint pain"
        ],
        citations: [
            "Lugo JP, et al. Efficacy and tolerability of undenatured type II collagen in knee osteoarthritis: a randomized double-blind clinical trial. Nutr J. 2016;15:14.",
            "Crowley DC, et al. Safety and efficacy of undenatured type II collagen in the treatment of osteoarthritis of the knee. Int J Med Sci. 2009;6(6):312-321."
        ]
    },
    "UNE ORTHO GOLD GEL": {
        composition: "Diclofenac Diethylamine + Methyl Salicylate + Menthol + Linseed Oil + Camphor",
        ingredients: [
            "Diclofenac Diethylamine (1.16% w/w)",
            "Linseed Oil (3.0% w/w)",
            "Methyl Salicylate (10.0% w/w)",
            "Menthol (5.0% w/w)",
            "Camphor (2.0% w/w)"
        ],
        dosage: "Apply 2g to 4g gently over the affected joint or muscle area 3-4 times daily, or as advised by your orthopaedist.",
        uses: [
            "Relieves acute musculoskeletal pain",
            "Reduces localized joint inflammation and swelling",
            "Rapid transdermal drug delivery",
            "Soothes arthritis, sprains, and sports injuries"
        ],
        citations: [
            "Derry S, et al. Topical NSAIDs for acute musculoskeletal pain in adults. Cochrane Database of Systematic Reviews. 2015;(6):CD007402.",
            "Barkin RL. Topical nonsteroidal anti-inflammatory drugs: the importance of drug, delivery, and therapeutic efficacy. Postgrad Med. 2013;125(4):70-85."
        ]
    },
    "UNE ORTHOGOLD TH GEL": {
        composition: "Diclofenac + Thiocolchicoside + Linseed Oil + Menthol",
        ingredients: [
            "Diclofenac Sodium (1.0% w/w)",
            "Thiocolchicoside (0.125% w/w)",
            "Linseed Oil (3.0% w/w)",
            "Menthol (5.0% w/w)"
        ],
        dosage: "Gently massage a thin layer onto the affected muscles or joints up to 3 times daily. Wash hands after application.",
        uses: [
            "Combined anti-inflammatory and muscle relaxant",
            "Treats severe muscle spasms and strain",
            "Relieves low back pain and neck stiffness",
            "Enhances local blood circulation to accelerate healing"
        ],
        citations: [
            "Ketenci A, et al. Thiocolchicoside in the treatment of acute muscle spasms: a multicenter clinical trial. International Journal of Clinical Practice. 2005;59(12):1420-1425.",
            "Tugay N, et al. Efficacy of topical diclofenac diethylamine gel combined with physical therapy in osteoarthritis. Rheum Int. 2007;27(11):1021-1027."
        ]
    },
    "COENZFIT Q10": {
        composition: "Coenzyme Q10 + L-Carnitine + Lycopene + Astaxanthin + Zinc + Folic Acid",
        ingredients: [
            "Coenzyme Q10 (100mg)",
            "L-Carnitine L-Tartrate (250mg)",
            "Lycopene (10%, 2500mcg)",
            "Astaxanthin (8mg)",
            "Zinc Oxide (15mg)",
            "Folic Acid (1.5mg)"
        ],
        dosage: "1 capsule daily after a fat-containing meal (for optimal absorption), or as advised by your fertility specialist.",
        uses: [
            "Supports cellular energy production",
            "Improves mitochondrial function in oocytes",
            "Enhances egg quality and ovarian response",
            "Promotes reproductive health and cellular longevity"
        ],
        citations: [
            "Bentov Y, et al. Coenzyme Q10 supplementation and oocyte quality in older patients undergoing IVF-ICSI. Fertility and Sterility. 2010;93(1):272-275.",
            "Showell MG, et al. Antioxidants for female subfertility. Cochrane Database of Systematic Reviews. 2017;(7):CD007807."
        ]
    },
    "CYANOSURE MOM": {
        composition: "DHA + Folic Acid + L-Methylfolate + Iron + Vitamin D3 + Multivitamins & Minerals",
        ingredients: [
            "Docosahexaenoic Acid (DHA 10% algae oil, 200mg)",
            "L-Methylfolate Calcium (1mg)",
            "Carbonyl Iron (60mg)",
            "Vitamin D3 (1000 IU)",
            "Vitamin B-Complex (B1, B2, B3, B5, B6, B12)",
            "Calcium, Zinc, Copper, and Selenium"
        ],
        dosage: "1 capsule daily after breakfast throughout pregnancy and lactation, or as advised by your obstetrician.",
        uses: [
            "Supports fetal brain and retinal development",
            "Prevents neural tube defects (NTDs)",
            "Meets maternal nutritional needs",
            "Supports healthy gestational term and fetal growth"
        ],
        citations: [
            "Greenberg JA, et al. Multivitamin supplementation during pregnancy: emphasis on folic acid and L-methylfolate. Reviews in Obstetrics and Gynecology. 2011;4(2):52-59.",
            "Coletta JM, et al. Omega-3 fatty acids and pregnancy. Reviews in Obstetrics and Gynecology. 2010;3(4):163-171."
        ]
    },
    "HIO-MT": {
        composition: "Myo-Inositol + D-Chiro-Inositol + L-Methylfolate + Vitamin D3 + Chromium Picolinate",
        ingredients: [
            "Myo-Inositol (2000mg)",
            "D-Chiro-Inositol (50mg) (physiologic 40:1 ratio)",
            "L-Methylfolate Calcium (1mg)",
            "Vitamin D3 (1000 IU)",
            "Chromium Picolinate (200mcg)"
        ],
        dosage: "1 sachet or tablet twice daily dissolved in water or taken with meals, or as recommended by your gynaecologist.",
        uses: [
            "Restores insulin sensitivity in PCOD",
            "Restores normal ovarian cycle and ovulation",
            "Reduces hyperandrogenism (acne, hirsutism)",
            "Enhances IVF success rates"
        ],
        citations: [
            "Unfer V, et al. Myo-inositol effects in women with PCOS: a meta-analysis of randomized controlled trials. Endocrine Connections. 2017;6(8):647-658.",
            "Nordio M, et al. The 40:1 myo-inositol/D-chiro-inositol ratio in the treatment of PCOS. Arch Gynecol Obstet. 2012;286(4):1029-1037."
        ]
    },
    "NUTRAFER": {
        composition: "Liposomal Iron (as Ferric Pyrophosphate) + Vitamin C + Vitamin B12 + Folic Acid",
        ingredients: [
            "Liposomal Iron equivalent to Elemental Iron (30mg)",
            "Vitamin C (50mg)",
            "Methylcobalamin (15mcg)",
            "Folic Acid (1mg)"
        ],
        dosage: "1 tablet daily before breakfast or 2 hours after a meal. Avoid taking with calcium supplements.",
        uses: [
            "High-absorption iron therapy",
            "Zero gastrointestinal irritation or constipation",
            "Treats gestational anaemia",
            "Supports haemoglobin and ferritin synthesis"
        ],
        citations: [
            "Visciano B, et al. Liposomal iron: a new approach for iron deficiency therapy. Journal of Nephrology. 2013;26(6):1035-1042.",
            "Pisani V, et al. Oral liposomal iron versus intravenous iron in pregnancy. Journal of Maternal-Fetal & Neonatal Medicine. 2015;28(9):1022-1026."
        ]
    },
    "ALPHAMULTI": {
        composition: "Multivitamin + Multimineral + Panax Ginseng + Green Tea Extract + Alpha Lipoic Acid",
        ingredients: [
            "Panax Ginseng Extract (42.5mg)",
            "Green Tea Extract (10mg)",
            "Alpha Lipoic Acid (50mg)",
            "Vitamins A, C, D3, E, B-Complex",
            "Zinc, Selenium, Magnesium, Copper, Chromium"
        ],
        dosage: "1 capsule daily after lunch or breakfast.",
        uses: [
            "Combats chronic fatigue and daily stress",
            "Enhances systemic immunity",
            "Protects cells against oxidative stress",
            "Supports cognitive alertness and overall wellness"
        ],
        citations: [
            "Kennedy DO, et al. Effects of Panax ginseng on cognitive performance and mood. Hum Psychopharmacol. 2001;16(2):159-171.",
            "Fletcher RH, et al. Vitamins for chronic disease prevention in adults: clinical applications. JAMA. 2002;287(23):3127-3129."
        ]
    },
    "CYANOSURE DM": {
        composition: "Myo-Inositol + Alpha Lipoic Acid + Methylcobalamin + Benfotiamine + Chromium + Zinc",
        ingredients: [
            "Myo-Inositol (100mg)",
            "Alpha Lipoic Acid (100mg)",
            "Methylcobalamin (1500mcg)",
            "Benfotiamine (150mg)",
            "Chromium Picolinate (200mcg)",
            "Zinc Oxide (15mg)"
        ],
        dosage: "1 capsule daily after breakfast or dinner, or as directed by an endocrinologist.",
        uses: [
            "Supports glucose utilization and insulin sensitivity",
            "Prevents and manages diabetic neuropathy",
            "Reduces advanced glycation end-products (AGEs)",
            "Protects peripheral nerves and blood flow"
        ],
        citations: [
            "Ziegler D, et al. Oral treatment with alpha-lipoic acid improves symptomatic diabetic polyneuropathy: the SYDNEY 2 trial. Diabetes Care. 2006;29(11):2365-2370.",
            "Stracke H, et al. Benfotiamine in diabetic polyneuropathy (BENDIP): a randomized clinical trial. Exp Clin Endocrinol Diabetes. 2008;116(10):600-605."
        ]
    },
    "FEROSPEC": {
        composition: "Sodium Feredetate + Folic Acid + Vitamin B12",
        ingredients: [
            "Sodium Feredetate (equivalent to Elemental Iron 33mg)",
            "Folic Acid (1.5mg)",
            "Vitamin B12 (as Cyanocobalamin, 15mcg)"
        ],
        dosage: "1-2 tablets daily or as directed by a general physician.",
        uses: [
            "Fast-acting iron formulation with minimal teeth staining",
            "Restores iron stores in systemic anaemia",
            "Increases energy and physical performance",
            "Boosts erythropoiesis (red blood cell production)"
        ],
        citations: [
            "Seshadri S, et al. Sodium feredetate (iron EDTA) in the treatment of iron deficiency anemia. Indian Pediatrics. 1989;26(10):1011-1015.",
            "WHO/UNICEF. Iron deficiency anaemia: assessment, prevention, and control. World Health Organization. 2001."
        ]
    },
    "MUCOSHIFA 600": {
        composition: "N-Acetylcysteine (NAC)",
        ingredients: [
            "N-Acetylcysteine (600mg)"
        ],
        dosage: "1 effervescent tablet dissolved in 150ml of water daily, or 1 tablet twice daily as prescribed for respiratory distress.",
        uses: [
            "Powerful mucolytic action to clear airways",
            "Replenishes intracellular glutathione levels",
            "Acts as a cellular detoxifier",
            "Supports lung health in chronic bronchitis or COPD"
        ],
        citations: [
            "Decramer M, et al. Effects of N-acetylcysteine on outcomes in chronic obstructive pulmonary disease (BRONCUS): a randomised trial. Lancet. 2005;365(9470):1552-1560.",
            "Sadowska AM. N-Acetylcysteine: a mucolytic and anti-inflammatory treatment in COPD. International Journal of COPD. 2007;2(3):305-312."
        ]
    },
    "SPECVITA B12": {
        composition: "Methylcobalamin + Alpha Lipoic Acid + Folic Acid + Pyridoxine",
        ingredients: [
            "Methylcobalamin (1500mcg)",
            "Alpha Lipoic Acid (100mg)",
            "Folic Acid (1.5mg)",
            "Pyridoxine Hydrochloride (3mg)"
        ],
        dosage: "1 tablet daily after meals.",
        uses: [
            "Improves nerve conduction and myelin sheath health",
            "Supports cognitive sharpness and memory retention",
            "Prevents megaloblastic anaemia",
            "Promotes heart health by lowering homocysteine"
        ],
        citations: [
            "Zhang M, et al. Methylcobalamin clinical trials in peripheral neuropathies: a review. Journal of Neurological Sciences. 2013;334(1):15-20.",
            "Selhub J. Homocysteine metabolism and the risk of cardiovascular disease. Annual Review of Nutrition. 1999;19(1):217-246."
        ]
    },
    "TRYCRAN": {
        composition: "Cranberry Extract (PACs) + D-Mannose",
        ingredients: [
            "Standardized Cranberry Extract (yielding 36mg Proanthocyanidins [PACs])",
            "D-Mannose (600mg)",
            "Hibiscus Extract (100mg)"
        ],
        dosage: "1 tablet twice daily with water for 10-14 days during active infections, or 1 tablet daily for long-term prevention.",
        uses: [
            "Prevents uropathogenic E. coli adhesion to urinary tract walls",
            "Offers natural non-antibiotic UTI management",
            "Flushes out bacteria from the bladder",
            "Restores healthy urinary pH"
        ],
        citations: [
            "Jepson RG, et al. Cranberries for preventing urinary tract infections. Cochrane Database of Systematic Reviews. 2012;(10):CD001321.",
            "Kranjcec B, et al. D-mannose powder for prophylaxis of recurrent urinary tract infections in women: a randomized clinical trial. World J Urol. 2014;32(1):79-84."
        ]
    },
    "ZIIBIOTIC": {
        composition: "Multi-strain Probiotic Blend + Prebiotics (FOS)",
        ingredients: [
            "Probiotic blend (L. acidophilus, B. longum, S. boulardii, S. thermophilus - Total 5 Billion CFUs)",
            "Fructooligosaccharides (FOS, 100mg)"
        ],
        dosage: "1 capsule twice daily, preferably 30 minutes before meals, or as advised by a gastroenterologist.",
        uses: [
            "Restores microbial diversity post-antibiotics",
            "Relieves irritable bowel syndrome (IBS) and diarrhea",
            "Enhances gut barrier integrity",
            "Strengthens immune response"
        ],
        citations: [
            "Wilkins T, et al. Probiotics for gastrointestinal conditions: a summary of reviews. Am Fam Physician. 2017;96(3):170-178.",
            "McFarland LV. Systematic review and meta-analysis of Saccharomyces boulardii in adult patients. World J Gastroenterol. 2010;16(18):2202-2222."
        ]
    }
};

// ==========================================
// 9. CATALOG FILTERING & SEARCH CONTROLLER
// ==========================================
function initProductFiltersAndSearch() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('product-search');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterProducts();
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', filterProducts);
    }
    
    // Initial run
    filterProducts();
}

function filterProducts() {
    const activeCategoryBtn = document.querySelector('.filter-btn.active');
    const activeCategory = activeCategoryBtn ? activeCategoryBtn.getAttribute('data-filter') : 'all';
    const searchInput = document.getElementById('product-search');
    const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';

    const productCards = document.querySelectorAll('.product-card');
    let firstVisibleCard = null;
    let currentActiveIsVisible = false;

    productCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        const cardName = card.getAttribute('data-name');
        const cardNameLower = cardName.toLowerCase();
        
        const descEl = card.querySelector('.product-desc');
        const cardDescLower = descEl ? descEl.textContent.toLowerCase() : '';

        const categoryMatch = (activeCategory === 'all' || cardCategory === activeCategory);

        const nameMatch = cardNameLower.includes(searchQuery);
        const descMatch = cardDescLower.includes(searchQuery);

        const dbProduct = productDetailsDatabase[cardName];
        let dbMatch = false;
        if (dbProduct) {
            const ingredients = dbProduct.ingredients.join(' ').toLowerCase();
            const uses = dbProduct.uses.join(' ').toLowerCase();
            const composition = dbProduct.composition.toLowerCase();
            if (ingredients.includes(searchQuery) || uses.includes(searchQuery) || composition.includes(searchQuery)) {
                dbMatch = true;
            }
        }

        const matches = categoryMatch && (searchQuery === '' || nameMatch || descMatch || dbMatch);

        if (matches) {
            if (!firstVisibleCard) {
                firstVisibleCard = card;
            }
            if (card.classList.contains('active')) {
                currentActiveIsVisible = true;
            }

            if (card.style.display === 'none') {
                gsap.killTweensOf(card);
                gsap.set(card, { display: 'flex' });
                gsap.fromTo(card, 
                    { opacity: 0, scale: 0.85 },
                    { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' }
                );
            } else {
                gsap.to(card, { opacity: 1, scale: 1, duration: 0.3 });
            }
        } else {
            gsap.killTweensOf(card);
            gsap.to(card, {
                opacity: 0,
                scale: 0.85,
                duration: 0.3,
                ease: 'power2.in',
                onComplete: () => {
                    card.style.display = 'none';
                }
            });
        }
    });

    if (!currentActiveIsVisible && firstVisibleCard) {
        productCards.forEach(c => c.classList.remove('active'));
        firstVisibleCard.classList.add('active');
        const name = firstVisibleCard.getAttribute('data-name');
        const category = firstVisibleCard.getAttribute('data-category');
        const colorAttr = firstVisibleCard.getAttribute('data-color');
        const colorHex = colorAttr.replace('0x', '#');
        
        if (typeof window.updateProductView === 'function') {
            window.updateProductView(name, category, colorHex, true);
        }
    }

    if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
    }
}

// ==========================================
// 10. PRODUCT SCIENTIFIC DRAWER CONTROLLER
// ==========================================
function initProductDrawer() {
    const drawer = document.getElementById('product-drawer');
    const closeBtn = document.getElementById('drawer-close');
    const overlay = document.getElementById('drawer-overlay');
    const drawerBody = document.getElementById('drawer-body');

    if (!drawer || !closeBtn || !overlay || !drawerBody) return;

    const detailLinks = document.querySelectorAll('.product-link');
    detailLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const card = link.closest('.product-card');
            if (!card) return;

            const productName = card.getAttribute('data-name');
            const productCategory = card.getAttribute('data-category');
            const productDetails = productDetailsDatabase[productName];

            if (productDetails) {
                populateDrawer(productName, productCategory, productDetails);
                drawer.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    const closeDrawer = () => {
        drawer.classList.remove('active');
        document.body.style.overflow = '';
    };

    closeBtn.addEventListener('click', closeDrawer);
    overlay.addEventListener('click', closeDrawer);

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && drawer.classList.contains('active')) {
            closeDrawer();
        }
    });
}

function populateDrawer(name, category, data) {
    const drawerBody = document.getElementById('drawer-body');
    if (!drawerBody) return;

    const ingredientsHtml = data.ingredients.map(ing => `
        <li class="drawer-bullet">
            <span class="drawer-bullet-dot">•</span>
            <span>${ing}</span>
        </li>
    `).join('');

    const citationsHtml = data.citations.map(cit => `
        <div class="drawer-citation">
            ${cit}
        </div>
    `).join('');

    drawerBody.innerHTML = `
        <span class="drawer-cat">${category}</span>
        <h3 class="drawer-title">${name}</h3>
        <p class="drawer-desc" style="font-weight: 500; color: var(--text-primary);">${data.composition}</p>

        <div class="drawer-section">
            <h4 class="drawer-section-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="section-icon" style="color: var(--clr-orange);"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                Active Ingredients
            </h4>
            <ul class="drawer-bullets">
                ${ingredientsHtml}
            </ul>
        </div>

        <div class="drawer-section">
            <h4 class="drawer-section-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="section-icon" style="color: var(--clr-orange);"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                Surgeon Recommended Dosage
            </h4>
            <p class="drawer-desc" style="margin-bottom: 0; font-size: 0.9rem;">${data.dosage}</p>
        </div>

        <div class="drawer-section">
            <h4 class="drawer-section-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="section-icon" style="color: var(--clr-orange);"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                Clinical Publications & Citations
            </h4>
            <div class="drawer-citations">
                ${citationsHtml}
            </div>
        </div>

        <div class="drawer-action-box">
            <button class="btn btn-primary drawer-inquire-btn" id="drawer-inquire-btn">
                Inquire Now
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
        </div>
    `;

    const inquireBtn = document.getElementById('drawer-inquire-btn');
    if (inquireBtn) {
        inquireBtn.addEventListener('click', () => {
            const productName = encodeURIComponent(name);
            window.location.href = `contact.html?product=${productName}`;
        });
    }
}




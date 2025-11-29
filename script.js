class Starfield {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
        
        this.setupRenderer();
        this.createStarfield();
        this.animate();
        
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    setupRenderer() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        document.getElementById('three-container').appendChild(this.renderer.domElement);
        
        this.camera.position.z = 1000;
    }
    
    createStarfield() {
        const starCount = 50000;
        const positions = [], colors = [];
        
        for (let i = 0; i < starCount; i++) {
            const x = (Math.random() - 0.5) * 10000;
            const y = (Math.random() - 0.5) * 10000;
            const z = (Math.random() - 0.5) * 10000;
            positions.push(x, y, z);

            const hue = Math.random();
            let r, g, b;
            if (hue < 0.33) { 
                r = 0.8 + Math.random() * 0.2; 
                g = 0.8 + Math.random() * 0.2; 
                b = 1.0;
            } else if (hue < 0.66) { 
                r = 1.0; 
                g = 0.9 + Math.random() * 0.1; 
                b = 0.7 + Math.random() * 0.1;
            } else { 
                r = 1.0; 
                g = 0.6 + Math.random() * 0.2; 
                b = 0.6 + Math.random() * 0.2;
            }
            colors.push(r, g, b);
        }

        const starGeometry = new THREE.BufferGeometry();
        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const starMaterial = new THREE.ShaderMaterial({
            uniforms: { 
                time: { value: 0 }
            },
            vertexShader: `
                uniform float time;
                varying vec3 vColor;
                varying float vTwinkle;
                void main() {
                    vec3 pos = position;
                    float twinkle = sin(dot(pos.xy, vec2(12.9898, 78.233)) + time * 2.0);
                    vTwinkle = 0.5 + 0.5 * twinkle;
                    vColor = color;
                    gl_PointSize = 4.0;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                varying float vTwinkle;
                void main() {
                    float dist = distance(gl_PointCoord, vec2(0.5));
                    float alpha = (1.0 - smoothstep(0.0, 0.5, dist)) * vTwinkle;
                    gl_FragColor = vec4(vColor, alpha);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexColors: true
        });

        this.stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(this.stars);
        
        this.startTime = Date.now();
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const currentTime = (Date.now() - this.startTime) * 0.001;
        this.stars.material.uniforms.time.value = currentTime;
        
        this.stars.rotation.y = currentTime * 0.01;
        this.stars.rotation.x = currentTime * 0.005;
        
        this.renderer.render(this.scene, this.camera);
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

new Starfield();

let lastMouseTime = 0;
const MOUSE_THROTTLE = 100;

const burstParticles = Array.from(document.querySelectorAll('.particle-burst'));
let currentBurstIndex = 0;

document.addEventListener('mousemove', (e) => {
    const cursor = document.querySelector('.cursor-glow');
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    
    const now = Date.now();
    if (now - lastMouseTime > MOUSE_THROTTLE && Math.random() > 0.5) {
        createCursorParticle(e.clientX, e.clientY);
        lastMouseTime = now;
    }
});

function createCursorParticle(x, y) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.position = 'fixed';
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.width = Math.random() * 4 + 2 + 'px';
    particle.style.height = particle.style.width;
    particle.style.background = Math.random() > 0.5 ? 
        'rgba(255, 0, 255, 0.8)' : 'rgba(0, 255, 255, 0.8)';
    particle.style.animation = 'float 2s ease-in-out forwards';
    particle.style.transform = 'translateZ(0)';
    particle.style.willChange = 'transform, opacity';
    document.body.appendChild(particle);
    
    setTimeout(() => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
    }, 2000);
}

document.querySelector('.container').addEventListener('click', function() {
    const orb = document.querySelector('.orb');
    const orbCore = document.querySelector('.orb-core');
    
    orb.style.animation = 'none';
    orbCore.style.animation = 'none';
    
    setTimeout(() => {
        orb.style.animation = 'rotate 4s linear infinite, pulse 2s ease-in-out infinite';
        orbCore.style.animation = 'pulse-core 1.5s ease-in-out infinite alternate';
    }, 50);
    
    createBurstParticles();
});

function createBurstParticles() {
    burstParticles.forEach((particle, index) => {
        setTimeout(() => {
            const angle = Math.random() * Math.PI * 2;
            const distance = 150 + Math.random() * 100;
            const x = 200 + Math.cos(angle) * distance;
            const y = 200 + Math.sin(angle) * distance;
            
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.width = Math.random() * 6 + 2 + 'px';
            particle.style.height = particle.style.width;
            particle.style.background = Math.random() > 0.5 ? 
                'rgba(255, 0, 255, 0.8)' : 'rgba(0, 255, 255, 0.8)';
            particle.style.opacity = '1';
            
            particle.style.transform = `translate(0, 0) scale(1)`;
            particle.style.transition = 'none';
            
            particle.offsetHeight;
            
            particle.style.transition = 'all 1s ease-out';
            particle.style.transform = `translate(${Math.cos(angle) * 100}px, ${Math.sin(angle) * 100}px) scale(0)`;
            particle.style.opacity = '0';
            
        }, index * 30);
    });
    
    setTimeout(() => {
        burstParticles.forEach(particle => {
            particle.style.transition = 'none';
            particle.style.opacity = '0';
        });
    }, 1000);
}

burstParticles.forEach(particle => {
    particle.style.opacity = '0';
});
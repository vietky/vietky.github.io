declare const THREE: any;

export function setupRubiksCube(container: HTMLElement) {
    // UI Overlay for Summary
    const overlay = document.createElement('div');
    overlay.className = "absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 text-white p-8 opacity-0 transition-opacity duration-1000 pointer-events-none";

    const contentBox = document.createElement('div');
    contentBox.className = "max-w-2xl text-center bg-gray-900 p-8 rounded-lg shadow-2xl";
    contentBox.innerHTML = `
        <h1 class="text-4xl font-bold mb-4 text-blue-400">Viet Ky</h1>
        <h2 class="text-2xl mb-6 text-gray-300">Backend Engineer</h2>
        <p class="text-lg leading-relaxed text-gray-200">
            A backend engineer with a focus on delivering reliable, high performance and scalable systems implementing unit and integration tests, applying caching, replication while enhancing observability through metrics, logs, tracing. Strive to adopt best practices in designing API, workers and internal tools to boost system performance overall.
        </p>
    `;
    overlay.appendChild(contentBox);
    container.style.position = 'relative';
    container.appendChild(overlay);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // Create textures
    const faceTexts = [
        { title: "About Me", lines: ["Backend engineer", "Reliable & Scalable systems", "Caching, replication"] },
        { title: "Tech Stack", lines: ["JavaScript, TypeScript", "Node.js, Golang", "GCP, Docker"] },
        { title: "VK Reader", lines: ["Chrome Extension", "AI reading & summarizing"] },
        { title: "Memorizer", lines: ["Chrome Extension", "Highlighting & Screenshots"] },
        { title: "Smart Cookies", lines: ["YouTube Channel", "Automated quiz videos"] },
        { title: "Contact Info", lines: ["LinkedIn: qvietky", "GitHub: vietky"] }
    ];

    function createTextTexture(textObj: any) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 512, 512);
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 10;
        ctx.strokeRect(0, 0, 512, 512);
        ctx.fillStyle = '#1a1a1a';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(textObj.title, 256, 100);
        ctx.font = '32px Arial';
        ctx.fillStyle = '#4a4a4a';
        for (let i = 0; i < textObj.lines.length; i++) {
            ctx.fillText(textObj.lines[i], 256, 220 + (i * 60));
        }
        return new THREE.CanvasTexture(canvas);
    }

    const textures = faceTexts.map(createTextTexture);

    // Create 27 cubies
    const cubies: any[] = [];
    const spacing = 1.05;

    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            for (let z = -1; z <= 1; z++) {
                const geometry = new THREE.BoxGeometry(1, 1, 1);

                // modify UVs so they map parts of the large textures
                const uvs = geometry.attributes.uv;

                const setFaceUV = (faceIndex: number, uOffset: number, vOffset: number) => {
                    const u = (uOffset + 1) / 3;
                    const v = (vOffset + 1) / 3;
                    const du = 1/3;
                    const dv = 1/3;
                    const offset = faceIndex * 4;
                    uvs.setXY(offset, u, v + dv);
                    uvs.setXY(offset + 1, u + du, v + dv);
                    uvs.setXY(offset + 2, u, v);
                    uvs.setXY(offset + 3, u + du, v);
                };

                if (x === 1) setFaceUV(0, -z, y);
                if (x === -1) setFaceUV(1, z, y);
                if (y === 1) setFaceUV(2, x, -z);
                if (y === -1) setFaceUV(3, x, z);
                if (z === 1) setFaceUV(4, x, y);
                if (z === -1) setFaceUV(5, -x, y);

                const materials = [
                    new THREE.MeshBasicMaterial({ map: textures[0], color: x === 1 ? 0xffffff : 0x000000 }),
                    new THREE.MeshBasicMaterial({ map: textures[1], color: x === -1 ? 0xffffff : 0x000000 }),
                    new THREE.MeshBasicMaterial({ map: textures[2], color: y === 1 ? 0xffffff : 0x000000 }),
                    new THREE.MeshBasicMaterial({ map: textures[3], color: y === -1 ? 0xffffff : 0x000000 }),
                    new THREE.MeshBasicMaterial({ map: textures[4], color: z === 1 ? 0xffffff : 0x000000 }),
                    new THREE.MeshBasicMaterial({ map: textures[5], color: z === -1 ? 0xffffff : 0x000000 }),
                ];

                const mesh = new THREE.Mesh(geometry, materials);
                mesh.position.set(x * spacing, y * spacing, z * spacing);
                group.add(mesh);
                cubies.push(mesh);
            }
        }
    }

    camera.position.z = 8;
    camera.position.x = 4;
    camera.position.y = 4;
    camera.lookAt(0, 0, 0);

    // Animation Logic
    let currentMove: any = null;
    let moveQueue: any[] = [];
    let isScrambling = true;
    let history: any[] = [];

    const axes = ['x', 'y', 'z'];
    const slices = [-1, 0, 1];
    const dirs = [1, -1];

    function generateScramble(moves = 15) {
        moveQueue = [];
        history = [];
        for (let i = 0; i < moves; i++) {
            const axis = axes[Math.floor(Math.random() * axes.length)];
            const slice = slices[Math.floor(Math.random() * slices.length)];
            const dir = dirs[Math.floor(Math.random() * dirs.length)];
            moveQueue.push({ axis, slice, dir, angle: 0, target: (Math.PI / 2) * dir });
            history.push({ axis, slice, dir: -dir }); // reverse dir for unscramble
        }
    }

    generateScramble();

    const pivot = new THREE.Object3D();
    group.add(pivot);

    let isSolved = false;

    // Interaction for replay
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    renderer.domElement.addEventListener('pointerdown', (event: any) => {
        if (!isSolved) return; // Ignore clicks if currently animating

        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(cubies);

        if (intersects.length > 0) {
            // Clicked on the cube: start replay
            overlay.classList.remove('opacity-100');
            overlay.classList.add('opacity-0');

            isSolved = false;
            isScrambling = true;
            generateScramble();
        }
    });

    function applyMove() {
        if (!currentMove && moveQueue.length > 0) {
            currentMove = moveQueue.shift();
            // Attach active cubies to pivot
            const activeCubies = cubies.filter(c => {
                let pos = new THREE.Vector3();
                c.getWorldPosition(pos);
                // convert to local group space
                group.worldToLocal(pos);
                return Math.abs((pos as any)[currentMove.axis] - (currentMove.slice * spacing)) < 0.1;
            });
            pivot.rotation.set(0,0,0);
            activeCubies.forEach(c => pivot.add(c));
            currentMove.activeCubies = activeCubies;
        }

        if (currentMove) {
            const step = 0.15 * currentMove.dir;
            currentMove.angle += step;
            pivot.rotation[currentMove.axis as 'x'|'y'|'z'] += step;

            if (Math.abs(currentMove.angle) >= Math.abs(currentMove.target)) {
                pivot.rotation[currentMove.axis as 'x'|'y'|'z'] = currentMove.target;
                pivot.updateMatrixWorld();

                currentMove.activeCubies.forEach((c: any) => {
                    group.attach(c);
                    c.position.x = Math.round(c.position.x / spacing) * spacing;
                    c.position.y = Math.round(c.position.y / spacing) * spacing;
                    c.position.z = Math.round(c.position.z / spacing) * spacing;
                });

                pivot.rotation.set(0,0,0);
                currentMove = null;

                if (moveQueue.length === 0) {
                    if (isScrambling) {
                        isScrambling = false;
                        // wait a bit before unscrambling
                        setTimeout(() => {
                            moveQueue = history.reverse().map(m => ({ ...m, angle: 0, target: (Math.PI / 2) * m.dir }));
                        }, 500);
                    } else if (!isSolved) {
                        isSolved = true;
                        overlay.classList.remove('opacity-0');
                        overlay.classList.add('opacity-100');
                    }
                }
            }
        } else if (isSolved) {
            // slowly rotate entire group
            group.rotation.y += 0.005;
            group.rotation.x += 0.005;
        }
    }

    let animationId: number;
    function animate() {
        animationId = requestAnimationFrame(animate);
        applyMove();
        renderer.render(scene, camera);
    }
    animate();

    return {
        cleanup: () => {
            cancelAnimationFrame(animationId);
            container.removeChild(renderer.domElement);
            container.removeChild(overlay);
        }
    };
}

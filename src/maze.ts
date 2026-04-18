export function setupMaze(container: HTMLElement) {
    const wrapper = document.createElement('div');
    wrapper.className = "relative w-full max-w-[600px] mx-auto";
    container.appendChild(wrapper);

    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 600;
    canvas.className = "bg-white border-4 border-gray-800 rounded-lg shadow-xl w-full h-auto";
    wrapper.appendChild(canvas);

    // UI Overlay for Employment History
    const overlay = document.createElement('div');
    overlay.className = "absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 text-white p-6 opacity-0 transition-opacity duration-1000 pointer-events-none rounded-lg";

    const contentBox = document.createElement('div');
    contentBox.className = "max-w-lg text-left bg-gray-900 p-6 rounded-lg shadow-2xl overflow-y-auto max-h-[90%]";
    contentBox.innerHTML = `
        <h2 class="text-3xl font-bold mb-4 text-green-400">Employment History</h2>

        <div class="mb-4">
            <h3 class="text-xl font-bold text-blue-300">Be Group (03/2022 - present)</h3>
            <ul class="list-disc pl-5 text-sm text-gray-300 mt-2 space-y-1">
                <li>Feature Development: BeClean, Daily Commute, Bounce Dispatch.</li>
                <li>Achieved less than 200ms in p99 for BeClean.</li>
                <li>Leveraged Cadence Workflow & distributed tracing.</li>
            </ul>
        </div>

        <div class="mb-4">
            <h3 class="text-xl font-bold text-blue-300">Chotot (05/2016 - 03/2022)</h3>
            <ul class="list-disc pl-5 text-sm text-gray-300 mt-2 space-y-1">
                <li>Feature Development: Ad Review, Sticky Ads, Ad Impression Counting.</li>
                <li>Managed 30M+ impressions per day.</li>
                <li>Utilized Kafka and PostgreSQL.</li>
            </ul>
        </div>

        <div>
            <h3 class="text-xl font-bold text-blue-300">Criteo (01/2013 - 01/2016)</h3>
            <ul class="list-disc pl-5 text-sm text-gray-300 mt-2 space-y-1">
                <li>Web development, maintenance & deployment on Windows Server.</li>
                <li>Optimized modules with In-Memory Caching.</li>
            </ul>
        </div>
    `;
    overlay.appendChild(contentBox);
    wrapper.appendChild(overlay);

    const ctx = canvas.getContext('2d')!;

    // Config
    const cols = 20;
    const rows = 20;
    const w = canvas.width / cols;
    const h = canvas.height / rows;

    class Cell {
        i: number;
        j: number;
        walls: boolean[];
        visited: boolean;

        constructor(i: number, j: number) {
            this.i = i;
            this.j = j;
            this.walls = [true, true, true, true]; // top, right, bottom, left
            this.visited = false;
        }

        show() {
            const x = this.i * w;
            const y = this.j * h;

            if (this.visited) {
                ctx.fillStyle = '#ebf8ff';
                ctx.fillRect(x, y, w, h);
            }

            ctx.strokeStyle = '#2d3748';
            ctx.lineWidth = 2;

            if (this.walls[0]) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.stroke(); }
            if (this.walls[1]) { ctx.beginPath(); ctx.moveTo(x + w, y); ctx.lineTo(x + w, y + h); ctx.stroke(); }
            if (this.walls[2]) { ctx.beginPath(); ctx.moveTo(x + w, y + h); ctx.lineTo(x, y + h); ctx.stroke(); }
            if (this.walls[3]) { ctx.beginPath(); ctx.moveTo(x, y + h); ctx.lineTo(x, y); ctx.stroke(); }
        }
    }

    const grid: Cell[] = [];
    for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
            grid.push(new Cell(i, j));
        }
    }

    function index(i: number, j: number) {
        if (i < 0 || j < 0 || i > cols - 1 || j > rows - 1) return -1;
        return i + j * cols;
    }

    function checkNeighbors(cell: Cell) {
        const neighbors: Cell[] = [];
        const top = grid[index(cell.i, cell.j - 1)];
        const right = grid[index(cell.i + 1, cell.j)];
        const bottom = grid[index(cell.i, cell.j + 1)];
        const left = grid[index(cell.i - 1, cell.j)];

        if (top && !top.visited) neighbors.push(top);
        if (right && !right.visited) neighbors.push(right);
        if (bottom && !bottom.visited) neighbors.push(bottom);
        if (left && !left.visited) neighbors.push(left);

        if (neighbors.length > 0) {
            const r = Math.floor(Math.random() * neighbors.length);
            return neighbors[r];
        } else {
            return undefined;
        }
    }

    function removeWalls(a: Cell, b: Cell) {
        const x = a.i - b.i;
        if (x === 1) { a.walls[3] = false; b.walls[1] = false; }
        else if (x === -1) { a.walls[1] = false; b.walls[3] = false; }
        const y = a.j - b.j;
        if (y === 1) { a.walls[0] = false; b.walls[2] = false; }
        else if (y === -1) { a.walls[2] = false; b.walls[0] = false; }
    }

    let current = grid[0];
    current.visited = true;
    const stack: Cell[] = [];

    // Generate maze using recursive backtracker
    while (true) {
        const next = checkNeighbors(current);
        if (next) {
            next.visited = true;
            stack.push(current);
            removeWalls(current, next);
            current = next;
        } else if (stack.length > 0) {
            current = stack.pop()!;
        } else {
            break;
        }
    }

    // Reset visited for rat pathfinding
    grid.forEach(c => c.visited = false);

    function drawMaze() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        grid.forEach(c => c.show());

        // Draw Exit
        ctx.fillStyle = '#48bb78'; // green
        ctx.fillRect((cols - 1) * w + 4, (rows - 1) * h + 4, w - 8, h - 8);
    }

    drawMaze();

    // Pathfinding (BFS on click)
    let ratPos = grid[0];
    let pathStack: Cell[] = [ratPos];
    let reachedExit = false;
    let isAnimating = false;

    function getAccessibleNeighbors(cell: Cell) {
        const neighbors: Cell[] = [];
        const top = grid[index(cell.i, cell.j - 1)];
        const right = grid[index(cell.i + 1, cell.j)];
        const bottom = grid[index(cell.i, cell.j + 1)];
        const left = grid[index(cell.i - 1, cell.j)];

        if (top && !cell.walls[0]) neighbors.push(top);
        if (right && !cell.walls[1]) neighbors.push(right);
        if (bottom && !cell.walls[2]) neighbors.push(bottom);
        if (left && !cell.walls[3]) neighbors.push(left);

        return neighbors;
    }

    function drawScene() {
        drawMaze();

        // Draw path
        if (pathStack.length > 0) {
            ctx.strokeStyle = '#ed8936';
            ctx.lineWidth = 4;
            ctx.beginPath();
            for (let i = 0; i < pathStack.length; i++) {
                const cx = pathStack[i].i * w + w / 2;
                const cy = pathStack[i].j * h + h / 2;
                if (i === 0) ctx.moveTo(cx, cy);
                else ctx.lineTo(cx, cy);
            }
            ctx.stroke();
        }

        // Draw Rat
        ctx.fillStyle = '#e53e3e';
        ctx.beginPath();
        const ratX = ratPos.i * w + w / 2;
        const ratY = ratPos.j * h + h / 2;
        ctx.arc(ratX, ratY, w / 3, 0, Math.PI * 2);
        ctx.fill();
    }

    drawScene();

    function animatePath(path: Cell[]) {
        isAnimating = true;
        let stepIndex = 0;

        function step() {
            if (stepIndex < path.length) {
                ratPos = path[stepIndex];
                pathStack.push(ratPos);
                drawScene();
                stepIndex++;

                // check if exit reached
                if (ratPos.i === cols - 1 && ratPos.j === rows - 1) {
                    reachedExit = true;
                    overlay.classList.remove('opacity-0');
                    overlay.classList.add('opacity-100');
                    overlay.style.pointerEvents = 'auto'; // allow scrolling if needed
                }

                if (!reachedExit) {
                    setTimeout(() => requestAnimationFrame(step), 50);
                } else {
                    isAnimating = false;
                }
            } else {
                isAnimating = false;
            }
        }

        requestAnimationFrame(step);
    }

    canvas.addEventListener('pointerdown', (e) => {
        if (isAnimating || reachedExit) return;

        const rect = canvas.getBoundingClientRect();
        // Calculate canvas scale in case CSS resizes it
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        const i = Math.floor(x / w);
        const j = Math.floor(y / h);

        const targetCell = grid[index(i, j)];
        if (!targetCell) return;

        // BFS to find shortest path from ratPos to targetCell
        const queue: Cell[] = [ratPos];
        const cameFrom = new Map<Cell, Cell | null>();
        cameFrom.set(ratPos, null);

        let found = false;

        while (queue.length > 0) {
            const current = queue.shift()!;

            if (current === targetCell) {
                found = true;
                break;
            }

            for (const next of getAccessibleNeighbors(current)) {
                if (!cameFrom.has(next)) {
                    queue.push(next);
                    cameFrom.set(next, current);
                }
            }
        }

        if (found) {
            // Reconstruct path
            const path: Cell[] = [];
            let curr: Cell | null = targetCell;
            while (curr !== null) {
                path.push(curr);
                curr = cameFrom.get(curr)!;
            }
            path.reverse();

            // clear old path but start from ratPos
            pathStack = [ratPos];

            animatePath(path.slice(1)); // skip the first element as rat is already there
        }
    });

}

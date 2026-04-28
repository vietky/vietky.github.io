import './style.css';
import { setupRubiksCube } from './rubiks';
import { setupMaze } from './maze';
import { setupCrossword } from './crossword';
import { setupNav } from './shared/nav';
import { setupFooter } from './shared/footer';

const navContainer = document.getElementById('nav-container')!;
setupNav(navContainer);

const footerContainer = document.getElementById('footer-container');
if (footerContainer) {
    setupFooter(footerContainer);
}

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="h-[calc(100vh-64px)] bg-gray-900 flex flex-col font-sans overflow-hidden">

    <header class="text-center py-4 flex-shrink-0">
        <h1 class="text-white text-3xl font-bold">Interactive Portfolio</h1>
        <p class="text-gray-400 text-sm mt-1">Select a game below to play.</p>
    </header>

    <!-- Main Center Area -->
    <div class="flex-1 w-full max-w-5xl mx-auto p-4 relative min-h-0">

        <!-- Rubik's Cube -->
        <div id="slide-cube" class="absolute inset-4 opacity-100 z-10 bg-gray-800 rounded-xl border border-gray-700 shadow-xl flex flex-col overflow-hidden">
            <div class="absolute top-4 left-4 z-20 pointer-events-none">
                <h2 class="text-white text-xl font-bold bg-black/50 px-3 py-1 rounded">3D Skills Cube</h2>
                <p class="text-gray-300 text-xs mt-1 bg-black/50 px-3 py-1 rounded inline-block">Drag to rotate</p>
            </div>
            <div id="rubiks-container" class="flex-1 w-full h-full relative"></div>
        </div>

        <!-- Maze -->
        <div id="slide-maze" class="absolute inset-4 opacity-0 z-0 pointer-events-none bg-gray-800 rounded-xl border border-gray-700 shadow-xl flex flex-col overflow-hidden p-4">
            <div class="text-center mb-2 flex-shrink-0">
                <h2 class="text-white text-lg font-bold">Maze Experience</h2>
                <p class="text-gray-400 text-xs">Help the rat find the exit!</p>
            </div>
            <div id="maze-container" class="flex-1 w-full h-full relative overflow-hidden flex items-center justify-center"></div>
        </div>

        <!-- Crossword -->
        <div id="slide-crossword" class="absolute inset-4 opacity-0 z-0 pointer-events-none bg-gray-50 rounded-xl border border-gray-300 shadow-xl flex flex-col overflow-hidden p-4">
            <div class="text-center mb-2 flex-shrink-0">
                <h2 class="text-gray-900 text-lg font-bold">Tech Stack Crossword</h2>
            </div>
            <div id="crossword-container" class="flex-1 w-full h-full relative overflow-auto custom-scrollbar"></div>
        </div>

    </div>

    <!-- Bottom Selection Bar -->
    <div class="flex-shrink-0 bg-gray-800 p-4 border-t border-gray-700 flex justify-center gap-4 overflow-x-auto">
        <button id="btn-cube" class="w-32 h-24 flex-shrink-0 bg-gray-700 hover:bg-gray-600 border-2 border-indigo-500 rounded-lg flex flex-col items-center justify-center transition-colors">
            <span class="text-white font-bold text-sm">Skills Cube</span>
            <span class="text-xs text-gray-400 mt-1">3D Puzzle</span>
        </button>

        <button id="btn-maze" class="w-32 h-24 flex-shrink-0 bg-gray-700 hover:bg-gray-600 border-2 border-transparent rounded-lg flex flex-col items-center justify-center transition-colors">
            <span class="text-white font-bold text-sm">Maze</span>
            <span class="text-xs text-gray-400 mt-1">Find the Exit</span>
        </button>

        <button id="btn-crossword" class="w-32 h-24 flex-shrink-0 bg-gray-700 hover:bg-gray-600 border-2 border-transparent rounded-lg flex flex-col items-center justify-center transition-colors">
            <span class="text-white font-bold text-sm">Crossword</span>
            <span class="text-xs text-gray-400 mt-1">Tech Trivia</span>
        </button>
    </div>

  </div>
`;

// Initialize components
const rubiksContainer = document.getElementById('rubiks-container')!;
setupRubiksCube(rubiksContainer);

const mazeContainer = document.getElementById('maze-container')!;
setupMaze(mazeContainer);

const crosswordContainer = document.getElementById('crossword-container')!;
setupCrossword(crosswordContainer);

// State management
const slides = {
    cube: document.getElementById('slide-cube')!,
    maze: document.getElementById('slide-maze')!,
    crossword: document.getElementById('slide-crossword')!
};

const buttons = {
    cube: document.getElementById('btn-cube')!,
    maze: document.getElementById('btn-maze')!,
    crossword: document.getElementById('btn-crossword')!
};

function setActiveSlide(activeId: 'cube' | 'maze' | 'crossword') {
    // Update slides
    for (const [id, el] of Object.entries(slides)) {
        if (id === activeId) {
            el.classList.remove('opacity-0', 'z-0', 'pointer-events-none');
            el.classList.add('opacity-100', 'z-10');
        } else {
            el.classList.remove('opacity-100', 'z-10');
            el.classList.add('opacity-0', 'z-0', 'pointer-events-none');
        }
    }

    // Update buttons
    for (const [id, btn] of Object.entries(buttons)) {
        if (id === activeId) {
            btn.classList.remove('border-transparent');
            btn.classList.add('border-indigo-500');
        } else {
            btn.classList.remove('border-indigo-500');
            btn.classList.add('border-transparent');
        }
    }
}

buttons.cube.addEventListener('click', () => setActiveSlide('cube'));
buttons.maze.addEventListener('click', () => setActiveSlide('maze'));
buttons.crossword.addEventListener('click', () => setActiveSlide('crossword'));

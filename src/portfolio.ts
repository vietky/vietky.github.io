import './style.css';
import { setupRubiksCube } from './rubiks';
import { setupMaze } from './maze';
import { setupCrossword } from './crossword';
import { setupNav } from './shared/nav';

const navContainer = document.getElementById('nav-container')!;
setupNav(navContainer);

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="h-[calc(100vh-64px)] bg-gray-900 flex flex-col font-sans overflow-hidden">

    <header class="text-center py-4 flex-shrink-0">
        <h1 class="text-white text-3xl font-bold">Interactive Portfolio</h1>
        <p class="text-gray-400 text-sm mt-1">Explore the 3D cube, solve the maze, and complete the crossword all in one place.</p>
    </header>

    <div class="flex-1 w-full max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">

        <!-- Left Column: Rubik's Cube -->
        <div class="bg-gray-800 rounded-xl border border-gray-700 shadow-xl flex flex-col overflow-hidden col-span-1 lg:col-span-2 relative">
            <div class="absolute top-4 left-4 z-10 pointer-events-none">
                <h2 class="text-white text-xl font-bold bg-black/50 px-3 py-1 rounded">3D Skills Cube</h2>
                <p class="text-gray-300 text-xs mt-1 bg-black/50 px-3 py-1 rounded inline-block">Drag to rotate</p>
            </div>
            <div id="rubiks-container" class="flex-1 w-full h-full relative min-h-[300px]"></div>
        </div>

        <!-- Right Column: Maze & Crossword stacked -->
        <div class="flex flex-col gap-6 col-span-1 h-full min-h-0">

            <!-- Maze -->
            <div class="bg-gray-800 rounded-xl border border-gray-700 shadow-xl flex flex-col flex-1 min-h-0 overflow-hidden relative p-4">
                <div class="text-center mb-2 flex-shrink-0">
                    <h2 class="text-white text-lg font-bold">Maze Experience</h2>
                    <p class="text-gray-400 text-xs">Help the rat find the exit!</p>
                </div>
                <div id="maze-container" class="flex-1 w-full h-full relative overflow-hidden flex items-center justify-center"></div>
            </div>

            <!-- Crossword -->
            <div class="bg-gray-50 rounded-xl border border-gray-300 shadow-xl flex flex-col flex-1 min-h-0 overflow-hidden relative p-4">
                <div class="text-center mb-2 flex-shrink-0">
                    <h2 class="text-gray-900 text-lg font-bold">Tech Stack Crossword</h2>
                </div>
                <div id="crossword-container" class="flex-1 w-full h-full relative overflow-auto custom-scrollbar"></div>
            </div>

        </div>

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

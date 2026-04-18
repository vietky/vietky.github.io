import './style.css';
import { setupRubiksCube } from './rubiks';
import { setupMaze } from './maze';
import { setupCrossword } from './crossword';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="min-h-screen bg-gray-50 flex flex-col font-sans">

    <!-- Section 1: Rubik's Cube Intro -->
    <section id="intro" class="w-full h-screen relative bg-gray-900 overflow-hidden flex flex-col">
        <h2 class="text-white text-3xl font-bold p-8 absolute top-0 left-0 w-full text-center z-10 pointer-events-none">Welcome to my Portfolio</h2>
        <div id="rubiks-container" class="flex-1 w-full relative"></div>
        <div class="absolute bottom-8 left-0 w-full text-center animate-bounce text-white pointer-events-none">
            <p>Scroll down</p>
            <svg class="w-6 h-6 mx-auto mt-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
        </div>
    </section>

    <!-- Section 2: Maze Experience -->
    <section id="experience" class="w-full min-h-screen bg-gray-800 py-16 px-4 flex flex-col items-center justify-center">
        <h2 class="text-4xl font-bold mb-8 text-white text-center">Help the Rat find the Exit!</h2>
        <div id="maze-container" class="w-full max-w-2xl relative"></div>
    </section>

    <!-- Section 3: Tech Stack Crossword -->
    <section id="tech-stack" class="w-full min-h-screen bg-gray-50 py-16 px-4 flex flex-col items-center justify-center">
        <div id="crossword-container" class="w-full"></div>
    </section>

  </div>
`;

// Initialize components
const rubiksContainer = document.getElementById('rubiks-container')!;
setupRubiksCube(rubiksContainer);

const mazeContainer = document.getElementById('maze-container')!;
setupMaze(mazeContainer);

const crosswordContainer = document.getElementById('crossword-container')!;
setupCrossword(crosswordContainer);

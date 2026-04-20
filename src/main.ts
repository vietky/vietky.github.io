import './style.css';
import { setupNav } from './shared/nav';

const navContainer = document.getElementById('nav-container')!;
setupNav(navContainer);

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="min-h-screen bg-gray-50 flex flex-col font-sans">
    <main class="flex-grow container mx-auto px-4 py-8">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl mb-4">Classic Games Collection</h1>
        <p class="text-xl text-gray-500">A nostalgic journey through retro games built from scratch.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <!-- Tetris Card -->
        <a href="/tetris.html" class="group block bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
          <div class="relative pb-[56.25%] bg-gray-200">
            <!-- Placeholder for Tetris image -->
            <div class="absolute inset-0 flex items-center justify-center bg-indigo-900 text-white group-hover:bg-indigo-800 transition-colors">
              <span class="text-5xl font-bold font-mono">TETRIS</span>
            </div>
          </div>
          <div class="p-6">
            <h3 class="text-2xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">Tetris</h3>
            <p class="text-gray-600">The iconic block-stacking puzzle game. Clear lines to survive as long as possible!</p>
          </div>
        </a>

        <!-- Placeholder: Mario -->
        <div class="block bg-white rounded-xl shadow-md overflow-hidden opacity-75 cursor-not-allowed">
          <div class="relative pb-[56.25%] bg-gray-200">
            <div class="absolute inset-0 flex items-center justify-center bg-red-800 text-white">
              <span class="text-3xl font-bold">Coming Soon</span>
            </div>
          </div>
          <div class="p-6">
            <h3 class="text-2xl font-bold text-gray-400 mb-2">Super Mario Bros (Clone)</h3>
            <p class="text-gray-500">Jump and run through levels. Currently in development.</p>
          </div>
        </div>

        <!-- Tank 1990 Card -->
        <a href="/tank.html" class="group block bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
          <div class="relative pb-[56.25%] bg-gray-200">
            <div class="absolute inset-0 flex items-center justify-center bg-green-900 text-white group-hover:bg-green-800 transition-colors">
              <span class="text-5xl font-bold font-mono">TANK</span>
            </div>
          </div>
          <div class="p-6">
            <h3 class="text-2xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">Tank 1990</h3>
            <p class="text-gray-600">Defend your base and destroy enemy tanks. Play the classic battle city!</p>
          </div>
        </a>

        <!-- Placeholder: Dynomite -->
        <div class="block bg-white rounded-xl shadow-md overflow-hidden opacity-75 cursor-not-allowed">
          <div class="relative pb-[56.25%] bg-gray-200">
            <div class="absolute inset-0 flex items-center justify-center bg-yellow-600 text-white">
              <span class="text-3xl font-bold">Coming Soon</span>
            </div>
          </div>
          <div class="p-6">
            <h3 class="text-2xl font-bold text-gray-400 mb-2">Dynomite</h3>
            <p class="text-gray-500">Shoot eggs and match colors to clear the board. Currently in development.</p>
          </div>
        </div>

      </div>
    </main>
    <footer class="bg-gray-800 text-white py-6 text-center">
      <p>&copy; ${new Date().getFullYear()} Viet Ky. All rights reserved.</p>
    </footer>
  </div>
`;
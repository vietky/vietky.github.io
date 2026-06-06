import './style.css';
import { setupNav } from './shared/nav';
import { setupFooter } from './shared/footer';

const navContainer = document.getElementById('nav-container')!;
setupNav(navContainer);

const footerContainer = document.getElementById('footer-container');
if (footerContainer) {
    setupFooter(footerContainer);
}

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="min-h-screen bg-gray-900 flex flex-col font-sans">
    <main class="flex-grow container mx-auto px-4 py-8">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-6xl mb-4">Classic Games Collection</h1>
        <p class="text-xl text-gray-400">A nostalgic journey through retro games built from scratch.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <!-- Tetris Card -->
        <a href="/tetris.html" class="group block bg-gray-800 border border-gray-700 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1">
          <div class="relative pb-[56.25%] bg-gray-900 border-b border-gray-700">
            <!-- Placeholder for Tetris image -->
            <div class="absolute inset-0 flex items-center justify-center bg-indigo-900 text-white group-hover:bg-indigo-800 transition-colors">
              <span class="text-5xl font-bold font-mono">TETRIS</span>
            </div>
          </div>
          <div class="p-6">
            <h3 class="text-2xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">Tetris</h3>
            <p class="text-gray-300">The iconic block-stacking puzzle game. Clear lines to survive as long as possible!</p>
          </div>
        </a>

        <!-- Tank 1990 Card -->
        <a href="/tank.html" class="group block bg-gray-800 border border-gray-700 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1">
          <div class="relative pb-[56.25%] bg-gray-900 border-b border-gray-700">
            <div class="absolute inset-0 flex items-center justify-center bg-green-900 text-white group-hover:bg-green-800 transition-colors">
              <span class="text-5xl font-bold font-mono">TANK</span>
            </div>
          </div>
          <div class="p-6">
            <h3 class="text-2xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors">Tank 1990</h3>
            <p class="text-gray-300">Defend your base and destroy enemy tanks. Play the classic battle city!</p>
          </div>
        </a>

      </div>
    </main>
    <footer class="bg-gray-800 border-t border-gray-700 text-gray-400 py-6 text-center">
      <p>&copy; ${new Date().getFullYear()} Viet Ky. All rights reserved.</p>
    </footer>
  </div>
`;
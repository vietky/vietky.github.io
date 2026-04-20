export function setupNav(element: HTMLElement) {
  element.innerHTML = `
    <nav class="bg-gray-800 text-white shadow-lg sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <a href="/" class="flex-shrink-0">
              <span class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600">Viet Ky</span>
            </a>
            <div class="hidden md:block">
              <div class="ml-10 flex items-baseline space-x-4">
                <a href="/" class="hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Games</a>
                <a href="/portfolio.html" class="hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Portfolio</a>
              </div>
            </div>
          </div>
          <!-- Mobile menu button -->
          <div class="-mr-2 flex md:hidden">
            <button type="button" id="mobile-menu-btn" class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
              <span class="sr-only">Open main menu</span>
              <!-- Icon when menu is closed -->
              <svg class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <!-- Mobile menu, show/hide based on menu state. -->
      <div class="md:hidden hidden" id="mobile-menu">
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <a href="/" class="hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Games</a>
          <a href="/portfolio.html" class="hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Portfolio</a>
        </div>
      </div>
    </nav>
  `;

  // Highlight active link
  const path = window.location.pathname;
  const links = element.querySelectorAll('a');
  links.forEach(link => {
      const href = link.getAttribute('href');
      // basic path matching
      if (href && ((href === '/' && (path === '/' || path === '/index.html')) ||
          (href !== '/' && path.startsWith(href)))) {
          link.classList.add('bg-gray-900', 'text-white');
          link.classList.remove('text-gray-300', 'hover:bg-gray-700', 'hover:text-white');
      } else {
          link.classList.add('text-gray-300');
          link.classList.remove('bg-gray-900', 'text-white');
      }
  });

  // Mobile menu toggle
  const mobileMenuBtn = element.querySelector('#mobile-menu-btn');
  const mobileMenu = element.querySelector('#mobile-menu');

  if (mobileMenuBtn && mobileMenu) {
      mobileMenuBtn.addEventListener('click', () => {
          mobileMenu.classList.toggle('hidden');
      });
  }
}

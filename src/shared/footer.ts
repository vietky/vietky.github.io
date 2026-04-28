export function setupFooter(element: HTMLElement) {
  element.innerHTML = `
    <footer class="bg-gray-800 text-gray-300 py-8 mt-12 border-t border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 class="text-xl font-bold text-white mb-4">Viet Ky</h3>
            <p class="text-sm">Software Engineer & Game Developer. Exploring the intersection of code, design, and interactive experiences.</p>
          </div>
          <div>
            <h3 class="text-lg font-bold text-white mb-4">Quick Links</h3>
            <ul class="space-y-2 text-sm">
              <li><a href="/" class="hover:text-white transition-colors">Portfolio</a></li>
              <li><a href="/games.html" class="hover:text-white transition-colors">Games</a></li>
              <li><a href="/blog.html" class="hover:text-white transition-colors">Blog</a></li>
              <li><a href="/contact.html" class="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h3 class="text-lg font-bold text-white mb-4">Legal</h3>
            <ul class="space-y-2 text-sm">
              <li><a href="/privacy.html" class="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="/terms.html" class="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div class="mt-8 pt-8 border-t border-gray-700 text-sm text-center">
          &copy; ${new Date().getFullYear()} Viet Ky. All rights reserved.
        </div>
      </div>
    </footer>
  `;
}

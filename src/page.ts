import './style.css';
import { setupNav } from './shared/nav';
import { setupFooter } from './shared/footer';

document.addEventListener('DOMContentLoaded', () => {
    const navContainer = document.querySelector<HTMLDivElement>('#nav-container');
    if (navContainer) {
        setupNav(navContainer);
    }

    const footerContainer = document.querySelector<HTMLDivElement>('#footer-container');
    if (footerContainer) {
        setupFooter(footerContainer);
    }
});
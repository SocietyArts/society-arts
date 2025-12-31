/* ========================================
   SOCIETY ARTS - UNIFIED HEADER SYSTEM
   Single source of truth for header/sidebar across ALL pages
   Version: 8.1 - Account Menu System
   Changes:
   - Removed Settings & Help from sidebar bottom nav
   - Added Account Trigger at bottom of sidebar (? icon or avatar)
   - Added Account Menu popup with help pages and settings
   - Added "Try Society Arts" button for logged-out users
   ======================================== */

// ========================================
// CONFIGURATION
// ========================================
const SITE_CONFIG = {
    siteName: 'Society Arts',
    logoMonogram: 'https://pub-acb560f551f141db830964aed1fa005f.r2.dev/site-assets/SA_Monogram_Black%401x%201x1.png',
    logoWordmark: 'https://pub-acb560f551f141db830964aed1fa005f.r2.dev/site-assets/SA_Wordmark_Brown%401x.png',
    year: new Date().getFullYear()
};

// Main navigation items (Settings & Help moved to Account Menu)
const NAV_ITEMS = [
    { id: 'home', label: 'Home', href: '/index.html', icon: 'home' },
    { id: 'story-builder', label: 'Story Builder', href: '/story-builder.html', icon: 'edit' },
    { id: 'style-finder', label: 'Style Finder', href: '/style-finder.html', icon: 'grid' },
    { id: 'favorites', label: 'Favorites', href: '/favorites.html', icon: 'heart' },
    { id: 'collections', label: 'Collections', href: '/collections.html', icon: 'layers' }
];

// Account Menu Items - Logged In
const ACCOUNT_MENU_LOGGED_IN = [
    { id: 'settings', label: 'Settings', href: '/settings.html', icon: 'settings' },
    { id: 'help', label: 'Get Help', href: '/help.html', icon: 'help' },
    { type: 'divider' },
    { id: 'about', label: 'About Society Arts', href: '/about.html', icon: 'info' },
    { id: 'how-it-works', label: 'How It Works', href: '/how-it-works.html', icon: 'lightbulb' },
    { id: 'videos', label: 'Video Guides', href: '/video-guides.html', icon: 'video' },
    { id: 'faq', label: 'FAQ', href: '/faq.html', icon: 'helpCircle' },
    { type: 'divider' },
    { id: 'logout', label: 'Log Out', action: 'logout', icon: 'logout' }
];

// Account Menu Items - Logged Out
const ACCOUNT_MENU_LOGGED_OUT = [
    { id: 'help', label: 'Get Help', href: '/help.html', icon: 'help' },
    { type: 'divider' },
    { id: 'about', label: 'About Society Arts', href: '/about.html', icon: 'info' },
    { id: 'how-it-works', label: 'How It Works', href: '/how-it-works.html', icon: 'lightbulb' },
    { id: 'videos', label: 'Video Guides', href: '/video-guides.html', icon: 'video' },
    { id: 'faq', label: 'FAQ', href: '/faq.html', icon: 'helpCircle' },
    { type: 'divider' },
    { id: 'login', label: 'Log In', action: 'login', icon: 'login' }
];

// ========================================
// SVG ICONS
// ========================================
const ICONS = {
    home: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
    grid: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`,
    edit: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>`,
    heart: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
    layers: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>`,
    settings: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
    help: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
    chevronDown: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>`,
    logout: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>`,
    login: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>`,
    close: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
    book: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`,
    video: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>`,
    messageCircle: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>`,
    mail: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`,
    arrowRight: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`,
    upload: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>`,
    users: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
    info: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
    lightbulb: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="9" y1="18" x2="15" y2="18"></line><line x1="10" y1="22" x2="14" y2="22"></line><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"></path></svg>`,
    helpCircle: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
    questionMark: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>`
};

// ========================================
// UTILITY FUNCTIONS
// ========================================
function getCurrentPageId() {
    const path = window.location.pathname;
    const page = path.split('/').pop().replace('.html', '') || 'index';
    const pageMap = {
        'index': 'home', '': 'home',
        'style-finder': 'style-finder', 'style-finder-2': 'style-finder',
        'story-builder': 'story-builder',
        'favorites': 'favorites',
        'collections': 'collections', 'projects': 'collections',
        'settings': 'settings'
    };
    return pageMap[page] || 'home';
}

function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

// ========================================
// HEADER HTML GENERATOR (Vanilla JS)
// ========================================
function generateHeaderHTML(user, profile) {
    const isLoggedIn = !!user;
    const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User';
    const initials = getInitials(displayName);
    const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
    const isSuperAdmin = profile?.role === 'super_admin';
    const roleLabel = isSuperAdmin ? 'Super Admin' : (isAdmin ? 'Admin' : null);
    
    const authSection = isLoggedIn ? `
        <div class="user-menu-container" id="saUserMenu">
            <button class="user-avatar-btn" onclick="window.SocietyArts.toggleUserMenu()">
                <div class="user-avatar"><span>${initials}</span></div>
                <span class="user-name">${displayName}</span>
                <span class="user-menu-chevron">${ICONS.chevronDown}</span>
            </button>
            <div class="user-dropdown" id="saUserDropdown">
                <div class="user-dropdown-header">
                    <div class="user-dropdown-name">${displayName}</div>
                    <div class="user-dropdown-email">${user?.email || ''}</div>
                    ${roleLabel ? `<span class="user-dropdown-role ${isSuperAdmin ? 'super-admin' : ''}">${roleLabel}</span>` : ''}
                </div>
                <a href="/settings.html" class="user-dropdown-item">
                    <span>${ICONS.settings}</span>
                    Settings
                </a>
                ${isSuperAdmin ? `
                <button class="user-dropdown-item" onclick="window.SocietyArts.openAdminUtilities()">
                    <span>${ICONS.upload}</span>
                    Admin Utilities
                </button>
                ` : ''}
                <div class="user-dropdown-divider"></div>
                <button class="user-dropdown-item logout" onclick="window.SocietyArts.handleLogout()">
                    <span>${ICONS.logout}</span>
                    Sign Out
                </button>
            </div>
        </div>
    ` : `
        <button class="btn btn-secondary" onclick="window.openAuthModal()">Log In</button>
    `;
    
    return `
        <header class="header" id="sa-header">
            <div class="header-brand">
                <a href="/index.html" class="header-logo-link">
                    <img src="${SITE_CONFIG.logoMonogram}" alt="${SITE_CONFIG.siteName}" class="header-logo-icon">
                    <img src="${SITE_CONFIG.logoWordmark}" alt="${SITE_CONFIG.siteName}" class="header-logo-text">
                </a>
            </div>
            <div class="header-right">
                <a href="/story-builder.html" class="btn btn-primary new-project-btn">New Project</a>
                <div class="header-auth">
                    ${authSection}
                </div>
            </div>
        </header>
    `;
}

// ========================================
// SIDEBAR HTML GENERATOR (Vanilla JS) - Updated with Account Menu
// ========================================
function generateSidebarHTML() {
    const currentPage = getCurrentPageId();
    const user = window.AuthState?.user;
    const profile = window.AuthState?.profile;
    const isLoggedIn = !!user;
    const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User';
    const initials = getInitials(displayName);
    
    const mainNavItems = NAV_ITEMS.map(item => `
        <li>
            <a href="${item.href}" class="sidebar-nav-item ${currentPage === item.id ? 'active' : ''}"
               ${item.action ? `onclick="event.preventDefault(); window.${item.action}()"` : ''}>
                <span class="sidebar-nav-icon">${ICONS[item.icon]}</span>
                <span class="sidebar-nav-label">${item.label}</span>
            </a>
        </li>
    `).join('');
    
    const menuItems = isLoggedIn ? ACCOUNT_MENU_LOGGED_IN : ACCOUNT_MENU_LOGGED_OUT;
    const accountMenuItems = menuItems.map((item, index) => {
        if (item.type === 'divider') {
            return `<div class="account-menu-divider"></div>`;
        }
        return `
            <a href="${item.href || '#'}" class="account-menu-item" 
               ${item.action ? `onclick="event.preventDefault(); window.SocietyArts.handleAccountMenuAction('${item.action}')"` : ''}>
                <span class="account-menu-item-icon">${ICONS[item.icon]}</span>
                <span class="account-menu-item-label">${item.label}</span>
            </a>
        `;
    }).join('');
    
    // Account trigger - ? icon for logged out, initials/avatar for logged in
    const accountTrigger = isLoggedIn 
        ? `<span class="account-trigger-initials">${initials}</span>`
        : `<span class="account-trigger-question">${ICONS.questionMark}</span>`;
    
    return `
        <aside class="sidebar" id="sa-sidebar">
            <nav class="sidebar-nav sidebar-nav-main">
                <ul>${mainNavItems}</ul>
            </nav>
            <div class="sidebar-account">
                <div class="account-menu" id="saAccountMenu">
                    ${isLoggedIn ? `<div class="account-menu-header"><span class="account-menu-name">${displayName}</span></div>` : ''}
                    <div class="account-menu-items">
                        ${accountMenuItems}
                    </div>
                </div>
                <button class="account-trigger" onclick="window.SocietyArts.toggleAccountMenu()" title="${isLoggedIn ? 'Account menu' : 'Help & Info'}">
                    ${accountTrigger}
                    <span class="account-trigger-name">${isLoggedIn ? displayName : 'Help & Info'}</span>
                </button>
                </div>
        </aside>
    `;
}

// ========================================
// FOOTER HTML GENERATOR
// ========================================
function generateFooterHTML() {
    return `
        <footer class="site-footer" id="sa-footer">
            <div class="footer-content">
                <p>© ${SITE_CONFIG.year} Society Arts. All rights reserved.</p>
            </div>
        </footer>
    `;
}

// ========================================
// DOM MANIPULATION
// ========================================
function updateHeaderAuth() {
    const user = window.AuthState?.user;
    const profile = window.AuthState?.profile;
    
    // Find existing header and replace it entirely
    const header = document.getElementById('sa-header');
    if (header) {
        header.outerHTML = generateHeaderHTML(user, profile);
    }
    
    // Also update sidebar (for account trigger)
    const sidebar = document.getElementById('sa-sidebar');
    if (sidebar) {
        sidebar.outerHTML = generateSidebarHTML();
    }
}

function injectComponents() {
    const user = window.AuthState?.user;
    const profile = window.AuthState?.profile;
    
    // Inject sidebar - check if empty placeholder or missing
    const existingSidebar = document.getElementById('sa-sidebar') || document.querySelector('aside.sidebar');
    if (existingSidebar) {
        // Replace if empty or is a placeholder
        if (!existingSidebar.innerHTML.trim() || existingSidebar.innerHTML.trim() === '') {
            existingSidebar.outerHTML = generateSidebarHTML();
        }
    } else {
        document.body.insertAdjacentHTML('afterbegin', generateSidebarHTML());
    }
    
    // Inject header - check if empty placeholder or missing
    const existingHeader = document.getElementById('sa-header') || document.querySelector('header.header');
    if (existingHeader) {
        // Replace if empty or is a placeholder
        if (!existingHeader.innerHTML.trim() || existingHeader.innerHTML.trim() === '') {
            existingHeader.outerHTML = generateHeaderHTML(user, profile);
        }
    } else {
        const sidebar = document.getElementById('sa-sidebar');
        if (sidebar) {
            sidebar.insertAdjacentHTML('afterend', generateHeaderHTML(user, profile));
        } else {
            document.body.insertAdjacentHTML('afterbegin', generateHeaderHTML(user, profile));
        }
    }
    
    // Listen for auth changes
    if (window.addAuthListener) {
        window.addAuthListener(updateHeaderAuth);
    }
}

// ========================================
// USER MENU FUNCTIONS (Global)
// ========================================
function toggleUserMenu() {
    const dropdown = document.getElementById('saUserDropdown');
    if (dropdown) {
        dropdown.classList.toggle('open');
    }
}

function closeUserMenu() {
    const dropdown = document.getElementById('saUserDropdown');
    if (dropdown) {
        dropdown.classList.remove('open');
    }
}

// ========================================
// ACCOUNT MENU FUNCTIONS (New)
// ========================================
function toggleAccountMenu() {
    const menu = document.getElementById('saAccountMenu');
    if (menu) {
        menu.classList.toggle('open');
    }
}

function closeAccountMenu() {
    const menu = document.getElementById('saAccountMenu');
    if (menu) {
        menu.classList.remove('open');
    }
}

function handleAccountMenuAction(action) {
    closeAccountMenu();
    if (action === 'logout') {
        if (window.signOut) {
            window.signOut().then(() => {
                window.location.href = '/index.html';
            });
        }
    } else if (action === 'login') {
        if (window.openAuthModal) {
            window.openAuthModal();
        } else {
            window.location.href = '/login.html';
        }
    }
}

// Close account menu on outside click
document.addEventListener('click', (e) => {
    const accountSection = document.querySelector('.sidebar-account');
    if (accountSection && !accountSection.contains(e.target)) {
        closeAccountMenu();
    }
});

// ========================================
// OTHER GLOBAL FUNCTIONS
// ========================================
async function handleLogout() {
    closeUserMenu();
    if (window.signOut) {
        await window.signOut();
    }
}

function openAdminUtilities() {
    closeUserMenu();
    // On settings page, trigger the state change
    if (window.setShowR2Uploader) {
        window.setShowR2Uploader(true);
    } else if (window.SocietyArts?.AdminUtils?.R2StyleUploader) {
        // Navigate to settings if R2 uploader available but no state setter
        window.location.href = '/settings.html?openUploader=true';
    } else {
        window.location.href = '/settings.html';
    }
}

// Close dropdown on outside click
document.addEventListener('click', (e) => {
    const userMenu = document.getElementById('saUserMenu');
    if (userMenu && !userMenu.contains(e.target)) {
        closeUserMenu();
    }
});

// ========================================
// REACT COMPONENTS (if React is available)
// ========================================
if (typeof React !== 'undefined') {
    const { useState, useEffect, useRef, createElement: h } = React;

    // useHeaderAuth hook - for header.js internal use
    function useHeaderAuth() {
        const [authState, setAuthState] = useState({
            user: window.AuthState?.user || null,
            profile: window.AuthState?.profile || null,
            isLoading: window.AuthState?.isLoading ?? true
        });

        useEffect(() => {
            if (window.initializeAuth && !window.AuthState?.initialized) {
                window.initializeAuth();
            }

            const unsubscribe = window.addAuthListener?.((state) => {
                setAuthState({
                    user: state.user,
                    profile: state.profile,
                    isLoading: state.isLoading
                });
            });

            if (window.AuthState) {
                setAuthState({
                    user: window.AuthState.user,
                    profile: window.AuthState.profile,
                    isLoading: window.AuthState.isLoading
                });
            }

            return () => unsubscribe?.();
        }, []);

        return authState;
    }

    // Header Component
    const Header = () => {
        const { user, profile } = useHeaderAuth();
        const [dropdownOpen, setDropdownOpen] = useState(false);
        const [authModalOpen, setAuthModalOpen] = useState(false);
        const menuRef = useRef(null);

        useEffect(() => {
            const handleClickOutside = (e) => {
                if (menuRef.current && !menuRef.current.contains(e.target)) {
                    setDropdownOpen(false);
                }
            };
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, []);

        useEffect(() => {
            if (window.registerAuthModal) {
                window.registerAuthModal(() => setAuthModalOpen(true));
            }
        }, []);

        const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User';
        const initials = getInitials(displayName);
        const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
        const isSuperAdmin = profile?.role === 'super_admin';
        const roleLabel = isSuperAdmin ? 'Super Admin' : (isAdmin ? 'Admin' : null);

        const handleLogoutClick = async () => {
            setDropdownOpen(false);
            if (window.signOut) {
                await window.signOut();
            }
        };

        const AuthModal = window.SocietyArts?.AuthModal;

        return h(React.Fragment, null,
            h('header', { className: 'header', id: 'sa-header' },
                h('div', { className: 'header-brand' },
                    h('a', { href: '/index.html', className: 'header-logo-link' },
                        h('img', { src: SITE_CONFIG.logoMonogram, alt: SITE_CONFIG.siteName, className: 'header-logo-icon' }),
                        h('img', { src: SITE_CONFIG.logoWordmark, alt: SITE_CONFIG.siteName, className: 'header-logo-text' })
                    )
                ),
                h('div', { className: 'header-right' },
                    h('a', { href: '/story-builder.html', className: 'btn btn-primary new-project-btn' }, 'New Project'),
                    h('div', { className: 'header-auth' },
                        !user ?
                            h('button', {
                                className: 'btn btn-secondary',
                                onClick: () => setAuthModalOpen(true)
                            }, 'Log In') :
                            h('div', { className: 'user-menu-container', ref: menuRef },
                                h('button', {
                                    className: `user-avatar-btn ${dropdownOpen ? 'open' : ''}`,
                                    onClick: () => setDropdownOpen(!dropdownOpen)
                                },
                                    h('div', { className: 'user-avatar' }, h('span', null, initials)),
                                    h('span', { className: 'user-name' }, displayName),
                                    h('span', { className: 'user-menu-chevron', dangerouslySetInnerHTML: { __html: ICONS.chevronDown } })
                                ),
                                dropdownOpen && h('div', { className: 'user-dropdown open' },
                                    h('div', { className: 'user-dropdown-header' },
                                        h('div', { className: 'user-dropdown-name' }, displayName),
                                        h('div', { className: 'user-dropdown-email' }, user.email),
                                        roleLabel && h('span', { className: `user-dropdown-role ${isSuperAdmin ? 'super-admin' : ''}` }, roleLabel)
                                    ),
                                    h('a', { href: '/settings.html', className: 'user-dropdown-item' },
                                        h('span', { dangerouslySetInnerHTML: { __html: ICONS.settings } }),
                                        'Settings'
                                    ),
                                    isSuperAdmin && h('button', {
                                        className: 'user-dropdown-item',
                                        onClick: () => { setDropdownOpen(false); window.SocietyArts?.openAdminUtilities?.(); }
                                    },
                                        h('span', { dangerouslySetInnerHTML: { __html: ICONS.upload } }),
                                        'Admin Utilities'
                                    ),
                                    h('div', { className: 'user-dropdown-divider' }),
                                    h('button', { className: 'user-dropdown-item logout', onClick: handleLogoutClick },
                                        h('span', { dangerouslySetInnerHTML: { __html: ICONS.logout } }),
                                        'Sign Out'
                                    )
                                )
                            )
                    )
                )
            ),
            authModalOpen && AuthModal && h(AuthModal, {
                isOpen: authModalOpen,
                onClose: () => setAuthModalOpen(false)
            })
        );
    };

    // Sidebar Component - Updated with Account Menu
    const Sidebar = () => {
        const { user, profile } = useHeaderAuth();
        const [accountMenuOpen, setAccountMenuOpen] = useState(false);
        const currentPage = getCurrentPageId();
        const accountRef = useRef(null);
        
        const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User';
        const initials = getInitials(displayName);
        const menuItems = user ? ACCOUNT_MENU_LOGGED_IN : ACCOUNT_MENU_LOGGED_OUT;

        useEffect(() => {
            const handleClickOutside = (e) => {
                if (accountRef.current && !accountRef.current.contains(e.target)) {
                    setAccountMenuOpen(false);
                }
            };
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, []);
        
        useEffect(() => {
            const handleEscape = (e) => {
                if (e.key === 'Escape') setAccountMenuOpen(false);
            };
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }, []);

        const handleMenuItemClick = (item) => {
            if (item.action === 'logout') {
                if (window.signOut) {
                    window.signOut().then(() => {
                        window.location.href = '/index.html';
                    });
                }
            } else if (item.action === 'login') {
                if (window.openAuthModal) {
                    window.openAuthModal();
                }
            }
            setAccountMenuOpen(false);
        };

        return h('aside', { className: 'sidebar', id: 'sa-sidebar' },
            h('nav', { className: 'sidebar-nav sidebar-nav-main' },
                h('ul', null,
                    NAV_ITEMS.map(item =>
                        h('li', { key: item.id },
                            h('a', {
                                href: item.href,
                                className: `sidebar-nav-item ${currentPage === item.id ? 'active' : ''}`
                            },
                                h('span', { className: 'sidebar-nav-icon', dangerouslySetInnerHTML: { __html: ICONS[item.icon] } }),
                                h('span', { className: 'sidebar-nav-label' }, item.label)
                            )
                        )
                    )
                )
            ),
            h('div', { className: 'sidebar-account', ref: accountRef },
                accountMenuOpen && h('div', { className: 'account-menu open' },
                    user && h('div', { className: 'account-menu-header' },
                        h('span', { className: 'account-menu-name' }, displayName)
                    ),
                    h('div', { className: 'account-menu-items' },
                        menuItems.map((item, index) =>
                            item.type === 'divider'
                                ? h('div', { key: `divider-${index}`, className: 'account-menu-divider' })
                                : h('a', {
                                    key: item.id,
                                    href: item.href || '#',
                                    className: 'account-menu-item',
                                    onClick: (e) => {
                                        if (item.action) {
                                            e.preventDefault();
                                            handleMenuItemClick(item);
                                        }
                                    }
                                },
                                    h('span', { className: 'account-menu-item-icon', dangerouslySetInnerHTML: { __html: ICONS[item.icon] } }),
                                    h('span', { className: 'account-menu-item-label' }, item.label)
                                )
                        )
                    )
                ),
                h('button', {
                    className: 'account-trigger',
                    onClick: () => setAccountMenuOpen(!accountMenuOpen),
                    title: user ? 'Account menu' : 'Help & Info'
                },
                    user
                        ? h('span', { className: 'account-trigger-initials' }, initials)
                        : h('span', { className: 'account-trigger-question', dangerouslySetInnerHTML: { __html: ICONS.questionMark } }),
                    h('span', { className: 'account-trigger-name' }, user ? displayName : 'Help & Info')
                )
            )
        );
    };

    // Footer Component
    const Footer = () => {
        return h('footer', { className: 'site-footer', id: 'sa-footer' },
            h('div', { className: 'footer-content' },
                h('p', null, `© ${SITE_CONFIG.year} Society Arts. All rights reserved.`)
            )
        );
    };

    // Icons object for React
    const ReactIcons = {};
    Object.keys(ICONS).forEach(key => {
        ReactIcons[key] = (props = {}) => h('span', { ...props, dangerouslySetInnerHTML: { __html: ICONS[key] } });
    });

    // Export React components
    window.SocietyArts = window.SocietyArts || {};
    Object.assign(window.SocietyArts, {
        Header,
        Sidebar,
        Footer,
        Icons: ReactIcons,
        useHeaderAuth
        // NOTE: Do NOT export useAuth here - auth.js already exports it
    });
}

// ========================================
// GLOBAL EXPORTS
// ========================================
window.SocietyArts = window.SocietyArts || {};
Object.assign(window.SocietyArts, {
    ICONS,
    SITE_CONFIG,
    NAV_ITEMS,
    generateHeaderHTML,
    generateSidebarHTML,
    generateFooterHTML,
    injectComponents,
    updateHeaderAuth,
    toggleUserMenu,
    closeUserMenu,
    handleLogout,
    openAdminUtilities,
    toggleAccountMenu,
    closeAccountMenu,
    handleAccountMenuAction,
    getCurrentPageId,
    getInitials
});

// ========================================
// AUTO-INITIALIZE FOR VANILLA JS PAGES
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    // Check if this is a vanilla JS page (no React babel script)
    const hasBabelScript = document.querySelector('script[type="text/babel"]');
    
    // For vanilla pages, inject components after auth is ready
    if (!hasBabelScript) {
        // Wait for auth.js to be loaded (it sets window.initializeAuth)
        let attempts = 0;
        const maxAttempts = 50;
        
        const waitForAuth = () => {
            attempts++;
            if (window.initializeAuth) {
                window.initializeAuth().then(() => {
                    injectComponents();
                });
            } else if (attempts < maxAttempts) {
                setTimeout(waitForAuth, 100);
            } else {
                // Auth not available after timeout, inject anyway
                console.warn('Auth not available, injecting components without auth');
                injectComponents();
            }
        };
        
        waitForAuth();
    }
});

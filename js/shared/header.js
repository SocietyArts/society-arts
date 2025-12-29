/* ========================================
   SOCIETY ARTS - UNIFIED HEADER SYSTEM
   Single source of truth for header/sidebar across ALL pages
   Version: 7.0 - Logo image header, fixed sidebar
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

const NAV_ITEMS = [
    { id: 'home', label: 'Home', href: '/index.html', icon: 'home' },
    { id: 'story-builder', label: 'Story Builder', href: '/story-builder.html', icon: 'edit' },
    { id: 'style-finder', label: 'Style Finder', href: '/style-finder.html', icon: 'grid' },
    { id: 'favorites', label: 'Favorites', href: '/favorites.html', icon: 'heart' },
    { id: 'collections', label: 'Collections', href: '/collections.html', icon: 'layers' }
];

const BOTTOM_NAV_ITEMS = [
    { id: 'settings', label: 'Settings', href: '/settings.html', icon: 'settings' },
    { id: 'help', label: 'Help', href: '#', icon: 'help', action: 'openHelp' }
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
    close: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
    book: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`,
    video: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>`,
    messageCircle: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>`,
    mail: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`,
    arrowRight: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`,
    upload: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>`,
    users: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`
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
// HELP MODAL SYSTEM
// ========================================
let helpModalOpen = false;

function openHelpModal() {
    if (document.getElementById('sa-help-modal')) return;
    
    helpModalOpen = true;
    
    const helpItems = [
        { icon: 'book', title: 'Documentation', desc: 'Learn how to use Society Arts', href: '/under-construction.html?feature=Documentation' },
        { icon: 'video', title: 'Video Tutorials', desc: 'Watch step-by-step guides', href: '/tutorials.html' },
        { icon: 'messageCircle', title: 'Community', desc: 'Join discussions with other artists', href: '/under-construction.html?feature=Community' },
        { icon: 'mail', title: 'Contact Support', desc: 'Get help from our team', href: 'mailto:support@societyarts.com' }
    ];
    
    const modalHtml = `
        <div class="help-modal-overlay" id="sa-help-modal" onclick="closeHelpModal()">
            <div class="help-modal" onclick="event.stopPropagation()">
                <div class="help-modal-header">
                    <h3>Help & Resources</h3>
                    <button class="help-modal-close" onclick="closeHelpModal()">${ICONS.close}</button>
                </div>
                <div class="help-modal-content">
                    ${helpItems.map(item => `
                        <a href="${item.href}" class="help-modal-item">
                            <span class="help-modal-item-icon">${ICONS[item.icon]}</span>
                            <div class="help-modal-item-text">
                                <span class="help-modal-item-title">${item.title}</span>
                                <span class="help-modal-item-desc">${item.desc}</span>
                            </div>
                        </a>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function closeHelpModal() {
    const modal = document.getElementById('sa-help-modal');
    if (modal) {
        modal.remove();
        helpModalOpen = false;
    }
}

// Make globally available
window.openHelpModal = openHelpModal;
window.closeHelpModal = closeHelpModal;
window.openHelp = openHelpModal;

// ========================================
// HEADER HTML GENERATOR
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
// SIDEBAR HTML GENERATOR
// ========================================
function generateSidebarHTML() {
    const currentPage = getCurrentPageId();
    
    const mainNavItems = NAV_ITEMS.map(item => `
        <li>
            <a href="${item.href}" class="sidebar-nav-item ${currentPage === item.id ? 'active' : ''}"
               ${item.action ? `onclick="event.preventDefault(); window.${item.action}()"` : ''}>
                <span class="sidebar-nav-icon">${ICONS[item.icon]}</span>
                <span class="sidebar-nav-label">${item.label}</span>
            </a>
        </li>
    `).join('');
    
    const bottomNavItems = BOTTOM_NAV_ITEMS.map(item => `
        <li>
            <a href="${item.href}" class="sidebar-nav-item ${currentPage === item.id ? 'active' : ''}"
               ${item.action ? `onclick="event.preventDefault(); window.${item.action}()"` : ''}>
                <span class="sidebar-nav-icon">${ICONS[item.icon]}</span>
                <span class="sidebar-nav-label">${item.label}</span>
            </a>
        </li>
    `).join('');
    
    return `
        <aside class="sidebar" id="sa-sidebar">
            <nav class="sidebar-nav sidebar-nav-main">
                <ul>${mainNavItems}</ul>
            </nav>
            <nav class="sidebar-nav sidebar-nav-bottom">
                <ul>${bottomNavItems}</ul>
            </nav>
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
}

function injectComponents() {
    const user = window.AuthState?.user;
    const profile = window.AuthState?.profile;
    
    // Inject sidebar if not present
    if (!document.getElementById('sa-sidebar')) {
        const existingSidebar = document.querySelector('aside.sidebar');
        if (existingSidebar) {
            existingSidebar.outerHTML = generateSidebarHTML();
        } else {
            document.body.insertAdjacentHTML('afterbegin', generateSidebarHTML());
        }
    }
    
    // Inject header if not present
    if (!document.getElementById('sa-header')) {
        const existingHeader = document.querySelector('header.header');
        
        if (existingHeader) {
            existingHeader.outerHTML = generateHeaderHTML(user, profile);
        } else {
            const sidebar = document.getElementById('sa-sidebar');
            if (sidebar) {
                sidebar.insertAdjacentHTML('afterend', generateHeaderHTML(user, profile));
            } else {
                document.body.insertAdjacentHTML('afterbegin', generateHeaderHTML(user, profile));
            }
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

    // useHeaderAuth hook
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

    // Sidebar Component
    const Sidebar = () => {
        const [helpModalOpen, setHelpModalOpen] = useState(false);
        const currentPage = getCurrentPageId();

        return h(React.Fragment, null,
            h('aside', { className: 'sidebar', id: 'sa-sidebar' },
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
                h('nav', { className: 'sidebar-nav sidebar-nav-bottom' },
                    h('ul', null,
                        BOTTOM_NAV_ITEMS.map(item =>
                            h('li', { key: item.id },
                                h('a', {
                                    href: item.href,
                                    className: `sidebar-nav-item ${currentPage === item.id ? 'active' : ''}`,
                                    onClick: (e) => {
                                        if (item.action === 'openHelp') {
                                            e.preventDefault();
                                            setHelpModalOpen(true);
                                        }
                                    }
                                },
                                    h('span', { className: 'sidebar-nav-icon', dangerouslySetInnerHTML: { __html: ICONS[item.icon] } }),
                                    h('span', { className: 'sidebar-nav-label' }, item.label)
                                )
                            )
                        )
                    )
                )
            ),
            helpModalOpen && h(HelpModal, { isOpen: helpModalOpen, onClose: () => setHelpModalOpen(false) })
        );
    };

    // Help Modal Component
    const HelpModal = ({ isOpen, onClose }) => {
        if (!isOpen) return null;

        const helpItems = [
            { icon: 'book', title: 'Documentation', desc: 'Learn how to use Society Arts', href: '/under-construction.html?feature=Documentation' },
            { icon: 'video', title: 'Video Tutorials', desc: 'Watch step-by-step guides', href: '/tutorials.html' },
            { icon: 'messageCircle', title: 'Community', desc: 'Join discussions with other artists', href: '/under-construction.html?feature=Community' },
            { icon: 'mail', title: 'Contact Support', desc: 'Get help from our team', href: 'mailto:support@societyarts.com' }
        ];

        return h('div', { className: 'help-modal-overlay', onClick: onClose },
            h('div', { className: 'help-modal', onClick: (e) => e.stopPropagation() },
                h('div', { className: 'help-modal-header' },
                    h('h3', null, 'Help & Resources'),
                    h('button', { className: 'help-modal-close', onClick: onClose, dangerouslySetInnerHTML: { __html: ICONS.close } })
                ),
                h('div', { className: 'help-modal-content' },
                    helpItems.map((item, i) =>
                        h('a', { key: i, href: item.href, className: 'help-modal-item' },
                            h('span', { className: 'help-modal-item-icon', dangerouslySetInnerHTML: { __html: ICONS[item.icon] } }),
                            h('div', { className: 'help-modal-item-text' },
                                h('span', { className: 'help-modal-item-title' }, item.title),
                                h('span', { className: 'help-modal-item-desc' }, item.desc)
                            )
                        )
                    )
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
        HelpModal,
        Icons: ReactIcons,
        useHeaderAuth,
        useAuth: useHeaderAuth // Alias for compatibility
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
    openHelpModal,
    closeHelpModal,
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
        if (window.initializeAuth) {
            window.initializeAuth().then(() => {
                injectComponents();
            });
        } else {
            // Auth not available, inject anyway
            injectComponents();
        }
    }
});

/* ========================================
   SOCIETY ARTS - UNIFIED HEADER SYSTEM
   Version: 8.1 - Account Menu System (FIXED)
   - Uses useAuth from auth.js (no duplicate)
   - Removed Settings & Help from sidebar
   - Added Account Trigger (? or avatar)
   - Added Account Menu popup
   - Added "Try Society Arts" button
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

// Main navigation - Settings & Help REMOVED (now in Account Menu)
const NAV_ITEMS = [
    { id: 'home', label: 'Home', href: '/index.html', icon: 'home' },
    { id: 'story-builder', label: 'Story Builder', href: '/story-builder.html', icon: 'edit' },
    { id: 'style-finder', label: 'Style Finder', href: '/style-finder.html', icon: 'grid' },
    { id: 'favorites', label: 'Favorites', href: '/favorites.html', icon: 'heart' },
    { id: 'projects', label: 'Projects', href: '/projects.html', icon: 'folder' }
];

// Account Menu Items - different for logged in vs logged out
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
// ICONS
// ========================================
const ICONS = {
    home: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
    edit: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
    grid: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`,
    heart: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
    folder: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`,
    layers: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>`,
    settings: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
    help: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
    info: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
    lightbulb: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="9" y1="18" x2="15" y2="18"></line><line x1="10" y1="22" x2="14" y2="22"></line><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"></path></svg>`,
    video: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>`,
    helpCircle: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
    logout: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>`,
    login: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>`,
    close: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
    chevronRight: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>`,
    questionMark: `<svg width="24" height="24" viewBox="0 0 512 512" fill="#3E2318"><path d="M256,0C114.616,0,0,114.612,0,256s114.616,256,256,256s256-114.612,256-256S397.385,0,256,0z M207.678,378.794c0-17.612,14.281-31.893,31.893-31.893c17.599,0,31.88,14.281,31.88,31.893c0,17.595-14.281,31.884-31.88,31.884C221.959,410.678,207.678,396.389,207.678,378.794z M343.625,218.852c-3.596,9.793-8.802,18.289-14.695,25.356c-11.847,14.148-25.888,22.718-37.442,29.041c-7.719,4.174-14.533,7.389-18.769,9.769c-2.905,1.604-4.479,2.95-5.256,3.826c-0.768,0.926-1.029,1.306-1.496,2.826c-0.273,1.009-0.558,2.612-0.558,5.091c0,6.868,0,12.512,0,12.512c0,6.472-5.248,11.728-11.723,11.728h-28.252c-6.475,0-11.732-5.256-11.732-11.728c0,0,0-5.645,0-12.512c0-6.438,0.752-12.744,2.405-18.777c1.636-6.008,4.215-11.718,7.508-16.694c6.599-10.083,15.542-16.802,23.984-21.48c7.401-4.074,14.723-7.455,21.516-11.281c6.789-3.793,12.843-7.91,17.302-12.372c2.988-2.975,5.31-6.05,7.087-9.52c2.335-4.628,3.955-10.067,3.992-18.389c0.012-2.463-0.698-5.702-2.632-9.405c-1.926-3.686-5.066-7.694-9.264-11.29c-8.45-7.248-20.843-12.545-35.054-12.521c-16.285,0.058-27.186,3.876-35.587,8.62c-8.36,4.776-11.029,9.595-11.029,9.595c-4.268,3.718-10.603,3.85-15.025,0.314l-21.71-17.397c-2.719-2.173-4.322-5.438-4.396-8.926c-0.063-3.479,1.425-6.81,4.061-9.099c0,0,6.765-10.43,22.451-19.38c15.62-8.992,36.322-15.488,61.236-15.429c20.215,0,38.839,5.562,54.268,14.661c15.434,9.148,27.897,21.744,35.851,36.876c5.281,10.074,8.525,21.43,8.533,33.38C349.211,198.042,347.248,209.058,343.625,218.852z"/></svg>`
};

// ========================================
// HELPER FUNCTIONS
// ========================================
const h = React.createElement;

function getInitialsFromHeader(name, email) {
    if (name) {
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }
    if (email) {
        return email.substring(0, 2).toUpperCase();
    }
    return '?';
}

function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop().replace('.html', '') || 'index';
    return page === 'index' ? 'home' : page;
}

// ========================================
// SIDEBAR COMPONENT
// ========================================
const Sidebar = ({ user, profile, onLogout }) => {
    const [accountMenuOpen, setAccountMenuOpen] = React.useState(false);
    const accountMenuRef = React.useRef(null);
    const currentPage = getCurrentPage();
    
    // Close menu when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (e) => {
            if (accountMenuRef.current && !accountMenuRef.current.contains(e.target)) {
                setAccountMenuOpen(false);
            }
        };
        if (accountMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [accountMenuOpen]);
    
    // Close on escape
    React.useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') setAccountMenuOpen(false);
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);
    
    const handleMenuItemClick = (item) => {
        if (item.action === 'logout') {
            // Use signOut from auth.js
            if (typeof window.signOut === 'function') {
                window.signOut().then(() => {
                    window.location.href = '/index.html';
                });
            } else if (onLogout) {
                onLogout();
            }
        } else if (item.action === 'login') {
            // Use openAuthModal from auth.js
            if (typeof window.openAuthModal === 'function') {
                window.openAuthModal();
            } else {
                window.location.href = '/login?returnTo=' + encodeURIComponent(window.location.pathname);
            }
        } else if (item.href) {
            window.location.href = item.href;
        }
        setAccountMenuOpen(false);
    };
    
    const menuItems = user ? ACCOUNT_MENU_LOGGED_IN : ACCOUNT_MENU_LOGGED_OUT;
    const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User';
    
    return h('aside', { className: 'sidebar' },
        // Logo
        h('div', { className: 'sidebar-logo' },
            h('a', { href: '/index.html', className: 'sidebar-logo-link' },
                h('img', { 
                    src: SITE_CONFIG.logoMonogram, 
                    alt: SITE_CONFIG.siteName,
                    className: 'sidebar-logo-img'
                })
            )
        ),
        
        // Main Navigation
        h('nav', { className: 'sidebar-nav' },
            h('ul', { className: 'sidebar-nav-list' },
                NAV_ITEMS.map(item => 
                    h('li', { key: item.id, className: 'sidebar-nav-item' },
                        h('a', { 
                            href: item.href,
                            className: `sidebar-nav-link ${currentPage === item.id ? 'active' : ''}`,
                            title: item.label
                        },
                            h('span', { 
                                className: 'sidebar-nav-icon',
                                dangerouslySetInnerHTML: { __html: ICONS[item.icon] }
                            }),
                            h('span', { className: 'sidebar-nav-label' }, item.label)
                        )
                    )
                )
            )
        ),
        
        // Spacer
        h('div', { className: 'sidebar-spacer' }),
        
        // Account Trigger (Bottom)
        h('div', { className: 'sidebar-account', ref: accountMenuRef },
            // Account Menu (pops up above trigger)
            accountMenuOpen && h('div', { className: 'account-menu' },
                // User name at top (only if logged in)
                user && h('div', { className: 'account-menu-header' },
                    h('span', { className: 'account-menu-name' }, displayName)
                ),
                
                // Menu items
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
                                h('span', { 
                                    className: 'account-menu-item-icon',
                                    dangerouslySetInnerHTML: { __html: ICONS[item.icon] }
                                }),
                                h('span', { className: 'account-menu-item-label' }, item.label)
                            )
                    )
                )
            ),
            
            // Trigger Button
            h('button', { 
                className: 'account-trigger',
                onClick: () => setAccountMenuOpen(!accountMenuOpen),
                title: user ? 'Account menu' : 'Help & Info'
            },
                user 
                    ? (profile?.avatar_url 
                        ? h('img', { 
                            src: profile.avatar_url, 
                            alt: displayName,
                            className: 'account-trigger-avatar'
                        })
                        : h('span', { className: 'account-trigger-initials' }, 
                            getInitialsFromHeader(profile?.display_name, user?.email)
                        )
                    )
                    : h('span', { 
                        className: 'account-trigger-question',
                        dangerouslySetInnerHTML: { __html: ICONS.questionMark }
                    })
            )
        )
    );
};

// ========================================
// HEADER COMPONENT
// ========================================
const Header = ({ user, profile }) => {
    return h('header', { className: 'header' },
        // Left side - Logo wordmark
        h('div', { className: 'header-left' },
            h('a', { href: '/index.html', className: 'header-logo-link' },
                h('img', { 
                    src: SITE_CONFIG.logoWordmark, 
                    alt: SITE_CONFIG.siteName,
                    className: 'header-logo-img'
                })
            )
        ),
        
        // Right side - Try Society Arts button (only if not logged in)
        h('div', { className: 'header-right' },
            !user && h('a', { 
                href: '#',
                className: 'try-button',
                onClick: (e) => {
                    e.preventDefault();
                    if (typeof window.openAuthModal === 'function') {
                        window.openAuthModal();
                    } else {
                        window.location.href = '/login?returnTo=' + encodeURIComponent(window.location.pathname);
                    }
                }
            }, 'Try Society Arts')
        )
    );
};

// ========================================
// EXPORT - NO useAuth here (use from auth.js)
// ========================================
window.SocietyArts = window.SocietyArts || {};
window.SocietyArts.Sidebar = Sidebar;
window.SocietyArts.Header = Header;
window.SocietyArts.ICONS = ICONS;
window.SocietyArts.SITE_CONFIG = SITE_CONFIG;

// For pages that use these directly
window.Sidebar = Sidebar;
window.Header = Header;

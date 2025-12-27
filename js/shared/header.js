// ============================================
// SOCIETY ARTS - UNIFIED HEADER SYSTEM
// A++ Brand Standards v3.0
// ============================================
// Works with both React and vanilla JS pages.
// Edit HEADER_CONFIG to change site-wide.
// ============================================

// ============================================
// SHARED CONFIGURATION
// ============================================
const HEADER_CONFIG = {
    logoUrl: 'https://pub-acb560f551f141db830964aed1fa005f.r2.dev/site-assets/SA_Wordmark_Brown%401x.png',
    logoAlt: 'Society Arts',
    
    navItems: [
        { id: 'story-builder', label: 'Story Builder', href: 'story-builder.html', icon: 'edit' },
        { id: 'style-finder', label: 'Style Finder', href: 'style-finder.html', icon: 'palette' },
        { type: 'divider' },
        { id: 'your-work', label: 'Your Work', href: 'projects.html', icon: 'folder' },
        { id: 'favorites', label: 'Favorites', href: 'favorites.html', icon: 'heart' },
        { type: 'divider' },
        { id: 'prints-pricing', label: 'Prints & Pricing', href: 'under-construction.html?feature=Prints%20%26%20Pricing', icon: 'dollar' },
        { id: 'help', label: 'Help', href: 'under-construction.html?feature=Help', icon: 'help' }
    ]
};

// ============================================
// SVG ICONS
// ============================================
const HEADER_ICONS = {
    hamburger: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`,
    close: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
    cart: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>`,
    user: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
    chevronDown: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>`,
    logout: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>`,
    users: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
    edit: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>`,
    palette: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="13.5" cy="6.5" r="2"></circle><circle cx="17.5" cy="10.5" r="2"></circle><circle cx="8.5" cy="7.5" r="2"></circle><circle cx="6.5" cy="12.5" r="2"></circle><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z"></path></svg>`,
    folder: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`,
    heart: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
    dollar: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`,
    help: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
    arrowRight: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`
};

// ============================================
// DETECT CURRENT PAGE
// ============================================
function getCurrentPageId() {
    const path = window.location.pathname;
    const page = path.split('/').pop().replace('.html', '') || 'index';
    const pageMap = {
        'story-builder': 'story-builder',
        'style-finder': 'style-finder',
        'projects': 'your-work',
        'favorites': 'favorites',
        'index': null
    };
    return pageMap[page] || null;
}

// ============================================
// VANILLA JS FUNCTIONS
// ============================================
function toggleNavSidebar() {
    const sidebar = document.getElementById('navSidebar');
    const overlay = document.getElementById('navOverlay');
    if (sidebar && overlay) {
        const isOpen = sidebar.classList.toggle('open');
        overlay.classList.toggle('open');
        document.body.style.overflow = isOpen ? 'hidden' : '';
    }
}

function closeNavSidebar() {
    const sidebar = document.getElementById('navSidebar');
    const overlay = document.getElementById('navOverlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
}

function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) dropdown.classList.toggle('open');
}

function closeUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) dropdown.classList.remove('open');
}

// Export to window for vanilla JS pages
window.toggleNavSidebar = toggleNavSidebar;
window.closeNavSidebar = closeNavSidebar;
window.toggleUserMenu = toggleUserMenu;
window.closeUserMenu = closeUserMenu;
window.HEADER_CONFIG = HEADER_CONFIG;
window.HEADER_ICONS = HEADER_ICONS;

// ============================================
// REACT COMPONENTS (for story-builder)
// ============================================
if (typeof React !== 'undefined') {
    const { useState, useEffect } = React;

    // Icon component
    const Icon = ({ name, size = 20 }) => {
        return React.createElement('span', {
            className: 'icon',
            dangerouslySetInnerHTML: { __html: HEADER_ICONS[name] || '' }
        });
    };

    // Header Component
    const Header = ({ user, profile, onAuthClick }) => {
        const [dropdownOpen, setDropdownOpen] = useState(false);

        useEffect(() => {
            const handleClickOutside = (e) => {
                if (!e.target.closest('.user-menu-container')) {
                    setDropdownOpen(false);
                }
            };
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }, []);

        const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User';
        const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        const isAdmin = profile?.role === 'admin';

        return React.createElement('header', { className: 'header' },
            // Left side
            React.createElement('div', { className: 'header-left' },
                React.createElement('button', {
                    className: 'hamburger-btn',
                    onClick: toggleNavSidebar,
                    'aria-label': 'Open menu',
                    dangerouslySetInnerHTML: { __html: HEADER_ICONS.hamburger }
                }),
                React.createElement('a', { href: 'index.html', className: 'logo' },
                    React.createElement('img', {
                        src: HEADER_CONFIG.logoUrl,
                        alt: HEADER_CONFIG.logoAlt,
                        className: 'logo-image'
                    })
                )
            ),
            // Right side
            React.createElement('div', { className: 'header-right' },
                React.createElement('button', {
                    className: 'btn-icon cart-btn',
                    onClick: () => window.location.href = 'under-construction.html?feature=Shopping%20Cart',
                    'aria-label': 'Cart',
                    dangerouslySetInnerHTML: { __html: HEADER_ICONS.cart }
                }),
                React.createElement('a', {
                    href: 'story-builder.html',
                    className: 'btn btn-primary new-project-btn'
                }, 'New Project'),
                // Auth section
                React.createElement('div', { className: 'header-auth' },
                    !user ? 
                        React.createElement('button', {
                            className: 'btn btn-secondary',
                            onClick: onAuthClick || (() => typeof openAuthModal === 'function' && openAuthModal())
                        }, 'Log In') :
                        React.createElement('div', { className: 'user-menu-container' },
                            React.createElement('button', {
                                className: 'user-avatar-btn',
                                onClick: (e) => { e.stopPropagation(); setDropdownOpen(!dropdownOpen); }
                            },
                                React.createElement('div', { className: 'user-avatar' },
                                    React.createElement('span', null, initials)
                                ),
                                React.createElement('span', { className: 'user-name' }, displayName),
                                React.createElement('span', { dangerouslySetInnerHTML: { __html: HEADER_ICONS.chevronDown } })
                            ),
                            React.createElement('div', { className: `user-dropdown ${dropdownOpen ? 'open' : ''}` },
                                React.createElement('div', { className: 'user-dropdown-header' },
                                    React.createElement('div', { className: 'user-dropdown-name' }, displayName),
                                    React.createElement('div', { className: 'user-dropdown-email' }, user.email),
                                    isAdmin && React.createElement('span', { className: 'user-dropdown-role' }, 'Admin')
                                ),
                                React.createElement('button', {
                                    className: 'user-dropdown-item',
                                    onClick: () => typeof openProfileModal === 'function' && openProfileModal()
                                },
                                    React.createElement('span', { dangerouslySetInnerHTML: { __html: HEADER_ICONS.user } }),
                                    'Profile'
                                ),
                                isAdmin && React.createElement('button', {
                                    className: 'user-dropdown-item',
                                    onClick: () => typeof openAdminUsersModal === 'function' && openAdminUsersModal()
                                },
                                    React.createElement('span', { dangerouslySetInnerHTML: { __html: HEADER_ICONS.users } }),
                                    'Manage Users'
                                ),
                                React.createElement('div', { className: 'user-dropdown-divider' }),
                                React.createElement('button', {
                                    className: 'user-dropdown-item logout',
                                    onClick: () => typeof handleLogout === 'function' && handleLogout()
                                },
                                    React.createElement('span', { dangerouslySetInnerHTML: { __html: HEADER_ICONS.logout } }),
                                    'Sign Out'
                                )
                            )
                        )
                )
            )
        );
    };

    // Navigation Sidebar Component
    const NavSidebar = () => {
        const currentPageId = getCurrentPageId();
        
        useEffect(() => {
            const handleEscape = (e) => {
                if (e.key === 'Escape') closeNavSidebar();
            };
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }, []);

        return React.createElement(React.Fragment, null,
            React.createElement('div', {
                className: 'nav-overlay',
                id: 'navOverlay',
                onClick: closeNavSidebar
            }),
            React.createElement('nav', { className: 'nav-sidebar', id: 'navSidebar' },
                React.createElement('div', { className: 'nav-header' },
                    React.createElement('img', {
                        src: HEADER_CONFIG.logoUrl,
                        alt: HEADER_CONFIG.logoAlt,
                        className: 'nav-logo'
                    }),
                    React.createElement('button', {
                        className: 'nav-close-btn',
                        onClick: closeNavSidebar,
                        dangerouslySetInnerHTML: { __html: HEADER_ICONS.close }
                    })
                ),
                React.createElement('div', { className: 'nav-content' },
                    React.createElement('ul', { className: 'nav-list' },
                        HEADER_CONFIG.navItems.map((item, index) => {
                            if (item.type === 'divider') {
                                return React.createElement('li', { key: index, className: 'nav-divider' });
                            }
                            const isActive = item.id === currentPageId;
                            return React.createElement('li', { key: index, className: 'nav-item' },
                                React.createElement('a', {
                                    href: item.href,
                                    className: `nav-link ${isActive ? 'active' : ''}`
                                },
                                    React.createElement('span', {
                                        className: 'nav-link-icon',
                                        dangerouslySetInnerHTML: { __html: HEADER_ICONS[item.icon] || '' }
                                    }),
                                    item.label
                                )
                            );
                        })
                    )
                )
            )
        );
    };

    // Subheader Component
    const Subheader = ({ title, subtitle }) => {
        return React.createElement('div', { className: 'subheader' },
            React.createElement('h1', { className: 'subheader-title' }, title),
            subtitle && React.createElement('p', { className: 'subheader-text' }, subtitle)
        );
    };

    // Footer Component  
    const Footer = ({ children }) => {
        return React.createElement('footer', { className: 'footer' }, children);
    };

    // Format Selector Component
    const FormatSelector = ({ value, onChange }) => {
        const [isOpen, setIsOpen] = useState(false);
        
        const formats = [
            { value: '1:1', label: '1:1', desc: 'Square' },
            { value: '4:3', label: '4:3', desc: 'Standard' },
            { value: '16:9', label: '16:9', desc: 'Widescreen' },
            { value: '9:16', label: '9:16', desc: 'Portrait' },
            { value: '3:2', label: '3:2', desc: 'Classic' }
        ];

        const currentFormat = formats.find(f => f.value === value) || formats[0];

        return React.createElement('div', { className: 'format-selector', onClick: () => setIsOpen(!isOpen) },
            React.createElement('span', { className: 'format-selector-label' }, 'Format'),
            React.createElement('span', { className: 'format-selector-value' }, currentFormat.label),
            React.createElement('div', { className: `format-dropdown ${isOpen ? 'open' : ''}` },
                formats.map(format => 
                    React.createElement('div', {
                        key: format.value,
                        className: `format-option ${format.value === value ? 'selected' : ''}`,
                        onClick: (e) => { e.stopPropagation(); onChange(format.value); setIsOpen(false); }
                    },
                        React.createElement('div', { className: 'format-option-icon' }),
                        React.createElement('span', { className: 'format-option-label' }, `${format.label} ${format.desc}`)
                    )
                )
            )
        );
    };

    // Export React components
    window.SocietyArts = window.SocietyArts || {};
    window.SocietyArts.Header = Header;
    window.SocietyArts.NavSidebar = NavSidebar;
    window.SocietyArts.Subheader = Subheader;
    window.SocietyArts.Footer = Footer;
    window.SocietyArts.FormatSelector = FormatSelector;
    
    // Create React icon components from SVG strings
    const Icons = {};
    Object.keys(HEADER_ICONS).forEach(key => {
        Icons[key] = (props) => React.createElement('span', {
            className: `icon ${props?.className || ''}`,
            style: props?.style,
            dangerouslySetInnerHTML: { __html: HEADER_ICONS[key] }
        });
    });
    window.SocietyArts.Icons = Icons;
}

// ============================================
// SOCIETY ARTS - UNIFIED HEADER & SIDEBAR
// A++ Brand Standards v4.0
// ============================================
// Persistent left sidebar (Supabase-style)
// Expands on hover to show labels
// ============================================

// ============================================
// CONFIGURATION
// ============================================
const SIDEBAR_CONFIG = {
    // Logo URLs
    monogramUrl: 'https://pub-acb560f551f141db830964aed1fa005f.r2.dev/site-assets/SA_Monogram_Black%401x%201x1.png',
    wordmarkUrl: 'https://pub-acb560f551f141db830964aed1fa005f.r2.dev/site-assets/SA_Wordmark_Brown%401x.png',
    logoAlt: 'Society Arts',
    
    // Main navigation items - Updated order: Home, Story Builder, Style Finder, Favorites, Collections
    navItems: [
        { id: 'home', label: 'Home', href: 'index.html', icon: 'home' },
        { id: 'story-builder', label: 'Story Builder', href: 'story-builder.html', icon: 'edit' },
        { id: 'style-finder', label: 'Style Finder', href: 'style-finder.html', icon: 'grid' },
        { id: 'favorites', label: 'Favorites', href: 'favorites.html', icon: 'heart' },
        { id: 'collections', label: 'Collections', href: 'collections.html', icon: 'layers' }
    ],
    
    // Bottom navigation items
    bottomItems: [
        { id: 'settings', label: 'Settings', href: 'settings.html', icon: 'settings' },
        { id: 'help', label: 'Help', href: '#', icon: 'help', action: 'openHelp' }
    ]
};

// ============================================
// SVG ICONS
// ============================================
const HEADER_ICONS = {
    // Navigation icons
    home: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
    grid: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`,
    edit: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>`,
    heart: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
    folder: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`,
    layers: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>`,
    settings: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
    help: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
    
    // Header icons
    cart: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>`,
    user: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
    chevronDown: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>`,
    logout: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>`,
    users: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
    close: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
    filter: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>`,
    
    // Help modal icons
    book: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`,
    video: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>`,
    messageCircle: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>`,
    mail: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`,
    arrowRight: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`
};

// ============================================
// DETECT CURRENT PAGE
// ============================================
function getCurrentPageId() {
    const path = window.location.pathname;
    const page = path.split('/').pop().replace('.html', '') || 'index';
    const pageMap = {
        'index': 'home',
        'style-finder': 'style-finder',
        'style-finder-2': 'style-finder',
        'story-builder': 'story-builder',
        'favorites': 'favorites',
        'collections': 'collections',
        'projects': 'collections'
    };
    return pageMap[page] || 'home';
}

// ============================================
// VANILLA JS FUNCTIONS
// ============================================
function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) dropdown.classList.toggle('open');
}

function closeUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) dropdown.classList.remove('open');
}

function openHelpModal() {
    const modal = document.getElementById('helpModal');
    if (modal) modal.classList.add('open');
}

function closeHelpModal() {
    const modal = document.getElementById('helpModal');
    if (modal) modal.classList.remove('open');
}

function openSettingsModal() {
    // For now, redirect to under construction
    window.location.href = 'under-construction.html?feature=Settings';
}

// Export to window for vanilla JS pages
window.toggleUserMenu = toggleUserMenu;
window.closeUserMenu = closeUserMenu;
window.openHelpModal = openHelpModal;
window.closeHelpModal = closeHelpModal;
window.openSettingsModal = openSettingsModal;
window.SIDEBAR_CONFIG = SIDEBAR_CONFIG;
window.HEADER_ICONS = HEADER_ICONS;

// ============================================
// REACT COMPONENTS
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

    // ========================================
    // PERSISTENT SIDEBAR (Supabase-style)
    // ========================================
    const Sidebar = () => {
        const currentPageId = getCurrentPageId();
        const [helpModalOpen, setHelpModalOpen] = useState(false);

        const handleNavClick = (item, e) => {
            if (item.action === 'openHelp') {
                e.preventDefault();
                setHelpModalOpen(true);
            } else if (item.action === 'openSettings') {
                e.preventDefault();
                openSettingsModal();
            }
        };

        return React.createElement(React.Fragment, null,
            // Persistent Logo Bar (always visible at top) - wordmark only
            React.createElement('div', { className: 'logo-bar' },
                React.createElement('a', { href: 'index.html', className: 'logo-bar-link' },
                    React.createElement('img', {
                        src: SIDEBAR_CONFIG.wordmarkUrl,
                        alt: SIDEBAR_CONFIG.logoAlt,
                        className: 'logo-bar-text'
                    })
                )
            ),
            
            // Sidebar (below logo bar)
            React.createElement('aside', { className: 'app-sidebar' },
                // Main navigation
                React.createElement('nav', { className: 'sidebar-nav' },
                    React.createElement('ul', { className: 'sidebar-nav-list' },
                        SIDEBAR_CONFIG.navItems.map((item, index) => {
                            const isActive = item.id === currentPageId;
                            return React.createElement('li', { key: index, className: 'sidebar-nav-item' },
                                React.createElement('a', {
                                    href: item.href,
                                    className: `sidebar-nav-link ${isActive ? 'active' : ''}`,
                                    title: item.label
                                },
                                    React.createElement('span', {
                                        className: 'sidebar-nav-icon',
                                        dangerouslySetInnerHTML: { __html: HEADER_ICONS[item.icon] || '' }
                                    }),
                                    React.createElement('span', { className: 'sidebar-nav-label' }, item.label)
                                )
                            );
                        })
                    )
                ),
                
                // Spacer
                React.createElement('div', { className: 'sidebar-spacer' }),
                
                // Bottom navigation
                React.createElement('nav', { className: 'sidebar-nav sidebar-nav-bottom' },
                    React.createElement('ul', { className: 'sidebar-nav-list' },
                        SIDEBAR_CONFIG.bottomItems.map((item, index) => 
                            React.createElement('li', { key: index, className: 'sidebar-nav-item' },
                                React.createElement('a', {
                                    href: item.href,
                                    className: 'sidebar-nav-link',
                                    title: item.label,
                                    onClick: (e) => handleNavClick(item, e)
                                },
                                    React.createElement('span', {
                                        className: 'sidebar-nav-icon',
                                        dangerouslySetInnerHTML: { __html: HEADER_ICONS[item.icon] || '' }
                                    }),
                                    React.createElement('span', { className: 'sidebar-nav-label' }, item.label)
                                )
                            )
                        )
                    )
                )
            ),
            
            // Help Modal
            helpModalOpen && React.createElement(HelpModal, {
                isOpen: helpModalOpen,
                onClose: () => setHelpModalOpen(false)
            })
        );
    };

    // ========================================
    // TOP HEADER (Simplified)
    // ========================================
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
        const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
        const roleLabel = profile?.role === 'super_admin' ? 'Super Admin' : (profile?.role === 'admin' ? 'Admin' : null);

        return React.createElement('header', { className: 'header' },
            // Spacer to account for sidebar width
            React.createElement('div', { className: 'header-spacer' }),
            
            // Right side actions
            React.createElement('div', { className: 'header-right' },
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
                                    roleLabel && React.createElement('span', { className: 'user-dropdown-role' }, roleLabel)
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

    // ========================================
    // HELP MODAL
    // ========================================
    const HelpModal = ({ isOpen, onClose }) => {
        if (!isOpen) return null;

        const helpItems = [
            { icon: 'book', title: 'Documentation', desc: 'Learn how to use Society Arts', href: 'under-construction.html?feature=Documentation' },
            { icon: 'video', title: 'Video Tutorials', desc: 'Watch step-by-step guides', href: 'tutorials.html' },
            { icon: 'messageCircle', title: 'Community', desc: 'Join discussions with other artists', href: 'under-construction.html?feature=Community' },
            { icon: 'mail', title: 'Contact Support', desc: 'Get help from our team', href: 'mailto:support@societyarts.com' }
        ];

        return React.createElement('div', { className: 'help-modal-overlay', onClick: onClose },
            React.createElement('div', { 
                className: 'help-modal',
                onClick: (e) => e.stopPropagation()
            },
                React.createElement('div', { className: 'help-modal-header' },
                    React.createElement('h3', null, 'Help & Resources'),
                    React.createElement('button', {
                        className: 'help-modal-close',
                        onClick: onClose,
                        dangerouslySetInnerHTML: { __html: HEADER_ICONS.close }
                    })
                ),
                React.createElement('div', { className: 'help-modal-content' },
                    helpItems.map((item, index) =>
                        React.createElement('a', {
                            key: index,
                            href: item.href,
                            className: 'help-modal-item'
                        },
                            React.createElement('span', {
                                className: 'help-modal-item-icon',
                                dangerouslySetInnerHTML: { __html: HEADER_ICONS[item.icon] }
                            }),
                            React.createElement('div', { className: 'help-modal-item-text' },
                                React.createElement('span', { className: 'help-modal-item-title' }, item.title),
                                React.createElement('span', { className: 'help-modal-item-desc' }, item.desc)
                            )
                        )
                    )
                )
            )
        );
    };

    // ========================================
    // FORMAT SELECTOR (for Story Builder)
    // ========================================
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

    // ========================================
    // FOOTER COMPONENT
    // ========================================
    const Footer = ({ children }) => {
        return React.createElement('footer', {
            className: 'app-footer',
            style: {
                height: 'var(--footer-height, 56px)',
                padding: '0 var(--space-xl, 24px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 'var(--space-lg, 16px)',
                borderTop: '1px solid var(--color-border, #E7E2DC)',
                background: 'var(--color-surface, #F9F8F6)',
                flexShrink: 0
            }
        }, children || React.createElement('span', {
            style: { 
                marginRight: 'auto', 
                color: 'var(--color-text-muted)', 
                fontSize: '14px' 
            }
        }, '© 2024 Society Arts'));
    };

    // ========================================
    // LEGACY COMPONENTS (for compatibility)
    // ========================================
    const NavSidebar = () => null; // No longer needed
    const Subheader = ({ title, subtitle }) => null; // Removed

    // ========================================
    // EXPORTS
    // ========================================
    window.SocietyArts = window.SocietyArts || {};
    window.SocietyArts.Header = Header;
    window.SocietyArts.Sidebar = Sidebar;
    window.SocietyArts.Footer = Footer;
    window.SocietyArts.NavSidebar = NavSidebar; // Legacy
    window.SocietyArts.Subheader = Subheader; // Legacy
    window.SocietyArts.FormatSelector = FormatSelector;
    window.SocietyArts.HelpModal = HelpModal;
    
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

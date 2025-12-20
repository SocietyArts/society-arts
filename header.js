/* ========================================
   SOCIETY ARTS - HEADER & NAVIGATION
   Header, sidebar nav, help menu, footer
   Version: 2.0
   ======================================== */

// ========================================
// ICONS
// ========================================

const Icons = {
  menu: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
  ),
  close: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  ),
  search: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  ),
  cart: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="9" cy="21" r="1"></circle>
      <circle cx="20" cy="21" r="1"></circle>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
    </svg>
  ),
  chevronDown: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  ),
  chevronRight: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  ),
  arrowRight: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="5" y1="12" x2="19" y2="12"></line>
      <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
  ),
  // Navigation icons
  projects: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="7" height="7"></rect>
      <rect x="14" y="3" width="7" height="7"></rect>
      <rect x="14" y="14" width="7" height="7"></rect>
      <rect x="3" y="14" width="7" height="7"></rect>
    </svg>
  ),
  styleFinder: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
    </svg>
  ),
  gallery: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <circle cx="8.5" cy="8.5" r="1.5"></circle>
      <polyline points="21 15 16 10 5 21"></polyline>
    </svg>
  ),
  collections: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="3" y1="9" x2="21" y2="9"></line>
      <line x1="9" y1="21" x2="9" y2="9"></line>
    </svg>
  ),
  favorites: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
  ),
  pricing: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="12" y1="1" x2="12" y2="23"></line>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
    </svg>
  ),
  help: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
  ),
  // Help menu icons
  howItWorks: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
  ),
  quickTips: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="8" y1="6" x2="21" y2="6"></line>
      <line x1="8" y1="12" x2="21" y2="12"></line>
      <line x1="8" y1="18" x2="21" y2="18"></line>
      <line x1="3" y1="6" x2="3.01" y2="6"></line>
      <line x1="3" y1="12" x2="3.01" y2="12"></line>
      <line x1="3" y1="18" x2="3.01" y2="18"></line>
    </svg>
  ),
  newChat: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  ),
  updates: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
  ),
  tutorials: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10"></circle>
      <polygon points="10 8 16 12 10 16 10 8"></polygon>
    </svg>
  ),
  explore: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10"></circle>
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
    </svg>
  ),
  troubleshoot: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
    </svg>
  ),
  feedback: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
    </svg>
  ),
  contact: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
      <polyline points="22,6 12,13 2,6"></polyline>
    </svg>
  ),
  // Format icons
  square: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    </svg>
  )
};

// ========================================
// NAVIGATION ITEMS
// ========================================

const NAV_ITEMS = [
  { id: 'story-builder', label: 'Story Builder', icon: 'newChat', href: '/story-builder.html' },
  { id: 'style-finder', label: 'Style Finder', icon: 'styleFinder', href: '/style-finder.html' },
  { divider: true },
  { id: 'projects', label: 'Projects', icon: 'projects', href: '/under-construction.html?feature=Projects', badge: 0 },
  { id: 'gallery', label: 'Gallery', icon: 'gallery', href: '/under-construction.html?feature=Gallery' },
  { id: 'collections', label: 'Collections', icon: 'collections', href: '/under-construction.html?feature=Collections', badge: 0 },
  { id: 'favorites', label: 'Favorites', icon: 'favorites', href: '/under-construction.html?feature=Favorites', badge: 0 },
  { divider: true },
  { id: 'pricing', label: 'Prints & Pricing', icon: 'pricing', href: '/under-construction.html?feature=Prints%20%26%20Pricing' },
  { id: 'help', label: 'Help', icon: 'help', href: '/under-construction.html?feature=Help' }
];

const HELP_MENU_ITEMS = [
  { id: 'how-it-works', label: 'How It Works', icon: 'howItWorks', href: '/under-construction.html?feature=How%20It%20Works' },
  { id: 'quick-tips', label: 'Quick Tips for Getting Started', icon: 'quickTips', href: '/under-construction.html?feature=Quick%20Tips' },
  { id: 'new-chat', label: 'Start a New Chat', icon: 'newChat', action: 'newChat' },
  { id: 'updates', label: 'New Features & Updates', icon: 'updates', href: '/under-construction.html?feature=New%20Features' },
  { id: 'tutorials', label: 'Help & Tutorials', icon: 'tutorials', href: '/under-construction.html?feature=Tutorials' },
  { id: 'explore', label: 'Explore Ways to Create', icon: 'explore', href: '/under-construction.html?feature=Explore' },
  { id: 'troubleshoot', label: 'Troubleshooting Guide', icon: 'troubleshoot', href: '/under-construction.html?feature=Troubleshooting' },
  { id: 'feedback', label: 'Share Feedback', icon: 'feedback', href: '/under-construction.html?feature=Feedback' },
  { id: 'contact', label: 'Contact Us', icon: 'contact', href: '/under-construction.html?feature=Contact' }
];

const FORMAT_OPTIONS = [
  { id: 'square', label: 'Square (1:1)', ratio: '1:1', width: 16, height: 16 },
  { id: 'vertical', label: 'Vertical (3:4)', ratio: '3:4', width: 12, height: 16 },
  { id: 'horizontal', label: 'Horizontal (4:3)', ratio: '4:3', width: 16, height: 12 },
  { id: 'tall', label: 'Tall (9:16)', ratio: '9:16', width: 9, height: 16 },
  { id: 'wide', label: 'Wide (16:9)', ratio: '16:9', width: 16, height: 9 }
];

// ========================================
// NAVIGATION SIDEBAR COMPONENT
// ========================================

function NavSidebar({ isOpen, onClose, currentPage, onOpenStyleFinder }) {
  // Close on escape key
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleItemClick = (item) => {
    if (item.href) {
      window.location.href = item.href;
    }
    onClose();
  };

  const getIcon = (iconName) => {
    const IconComponent = Icons[iconName];
    return IconComponent ? <IconComponent /> : null;
  };

  return (
    <>
      <div 
        className={`nav-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />
      
      <nav className={`nav-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="nav-header">
          <button className="nav-close-btn" onClick={onClose} aria-label="Close menu">
            <Icons.close />
          </button>
        </div>
        
        <div className="nav-search">
          <div className="nav-search-input">
            <Icons.search />
            <input type="text" placeholder="Search" />
          </div>
        </div>
        
        <div className="nav-content">
          <ul className="nav-list">
            {NAV_ITEMS.map((item, index) => (
              item.divider ? (
                <li key={`divider-${index}`} className="nav-divider"></li>
              ) : (
                <li key={item.id} className="nav-item">
                  <a 
                    className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleItemClick(item);
                    }}
                    href={item.href || '#'}
                  >
                    <span className="nav-link-icon">{getIcon(item.icon)}</span>
                    <span>{item.label}</span>
                    {item.badge && <span className="nav-link-badge">{item.badge}</span>}
                  </a>
                </li>
              )
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
}

// ========================================
// HELP MENU COMPONENT
// ========================================

function HelpMenu({ isOpen, onClose, onNewChat }) {
  const menuRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleItemClick = (item) => {
    if (item.action === 'newChat' && onNewChat) {
      onNewChat();
    } else if (item.href) {
      window.location.href = item.href;
    }
    onClose();
  };

  const getIcon = (iconName) => {
    const IconComponent = Icons[iconName];
    return IconComponent ? <IconComponent /> : null;
  };

  return (
    <div ref={menuRef} className={`help-menu ${isOpen ? 'open' : ''}`}>
      {HELP_MENU_ITEMS.map((item) => (
        <button
          key={item.id}
          className="help-menu-item"
          onClick={() => handleItemClick(item)}
        >
          <span className="help-menu-icon">{getIcon(item.icon)}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}

// ========================================
// FORMAT SELECTOR COMPONENT
// ========================================

function FormatSelector({ value, onChange }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = FORMAT_OPTIONS.find(opt => opt.ratio === value) || FORMAT_OPTIONS[0];

  return (
    <div className="format-selector" ref={dropdownRef} onClick={() => setIsOpen(!isOpen)}>
      <span className="format-selector-icon">
        <Icons.square />
      </span>
      <span className="format-selector-label">Format</span>
      <span className="format-selector-value">{value}</span>
      <Icons.chevronDown />
      
      <div className={`format-dropdown ${isOpen ? 'open' : ''}`}>
        {FORMAT_OPTIONS.map((option) => (
          <div
            key={option.id}
            className={`format-option ${value === option.ratio ? 'selected' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onChange(option.ratio);
              setIsOpen(false);
            }}
          >
            <div 
              className="format-option-icon"
              style={{
                width: option.width,
                height: option.height
              }}
            />
            <span className="format-option-label">{option.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ========================================
// HEADER COMPONENT
// ========================================

function Header({ currentPage, onNewProject, onOpenStyleFinder }) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <>
      <header className="header">
        <div className="header-left">
          <button 
            className="hamburger-btn"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Icons.menu />
          </button>
          <a href="/" className="logo">SOCIETY ARTS</a>
        </div>
        <div className="header-right">
          <button className="btn-icon" aria-label="Cart">
            <Icons.cart />
          </button>
          {onNewProject && (
            <button className="btn btn-primary" onClick={onNewProject}>
              New Project
            </button>
          )}
          <button className="btn btn-secondary">Log In</button>
        </div>
      </header>
      
      <NavSidebar 
        isOpen={menuOpen} 
        onClose={() => setMenuOpen(false)}
        currentPage={currentPage}
        onOpenStyleFinder={onOpenStyleFinder}
      />
    </>
  );
}

// ========================================
// SUBHEADER COMPONENT
// ========================================

function Subheader({ title, description, progress }) {
  return (
    <div className="subheader">
      <h2 className="subheader-title">{title}</h2>
      {description && <p className="subheader-text">{description}</p>}
      {typeof progress === 'number' && (
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
      )}
    </div>
  );
}

// ========================================
// FOOTER COMPONENT
// ========================================

function Footer({ children, onNewChat }) {
  const [helpOpen, setHelpOpen] = React.useState(false);

  return (
    <footer className="footer">
      {children}
      <div style={{ position: 'relative' }}>
        <button 
          className="help-btn" 
          onClick={() => setHelpOpen(!helpOpen)}
          aria-label="Help"
        >
          ?
        </button>
        <HelpMenu 
          isOpen={helpOpen} 
          onClose={() => setHelpOpen(false)} 
          onNewChat={onNewChat}
        />
      </div>
    </footer>
  );
}

// ========================================
// EXPORTS
// ========================================

if (typeof window !== 'undefined') {
  window.SocietyArts = window.SocietyArts || {};
  window.SocietyArts.Header = Header;
  window.SocietyArts.Subheader = Subheader;
  window.SocietyArts.Footer = Footer;
  window.SocietyArts.NavSidebar = NavSidebar;
  window.SocietyArts.HelpMenu = HelpMenu;
  window.SocietyArts.FormatSelector = FormatSelector;
  window.SocietyArts.Icons = Icons;
  window.SocietyArts.NAV_ITEMS = NAV_ITEMS;
  window.SocietyArts.HELP_MENU_ITEMS = HELP_MENU_ITEMS;
  window.SocietyArts.FORMAT_OPTIONS = FORMAT_OPTIONS;
}

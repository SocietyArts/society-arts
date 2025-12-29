/* ========================================
   SOCIETY ARTS - UNIFIED AUTHENTICATION
   A+++ Architecture: Works for React AND Vanilla JS
   Version: 3.0
   ======================================== */

// ========================================
// AUTH STATE (Singleton)
// ========================================

const AuthState = {
    user: null,
    profile: null,
    isLoading: true,
    listeners: [],
    authModalCallback: null,
    initialized: false
};

// ========================================
// AUTH HELPERS
// ========================================

function isAdmin() {
    return AuthState.profile?.role === 'admin' || AuthState.profile?.role === 'super_admin';
}

function isSuperAdmin() {
    return AuthState.profile?.role === 'super_admin';
}

function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function addAuthListener(callback) {
    AuthState.listeners.push(callback);
    return () => {
        AuthState.listeners = AuthState.listeners.filter(l => l !== callback);
    };
}

function notifyListeners() {
    AuthState.listeners.forEach(l => l(AuthState));
    // Also update vanilla JS UI if present
    updateVanillaAuthUI();
}

// ========================================
// CORE AUTH FUNCTIONS
// ========================================

async function initializeAuth() {
    if (AuthState.initialized) return;
    AuthState.initialized = true;
    
    const { supabase } = window.SocietyArts;
    if (!supabase) {
        console.error('Supabase not initialized');
        AuthState.isLoading = false;
        return;
    }

    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            AuthState.user = session.user;
            await loadUserProfile();
        }
    } catch (error) {
        console.error('Auth init error:', error);
    }

    AuthState.isLoading = false;
    notifyListeners();

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event);
        AuthState.user = session?.user || null;
        
        if (session?.user) {
            await loadUserProfile();
        } else {
            AuthState.profile = null;
        }
        
        notifyListeners();
    });
}

async function loadUserProfile() {
    if (!AuthState.user) return;
    
    const { supabase } = window.SocietyArts;
    
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', AuthState.user.id)
            .single();
        
        if (error && error.code === 'PGRST116') {
            // Profile doesn't exist - create it
            await createUserProfile();
            return;
        }
        
        if (error) {
            console.error('Error loading profile:', error);
            return;
        }
        
        AuthState.profile = data;
    } catch (err) {
        console.error('Profile load error:', err);
    }
}

async function createUserProfile() {
    if (!AuthState.user) return;
    
    const { supabase } = window.SocietyArts;
    const user = AuthState.user;
    
    const displayName = user.user_metadata?.full_name || 
                       user.user_metadata?.name || 
                       user.email?.split('@')[0] || 'User';
    
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .insert({
                id: user.id,
                email: user.email,
                display_name: displayName,
                role: user.email === 'steve@societyarts.com' ? 'super_admin' : 'user'
            })
            .select()
            .single();
        
        if (!error) {
            AuthState.profile = data;
        }
    } catch (err) {
        console.error('Profile creation error:', err);
    }
}

async function signInWithGoogle() {
    const { supabase } = window.SocietyArts;
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin + window.location.pathname
        }
    });
    if (error) throw error;
}

async function signInWithEmail(email, password) {
    const { supabase } = window.SocietyArts;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
}

async function signUpWithEmail(email, password, displayName) {
    const { supabase } = window.SocietyArts;
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { display_name: displayName }
        }
    });
    if (error) throw error;
    return data;
}

async function signOut() {
    const { supabase } = window.SocietyArts;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    AuthState.user = null;
    AuthState.profile = null;
    notifyListeners();
}

async function resetPassword(email) {
    const { supabase } = window.SocietyArts;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/settings.html'
    });
    if (error) throw error;
}

// ========================================
// VANILLA JS AUTH MODAL
// ========================================

let vanillaModalView = 'welcome';
let vanillaModalElement = null;

function injectAuthModal() {
    if (document.getElementById('societyArtsAuthModal')) return;
    
    const modalHTML = `
    <div class="sa-auth-overlay" id="societyArtsAuthModal">
        <div class="sa-auth-modal">
            <button class="sa-auth-close" onclick="closeAuthModal()">&times;</button>
            
            <!-- Welcome View -->
            <div class="sa-auth-view" id="saAuthWelcome">
                <h2>Welcome</h2>
                <p class="sa-auth-subtitle">Sign in to save favorites and projects</p>
                
                <button class="sa-auth-btn sa-auth-google" onclick="handleGoogleSignIn()">
                    <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    Continue with Google
                </button>
                
                <button class="sa-auth-btn sa-auth-apple" disabled>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                    Continue with Apple
                </button>
                
                <div class="sa-auth-divider"><span>or</span></div>
                
                <button class="sa-auth-btn sa-auth-email" onclick="showAuthView('signin')">
                    Continue with Email
                </button>
            </div>
            
            <!-- Sign In View -->
            <div class="sa-auth-view" id="saAuthSignin" style="display:none;">
                <button class="sa-auth-back" onclick="showAuthView('welcome')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    Back
                </button>
                <h2>Sign In</h2>
                <p class="sa-auth-subtitle">Welcome back to Society Arts</p>
                
                <div class="sa-auth-error" id="saSigninError"></div>
                
                <form onsubmit="handleEmailSignIn(event)">
                    <input type="email" id="saSigninEmail" placeholder="Email" required>
                    <input type="password" id="saSigninPassword" placeholder="Password" required>
                    <button type="submit" class="sa-auth-btn sa-auth-primary" id="saSigninBtn">Sign In</button>
                </form>
                
                <p class="sa-auth-link">
                    <a href="#" onclick="showAuthView('forgot'); return false;">Forgot password?</a>
                </p>
                <p class="sa-auth-link">
                    Don't have an account? <a href="#" onclick="showAuthView('signup'); return false;">Sign up</a>
                </p>
            </div>
            
            <!-- Sign Up View -->
            <div class="sa-auth-view" id="saAuthSignup" style="display:none;">
                <button class="sa-auth-back" onclick="showAuthView('welcome')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    Back
                </button>
                <h2>Create Account</h2>
                <p class="sa-auth-subtitle">Join Society Arts</p>
                
                <div class="sa-auth-error" id="saSignupError"></div>
                <div class="sa-auth-success" id="saSignupSuccess"></div>
                
                <form onsubmit="handleEmailSignUp(event)">
                    <input type="text" id="saSignupName" placeholder="Display Name" required>
                    <input type="email" id="saSignupEmail" placeholder="Email" required>
                    <input type="password" id="saSignupPassword" placeholder="Password" required minlength="6">
                    <input type="password" id="saSignupConfirm" placeholder="Confirm Password" required>
                    <button type="submit" class="sa-auth-btn sa-auth-primary" id="saSignupBtn">Create Account</button>
                </form>
                
                <p class="sa-auth-link">
                    Already have an account? <a href="#" onclick="showAuthView('signin'); return false;">Sign in</a>
                </p>
            </div>
            
            <!-- Forgot Password View -->
            <div class="sa-auth-view" id="saAuthForgot" style="display:none;">
                <button class="sa-auth-back" onclick="showAuthView('signin')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    Back
                </button>
                <h2>Reset Password</h2>
                <p class="sa-auth-subtitle">We'll send you a reset link</p>
                
                <div class="sa-auth-error" id="saForgotError"></div>
                <div class="sa-auth-success" id="saForgotSuccess"></div>
                
                <form onsubmit="handleForgotPassword(event)">
                    <input type="email" id="saForgotEmail" placeholder="Email" required>
                    <button type="submit" class="sa-auth-btn sa-auth-primary" id="saForgotBtn">Send Reset Link</button>
                </form>
            </div>
        </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    vanillaModalElement = document.getElementById('societyArtsAuthModal');
    
    // Close on overlay click
    vanillaModalElement.addEventListener('click', (e) => {
        if (e.target === vanillaModalElement) closeAuthModal();
    });
    
    // Close on escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && vanillaModalElement?.classList.contains('open')) {
            closeAuthModal();
        }
    });
}

function injectAuthStyles() {
    if (document.getElementById('societyArtsAuthStyles')) return;
    
    const styles = `
    <style id="societyArtsAuthStyles">
        .sa-auth-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.2s, visibility 0.2s;
            padding: 20px;
        }
        .sa-auth-overlay.open {
            opacity: 1;
            visibility: visible;
        }
        .sa-auth-modal {
            background: white;
            border-radius: 16px;
            max-width: 420px;
            width: 100%;
            padding: 32px;
            position: relative;
            max-height: 90vh;
            overflow-y: auto;
            transform: scale(0.95);
            transition: transform 0.2s;
        }
        .sa-auth-overlay.open .sa-auth-modal {
            transform: scale(1);
        }
        .sa-auth-close {
            position: absolute;
            top: 16px;
            right: 16px;
            background: transparent;
            border: none;
            font-size: 28px;
            cursor: pointer;
            color: #888;
            line-height: 1;
            padding: 4px;
        }
        .sa-auth-close:hover { color: #333; }
        .sa-auth-view h2 {
            font-family: 'Lora', Georgia, serif;
            font-size: 28px;
            margin: 0 0 8px;
            text-align: center;
            color: #3D3530;
        }
        .sa-auth-subtitle {
            color: #888;
            margin: 0 0 32px;
            text-align: center;
        }
        .sa-auth-btn {
            width: 100%;
            padding: 14px;
            border: none;
            border-radius: 8px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-bottom: 12px;
            transition: background 0.2s, opacity 0.2s;
        }
        .sa-auth-google {
            background: white;
            border: 1px solid #e5e5e5;
            color: #333;
        }
        .sa-auth-google:hover { background: #f5f5f5; }
        .sa-auth-apple {
            background: white;
            border: 1px solid #e5e5e5;
            color: #333;
            opacity: 0.5;
            cursor: not-allowed;
        }
        .sa-auth-email, .sa-auth-primary {
            background: #3D3530;
            color: white;
        }
        .sa-auth-email:hover, .sa-auth-primary:hover { background: #2a2420; }
        .sa-auth-divider {
            display: flex;
            align-items: center;
            gap: 16px;
            margin: 24px 0;
        }
        .sa-auth-divider::before, .sa-auth-divider::after {
            content: '';
            flex: 1;
            height: 1px;
            background: #e5e5e5;
        }
        .sa-auth-divider span { color: #888; font-size: 14px; }
        .sa-auth-back {
            display: flex;
            align-items: center;
            gap: 4px;
            background: none;
            border: none;
            cursor: pointer;
            font-size: 14px;
            color: #666;
            padding: 0;
            margin-bottom: 16px;
        }
        .sa-auth-back:hover { color: #333; }
        .sa-auth-view input[type="email"],
        .sa-auth-view input[type="password"],
        .sa-auth-view input[type="text"] {
            width: 100%;
            padding: 14px 16px;
            border: 1px solid #e5e5e5;
            border-radius: 8px;
            font-size: 15px;
            margin-bottom: 12px;
            box-sizing: border-box;
        }
        .sa-auth-view input:focus {
            outline: none;
            border-color: #3D3530;
        }
        .sa-auth-error {
            background: #fee;
            color: #c00;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 16px;
            font-size: 14px;
            display: none;
        }
        .sa-auth-error.show { display: block; }
        .sa-auth-success {
            background: #efe;
            color: #060;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 16px;
            font-size: 14px;
            display: none;
        }
        .sa-auth-success.show { display: block; }
        .sa-auth-link {
            text-align: center;
            font-size: 14px;
            color: #666;
            margin: 16px 0 0;
        }
        .sa-auth-link a { color: #3D3530; font-weight: 600; }
        .sa-auth-link a:hover { text-decoration: underline; }
    </style>`;
    
    document.head.insertAdjacentHTML('beforeend', styles);
}

// Global auth modal functions (work for both React and Vanilla)
function openAuthModal() {
    // If React modal is registered, use it
    if (AuthState.authModalCallback) {
        AuthState.authModalCallback();
        return;
    }
    
    // Otherwise use vanilla JS modal
    injectAuthStyles();
    injectAuthModal();
    showAuthView('welcome');
    vanillaModalElement?.classList.add('open');
}

function closeAuthModal() {
    vanillaModalElement?.classList.remove('open');
}

function showAuthView(view) {
    vanillaModalView = view;
    const views = ['welcome', 'signin', 'signup', 'forgot'];
    views.forEach(v => {
        const el = document.getElementById('saAuth' + v.charAt(0).toUpperCase() + v.slice(1));
        if (el) el.style.display = v === view ? 'block' : 'none';
    });
    // Clear errors/success
    document.querySelectorAll('.sa-auth-error, .sa-auth-success').forEach(el => {
        el.classList.remove('show');
        el.textContent = '';
    });
}

function registerAuthModal(callback) {
    AuthState.authModalCallback = callback;
}

// Vanilla JS auth handlers
async function handleGoogleSignIn() {
    try {
        await signInWithGoogle();
    } catch (err) {
        showAuthError('saSigninError', err.message);
    }
}

async function handleEmailSignIn(e) {
    e.preventDefault();
    const email = document.getElementById('saSigninEmail')?.value;
    const password = document.getElementById('saSigninPassword')?.value;
    const btn = document.getElementById('saSigninBtn');
    
    if (btn) btn.textContent = 'Signing in...';
    
    try {
        await signInWithEmail(email, password);
        closeAuthModal();
    } catch (err) {
        showAuthError('saSigninError', err.message);
    }
    
    if (btn) btn.textContent = 'Sign In';
}

async function handleEmailSignUp(e) {
    e.preventDefault();
    const name = document.getElementById('saSignupName')?.value;
    const email = document.getElementById('saSignupEmail')?.value;
    const password = document.getElementById('saSignupPassword')?.value;
    const confirm = document.getElementById('saSignupConfirm')?.value;
    const btn = document.getElementById('saSignupBtn');
    
    if (password !== confirm) {
        showAuthError('saSignupError', 'Passwords do not match');
        return;
    }
    
    if (btn) btn.textContent = 'Creating account...';
    
    try {
        await signUpWithEmail(email, password, name);
        showAuthSuccess('saSignupSuccess', 'Check your email to confirm your account!');
    } catch (err) {
        showAuthError('saSignupError', err.message);
    }
    
    if (btn) btn.textContent = 'Create Account';
}

async function handleForgotPassword(e) {
    e.preventDefault();
    const email = document.getElementById('saForgotEmail')?.value;
    const btn = document.getElementById('saForgotBtn');
    
    if (btn) btn.textContent = 'Sending...';
    
    try {
        await resetPassword(email);
        showAuthSuccess('saForgotSuccess', 'Password reset link sent to your email!');
    } catch (err) {
        showAuthError('saForgotError', err.message);
    }
    
    if (btn) btn.textContent = 'Send Reset Link';
}

function showAuthError(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = message;
        el.classList.add('show');
    }
}

function showAuthSuccess(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = message;
        el.classList.add('show');
    }
}

// ========================================
// VANILLA JS UI UPDATE
// ========================================

function updateVanillaAuthUI() {
    const user = AuthState.user;
    const profile = AuthState.profile;
    
    // Standard elements used across vanilla JS pages
    const signInBtn = document.getElementById('signInBtn');
    const userMenuContainer = document.getElementById('userMenuContainer');
    const userInitials = document.getElementById('userInitials');
    const userName = document.getElementById('userName');
    const dropdownUserName = document.getElementById('dropdownUserName');
    const dropdownUserEmail = document.getElementById('dropdownUserEmail');
    const dropdownUserRole = document.getElementById('dropdownUserRole');
    const adminUsersBtn = document.getElementById('adminUsersBtn');
    
    if (user && profile) {
        // Logged in state
        if (signInBtn) signInBtn.style.display = 'none';
        if (userMenuContainer) userMenuContainer.style.display = 'block';
        
        const displayName = profile.display_name || user.email?.split('@')[0] || 'User';
        const initials = getInitials(displayName);
        
        if (userInitials) userInitials.textContent = initials;
        if (userName) userName.textContent = displayName;
        if (dropdownUserName) dropdownUserName.textContent = displayName;
        if (dropdownUserEmail) dropdownUserEmail.textContent = user.email;
        
        // Role badge
        if (dropdownUserRole) {
            if (profile.role === 'super_admin') {
                dropdownUserRole.textContent = 'Super Admin';
                dropdownUserRole.style.display = 'inline-block';
            } else if (profile.role === 'admin') {
                dropdownUserRole.textContent = 'Admin';
                dropdownUserRole.style.display = 'inline-block';
            } else {
                dropdownUserRole.style.display = 'none';
            }
        }
        
        // Admin buttons
        if (adminUsersBtn) {
            adminUsersBtn.style.display = (profile.role === 'super_admin' || profile.role === 'admin') ? 'flex' : 'none';
        }
        
        // Show admin edit buttons in modals
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = isAdmin() ? '' : 'none';
        });
        
    } else {
        // Logged out state
        if (signInBtn) signInBtn.style.display = 'block';
        if (userMenuContainer) userMenuContainer.style.display = 'none';
        
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = 'none';
        });
    }
}

// User menu toggle (for vanilla JS pages)
function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// Close user menu when clicking outside
document.addEventListener('click', (e) => {
    const userMenu = document.querySelector('.user-menu-container');
    const dropdown = document.getElementById('userDropdown');
    if (userMenu && dropdown && !userMenu.contains(e.target)) {
        dropdown.classList.remove('show');
    }
});

// Logout handler for vanilla JS
async function handleLogout() {
    try {
        await signOut();
        showToast?.('Signed out successfully');
    } catch (err) {
        console.error('Logout error:', err);
    }
}

// ========================================
// REACT COMPONENTS (No JSX - createElement only)
// ========================================

if (typeof React !== 'undefined') {
    const { useState, useEffect, useRef, createElement: h } = React;

    // ========================================
    // useAuth Hook
    // ========================================
    function useAuth() {
        const [authState, setAuthState] = useState({
            user: AuthState.user,
            profile: AuthState.profile,
            isLoading: AuthState.isLoading
        });

        useEffect(() => {
            if (!AuthState.initialized) {
                initializeAuth();
            }

            const unsubscribe = addAuthListener((state) => {
                setAuthState({
                    user: state.user,
                    profile: state.profile,
                    isLoading: state.isLoading
                });
            });

            return unsubscribe;
        }, []);

        return {
            ...authState,
            isAdmin: isAdmin(),
            isSuperAdmin: isSuperAdmin(),
            signInWithGoogle,
            signInWithEmail,
            signUpWithEmail,
            signOut,
            resetPassword
        };
    }

    // ========================================
    // UserAvatar Component
    // ========================================
    const UserAvatar = ({ user, profile, size = 32, onClick, style = {} }) => {
        const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User';
        const initials = getInitials(displayName);
        
        const avatarStyle = {
            width: size + 'px',
            height: size + 'px',
            borderRadius: '50%',
            background: 'var(--color-tan-40, #CFC5B9)',
            color: 'var(--color-text-primary, #3D3530)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: (size * 0.4) + 'px',
            fontWeight: '600',
            cursor: onClick ? 'pointer' : 'default',
            ...style
        };

        return h('div', { style: avatarStyle, onClick: onClick }, initials);
    };

    // ========================================
    // UserMenu Component (for Header)
    // ========================================
    const UserMenu = ({ user, profile, onSignOut }) => {
        const [isOpen, setIsOpen] = useState(false);
        const menuRef = useRef(null);
        const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User';

        useEffect(() => {
            const handleClickOutside = (e) => {
                if (menuRef.current && !menuRef.current.contains(e.target)) {
                    setIsOpen(false);
                }
            };
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, []);

        const handleSignOut = async () => {
            await signOut();
            onSignOut?.();
            setIsOpen(false);
        };

        return h('div', { className: 'user-menu', ref: menuRef, style: { position: 'relative' } },
            h('button', {
                className: 'user-menu-btn',
                onClick: () => setIsOpen(!isOpen),
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 12px',
                    background: 'transparent',
                    border: '1px solid var(--color-border, #e5e5e5)',
                    borderRadius: '24px',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                }
            },
                h(UserAvatar, { user, profile, size: 28 }),
                h('span', { style: { fontSize: '14px', fontWeight: '500' } }, displayName),
                h('span', { 
                    style: { transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' },
                    dangerouslySetInnerHTML: { __html: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>' }
                })
            ),
            isOpen && h('div', {
                className: 'user-dropdown',
                style: {
                    position: 'absolute',
                    top: '100%',
                    right: '0',
                    marginTop: '8px',
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    minWidth: '220px',
                    zIndex: 1000,
                    overflow: 'hidden'
                }
            },
                h('div', { style: { padding: '12px 16px', borderBottom: '1px solid var(--color-border, #e5e5e5)' } },
                    h('div', { style: { fontWeight: '600', marginBottom: '2px' } }, displayName),
                    h('div', { style: { fontSize: '12px', color: 'var(--color-text-muted, #888)' } }, user?.email),
                    profile?.role && profile.role !== 'user' && h('span', {
                        style: {
                            display: 'inline-block',
                            marginTop: '6px',
                            padding: '2px 8px',
                            fontSize: '10px',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            background: profile.role === 'super_admin' ? 'linear-gradient(135deg, #BE185D, #9D174D)' : '#3B82F6',
                            color: 'white',
                            borderRadius: '4px'
                        }
                    }, profile.role === 'super_admin' ? 'Super Admin' : 'Admin')
                ),
                h('a', {
                    href: 'settings.html',
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 16px',
                        color: 'inherit',
                        textDecoration: 'none',
                        transition: 'background 0.15s'
                    },
                    onMouseEnter: (e) => e.currentTarget.style.background = '#f5f5f5',
                    onMouseLeave: (e) => e.currentTarget.style.background = 'transparent'
                },
                    h('span', { dangerouslySetInnerHTML: { __html: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>' }}),
                    'Settings'
                ),
                h('div', { style: { height: '1px', background: 'var(--color-border, #e5e5e5)', margin: '4px 0' } }),
                h('button', {
                    onClick: handleSignOut,
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        width: '100%',
                        padding: '10px 16px',
                        background: 'transparent',
                        border: 'none',
                        color: '#DC2626',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: '14px'
                    },
                    onMouseEnter: (e) => e.currentTarget.style.background = '#fef2f2',
                    onMouseLeave: (e) => e.currentTarget.style.background = 'transparent'
                },
                    h('span', { dangerouslySetInnerHTML: { __html: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>' }}),
                    'Sign Out'
                )
            )
        );
    };

    // ========================================
    // AuthModal Component (React version)
    // ========================================
    const AuthModal = ({ isOpen, onClose }) => {
        const [view, setView] = useState('welcome');
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        const [confirmPassword, setConfirmPassword] = useState('');
        const [displayName, setDisplayName] = useState('');
        const [error, setError] = useState('');
        const [success, setSuccess] = useState('');
        const [loading, setLoading] = useState(false);

        useEffect(() => {
            if (isOpen) {
                setView('welcome');
                setError('');
                setSuccess('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setDisplayName('');
            }
        }, [isOpen]);

        const handleGoogleSignIn = async () => {
            try {
                await signInWithGoogle();
            } catch (err) {
                setError(err.message);
            }
        };

        const handleEmailSignIn = async (e) => {
            e.preventDefault();
            setError('');
            setLoading(true);
            try {
                await signInWithEmail(email, password);
                onClose();
            } catch (err) {
                setError(err.message);
            }
            setLoading(false);
        };

        const handleSignUp = async (e) => {
            e.preventDefault();
            setError('');
            if (password !== confirmPassword) {
                setError('Passwords do not match');
                return;
            }
            setLoading(true);
            try {
                await signUpWithEmail(email, password, displayName);
                setSuccess('Check your email to confirm your account!');
            } catch (err) {
                setError(err.message);
            }
            setLoading(false);
        };

        const handleForgotPassword = async (e) => {
            e.preventDefault();
            setError('');
            setLoading(true);
            try {
                await resetPassword(email);
                setSuccess('Password reset link sent to your email!');
            } catch (err) {
                setError(err.message);
            }
            setLoading(false);
        };

        if (!isOpen) return null;

        const modalStyle = {
            position: 'fixed',
            inset: '0',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px'
        };

        const contentStyle = {
            background: 'white',
            borderRadius: '16px',
            maxWidth: '420px',
            width: '100%',
            padding: '32px',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto'
        };

        const inputStyle = {
            width: '100%',
            padding: '14px 16px',
            border: '1px solid var(--color-border, #e5e5e5)',
            borderRadius: '8px',
            fontSize: '15px',
            marginBottom: '12px',
            boxSizing: 'border-box'
        };

        const buttonStyle = {
            width: '100%',
            padding: '14px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer'
        };

        const socialButtonStyle = {
            ...buttonStyle,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            background: 'white',
            border: '1px solid var(--color-border, #e5e5e5)',
            marginBottom: '12px'
        };

        return h('div', { style: modalStyle, onClick: (e) => { if (e.target === e.currentTarget) onClose(); } },
            h('div', { style: contentStyle, onClick: (e) => e.stopPropagation() },
                h('button', {
                    onClick: onClose,
                    style: {
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        fontSize: '24px'
                    }
                }, '×'),

                // Welcome View
                view === 'welcome' && h(React.Fragment, null,
                    h('h2', { style: { fontFamily: 'var(--font-serif, Georgia)', fontSize: '28px', marginBottom: '8px', textAlign: 'center' } }, 'Welcome'),
                    h('p', { style: { color: 'var(--color-text-muted, #888)', marginBottom: '32px', textAlign: 'center' } }, 'Sign in to save favorites and projects'),
                    h('button', { style: socialButtonStyle, onClick: handleGoogleSignIn },
                        h('span', { dangerouslySetInnerHTML: { __html: '<svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>' } }),
                        'Continue with Google'
                    ),
                    h('button', { style: { ...socialButtonStyle, opacity: 0.5, cursor: 'not-allowed' } },
                        h('span', { dangerouslySetInnerHTML: { __html: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>' } }),
                        'Continue with Apple'
                    ),
                    h('div', { style: { display: 'flex', alignItems: 'center', gap: '16px', margin: '24px 0' } },
                        h('div', { style: { flex: 1, height: '1px', background: 'var(--color-border, #e5e5e5)' } }),
                        h('span', { style: { color: 'var(--color-text-muted, #888)', fontSize: '14px' } }, 'or'),
                        h('div', { style: { flex: 1, height: '1px', background: 'var(--color-border, #e5e5e5)' } })
                    ),
                    h('button', {
                        onClick: () => setView('signin'),
                        style: { ...buttonStyle, background: 'var(--color-text-primary, #3D3530)', color: 'white' }
                    }, 'Continue with Email')
                ),

                // Sign In View
                view === 'signin' && h(React.Fragment, null,
                    h('span', {
                        style: { cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px', fontSize: '14px' },
                        onClick: () => setView('welcome')
                    },
                        h('span', { dangerouslySetInnerHTML: { __html: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>' } }),
                        'Back'
                    ),
                    h('h2', { style: { fontFamily: 'var(--font-serif, Georgia)', fontSize: '28px', marginBottom: '8px' } }, 'Sign In'),
                    h('p', { style: { color: 'var(--color-text-muted, #888)', marginBottom: '24px' } }, 'Welcome back to Society Arts'),
                    error && h('div', { style: { background: '#fee', color: '#c00', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' } }, error),
                    h('form', { onSubmit: handleEmailSignIn },
                        h('input', { type: 'email', placeholder: 'Email', value: email, onChange: (e) => setEmail(e.target.value), style: inputStyle, required: true }),
                        h('input', { type: 'password', placeholder: 'Password', value: password, onChange: (e) => setPassword(e.target.value), style: inputStyle, required: true }),
                        h('button', { type: 'submit', style: { ...buttonStyle, background: 'var(--color-text-primary, #3D3530)', color: 'white' }, disabled: loading }, loading ? 'Signing in...' : 'Sign In')
                    ),
                    h('p', { style: { textAlign: 'center', marginTop: '16px', fontSize: '14px' } },
                        h('a', { href: '#', onClick: (e) => { e.preventDefault(); setView('forgot'); }, style: { color: 'var(--color-text-primary, #3D3530)' } }, 'Forgot password?')
                    ),
                    h('p', { style: { textAlign: 'center', marginTop: '8px', fontSize: '14px', color: '#666' } },
                        "Don't have an account? ",
                        h('a', { href: '#', onClick: (e) => { e.preventDefault(); setView('signup'); }, style: { color: 'var(--color-text-primary, #3D3530)', fontWeight: '600' } }, 'Sign up')
                    )
                ),

                // Sign Up View
                view === 'signup' && h(React.Fragment, null,
                    h('span', {
                        style: { cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px', fontSize: '14px' },
                        onClick: () => setView('welcome')
                    },
                        h('span', { dangerouslySetInnerHTML: { __html: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>' } }),
                        'Back'
                    ),
                    h('h2', { style: { fontFamily: 'var(--font-serif, Georgia)', fontSize: '28px', marginBottom: '8px' } }, 'Create Account'),
                    h('p', { style: { color: 'var(--color-text-muted, #888)', marginBottom: '24px' } }, 'Join Society Arts'),
                    error && h('div', { style: { background: '#fee', color: '#c00', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' } }, error),
                    success && h('div', { style: { background: '#efe', color: '#060', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' } }, success),
                    h('form', { onSubmit: handleSignUp },
                        h('input', { type: 'text', placeholder: 'Display Name', value: displayName, onChange: (e) => setDisplayName(e.target.value), style: inputStyle, required: true }),
                        h('input', { type: 'email', placeholder: 'Email', value: email, onChange: (e) => setEmail(e.target.value), style: inputStyle, required: true }),
                        h('input', { type: 'password', placeholder: 'Password', value: password, onChange: (e) => setPassword(e.target.value), style: inputStyle, required: true, minLength: 6 }),
                        h('input', { type: 'password', placeholder: 'Confirm Password', value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), style: inputStyle, required: true }),
                        h('button', { type: 'submit', style: { ...buttonStyle, background: 'var(--color-text-primary, #3D3530)', color: 'white' }, disabled: loading }, loading ? 'Creating account...' : 'Create Account')
                    ),
                    h('p', { style: { textAlign: 'center', marginTop: '16px', fontSize: '14px', color: '#666' } },
                        'Already have an account? ',
                        h('a', { href: '#', onClick: (e) => { e.preventDefault(); setView('signin'); }, style: { color: 'var(--color-text-primary, #3D3530)', fontWeight: '600' } }, 'Sign in')
                    )
                ),

                // Forgot Password View
                view === 'forgot' && h(React.Fragment, null,
                    h('span', {
                        style: { cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px', fontSize: '14px' },
                        onClick: () => setView('signin')
                    },
                        h('span', { dangerouslySetInnerHTML: { __html: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>' } }),
                        'Back'
                    ),
                    h('h2', { style: { fontFamily: 'var(--font-serif, Georgia)', fontSize: '28px', marginBottom: '8px' } }, 'Reset Password'),
                    h('p', { style: { color: 'var(--color-text-muted, #888)', marginBottom: '24px' } }, "We'll send you a reset link"),
                    error && h('div', { style: { background: '#fee', color: '#c00', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' } }, error),
                    success && h('div', { style: { background: '#efe', color: '#060', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' } }, success),
                    h('form', { onSubmit: handleForgotPassword },
                        h('input', { type: 'email', placeholder: 'Email', value: email, onChange: (e) => setEmail(e.target.value), style: inputStyle, required: true }),
                        h('button', { type: 'submit', style: { ...buttonStyle, background: 'var(--color-text-primary, #3D3530)', color: 'white' }, disabled: loading }, loading ? 'Sending...' : 'Send Reset Link')
                    )
                )
            )
        );
    };

    // ========================================
    // useFavorites Hook
    // ========================================
    function useFavorites() {
        const { user } = useAuth();
        const [favorites, setFavorites] = useState([]);
        const [isLoading, setIsLoading] = useState(false);

        const loadFavorites = async () => {
            if (!user) {
                setFavorites([]);
                return;
            }
            
            setIsLoading(true);
            const { supabase } = window.SocietyArts;
            
            try {
                const { data, error } = await supabase
                    .from('user_favorites')
                    .select('style_id')
                    .eq('user_id', user.id);
                
                if (!error && data) {
                    setFavorites(data.map(f => f.style_id));
                }
            } catch (err) {
                console.error('Error loading favorites:', err);
            }
            
            setIsLoading(false);
        };

        useEffect(() => {
            loadFavorites();
        }, [user]);

        const toggleFavorite = async (styleId) => {
            if (!user) {
                openAuthModal();
                return false;
            }

            const { supabase } = window.SocietyArts;
            const isFavorite = favorites.includes(styleId);

            try {
                if (isFavorite) {
                    await supabase.from('user_favorites').delete().eq('user_id', user.id).eq('style_id', styleId);
                    setFavorites(favorites.filter(id => id !== styleId));
                } else {
                    await supabase.from('user_favorites').insert({ user_id: user.id, style_id: styleId });
                    setFavorites([...favorites, styleId]);
                }
                return true;
            } catch (err) {
                console.error('Error toggling favorite:', err);
                return false;
            }
        };

        return {
            favorites,
            isLoading,
            isFavorite: (styleId) => favorites.includes(styleId),
            toggleFavorite,
            loadFavorites
        };
    }

    // ========================================
    // useCollections Hook
    // ========================================
    function useCollections() {
        const { user } = useAuth();
        const [collections, setCollections] = useState([]);
        const [isLoading, setIsLoading] = useState(false);

        const loadCollections = async () => {
            if (!user) {
                setCollections([]);
                return;
            }
            
            setIsLoading(true);
            const { supabase } = window.SocietyArts;
            
            try {
                const { data, error } = await supabase
                    .from('collections')
                    .select('*, collection_items(style_id)')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });
                
                if (!error && data) {
                    setCollections(data);
                }
            } catch (err) {
                console.error('Error loading collections:', err);
            }
            
            setIsLoading(false);
        };

        useEffect(() => {
            loadCollections();
        }, [user]);

        const createCollection = async (name, description = '') => {
            if (!user) return null;
            
            const { supabase } = window.SocietyArts;
            const { data, error } = await supabase
                .from('collections')
                .insert({ user_id: user.id, name, description })
                .select()
                .single();
            
            if (!error && data) {
                setCollections([{ ...data, collection_items: [] }, ...collections]);
                return data;
            }
            return null;
        };

        const deleteCollection = async (collectionId) => {
            const { supabase } = window.SocietyArts;
            const { error } = await supabase.from('collections').delete().eq('id', collectionId);
            if (!error) {
                setCollections(collections.filter(c => c.id !== collectionId));
            }
        };

        const addToCollection = async (collectionId, styleId) => {
            const { supabase } = window.SocietyArts;
            const { error } = await supabase.from('collection_items').insert({ collection_id: collectionId, style_id: styleId });
            if (!error) {
                loadCollections();
            }
        };

        const removeFromCollection = async (collectionId, styleId) => {
            const { supabase } = window.SocietyArts;
            const { error } = await supabase.from('collection_items').delete().eq('collection_id', collectionId).eq('style_id', styleId);
            if (!error) {
                loadCollections();
            }
        };

        return {
            collections,
            isLoading,
            loadCollections,
            createCollection,
            deleteCollection,
            addToCollection,
            removeFromCollection
        };
    }

    // ========================================
    // SaveProjectModal Component
    // ========================================
    const SaveProjectModal = ({ isOpen, onClose, styleId, onSaved }) => {
        // ... (keeping the implementation simple for now)
        if (!isOpen) return null;
        return h('div', { 
            style: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 },
            onClick: onClose 
        },
            h('div', { 
                style: { background: 'white', padding: '24px', borderRadius: '12px', maxWidth: '400px', width: '90%' },
                onClick: e => e.stopPropagation()
            },
                h('h3', { style: { marginBottom: '16px' } }, 'Add to Project'),
                h('p', { style: { color: '#666', marginBottom: '16px' } }, 'Project selection coming soon...'),
                h('button', { onClick: onClose, style: { padding: '8px 16px', cursor: 'pointer' } }, 'Close')
            )
        );
    };

    // ========================================
    // EXPORTS (React)
    // ========================================
    window.SocietyArts = window.SocietyArts || {};
    Object.assign(window.SocietyArts, {
        AuthState,
        initializeAuth,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        resetPassword,
        isAdmin,
        isSuperAdmin,
        openAuthModal,
        closeAuthModal,
        registerAuthModal,
        updateVanillaAuthUI,
        useAuth,
        useFavorites,
        useCollections,
        UserAvatar,
        UserMenu,
        AuthModal,
        SaveProjectModal
    });
}

// ========================================
// EXPORTS (Vanilla JS - Global)
// ========================================
if (typeof window !== 'undefined') {
    window.AuthState = AuthState;
    window.initializeAuth = initializeAuth;
    window.signInWithGoogle = signInWithGoogle;
    window.signInWithEmail = signInWithEmail;
    window.signUpWithEmail = signUpWithEmail;
    window.signOut = signOut;
    window.resetPassword = resetPassword;
    window.isAdmin = isAdmin;
    window.isSuperAdmin = isSuperAdmin;
    window.openAuthModal = openAuthModal;
    window.closeAuthModal = closeAuthModal;
    window.showAuthView = showAuthView;
    window.handleGoogleSignIn = handleGoogleSignIn;
    window.handleEmailSignIn = handleEmailSignIn;
    window.handleEmailSignUp = handleEmailSignUp;
    window.handleForgotPassword = handleForgotPassword;
    window.handleLogout = handleLogout;
    window.toggleUserMenu = toggleUserMenu;
    window.updateVanillaAuthUI = updateVanillaAuthUI;
    window.addAuthListener = addAuthListener;
    window.getInitials = getInitials;
}

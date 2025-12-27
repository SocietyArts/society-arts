/* ========================================
   SOCIETY ARTS - AUTHENTICATION MODULE
   Shared auth for all pages
   No JSX - uses React.createElement for compatibility
   ======================================== */

// ========================================
// AUTH STATE
// ========================================

const AuthState = {
    user: null,
    profile: null,
    isLoading: true,
    listeners: []
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
}

// ========================================
// AUTH FUNCTIONS
// ========================================

async function initializeAuth() {
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
    const { supabase } = window.SocietyArts;
    if (!AuthState.user) return;

    const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', AuthState.user.id)
        .single();

    if (error) {
        console.error('Failed to load profile:', error);
        await createUserProfile();
    } else {
        AuthState.profile = data;
    }
}

async function createUserProfile() {
    const { supabase } = window.SocietyArts;
    if (!AuthState.user) return;

    const { data, error } = await supabase
        .from('user_profiles')
        .insert({
            id: AuthState.user.id,
            email: AuthState.user.email,
            display_name: AuthState.user.user_metadata?.full_name || 
                         AuthState.user.user_metadata?.name ||
                         AuthState.user.email?.split('@')[0] || 'User',
            role: 'user'
        })
        .select()
        .single();

    if (!error) {
        AuthState.profile = data;
    }
}

async function signInWithGoogle() {
    const { supabase } = window.SocietyArts;
    const productionUrl = 'https://studio.societyarts.com';
    
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: productionUrl + window.location.pathname
        }
    });
    
    if (error) {
        console.error('Google sign in error:', error);
        throw error;
    }
}

async function signInWithEmail(email, password) {
    const { supabase } = window.SocietyArts;
    
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    
    if (error) throw error;
    return data;
}

async function signUpWithEmail(email, password, displayName) {
    const { supabase } = window.SocietyArts;
    
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: displayName },
            emailRedirectTo: 'https://studio.societyarts.com/style-finder.html'
        }
    });
    
    if (error) throw error;
    return data;
}

async function signOut() {
    const { supabase } = window.SocietyArts;
    await supabase.auth.signOut();
    AuthState.user = null;
    AuthState.profile = null;
    notifyListeners();
}

async function resetPassword(email) {
    const { supabase } = window.SocietyArts;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://studio.societyarts.com/style-finder.html'
    });
    
    if (error) throw error;
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
            if (AuthState.isLoading) {
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
    // UserMenu Component
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
            // Avatar button
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
                    dangerouslySetInnerHTML: { 
                        __html: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>' 
                    }
                })
            ),
            // Dropdown
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
                // User info
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
                            background: profile.role === 'super_admin' ? '#C73314' : 'var(--color-tan, #C4B7A6)',
                            color: profile.role === 'super_admin' ? 'white' : 'var(--color-text-primary)',
                            borderRadius: '4px'
                        }
                    }, profile.role.replace('_', ' '))
                ),
                // Settings button
                h('button', {
                    onClick: () => { window.location.href = 'settings.html'; setIsOpen(false); },
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        width: '100%',
                        padding: '12px 16px',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        fontSize: '14px',
                        textAlign: 'left'
                    }
                },
                    h('span', { dangerouslySetInnerHTML: { __html: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>' } }),
                    'Settings'
                ),
                // Sign out button
                h('button', {
                    onClick: handleSignOut,
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        width: '100%',
                        padding: '12px 16px',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        fontSize: '14px',
                        textAlign: 'left',
                        borderTop: '1px solid var(--color-border, #e5e5e5)',
                        color: 'var(--color-accent, #C73314)'
                    }
                },
                    h('span', { dangerouslySetInnerHTML: { __html: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>' } }),
                    'Sign Out'
                )
            )
        );
    };

    // ========================================
    // AuthModal Component
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

        // Modal wrapper
        return h('div', { style: modalStyle, onClick: (e) => { if (e.target === e.currentTarget) onClose(); } },
            h('div', { style: contentStyle, onClick: (e) => e.stopPropagation() },
                // Close button
                h('button', {
                    onClick: onClose,
                    style: {
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px'
                    }
                },
                    h('span', { dangerouslySetInnerHTML: { __html: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>' } })
                ),

                // Welcome View
                view === 'welcome' && h(React.Fragment, null,
                    h('h2', { style: { fontFamily: 'var(--font-serif, Georgia)', fontSize: '28px', marginBottom: '8px', textAlign: 'center' } }, 'Welcome'),
                    h('p', { style: { color: 'var(--color-text-muted, #888)', marginBottom: '32px', textAlign: 'center' } }, 'Sign in to save favorites and projects'),
                    
                    // Google button
                    h('button', { style: socialButtonStyle, onClick: handleGoogleSignIn },
                        h('span', { dangerouslySetInnerHTML: { __html: '<svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>' } }),
                        'Continue with Google'
                    ),
                    
                    // Apple button (disabled)
                    h('button', { style: { ...socialButtonStyle, opacity: 0.5, cursor: 'not-allowed' } },
                        h('span', { dangerouslySetInnerHTML: { __html: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>' } }),
                        'Continue with Apple'
                    ),
                    
                    // Divider
                    h('div', { style: { display: 'flex', alignItems: 'center', gap: '16px', margin: '24px 0' } },
                        h('div', { style: { flex: 1, height: '1px', background: 'var(--color-border, #e5e5e5)' } }),
                        h('span', { style: { color: 'var(--color-text-muted, #888)', fontSize: '14px' } }, 'or'),
                        h('div', { style: { flex: 1, height: '1px', background: 'var(--color-border, #e5e5e5)' } })
                    ),
                    
                    // Email button
                    h('button', {
                        onClick: () => setView('signin'),
                        style: { ...buttonStyle, background: 'var(--color-text-primary, #3D3530)', color: 'white' }
                    }, 'Continue with Email')
                ),

                // Sign In View
                view === 'signin' && h(React.Fragment, null,
                    // Back button
                    h('span', {
                        style: { cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px', fontSize: '14px' },
                        onClick: () => setView('welcome')
                    },
                        h('span', { dangerouslySetInnerHTML: { __html: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>' } }),
                        'Back'
                    ),
                    
                    h('h2', { style: { fontFamily: 'var(--font-serif, Georgia)', fontSize: '28px', marginBottom: '8px' } }, 'Sign In'),
                    h('p', { style: { color: 'var(--color-text-muted, #888)', marginBottom: '24px' } }, 'Welcome back to Society Arts'),
                    
                    // Error message
                    error && h('div', { style: { background: '#fee', color: '#c00', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' } }, error),
                    
                    // Form
                    h('form', { onSubmit: handleEmailSignIn },
                        h('input', { type: 'email', placeholder: 'Email', value: email, onChange: (e) => setEmail(e.target.value), style: inputStyle, required: true }),
                        h('input', { type: 'password', placeholder: 'Password', value: password, onChange: (e) => setPassword(e.target.value), style: inputStyle, required: true }),
                        
                        h('p', { style: { textAlign: 'right', marginBottom: '16px' } },
                            h('span', {
                                style: { color: 'var(--color-accent, #C75B3F)', cursor: 'pointer', fontSize: '14px' },
                                onClick: () => setView('forgot')
                            }, 'Forgot password?')
                        ),
                        
                        h('button', {
                            type: 'submit',
                            disabled: loading,
                            style: { ...buttonStyle, background: 'var(--color-text-primary, #3D3530)', color: 'white', opacity: loading ? 0.7 : 1 }
                        }, loading ? 'Signing in...' : 'Sign In')
                    ),
                    
                    h('p', { style: { textAlign: 'center', marginTop: '16px', fontSize: '14px' } },
                        "Don't have an account? ",
                        h('span', {
                            style: { color: 'var(--color-accent, #C75B3F)', cursor: 'pointer', fontWeight: '600' },
                            onClick: () => setView('signup')
                        }, 'Sign Up')
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
                    h('p', { style: { color: 'var(--color-text-muted, #888)', marginBottom: '24px' } }, 'Join Society Arts today'),
                    
                    error && h('div', { style: { background: '#fee', color: '#c00', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' } }, error),
                    success && h('div', { style: { background: '#efe', color: '#060', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' } }, success),
                    
                    h('form', { onSubmit: handleSignUp },
                        h('input', { type: 'text', placeholder: 'Display Name', value: displayName, onChange: (e) => setDisplayName(e.target.value), style: inputStyle, required: true }),
                        h('input', { type: 'email', placeholder: 'Email', value: email, onChange: (e) => setEmail(e.target.value), style: inputStyle, required: true }),
                        h('input', { type: 'password', placeholder: 'Password (min 8 characters)', value: password, onChange: (e) => setPassword(e.target.value), style: inputStyle, required: true, minLength: 8 }),
                        h('input', { type: 'password', placeholder: 'Confirm Password', value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), style: inputStyle, required: true }),
                        
                        h('button', {
                            type: 'submit',
                            disabled: loading,
                            style: { ...buttonStyle, background: 'var(--color-text-primary, #3D3530)', color: 'white', opacity: loading ? 0.7 : 1 }
                        }, loading ? 'Creating account...' : 'Create Account')
                    ),
                    
                    h('p', { style: { textAlign: 'center', marginTop: '16px', fontSize: '14px' } },
                        'Already have an account? ',
                        h('span', {
                            style: { color: 'var(--color-accent, #C75B3F)', cursor: 'pointer', fontWeight: '600' },
                            onClick: () => setView('signin')
                        }, 'Sign In')
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
                    h('p', { style: { color: 'var(--color-text-muted, #888)', marginBottom: '24px' } }, 'Enter your email to receive a reset link'),
                    
                    error && h('div', { style: { background: '#fee', color: '#c00', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' } }, error),
                    success && h('div', { style: { background: '#efe', color: '#060', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' } }, success),
                    
                    h('form', { onSubmit: handleForgotPassword },
                        h('input', { type: 'email', placeholder: 'Email', value: email, onChange: (e) => setEmail(e.target.value), style: inputStyle, required: true }),
                        
                        h('button', {
                            type: 'submit',
                            disabled: loading,
                            style: { ...buttonStyle, background: 'var(--color-text-primary, #3D3530)', color: 'white', opacity: loading ? 0.7 : 1 }
                        }, loading ? 'Sending...' : 'Send Reset Link')
                    )
                )
            )
        );
    };

    // ========================================
    // SaveProjectModal Component
    // ========================================
    const SaveProjectModal = ({ isOpen, onClose, onSave, onDiscard, projectTitle }) => {
        if (!isOpen) return null;

        const modalStyle = {
            position: 'fixed',
            inset: '0',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000
        };

        const contentStyle = {
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center'
        };

        const buttonRowStyle = {
            display: 'flex',
            gap: '12px',
            marginTop: '24px'
        };

        const buttonStyle = {
            flex: 1,
            padding: '12px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
        };

        return h('div', { style: modalStyle, onClick: onClose },
            h('div', { style: contentStyle, onClick: (e) => e.stopPropagation() },
                h('h3', { style: { fontFamily: 'var(--font-serif, Georgia)', fontSize: '20px', marginBottom: '12px' } }, 'Save Your Work?'),
                h('p', { style: { color: 'var(--color-text-muted, #888)', marginBottom: '8px' } },
                    projectTitle ? `"${projectTitle}" has unsaved changes.` : 'You have unsaved changes.'
                ),
                h('div', { style: buttonRowStyle },
                    h('button', {
                        onClick: onDiscard,
                        style: { ...buttonStyle, background: 'transparent', border: '1px solid var(--color-border, #e5e5e5)' }
                    }, 'Discard'),
                    h('button', {
                        onClick: onSave,
                        style: { ...buttonStyle, background: 'var(--color-text-primary, #3D3530)', color: 'white', border: 'none' }
                    }, 'Save')
                )
            )
        );
    };

    // ========================================
    // EXPORTS
    // ========================================
    window.SocietyArts = window.SocietyArts || {};
    Object.assign(window.SocietyArts, {
        // Auth state
        AuthState,
        
        // Auth functions
        initializeAuth,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        resetPassword,
        isAdmin,
        isSuperAdmin,
        
        // React components
        useAuth,
        UserAvatar,
        UserMenu,
        AuthModal,
        SaveProjectModal
    });
}

// Export to window for vanilla JS usage
if (typeof window !== 'undefined') {
    window.AuthState = AuthState;
    window.initializeAuth = initializeAuth;
    window.signInWithGoogle = signInWithGoogle;
    window.signOut = signOut;
    window.isAdmin = isAdmin;
    window.isSuperAdmin = isSuperAdmin;
}

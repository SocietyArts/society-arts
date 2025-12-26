/* ========================================
   SOCIETY ARTS - AUTHENTICATION MODULE
   Shared auth for all pages
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
        // Try to create profile if it doesn't exist
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
// REACT COMPONENTS
// ========================================

// Auth Provider Hook
function useAuth() {
    const [authState, setAuthState] = React.useState({
        user: AuthState.user,
        profile: AuthState.profile,
        isLoading: AuthState.isLoading
    });

    React.useEffect(() => {
        // Initialize auth on mount
        if (AuthState.isLoading) {
            initializeAuth();
        }

        // Subscribe to changes
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

// User Avatar Component
function UserAvatar({ user, profile, size = 36, onClick }) {
    const initials = getInitials(profile?.display_name || user?.email);
    
    const style = {
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: 'var(--color-accent, #C75B3F)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.4,
        fontWeight: '600',
        cursor: onClick ? 'pointer' : 'default',
        overflow: 'hidden'
    };

    if (profile?.avatar_url) {
        return (
            <div style={style} onClick={onClick}>
                <img 
                    src={profile.avatar_url} 
                    alt={profile.display_name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            </div>
        );
    }

    return (
        <div style={style} onClick={onClick}>
            {initials}
        </div>
    );
}

// User Menu Dropdown
function UserMenu({ user, profile, onSignOut, onOpenProfile }) {
    const [isOpen, setIsOpen] = React.useState(false);
    const menuRef = React.useRef(null);

    React.useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User';

    return (
        <div className="user-menu" ref={menuRef} style={{ position: 'relative' }}>
            <button 
                className="user-menu-btn"
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'white',
                    border: '1px solid var(--color-border, #e5e5e5)',
                    borderRadius: '24px',
                    padding: '4px 12px 4px 4px',
                    cursor: 'pointer',
                    fontFamily: 'inherit'
                }}
            >
                <UserAvatar user={user} profile={profile} size={32} />
                <span style={{ fontSize: '14px', fontWeight: '500' }}>{displayName}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points={isOpen ? "18 15 12 9 6 15" : "6 9 12 15 18 9"}></polyline>
                </svg>
            </button>

            {isOpen && (
                <div 
                    className="user-dropdown"
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        right: 0,
                        width: '200px',
                        background: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                        border: '1px solid var(--color-border, #e5e5e5)',
                        padding: '8px 0',
                        zIndex: 200
                    }}
                >
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border, #e5e5e5)' }}>
                        <div style={{ fontWeight: '600', marginBottom: '2px' }}>{displayName}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted, #888)' }}>{user?.email}</div>
                        {profile?.role && profile.role !== 'user' && (
                            <span style={{
                                display: 'inline-block',
                                marginTop: '4px',
                                padding: '2px 8px',
                                fontSize: '10px',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                background: profile.role === 'super_admin' ? '#7c3aed' : '#C75B3F',
                                color: 'white',
                                borderRadius: '4px'
                            }}>
                                {profile.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                            </span>
                        )}
                    </div>

                    {onOpenProfile && (
                        <button
                            onClick={() => { onOpenProfile(); setIsOpen(false); }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                width: '100%',
                                padding: '10px 16px',
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                fontSize: '14px',
                                textAlign: 'left'
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            Profile
                        </button>
                    )}

                    <button
                        onClick={() => { onSignOut(); setIsOpen(false); }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            width: '100%',
                            padding: '10px 16px',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            fontSize: '14px',
                            textAlign: 'left',
                            color: 'var(--color-accent, #C75B3F)'
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        Sign Out
                    </button>
                </div>
            )}
        </div>
    );
}

// Auth Modal Component
function AuthModal({ isOpen, onClose }) {
    const [view, setView] = React.useState('welcome'); // welcome, signin, signup, forgot
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [displayName, setDisplayName] = React.useState('');
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            // Reset state when closing
            setView('welcome');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setDisplayName('');
            setError('');
            setSuccess('');
        }
        return () => { document.body.style.overflow = ''; };
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
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError('');
        
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        
        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setLoading(true);

        try {
            const result = await signUpWithEmail(email, password, displayName);
            if (result.user && !result.session) {
                setSuccess('Check your email for a confirmation link!');
            } else {
                onClose();
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await resetPassword(email);
            setSuccess('Check your email for a password reset link!');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const modalStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)'
    };

    const contentStyle = {
        background: 'white',
        borderRadius: '24px',
        padding: '40px',
        maxWidth: '420px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative'
    };

    const inputStyle = {
        width: '100%',
        padding: '14px 18px',
        border: '1px solid var(--color-border, #e5e5e5)',
        borderRadius: '25px',
        fontSize: '15px',
        marginBottom: '12px',
        outline: 'none',
        fontFamily: 'inherit'
    };

    const buttonStyle = {
        width: '100%',
        padding: '14px',
        border: 'none',
        borderRadius: '25px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'all 0.2s'
    };

    const socialButtonStyle = {
        ...buttonStyle,
        background: 'white',
        border: '1px solid var(--color-border, #e5e5e5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        marginBottom: '10px'
    };

    return (
        <div style={modalStyle} onClick={onClose}>
            <div style={contentStyle} onClick={e => e.stopPropagation()}>
                <button 
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '8px'
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                {/* Welcome View */}
                {view === 'welcome' && (
                    <>
                        <h2 style={{ fontFamily: 'var(--font-serif, Georgia)', fontSize: '28px', marginBottom: '8px', textAlign: 'center' }}>
                            Welcome to Society Arts
                        </h2>
                        <p style={{ color: 'var(--color-text-muted, #888)', textAlign: 'center', marginBottom: '24px' }}>
                            Sign in or create an account
                        </p>

                        {error && (
                            <div style={{ background: '#fee', color: '#c00', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                                {error}
                            </div>
                        )}

                        <button style={socialButtonStyle} onClick={handleGoogleSignIn}>
                            <svg viewBox="0 0 24 24" width="20" height="20">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Continue with Google
                        </button>

                        <button style={{...socialButtonStyle, opacity: 0.5, cursor: 'not-allowed'}}>
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                            </svg>
                            Continue with Apple (Coming Soon)
                        </button>

                        <button style={{...socialButtonStyle, opacity: 0.5, cursor: 'not-allowed'}}>
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="#1877F2">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                            Continue with Facebook (Coming Soon)
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
                            <div style={{ flex: 1, height: '1px', background: 'var(--color-border, #e5e5e5)' }}></div>
                            <span style={{ padding: '0 16px', color: 'var(--color-text-muted, #888)', fontSize: '13px' }}>or</span>
                            <div style={{ flex: 1, height: '1px', background: 'var(--color-border, #e5e5e5)' }}></div>
                        </div>

                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            style={inputStyle}
                        />

                        <button 
                            style={{...buttonStyle, background: 'var(--color-text-primary, #3D3530)', color: 'white'}}
                            onClick={() => setView('signup')}
                        >
                            Continue with Email
                        </button>

                        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px' }}>
                            Already have an account?{' '}
                            <span 
                                style={{ color: 'var(--color-accent, #C75B3F)', cursor: 'pointer', fontWeight: '600' }}
                                onClick={() => setView('signin')}
                            >
                                Sign In
                            </span>
                        </p>
                    </>
                )}

                {/* Sign In View */}
                {view === 'signin' && (
                    <>
                        <span 
                            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px', fontSize: '14px' }}
                            onClick={() => setView('welcome')}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                            Back
                        </span>

                        <h2 style={{ fontFamily: 'var(--font-serif, Georgia)', fontSize: '28px', marginBottom: '8px' }}>
                            Welcome Back
                        </h2>
                        <p style={{ color: 'var(--color-text-muted, #888)', marginBottom: '24px' }}>
                            Sign in to your account
                        </p>

                        {error && (
                            <div style={{ background: '#fee', color: '#c00', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleEmailSignIn}>
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                style={inputStyle}
                                required
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                style={inputStyle}
                                required
                            />

                            <p style={{ textAlign: 'right', marginBottom: '16px' }}>
                                <span 
                                    style={{ color: 'var(--color-accent, #C75B3F)', cursor: 'pointer', fontSize: '14px' }}
                                    onClick={() => setView('forgot')}
                                >
                                    Forgot password?
                                </span>
                            </p>

                            <button 
                                type="submit"
                                disabled={loading}
                                style={{
                                    ...buttonStyle, 
                                    background: 'var(--color-text-primary, #3D3530)', 
                                    color: 'white',
                                    opacity: loading ? 0.7 : 1
                                }}
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                            </button>
                        </form>

                        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px' }}>
                            Don't have an account?{' '}
                            <span 
                                style={{ color: 'var(--color-accent, #C75B3F)', cursor: 'pointer', fontWeight: '600' }}
                                onClick={() => setView('signup')}
                            >
                                Sign Up
                            </span>
                        </p>
                    </>
                )}

                {/* Sign Up View */}
                {view === 'signup' && (
                    <>
                        <span 
                            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px', fontSize: '14px' }}
                            onClick={() => setView('welcome')}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                            Back
                        </span>

                        <h2 style={{ fontFamily: 'var(--font-serif, Georgia)', fontSize: '28px', marginBottom: '8px' }}>
                            Create Account
                        </h2>
                        <p style={{ color: 'var(--color-text-muted, #888)', marginBottom: '24px' }}>
                            Join Society Arts today
                        </p>

                        {error && (
                            <div style={{ background: '#fee', color: '#c00', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                                {error}
                            </div>
                        )}

                        {success && (
                            <div style={{ background: '#efe', color: '#060', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                                {success}
                            </div>
                        )}

                        <form onSubmit={handleSignUp}>
                            <input
                                type="text"
                                placeholder="Display Name"
                                value={displayName}
                                onChange={e => setDisplayName(e.target.value)}
                                style={inputStyle}
                                required
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                style={inputStyle}
                                required
                            />
                            <input
                                type="password"
                                placeholder="Password (min 8 characters)"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                style={inputStyle}
                                required
                                minLength={8}
                            />
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                style={inputStyle}
                                required
                            />

                            <button 
                                type="submit"
                                disabled={loading}
                                style={{
                                    ...buttonStyle, 
                                    background: 'var(--color-text-primary, #3D3530)', 
                                    color: 'white',
                                    opacity: loading ? 0.7 : 1
                                }}
                            >
                                {loading ? 'Creating account...' : 'Create Account'}
                            </button>
                        </form>

                        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px' }}>
                            Already have an account?{' '}
                            <span 
                                style={{ color: 'var(--color-accent, #C75B3F)', cursor: 'pointer', fontWeight: '600' }}
                                onClick={() => setView('signin')}
                            >
                                Sign In
                            </span>
                        </p>
                    </>
                )}

                {/* Forgot Password View */}
                {view === 'forgot' && (
                    <>
                        <span 
                            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px', fontSize: '14px' }}
                            onClick={() => setView('signin')}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                            Back
                        </span>

                        <h2 style={{ fontFamily: 'var(--font-serif, Georgia)', fontSize: '28px', marginBottom: '8px' }}>
                            Reset Password
                        </h2>
                        <p style={{ color: 'var(--color-text-muted, #888)', marginBottom: '24px' }}>
                            Enter your email to receive a reset link
                        </p>

                        {error && (
                            <div style={{ background: '#fee', color: '#c00', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                                {error}
                            </div>
                        )}

                        {success && (
                            <div style={{ background: '#efe', color: '#060', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                                {success}
                            </div>
                        )}

                        <form onSubmit={handleForgotPassword}>
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                style={inputStyle}
                                required
                            />

                            <button 
                                type="submit"
                                disabled={loading}
                                style={{
                                    ...buttonStyle, 
                                    background: 'var(--color-text-primary, #3D3530)', 
                                    color: 'white',
                                    opacity: loading ? 0.7 : 1
                                }}
                            >
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

// ========================================
// EXPORTS
// ========================================

if (typeof window !== 'undefined') {
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
        AuthModal
    });
}

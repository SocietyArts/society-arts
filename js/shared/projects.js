/* ========================================
   SOCIETY ARTS - PROJECTS MODULE
   Save, load, and manage user projects
   ======================================== */

// ========================================
// PROJECT STATE
// ========================================

const ProjectState = {
    projects: [],
    currentProject: null,
    isLoading: false,
    listeners: []
};

// ========================================
// PROJECT HELPERS
// ========================================

function addProjectListener(callback) {
    ProjectState.listeners.push(callback);
    return () => {
        ProjectState.listeners = ProjectState.listeners.filter(l => l !== callback);
    };
}

function notifyProjectListeners() {
    ProjectState.listeners.forEach(l => l(ProjectState));
}

// ========================================
// PROJECT CRUD OPERATIONS
// ========================================

async function loadUserProjects() {
    const { supabase, AuthState } = window.SocietyArts;
    if (!supabase || !AuthState?.user) {
        console.log('Cannot load projects: not authenticated');
        return [];
    }

    ProjectState.isLoading = true;
    notifyProjectListeners();

    try {
        const { data, error } = await supabase
            .from('user_projects')
            .select('*')
            .eq('user_id', AuthState.user.id)
            .order('updated_at', { ascending: false });

        if (error) throw error;

        ProjectState.projects = data || [];
        console.log(`Loaded ${ProjectState.projects.length} projects`);
    } catch (error) {
        console.error('Failed to load projects:', error);
        ProjectState.projects = [];
    }

    ProjectState.isLoading = false;
    notifyProjectListeners();
    return ProjectState.projects;
}

async function saveProject(projectData) {
    const { supabase, AuthState } = window.SocietyArts;
    if (!supabase || !AuthState?.user) {
        throw new Error('Must be logged in to save projects');
    }

    const now = new Date().toISOString();
    
    // Prepare project data
    const project = {
        user_id: AuthState.user.id,
        title: projectData.title || 'Untitled Project',
        status: projectData.status || 'draft',
        story: projectData.story || '',
        transformed_story: projectData.transformedStory || null,
        transform_label: projectData.transformLabel || null,
        aspect_ratio: projectData.aspectRatio || '1:1',
        selected_styles: projectData.selectedStyles || [],
        chat_history: projectData.chatHistory || [],
        updated_at: now
    };

    try {
        let result;
        
        if (projectData.id) {
            // Update existing project
            const { data, error } = await supabase
                .from('user_projects')
                .update(project)
                .eq('id', projectData.id)
                .eq('user_id', AuthState.user.id)
                .select()
                .single();

            if (error) throw error;
            result = data;
            
            // Update in local state
            const index = ProjectState.projects.findIndex(p => p.id === projectData.id);
            if (index >= 0) {
                ProjectState.projects[index] = result;
            }
        } else {
            // Create new project
            project.created_at = now;
            
            const { data, error } = await supabase
                .from('user_projects')
                .insert(project)
                .select()
                .single();

            if (error) throw error;
            result = data;
            
            // Add to local state
            ProjectState.projects.unshift(result);
        }

        ProjectState.currentProject = result;
        notifyProjectListeners();
        
        console.log('Project saved:', result.id);
        return result;
    } catch (error) {
        console.error('Failed to save project:', error);
        throw error;
    }
}

async function deleteProject(projectId) {
    const { supabase, AuthState } = window.SocietyArts;
    if (!supabase || !AuthState?.user) {
        throw new Error('Must be logged in to delete projects');
    }

    try {
        const { error } = await supabase
            .from('user_projects')
            .delete()
            .eq('id', projectId)
            .eq('user_id', AuthState.user.id);

        if (error) throw error;

        // Remove from local state
        ProjectState.projects = ProjectState.projects.filter(p => p.id !== projectId);
        
        if (ProjectState.currentProject?.id === projectId) {
            ProjectState.currentProject = null;
        }

        notifyProjectListeners();
        console.log('Project deleted:', projectId);
        return true;
    } catch (error) {
        console.error('Failed to delete project:', error);
        throw error;
    }
}

async function loadProject(projectId) {
    const { supabase, AuthState } = window.SocietyArts;
    if (!supabase || !AuthState?.user) {
        throw new Error('Must be logged in to load projects');
    }

    try {
        const { data, error } = await supabase
            .from('user_projects')
            .select('*')
            .eq('id', projectId)
            .eq('user_id', AuthState.user.id)
            .single();

        if (error) throw error;

        ProjectState.currentProject = data;
        notifyProjectListeners();
        return data;
    } catch (error) {
        console.error('Failed to load project:', error);
        throw error;
    }
}

function clearCurrentProject() {
    ProjectState.currentProject = null;
    notifyProjectListeners();
}

function getProjectCount() {
    return ProjectState.projects.length;
}

// ========================================
// FAVORITES OPERATIONS
// ========================================

let userFavorites = [];

async function loadUserFavorites() {
    const { supabase, AuthState } = window.SocietyArts;
    if (!supabase || !AuthState?.user) {
        return [];
    }

    try {
        const { data, error } = await supabase
            .from('user_favorites')
            .select('style_id, style_name, created_at')
            .eq('user_id', AuthState.user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        userFavorites = data || [];
        console.log(`Loaded ${userFavorites.length} favorites`);
        return userFavorites;
    } catch (error) {
        console.error('Failed to load favorites:', error);
        return [];
    }
}

async function addFavorite(styleId, styleName) {
    const { supabase, AuthState } = window.SocietyArts;
    if (!supabase || !AuthState?.user) {
        throw new Error('Must be logged in to add favorites');
    }

    try {
        const { data, error } = await supabase
            .from('user_favorites')
            .insert({
                user_id: AuthState.user.id,
                style_id: styleId,
                style_name: styleName || null
            })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                // Already exists, that's fine
                return true;
            }
            throw error;
        }

        userFavorites.unshift({ 
            style_id: styleId, 
            style_name: styleName,
            created_at: new Date().toISOString() 
        });
        return true;
    } catch (error) {
        console.error('Failed to add favorite:', error);
        throw error;
    }
}

async function removeFavorite(styleId) {
    const { supabase, AuthState } = window.SocietyArts;
    if (!supabase || !AuthState?.user) {
        throw new Error('Must be logged in to remove favorites');
    }

    try {
        const { error } = await supabase
            .from('user_favorites')
            .delete()
            .eq('user_id', AuthState.user.id)
            .eq('style_id', styleId);

        if (error) throw error;

        userFavorites = userFavorites.filter(f => f.style_id !== styleId);
        return true;
    } catch (error) {
        console.error('Failed to remove favorite:', error);
        throw error;
    }
}

function isStyleFavorited(styleId) {
    return userFavorites.some(f => f.style_id === styleId);
}

function getFavoriteCount() {
    return userFavorites.length;
}

function getFavoriteStyleIds() {
    return userFavorites.map(f => f.style_id);
}

// ========================================
// REACT HOOKS
// ========================================

function useProjects() {
    const [state, setState] = React.useState({
        projects: ProjectState.projects,
        currentProject: ProjectState.currentProject,
        isLoading: ProjectState.isLoading
    });

    React.useEffect(() => {
        const unsubscribe = addProjectListener((newState) => {
            setState({
                projects: newState.projects,
                currentProject: newState.currentProject,
                isLoading: newState.isLoading
            });
        });

        // Load projects on mount if authenticated
        if (window.SocietyArts.AuthState?.user && ProjectState.projects.length === 0) {
            loadUserProjects();
        }

        return unsubscribe;
    }, []);

    return {
        ...state,
        loadProjects: loadUserProjects,
        saveProject,
        deleteProject,
        loadProject,
        clearCurrentProject,
        getProjectCount
    };
}

function useFavorites() {
    const [favorites, setFavorites] = React.useState(userFavorites);

    React.useEffect(() => {
        // Load favorites on mount if authenticated
        if (window.SocietyArts.AuthState?.user && userFavorites.length === 0) {
            loadUserFavorites().then(setFavorites);
        }
    }, []);

    const toggleFavorite = async (styleId) => {
        if (isStyleFavorited(styleId)) {
            await removeFavorite(styleId);
        } else {
            await addFavorite(styleId);
        }
        setFavorites([...userFavorites]);
    };

    return {
        favorites,
        isStyleFavorited,
        toggleFavorite,
        addFavorite,
        removeFavorite,
        getFavoriteCount,
        getFavoriteStyleIds,
        loadFavorites: loadUserFavorites
    };
}

// ========================================
// REACT COMPONENTS
// ========================================

// Save Project Confirmation Modal
function SaveProjectModal({ isOpen, onClose, onSave, onDiscard, projectTitle }) {
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
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '400px',
        width: '90%',
        textAlign: 'center'
    };

    return (
        <div style={modalStyle} onClick={onClose}>
            <div style={contentStyle} onClick={e => e.stopPropagation()}>
                <h3 style={{ 
                    fontFamily: 'var(--font-serif, Georgia)', 
                    fontSize: '22px', 
                    marginBottom: '12px' 
                }}>
                    Save Your Project?
                </h3>
                <p style={{ 
                    color: 'var(--color-text-muted, #888)', 
                    marginBottom: '24px',
                    lineHeight: '1.5'
                }}>
                    You have unsaved changes to "{projectTitle || 'Untitled Project'}". 
                    Would you like to save before continuing?
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button
                        onClick={onDiscard}
                        style={{
                            padding: '12px 24px',
                            border: '1px solid var(--color-border, #e5e5e5)',
                            borderRadius: '25px',
                            background: 'white',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500'
                        }}
                    >
                        Don't Save
                    </button>
                    <button
                        onClick={onSave}
                        style={{
                            padding: '12px 24px',
                            border: 'none',
                            borderRadius: '25px',
                            background: 'var(--color-text-primary, #3D3530)',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600'
                        }}
                    >
                        Save Project
                    </button>
                </div>
            </div>
        </div>
    );
}

// Delete Project Confirmation Modal
function DeleteProjectModal({ isOpen, onClose, onConfirm, projectTitle }) {
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
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '400px',
        width: '90%',
        textAlign: 'center'
    };

    return (
        <div style={modalStyle} onClick={onClose}>
            <div style={contentStyle} onClick={e => e.stopPropagation()}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: '#fee2e2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                </div>
                <h3 style={{ 
                    fontFamily: 'var(--font-serif, Georgia)', 
                    fontSize: '22px', 
                    marginBottom: '12px' 
                }}>
                    Delete Project?
                </h3>
                <p style={{ 
                    color: 'var(--color-text-muted, #888)', 
                    marginBottom: '24px',
                    lineHeight: '1.5'
                }}>
                    Are you sure you want to delete "{projectTitle}"? 
                    This action cannot be undone.
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '12px 24px',
                            border: '1px solid var(--color-border, #e5e5e5)',
                            borderRadius: '25px',
                            background: 'white',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{
                            padding: '12px 24px',
                            border: 'none',
                            borderRadius: '25px',
                            background: '#dc2626',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600'
                        }}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

// Projects List Component
function ProjectsList({ onSelectProject, onClose }) {
    const { projects, isLoading, deleteProject, loadProjects } = useProjects();
    const [sortBy, setSortBy] = React.useState('date'); // 'date' or 'title'
    const [deleteModal, setDeleteModal] = React.useState({ open: false, project: null });

    React.useEffect(() => {
        loadProjects();
    }, []);

    const sortedProjects = React.useMemo(() => {
        const sorted = [...projects];
        if (sortBy === 'title') {
            sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        } else {
            sorted.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        }
        return sorted;
    }, [projects, sortBy]);

    const handleDelete = async () => {
        if (deleteModal.project) {
            await deleteProject(deleteModal.project.id);
            setDeleteModal({ open: false, project: null });
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
        });
    };

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '24px'
            }}>
                <h2 style={{ 
                    fontFamily: 'var(--font-serif, Georgia)', 
                    fontSize: '24px',
                    margin: 0
                }}>
                    My Projects ({projects.length})
                </h2>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => setSortBy('date')}
                        style={{
                            padding: '8px 16px',
                            border: '1px solid var(--color-border, #e5e5e5)',
                            borderRadius: '20px',
                            background: sortBy === 'date' ? 'var(--color-text-primary, #3D3530)' : 'white',
                            color: sortBy === 'date' ? 'white' : 'inherit',
                            cursor: 'pointer',
                            fontSize: '13px'
                        }}
                    >
                        By Date
                    </button>
                    <button
                        onClick={() => setSortBy('title')}
                        style={{
                            padding: '8px 16px',
                            border: '1px solid var(--color-border, #e5e5e5)',
                            borderRadius: '20px',
                            background: sortBy === 'title' ? 'var(--color-text-primary, #3D3530)' : 'white',
                            color: sortBy === 'title' ? 'white' : 'inherit',
                            cursor: 'pointer',
                            fontSize: '13px'
                        }}
                    >
                        By Title
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted, #888)' }}>
                    Loading projects...
                </div>
            ) : sortedProjects.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted, #888)' }}>
                    <p style={{ marginBottom: '16px' }}>You don't have any projects yet.</p>
                    <a 
                        href="/story-builder.html" 
                        style={{ color: 'var(--color-accent, #C75B3F)', fontWeight: '600' }}
                    >
                        Start your first project →
                    </a>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {sortedProjects.map(project => (
                        <div 
                            key={project.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '16px',
                                background: 'var(--color-surface-alt, #f8f7f5)',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                            }}
                            onClick={() => onSelectProject(project)}
                            onMouseEnter={e => e.currentTarget.style.background = '#f0efed'}
                            onMouseLeave={e => e.currentTarget.style.background = 'var(--color-surface-alt, #f8f7f5)'}
                        >
                            {/* Preview thumbnail */}
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '8px',
                                background: 'var(--color-border, #e5e5e5)',
                                marginRight: '16px',
                                overflow: 'hidden',
                                flexShrink: 0
                            }}>
                                {project.selected_styles?.[0] && (
                                    <img 
                                        src={`https://pub-d4d49982f29749dea52e2eb37c29ad51.r2.dev/${project.selected_styles[0]}/${project.selected_styles[0]}_1.webp`}
                                        alt=""
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onError={e => e.target.style.display = 'none'}
                                    />
                                )}
                            </div>
                            
                            {/* Project info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h4 style={{ 
                                    margin: '0 0 4px 0', 
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                    {project.title || 'Untitled Project'}
                                </h4>
                                <p style={{ 
                                    margin: 0, 
                                    fontSize: '13px', 
                                    color: 'var(--color-text-muted, #888)',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                    {project.story ? project.story.slice(0, 60) + '...' : 'No story yet'}
                                </p>
                            </div>
                            
                            {/* Meta info */}
                            <div style={{ 
                                textAlign: 'right', 
                                marginLeft: '16px',
                                flexShrink: 0
                            }}>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-muted, #888)' }}>
                                    {formatDate(project.updated_at)}
                                </div>
                                <div style={{ fontSize: '12px', marginTop: '4px' }}>
                                    {project.selected_styles?.length || 0} style{project.selected_styles?.length !== 1 ? 's' : ''}
                                </div>
                            </div>
                            
                            {/* Delete button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteModal({ open: true, project });
                                }}
                                style={{
                                    marginLeft: '12px',
                                    padding: '8px',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--color-text-muted, #888)',
                                    borderRadius: '8px'
                                }}
                                onMouseEnter={e => e.currentTarget.style.color = '#dc2626'}
                                onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted, #888)'}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <DeleteProjectModal
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, project: null })}
                onConfirm={handleDelete}
                projectTitle={deleteModal.project?.title}
            />
        </div>
    );
}

// ========================================
// EXPORTS
// ========================================

if (typeof window !== 'undefined') {
    window.SocietyArts = window.SocietyArts || {};
    Object.assign(window.SocietyArts, {
        // State
        ProjectState,
        
        // Project functions
        loadUserProjects,
        saveProject,
        deleteProject,
        loadProject,
        clearCurrentProject,
        getProjectCount,
        
        // Favorites functions
        loadUserFavorites,
        addFavorite,
        removeFavorite,
        isStyleFavorited,
        getFavoriteCount,
        getFavoriteStyleIds,
        
        // React hooks
        useProjects,
        useFavorites,
        
        // React components
        SaveProjectModal,
        DeleteProjectModal,
        ProjectsList
    });
}

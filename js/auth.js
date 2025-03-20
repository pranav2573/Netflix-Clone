// User authentication related functionality

// Local storage keys
const USER_KEY = 'netflix_clone_user';
const TOKEN_KEY = 'netflix_clone_token';

// Check if user is authenticated
function isAuthenticated() {
    try {
        return !!getToken();
    } catch (e) {
        console.error('Error checking authentication:', e);
        return false;
    }
}

// Get stored token
function getToken() {
    try {
        return localStorage.getItem(TOKEN_KEY);
    } catch (e) {
        console.error('Error getting token from localStorage:', e);
        return null;
    }
}

// Get stored user
function getUser() {
    try {
        const userStr = localStorage.getItem(USER_KEY);
        if (!userStr) return null;
        
        return JSON.parse(userStr);
    } catch (error) {
        console.error('Error parsing user data:', error);
        logout(); // Clear invalid data
        return null;
    }
}

// Store user and token
function setUserAndToken(user, token) {
    try {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        localStorage.setItem(TOKEN_KEY, token);
        return true;
    } catch (e) {
        console.error('Error storing user data:', e);
        return false;
    }
}

// Log out user
function logout() {
    try {
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_KEY);
        window.location.reload();
    } catch (e) {
        console.error('Error during logout:', e);
        // Try an alternative approach if the standard one fails
        window.location.href = window.location.pathname;
    }
}

// Generate a dummy token (In a real app this would come from a server)
function generateToken() {
    return 'token_' + Math.random().toString(36).substr(2, 9);
}

// Simple user database (In a real app this would be on a server)
let users = [];
try {
    users = JSON.parse(localStorage.getItem('netflix_clone_users') || '[]');
} catch (e) {
    console.error('Error loading user database:', e);
    // Reset users if there's an error
    users = [];
}

// Save users to local storage
function saveUsers() {
    try {
        localStorage.setItem('netflix_clone_users', JSON.stringify(users));
        return true;
    } catch (e) {
        console.error('Error saving users to localStorage:', e);
        return false;
    }
}

// Register a new user
function registerUser(name, email, password) {
    if (!name || !email || !password) {
        return { success: false, message: 'All fields are required.' };
    }
    
    // Check if user already exists
    if (users.some(user => user.email === email)) {
        return { success: false, message: 'User with this email already exists.' };
    }
    
    try {
        // Create new user
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password // In a real app, this would be hashed
        };
        
        users.push(newUser);
        saveUsers();
        
        // Create user data for storage (without password)
        const userData = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email
        };
        
        const token = generateToken();
        const stored = setUserAndToken(userData, token);
        
        if (!stored) {
            return { success: false, message: 'Could not store user data. Please check browser storage permissions.' };
        }
        
        return { success: true, user: userData, token };
    } catch (e) {
        console.error('Error during user registration:', e);
        return { success: false, message: 'An error occurred during registration.' };
    }
}

// Login user
function loginUser(email, password) {
    if (!email || !password) {
        return { success: false, message: 'Email and password are required.' };
    }
    
    try {
        // Find user
        const user = users.find(user => user.email === email && user.password === password);
        
        if (!user) {
            return { success: false, message: 'Invalid email or password.' };
        }
        
        // Create user data for storage (without password)
        const userData = {
            id: user.id,
            name: user.name,
            email: user.email
        };
        
        const token = generateToken();
        const stored = setUserAndToken(userData, token);
        
        if (!stored) {
            return { success: false, message: 'Could not store user data. Please check browser storage permissions.' };
        }
        
        return { success: true, user: userData, token };
    } catch (e) {
        console.error('Error during login:', e);
        return { success: false, message: 'An error occurred during login.' };
    }
}

// Initialize authentication listeners
function initAuth() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const showSignupBtn = document.getElementById('showSignupBtn');
    const showLoginBtn = document.getElementById('showLoginBtn');
    const loginError = document.getElementById('loginError');
    const signupError = document.getElementById('signupError');
    const userAvatar = document.querySelector('.user-avatar');
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    
    // Update user avatar if logged in
    const currentUser = getUser();
    if (currentUser && dropdownToggle) {
        // We don't need this code that adds initials overlay, so removing it
        // Keep dropdown functionality but remove the avatar-initials element
    }
    
    // Add demo account if none exists
    if (users.length === 0) {
        // Create a demo account for easy testing
        registerUser('Demo User', 'demo@example.com', 'password123');
        console.log('Demo account created: demo@example.com / password123');
        
        // Add a Netflix preset account too
        registerUser('Netflix Admin', 'admin@netflix.com', 'netflix2025');
        console.log('Admin account created: admin@netflix.com / netflix2025');
    }
    
    // Add auto-login option to the login form
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        const modalBody = loginModal.querySelector('.modal-body');
        if (modalBody && modalBody.querySelector('form')) {
            const autoLoginDiv = document.createElement('div');
            autoLoginDiv.className = 'text-center mt-3 mb-3';
            autoLoginDiv.innerHTML = `
                <button type="button" class="btn btn-sm btn-outline-secondary me-2" id="autoLoginDemo">Demo Login</button>
                <button type="button" class="btn btn-sm btn-outline-danger" id="autoLoginAdmin">Admin Login</button>
            `;
            
            // Insert before the form
            modalBody.insertBefore(autoLoginDiv, modalBody.querySelector('form'));
            
            // Add click handlers for auto-login buttons
            document.getElementById('autoLoginDemo')?.addEventListener('click', function() {
                document.getElementById('email').value = 'demo@example.com';
                document.getElementById('password').value = 'password123';
                loginForm.querySelector('button[type="submit"]').click();
            });
            
            document.getElementById('autoLoginAdmin')?.addEventListener('click', function() {
                document.getElementById('email').value = 'admin@netflix.com';
                document.getElementById('password').value = 'netflix2025';
                loginForm.querySelector('button[type="submit"]').click();
            });
        }
    }
    
    // Helper to display errors
    function displayError(element, message) {
        if (element) {
            element.textContent = message;
            element.classList.remove('d-none');
            // Automatically hide after 5 seconds
            setTimeout(() => {
                element.classList.add('d-none');
            }, 5000);
        } else {
            alert(message);
        }
    }
    
    // Helper to display success message
    function displaySuccess(form, message) {
        let successElement = form.querySelector('.alert-success');
        if (!successElement) {
            successElement = document.createElement('div');
            successElement.className = 'alert alert-success mt-3';
            form.appendChild(successElement);
        }
        
        successElement.textContent = message;
        // Automatically hide after 3 seconds
        setTimeout(() => {
            successElement.remove();
        }, 3000);
    }
    
    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            try {
                if (loginError) loginError.classList.add('d-none');
                
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                
                // Disable the form during login
                const submitButton = loginForm.querySelector('button[type="submit"]');
                if (submitButton) {
                    submitButton.disabled = true;
                    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Signing in...';
                }
                
                const result = loginUser(email, password);
                
                if (result.success) {
                    displaySuccess(loginForm, 'Login successful! Redirecting...');
                    
                    setTimeout(() => {
                        try {
                            const loginModalElem = document.getElementById('loginModal');
                            if (loginModalElem) {
                                const modalInstance = bootstrap.Modal.getInstance(loginModalElem);
                                if (modalInstance) modalInstance.hide();
                            }
                            window.location.reload();
                        } catch (e) {
                            console.error('Error closing modal:', e);
                            window.location.reload();
                        }
                    }, 1000);
                } else {
                    if (submitButton) {
                        submitButton.disabled = false;
                        submitButton.innerHTML = 'Sign In';
                    }
                    displayError(loginError, result.message);
                }
            } catch (error) {
                console.error('Login error:', error);
                displayError(loginError, 'An unexpected error occurred. Please try again.');
                const submitButton = loginForm.querySelector('button[type="submit"]');
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = 'Sign In';
                }
            }
        });
    }
    
    // Signup form submission
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            try {
                if (signupError) signupError.classList.add('d-none');
                
                const name = document.getElementById('signupName').value;
                const email = document.getElementById('signupEmail').value;
                const password = document.getElementById('signupPassword').value;
                
                // Disable the form during signup
                const submitButton = signupForm.querySelector('button[type="submit"]');
                if (submitButton) submitButton.disabled = true;
                
                const result = registerUser(name, email, password);
                
                if (result.success) {
                    try {
                        const signupModalElem = document.getElementById('signupModal');
                        if (signupModalElem) {
                            const modalInstance = bootstrap.Modal.getInstance(signupModalElem);
                            if (modalInstance) modalInstance.hide();
                        }
                        window.location.reload();
                    } catch (e) {
                        console.error('Error closing modal:', e);
                        window.location.reload();
                    }
                } else {
                    if (submitButton) submitButton.disabled = false;
                    displayError(signupError, result.message);
                }
            } catch (error) {
                console.error('Signup error:', error);
                displayError(signupError, 'An unexpected error occurred. Please try again.');
                const submitButton = signupForm.querySelector('button[type="submit"]');
                if (submitButton) submitButton.disabled = false;
            }
        });
    }
    
    // Logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
    
    // Toggle between login and signup modals
    if (showSignupBtn) {
        showSignupBtn.addEventListener('click', function(e) {
            e.preventDefault();
            try {
                const loginModalElem = document.getElementById('loginModal');
                if (loginModalElem) {
                    const modalInstance = bootstrap.Modal.getInstance(loginModalElem);
                    if (modalInstance) modalInstance.hide();
                    setTimeout(() => {
                        new bootstrap.Modal(document.getElementById('signupModal')).show();
                    }, 200);
                }
            } catch (error) {
                console.error('Error toggling to signup modal:', error);
                window.location.reload();
            }
        });
    }
    
    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            try {
                const signupModalElem = document.getElementById('signupModal');
                if (signupModalElem) {
                    const modalInstance = bootstrap.Modal.getInstance(signupModalElem);
                    if (modalInstance) modalInstance.hide();
                    setTimeout(() => {
                        new bootstrap.Modal(document.getElementById('loginModal')).show();
                    }, 200);
                }
            } catch (error) {
                console.error('Error toggling to login modal:', error);
                window.location.reload();
            }
        });
    }
} 
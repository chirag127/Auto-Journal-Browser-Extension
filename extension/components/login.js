// Auto-Journal - Login Component
// Component for user authentication

import AuthUtil from '../utils/auth.js';

/**
 * Create login form element
 * @param {Function} onLogin - Login success callback
 * @returns {HTMLElement} - Login form element
 */
function createLoginForm(onLogin) {
  const loginForm = document.createElement('div');
  loginForm.className = 'login-form';
  
  loginForm.innerHTML = `
    <div class="form-header">
      <h2>Login to Auto-Journal</h2>
      <p>Please enter your credentials to continue</p>
    </div>
    <div class="form-group">
      <label for="userId">User ID</label>
      <input type="text" id="userId" placeholder="Enter your user ID" required>
    </div>
    <div class="form-group">
      <label for="password">Password</label>
      <input type="password" id="password" placeholder="Enter your password" required>
    </div>
    <div class="form-error" style="display: none; color: #f44336; margin-bottom: 10px;"></div>
    <div class="form-actions">
      <button type="button" id="login-button" class="primary-button">Login</button>
    </div>
    <div class="form-footer">
      <p>Don't have an account? <a href="#" id="register-link">Register</a></p>
    </div>
  `;
  
  // Add event listeners
  const loginButton = loginForm.querySelector('#login-button');
  const registerLink = loginForm.querySelector('#register-link');
  const userIdInput = loginForm.querySelector('#userId');
  const passwordInput = loginForm.querySelector('#password');
  const errorElement = loginForm.querySelector('.form-error');
  
  loginButton.addEventListener('click', async () => {
    const userId = userIdInput.value.trim();
    const password = passwordInput.value;
    
    if (!userId || !password) {
      showError(errorElement, 'Please enter both user ID and password');
      return;
    }
    
    try {
      loginButton.disabled = true;
      loginButton.textContent = 'Logging in...';
      
      const data = await AuthUtil.login(userId, password);
      
      if (onLogin) {
        onLogin(data);
      }
    } catch (error) {
      showError(errorElement, error.message || 'Login failed');
      loginButton.disabled = false;
      loginButton.textContent = 'Login';
    }
  });
  
  registerLink.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Replace login form with register form
    const registerForm = createRegisterForm(onLogin);
    loginForm.parentNode.replaceChild(registerForm, loginForm);
  });
  
  return loginForm;
}

/**
 * Create register form element
 * @param {Function} onLogin - Login success callback
 * @returns {HTMLElement} - Register form element
 */
function createRegisterForm(onLogin) {
  const registerForm = document.createElement('div');
  registerForm.className = 'login-form';
  
  registerForm.innerHTML = `
    <div class="form-header">
      <h2>Register for Auto-Journal</h2>
      <p>Create a new account</p>
    </div>
    <div class="form-group">
      <label for="userId">User ID</label>
      <input type="text" id="userId" placeholder="Choose a user ID" required>
    </div>
    <div class="form-group">
      <label for="password">Password</label>
      <input type="password" id="password" placeholder="Choose a password" required>
    </div>
    <div class="form-group">
      <label for="confirmPassword">Confirm Password</label>
      <input type="password" id="confirmPassword" placeholder="Confirm your password" required>
    </div>
    <div class="form-error" style="display: none; color: #f44336; margin-bottom: 10px;"></div>
    <div class="form-actions">
      <button type="button" id="register-button" class="primary-button">Register</button>
    </div>
    <div class="form-footer">
      <p>Already have an account? <a href="#" id="login-link">Login</a></p>
    </div>
  `;
  
  // Add event listeners
  const registerButton = registerForm.querySelector('#register-button');
  const loginLink = registerForm.querySelector('#login-link');
  const userIdInput = registerForm.querySelector('#userId');
  const passwordInput = registerForm.querySelector('#password');
  const confirmPasswordInput = registerForm.querySelector('#confirmPassword');
  const errorElement = registerForm.querySelector('.form-error');
  
  registerButton.addEventListener('click', async () => {
    const userId = userIdInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    if (!userId || !password || !confirmPassword) {
      showError(errorElement, 'Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      showError(errorElement, 'Passwords do not match');
      return;
    }
    
    try {
      registerButton.disabled = true;
      registerButton.textContent = 'Registering...';
      
      const data = await AuthUtil.register(userId, password);
      
      if (onLogin) {
        onLogin(data);
      }
    } catch (error) {
      showError(errorElement, error.message || 'Registration failed');
      registerButton.disabled = false;
      registerButton.textContent = 'Register';
    }
  });
  
  loginLink.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Replace register form with login form
    const loginForm = createLoginForm(onLogin);
    registerForm.parentNode.replaceChild(loginForm, registerForm);
  });
  
  return registerForm;
}

/**
 * Show error message
 * @param {HTMLElement} errorElement - Error element
 * @param {string} message - Error message
 */
function showError(errorElement, message) {
  errorElement.textContent = message;
  errorElement.style.display = 'block';
  
  // Hide error after 5 seconds
  setTimeout(() => {
    errorElement.style.display = 'none';
  }, 5000);
}

/**
 * Create auth container
 * @param {Function} onLogin - Login success callback
 * @returns {HTMLElement} - Auth container element
 */
function createAuthContainer(onLogin) {
  const container = document.createElement('div');
  container.className = 'auth-container';
  
  // Add login form
  const loginForm = createLoginForm(onLogin);
  container.appendChild(loginForm);
  
  return container;
}

export { createAuthContainer, createLoginForm, createRegisterForm };

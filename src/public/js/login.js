// DOM Elements
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const togglePasswordBtn = document.getElementById('togglePassword');
const loginButton = document.getElementById('loginButton');
const loadingState = document.getElementById('loadingState');
const statusMessage = document.getElementById('statusMessage');

// Sound effects (optional - can be enabled if audio files are available)
const playSound = (type) => {
  // Uncomment and add audio files if needed
  // const audio = new Audio(`sounds/${type}.mp3`);
  // audio.volume = 0.3;
  // audio.play().catch(() => {});
};

// Utility functions
const showError = (input, message) => {
  const errorDiv = input.parentElement.querySelector('.error-message');
  errorDiv.textContent = message;
  errorDiv.classList.remove('hidden');
  input.classList.add('border-red-500');
};

const clearError = (input) => {
  const errorDiv = input.parentElement.querySelector('.error-message');
  errorDiv.textContent = '';
  errorDiv.classList.add('hidden');
  input.classList.remove('border-red-500');
};

const showStatus = (message, type = 'info') => {
  statusMessage.textContent = message;
  statusMessage.className = `mt-4 p-3 rounded-md font-mono text-sm ${type === 'error' ? 'bg-red-900 bg-opacity-50 text-red-400' : 'bg-green-900 bg-opacity-50 text-green-400'}`;
  statusMessage.classList.remove('hidden');
};

const setLoadingState = (isLoading) => {
  const submitButton = loginForm.querySelector('button[type="submit"]');
  if (isLoading) {
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="loading-dots">AUTHENTICATING<span>.</span><span>.</span><span>.</span></span>';
  } else {
    submitButton.disabled = false;
    submitButton.textContent = '[ ENTER SYSTEM ]';
  }
};

// Validation functions
const validateUsername = (username) => {
  if (!username || username.trim().length === 0) {
    return 'Access code required';
  }
  if (username.length < 3) {
    return 'Access code must be at least 3 characters';
  }
  return null;
};

const validatePassword = (password) => {
  if (!password || password.trim().length === 0) {
    return 'Security key required';
  }
  if (password.length < 6) {
    return 'Security key must be at least 6 characters';
  }
  return null;
};

// Event listeners
usernameInput.addEventListener('input', () => {
  clearError(usernameInput);
});

passwordInput.addEventListener('input', () => {
  clearError(passwordInput);
});

// Password toggle functionality
togglePasswordBtn.addEventListener('click', () => {
  const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
  passwordInput.setAttribute('type', type);
  
  // Update icon
  const icon = togglePasswordBtn.querySelector('svg');
  if (type === 'text') {
    icon.innerHTML = `
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
    `;
  } else {
    icon.innerHTML = `
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
    `;
  }
  
  playSound('click');
});

// Form submission
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();
  
  // Clear previous errors
  clearError(usernameInput);
  clearError(passwordInput);
  
  // Validate inputs
  if (!username) {
    showError(usernameInput, 'Access code required');
    return;
  }
  
  if (!password) {
    showError(passwordInput, 'Security key required');
    return;
  }
  
  // Set loading state
  setLoadingState(true);
  
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showStatus('ACCESS GRANTED - Redirecting to secure area...', 'success');
      setTimeout(() => {
        window.location.href = '/admin';
      }, 1500);
    } else {
      showStatus(`ACCESS DENIED: ${data.message || 'Invalid credentials'}`, 'error');
    }
  } catch (error) {
    console.error('Login error:', error);
    showStatus('SYSTEM ERROR: Connection to secure server failed', 'error');
  } finally {
    setLoadingState(false);
  }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Ctrl + Enter to submit form
  if (e.ctrlKey && e.key === 'Enter') {
    e.preventDefault();
    loginForm.dispatchEvent(new Event('submit'));
  }
  
  // Escape to clear form
  if (e.key === 'Escape') {
    usernameInput.value = '';
    passwordInput.value = '';
    clearError(usernameInput);
    clearError(passwordInput);
    statusMessage.classList.add('hidden');
    playSound('click');
  }
});

// Performance optimization
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Debounced validation
const debouncedValidateUsername = debounce((input) => {
  const error = validateUsername(input.value);
  if (error && input.value.length > 0) {
    showError(input, error);
  } else {
    clearError(input);
  }
}, 500);

const debouncedValidatePassword = debounce((input) => {
  const error = validatePassword(input.value);
  if (error && input.value.length > 0) {
    showError(input, error);
  } else {
    clearError(input);
  }
}, 500);

// Apply debounced validation
usernameInput.addEventListener('input', () => debouncedValidateUsername(usernameInput));
passwordInput.addEventListener('input', () => debouncedValidatePassword(passwordInput));

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Focus on username input
  usernameInput.focus();
  
  // Add typing sound effect to inputs (optional)
  [usernameInput, passwordInput].forEach(input => {
    input.addEventListener('keydown', () => {
      // playSound('type');
    });
  });
  
  // Console easter egg
  console.log(`
    ╔══════════════════════════════════════╗
    ║          SECURE TERMINAL             ║
    ║        ACCESS MONITORING ON          ║
    ║                                      ║
    ║  All activities are being logged     ║
    ║  Unauthorized access is prohibited   ║
    ╚══════════════════════════════════════╝
  `);
  
  console.log('%cWelcome to the Matrix', 'color: #00ff41; font-family: monospace; font-size: 16px;');
});

// Matrix rain effect (optional enhancement)
const createMatrixRain = () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '0';
  canvas.style.opacity = '0.1';
  
  document.body.appendChild(canvas);
  
  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';
  const fontSize = 14;
  const columns = canvas.width / fontSize;
  const drops = [];
  
  for (let i = 0; i < columns; i++) {
    drops[i] = 1;
  }
  
  const draw = () => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#00ff41';
    ctx.font = `${fontSize}px monospace`;
    
    for (let i = 0; i < drops.length; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);
      
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  };
  
  setInterval(draw, 35);
};

// Uncomment to enable matrix rain effect
// createMatrixRain();
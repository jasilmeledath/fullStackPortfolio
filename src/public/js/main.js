// Utility Functions
const utils = {
  showSpinner() {
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    document.body.appendChild(spinner);
  },

  hideSpinner() {
    const spinner = document.querySelector('.spinner');
    if (spinner) {
      spinner.remove();
    }
  },

  showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.body.insertBefore(alertDiv, document.body.firstChild);
    setTimeout(() => alertDiv.remove(), 5000);
  },

  async handleFormSubmit(form, endpoint, options = {}) {
    try {
      this.showSpinner();
      const formData = new FormData(form);
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        ...options
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      
      this.showAlert(data.message || 'Success!');
      form.reset();
      return data;
    } catch (error) {
      this.showAlert(error.message, 'danger');
      throw error;
    } finally {
      this.hideSpinner();
    }
  },

  async apiRequest(endpoint, options = {}) {
    try {
      this.showSpinner();
      const response = await fetch(endpoint, options);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      
      return data;
    } catch (error) {
      this.showAlert(error.message, 'danger');
      throw error;
    } finally {
      this.hideSpinner();
    }
  }
};

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Fade-in Animation
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(element => {
  observer.observe(element);
});

// Form Validation
document.querySelectorAll('form').forEach(form => {
  form.addEventListener('submit', (e) => {
    if (!form.checkValidity()) {
      e.preventDefault();
      e.stopPropagation();
    }
    form.classList.add('was-validated');
  });
});

// Mobile Navigation
const navbarToggler = document.querySelector('.navbar-toggler');
const navbarCollapse = document.querySelector('.navbar-collapse');

if (navbarToggler && navbarCollapse) {
  navbarToggler.addEventListener('click', () => {
    navbarCollapse.classList.toggle('show');
  });

  document.addEventListener('click', (e) => {
    if (!navbarCollapse.contains(e.target) && !navbarToggler.contains(e.target)) {
      navbarCollapse.classList.remove('show');
    }
  });
}

// Export utilities to global scope
window.utils = utils; 
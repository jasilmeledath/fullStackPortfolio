// Toast Component
class HackerToast {
    constructor() {
        this.container = document.getElementById('toast-container') || this.createContainer();
        this.setupStyles();
    }

    createContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed top-4 right-4 z-50';
        document.body.appendChild(container);
        return container;
    }

    setupStyles() {
        if (!document.getElementById('toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                @keyframes matrix-typing {
                    0% { opacity: 0; transform: translateY(-20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }

                @keyframes matrix-fade {
                    0% { opacity: 1; }
                    80% { opacity: 1; }
                    100% { opacity: 0; }
                }

                .toast {
                    background: rgba(0, 0, 0, 0.9);
                    border: 1px solid;
                    padding: 1rem;
                    margin-bottom: 0.5rem;
                    border-radius: 4px;
                    font-family: 'Courier New', monospace;
                    position: relative;
                    overflow: hidden;
                    animation: matrix-typing 0.3s ease-out, matrix-fade 5s ease-in-out forwards;
                }

                .toast::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: currentColor;
                    animation: matrix-scan 2s linear infinite;
                }

                .toast-success {
                    border-color: #00ff00;
                    color: #00ff00;
                    box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
                }

                .toast-error {
                    border-color: #ff0000;
                    color: #ff0000;
                    box-shadow: 0 0 10px rgba(255, 0, 0, 0.3);
                }

                @keyframes matrix-scan {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }

                .toast-content {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .toast-icon {
                    font-size: 1.2rem;
                }

                .toast-message {
                    font-size: 0.9rem;
                    text-transform: uppercase;
                }
            `;
            document.head.appendChild(style);
        }
    }

    matrixTyping(text, element) {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let iterations = 0;
        const maxIterations = 3;
        
        const interval = setInterval(() => {
            element.innerHTML = text
                .split("")
                .map((char, index) => {
                    if (index < iterations) {
                        return text[index];
                    }
                    return chars[Math.floor(Math.random() * chars.length)];
                })
                .join("");
            
            if (iterations >= text.length) {
                clearInterval(interval);
            }
            
            iterations += 1 / maxIterations;
        }, 30);
    }

    show(title, text, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${type === 'success' ? '[+]' : '[!]'}</span>
                <div>
                    <div class="toast-message">${title}</div>
                    <div id="matrix-text">${text}</div>
                </div>
            </div>
        `;
        
        this.container.appendChild(toast);
        this.matrixTyping(text, toast.querySelector('#matrix-text'));
        
        // Remove toast after animation
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }

    success(title, text) {
        this.show(title, text, 'success');
    }

    error(title, text) {
        this.show(title, text, 'error');
    }
}

// Create a global instance
window.toast = new HackerToast(); 
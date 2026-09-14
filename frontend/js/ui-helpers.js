// Auto inject CSS
(function injectCSS() {
    if (document.getElementById('ui-helpers-css')) return;
    const link = document.createElement('link');
    link.id = 'ui-helpers-css';
    link.rel = 'stylesheet';
    // Base path logic depending on whether we are in pages/ or root
    const isInsidePages = window.location.pathname.includes('/pages/');
    const basePath = isInsidePages ? '../css/' : './css/';
    link.href = basePath + 'ui-helpers.css';
    document.head.appendChild(link);
})();

// Toast Container
let toastContainer;
function getToastContainer() {
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    return toastContainer;
}

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - 'success', 'error', 'warning', 'info'
 */
export function showToast(message, type = 'info') {
    const container = getToastContainer();
    const toast = document.createElement('div');
    toast.className = `ui-toast ${type}`;

    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-times-circle';
    if (type === 'warning') icon = 'fa-exclamation-triangle';

    toast.innerHTML = `
        <div class="ui-toast-icon"><i class="fa-solid ${icon}"></i></div>
        <div class="ui-toast-content">${message}</div>
        <button class="ui-toast-close"><i class="fa-solid fa-xmark"></i></button>
    `;

    container.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // Close logic
    const closeBtn = toast.querySelector('.ui-toast-close');
    
    let hideTimeout;
    
    const removeToast = () => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    };

    closeBtn.addEventListener('click', () => {
        clearTimeout(hideTimeout);
        removeToast();
    });

    hideTimeout = setTimeout(() => {
        removeToast();
    }, 3000);
}

/**
 * Show a modal dialog
 * @param {string} title 
 * @param {string} content 
 * @param {function} onConfirm 
 * @param {string} confirmText 
 * @param {string} cancelText 
 * @param {boolean} isDanger 
 */
export function showModal(title, content, onConfirm, confirmText = 'Xác nhận', cancelText = 'Hủy', isDanger = true) {
    let overlay = document.querySelector('.ui-modal-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'ui-modal-overlay';
        document.body.appendChild(overlay);
    }

    const confirmBtnClass = isDanger ? 'ui-btn-confirm' : 'ui-btn-confirm success';

    overlay.innerHTML = `
        <div class="ui-modal">
            <div class="ui-modal-header">
                <span>${title}</span>
                <button class="close-btn"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="ui-modal-body">
                ${content}
            </div>
            <div class="ui-modal-footer">
                <button class="ui-btn ui-btn-cancel">${cancelText}</button>
                <button class="ui-btn ${confirmBtnClass}">${confirmText}</button>
            </div>
        </div>
    `;

    const close = () => {
        overlay.classList.remove('show');
        setTimeout(() => {
            overlay.innerHTML = '';
        }, 200);
    };

    overlay.querySelector('.close-btn').addEventListener('click', close);
    overlay.querySelector('.ui-btn-cancel').addEventListener('click', close);
    
    overlay.querySelector('.ui-btn-confirm').addEventListener('click', () => {
        if (onConfirm) onConfirm();
        close();
    });

    // Animate in
    setTimeout(() => {
        overlay.classList.add('show');
    }, 10);
}

/**
 * Show inline validation error
 * @param {HTMLElement} inputElement 
 * @param {string} message 
 */
export function showInlineError(inputElement, message) {
    const formGroup = inputElement.closest('.form-group');
    if (formGroup) {
        formGroup.classList.add('has-error');
        let errorText = formGroup.querySelector('.error-text');
        if (!errorText) {
            errorText = document.createElement('div');
            errorText.className = 'error-text';
            formGroup.appendChild(errorText);
        }
        errorText.innerText = message;
    }
}

/**
 * Clear inline validation error
 * @param {HTMLElement} inputElement 
 */
export function clearInlineError(inputElement) {
    const formGroup = inputElement.closest('.form-group');
    if (formGroup) {
        formGroup.classList.remove('has-error');
        const errorText = formGroup.querySelector('.error-text');
        if (errorText) {
            errorText.innerText = '';
        }
    }
}

export function generateSkeletonCard() {
    return `
        <div class="skeleton-card">
            <div class="skeleton skeleton-img"></div>
            <div class="skeleton skeleton-text-1"></div>
            <div class="skeleton skeleton-text-2"></div>
            <div class="skeleton skeleton-text-3"></div>
            <div class="skeleton skeleton-btn"></div>
        </div>
    `;
}

export function generateEmptyState(message, icon = 'fa-box-open') {
    return `
        <div class="ui-empty-state">
            <i class="fa-solid ${icon}"></i>
            <h3>Trống</h3>
            <p>${message}</p>
        </div>
    `;
}

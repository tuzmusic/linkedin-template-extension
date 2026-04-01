export type NotificationType = 'success' | 'error' | 'info';

export function showNotification(
  message: string,
  type: NotificationType = 'success',
  copiedMessage?: string | null,
  warning?: string | null
): void {
  // Remove existing notification if any
  const existing = document.getElementById('linkedin-template-toast');
  if (existing) {
    existing.remove();
  }

  const toast = document.createElement('div');
  toast.id = 'linkedin-template-toast';
  toast.className = `linkedin-template-toast ${type}`;

  if (copiedMessage) {
    // Show header, message preview, footer, and optional warning
    const warningHtml = warning
      ? `<div class="linkedin-template-toast-warning">${warning}</div>`
      : '';
    toast.innerHTML = `
      <div class="linkedin-template-toast-header">${message}</div>
      <div class="linkedin-template-toast-message">${copiedMessage}</div>
      <div class="linkedin-template-toast-footer">Press Cmd+V to paste</div>
      ${warningHtml}
    `;
  } else {
    // Simple message
    toast.textContent = message;
  }

  document.body.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  // Function to hide toast
  const hideToast = () => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
      // Remove paste listener when toast is removed
      document.removeEventListener('paste', pasteListener);
    }, 300);
  };

  // Listen for paste event (Cmd+V)
  const pasteListener = () => {
    hideToast();
  };
  document.addEventListener('paste', pasteListener);

  // Auto-hide after 5 seconds
  setTimeout(hideToast, 5000);
}

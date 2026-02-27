// ============================================
// THEME MODULE — Dark/Light Mode Toggle
// ============================================

const DashboardTheme = (() => {
    const STORAGE_KEY = 'exec-dashboard-theme';
    let currentTheme = 'dark';

    function init() {
        // Load saved preference
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            currentTheme = saved;
        } else {
            // Check system preference
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
                currentTheme = 'light';
            }
        }

        applyTheme(currentTheme);

        // Toggle button
        const toggleBtn = document.getElementById('themeToggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
                applyTheme(currentTheme);
                localStorage.setItem(STORAGE_KEY, currentTheme);
            });
        }
    }

    function applyTheme(theme) {
        if (theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }

    function getTheme() {
        return currentTheme;
    }

    return {
        init,
        getTheme
    };
})();

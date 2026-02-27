// ============================================
// FILTERS MODULE — Date Range & Segment
// ============================================

const DashboardFilters = (() => {
    let currentRange = 'all';
    let onFilterChange = null;

    function init(callback) {
        onFilterChange = callback;

        // Date range filter pills
        const filterPills = document.querySelectorAll('.filter-pill[data-range]');
        filterPills.forEach(pill => {
            pill.addEventListener('click', () => {
                filterPills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                currentRange = pill.dataset.range;

                if (onFilterChange) {
                    onFilterChange(currentRange);
                }
            });
        });
    }

    function getCurrentRange() {
        return currentRange;
    }

    return {
        init,
        getCurrentRange
    };
})();

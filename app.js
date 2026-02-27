// ============================================
// APP MODULE — Main Orchestrator
// ============================================

const DashboardApp = (() => {

    function init() {
        try {
            // Initialize theme first (before charts render)
            DashboardTheme.init();

            // Render KPIs
            renderKPIs('all');

            // Render charts (slight delay for DOM to settle)
            setTimeout(function () {
                renderCharts('all');
            }, 100);

            // Render team table
            renderTeamTable();

            // Initialize filters with callback
            DashboardFilters.init(function (range) {
                renderKPIs(range);
                renderCharts(range);
            });

            // Initialize data entry modal
            initModal();

            // Update timestamp
            updateTimestamp();
        } catch (e) {
            console.error('Dashboard init error:', e);
        }
    }

    // ---- Modal Controller ----
    function initModal() {
        var modal = document.getElementById('dataModal');
        var openBtn = document.getElementById('addDataBtn');
        var closeBtn = document.getElementById('modalClose');
        var cancelBtn = document.getElementById('modalCancelBtn');
        var form = document.getElementById('dataEntryForm');
        var clearBtn = document.getElementById('clearEntriesBtn');
        var yearInput = document.getElementById('entryYear');

        // Set default year
        if (yearInput) {
            yearInput.value = new Date().getFullYear();
        }

        // Set default month to current
        var monthSelect = document.getElementById('entryMonth');
        if (monthSelect) {
            var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            monthSelect.value = monthNames[new Date().getMonth()];
        }

        function openModal() {
            if (modal) {
                modal.classList.add('active');
                renderEntries();
            }
        }

        function closeModal() {
            if (modal) {
                modal.classList.remove('active');
            }
        }

        if (openBtn) openBtn.addEventListener('click', openModal);
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

        // Close on overlay click
        if (modal) {
            modal.addEventListener('click', function (e) {
                if (e.target === modal) closeModal();
            });
        }

        // Close on Escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeModal();
        });

        // Form submission
        if (form) {
            form.addEventListener('submit', function (e) {
                e.preventDefault();

                var month = document.getElementById('entryMonth').value;
                var year = document.getElementById('entryYear').value;
                var revenue = document.getElementById('entryRevenue').value;
                var expenditure = document.getElementById('entryExpenditure').value;

                if (!revenue || !expenditure || !year) return;

                // Add entry to data
                DashboardData.addEntry(month, year, revenue, expenditure);

                // Flash success on the form
                var card = modal.querySelector('.modal-card');
                if (card) {
                    card.classList.add('success-flash');
                    setTimeout(function () { card.classList.remove('success-flash'); }, 600);
                }

                // Clear revenue & expenditure fields
                document.getElementById('entryRevenue').value = '';
                document.getElementById('entryExpenditure').value = '';

                // Refresh dashboard
                var currentRange = DashboardFilters.getCurrentRange();
                renderKPIs(currentRange);
                renderCharts(currentRange);
                updateTimestamp();

                // Refresh entries list
                renderEntries();
            });
        }

        // Clear all entries
        if (clearBtn) {
            clearBtn.addEventListener('click', function () {
                DashboardData.clearCustomEntries();
                renderEntries();
            });
        }
    }

    // ---- Render Entries Table ----
    function renderEntries() {
        var section = document.getElementById('entriesSection');
        var tbody = document.getElementById('entriesTableBody');
        if (!section || !tbody) return;

        var entries = DashboardData.getCustomEntries();

        if (entries.length === 0) {
            section.style.display = 'none';
            return;
        }

        section.style.display = 'block';

        tbody.innerHTML = entries.map(function (entry) {
            var profit = entry.revenue - entry.expenditure;
            var profitClass = profit >= 0 ? 'profit-positive' : 'profit-negative';
            var profitSign = profit >= 0 ? '+' : '';

            return '<tr>' +
                '<td>' + entry.month + ' ' + entry.year + '</td>' +
                '<td>' + DashboardData.formatCurrency(entry.revenue) + '</td>' +
                '<td>' + DashboardData.formatCurrency(entry.expenditure) + '</td>' +
                '<td class="' + profitClass + '">' + profitSign + DashboardData.formatCurrency(Math.abs(profit)) + '</td>' +
                '<td><button class="btn-delete-row" data-entry-id="' + entry.id + '" title="Delete entry">\u2715</button></td>' +
                '</tr>';
        }).join('');

        // Attach delete listeners
        var deleteButtons = tbody.querySelectorAll('.btn-delete-row');
        deleteButtons.forEach(function (btn) {
            btn.addEventListener('click', function () {
                var id = btn.getAttribute('data-entry-id');
                DashboardData.removeEntry(id);
                renderEntries();

                // Refresh dashboard
                var currentRange = DashboardFilters.getCurrentRange();
                renderKPIs(currentRange);
                renderCharts(currentRange);
            });
        });
    }

    // ---- KPI Rendering ----
    function renderKPIs(range) {
        var kpis = DashboardData.getKPIs(range);

        var kpiMap = {
            'kpi-runway': kpis.cashRunway,
            'kpi-mrr': kpis.mrr,
            'kpi-burn': kpis.burnRate,
            'kpi-pipeline': kpis.pipeline,
            'kpi-forecast': kpis.forecastAccuracy,
            'kpi-velocity': kpis.teamVelocity
        };

        Object.entries(kpiMap).forEach(function (pair) {
            var id = pair[0];
            var data = pair[1];
            var el = document.getElementById(id);
            if (!el) return;

            var valueEl = el.querySelector('.kpi-value');
            var trendEl = el.querySelector('.kpi-trend');
            var subtextEl = el.querySelector('.kpi-subtext');

            if (valueEl) {
                var displayValue = '';
                if (data.unit === '$') {
                    displayValue = DashboardData.formatCurrency(data.value);
                } else if (data.unit === '%') {
                    displayValue = String(data.value) + '%';
                } else if (data.unit === 'months') {
                    displayValue = String(data.value) + ' mo';
                } else if (data.unit === 'pts') {
                    displayValue = String(data.value) + ' pts';
                } else {
                    displayValue = String(data.value);
                }

                animateValue(valueEl, displayValue);
            }

            if (trendEl) {
                var changeValue = parseFloat(data.change);
                var arrow = data.direction === 'up' ? '\u2191' : '\u2193';
                trendEl.textContent = arrow + ' ' + Math.abs(changeValue) + '%';
                trendEl.className = 'kpi-trend ' + data.direction;
            }

            if (subtextEl) {
                subtextEl.textContent = data.subtitle;
            }
        });
    }

    // ---- Animated counter ----
    function animateValue(element, targetText) {
        targetText = String(targetText);

        var numericMatch = targetText.match(/[\d.]+/);
        if (!numericMatch) {
            element.textContent = targetText;
            return;
        }

        var targetNum = parseFloat(numericMatch[0]);
        var idx = targetText.indexOf(numericMatch[0]);
        var prefix = targetText.substring(0, idx);
        var suffix = targetText.substring(idx + numericMatch[0].length);

        var duration = 1200;
        var startTime = performance.now();

        function update(currentTime) {
            var elapsed = currentTime - startTime;
            var progress = Math.min(elapsed / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            var currentNum = targetNum * eased;

            var decimals = numericMatch[0].includes('.') ? numericMatch[0].split('.')[1].length : 0;
            element.textContent = prefix + currentNum.toFixed(decimals) + suffix;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.textContent = targetText;
            }
        }

        requestAnimationFrame(update);
    }

    // ---- Chart Rendering ----
    function renderCharts(range) {
        try {
            var data = DashboardData.getChartData(range);

            var revenueCanvas = document.getElementById('revenueChart');
            if (revenueCanvas) {
                DashboardCharts.createRevenueChart(revenueCanvas.getContext('2d'), data);
            }

            var forecastCanvas = document.getElementById('forecastChart');
            if (forecastCanvas) {
                DashboardCharts.createForecastChart(forecastCanvas.getContext('2d'), data);
            }

            var burnCanvas = document.getElementById('burnChart');
            if (burnCanvas) {
                DashboardCharts.createBurnChart(burnCanvas.getContext('2d'), data);
            }

            var pipelineCanvas = document.getElementById('pipelineChart');
            if (pipelineCanvas) {
                var pipelineData = DashboardData.getPipelineBreakdown();
                DashboardCharts.createPipelineChart(pipelineCanvas.getContext('2d'), pipelineData);
            }
        } catch (e) {
            console.error('Chart render error:', e);
        }
    }

    // ---- Team Table ----
    function renderTeamTable() {
        var tbody = document.getElementById('teamTableBody');
        if (!tbody) return;

        var team = DashboardData.getTeamData();

        tbody.innerHTML = team.map(function (member) {
            var initials = member.member.split(' ').map(function (n) { return n[0]; }).join('');
            var barColor = member.velocity >= 75 ? 'var(--accent-emerald)' : member.velocity >= 60 ? 'var(--accent-amber)' : 'var(--accent-coral)';
            var statusLabel = member.status.charAt(0).toUpperCase() + member.status.slice(1);

            return '<tr>' +
                '<td>' +
                '<div style="display:flex; align-items:center; gap:0.75rem;">' +
                '<div style="width:32px; height:32px; border-radius:50%; background:var(--bg-glass); border:1px solid var(--border-color); display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:600; color:var(--text-secondary);">' +
                initials +
                '</div>' +
                '<div>' +
                '<div style="font-weight:500;">' + member.member + '</div>' +
                '<div style="font-size:0.625rem; color:var(--text-muted);">' + member.role + '</div>' +
                '</div>' +
                '</div>' +
                '</td>' +
                '<td>' +
                '<div style="display:flex; align-items:center; gap:0.5rem;">' +
                '<div class="progress-bar" style="width:80px;">' +
                '<div class="progress-fill" style="width:' + member.velocity + '%; background:' + barColor + '"></div>' +
                '</div>' +
                '<span>' + member.velocity + '</span>' +
                '</div>' +
                '</td>' +
                '<td>' + member.tasks + '</td>' +
                '<td><span class="status-badge ' + member.status + '">\u25CF ' + statusLabel + '</span></td>' +
                '</tr>';
        }).join('');
    }

    // ---- Timestamp ----
    function updateTimestamp() {
        var el = document.getElementById('lastUpdated');
        if (el) {
            var now = new Date();
            var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            var month = months[now.getMonth()];
            var day = now.getDate();
            var year = now.getFullYear();
            var hours = now.getHours();
            var minutes = now.getMinutes();
            var ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;
            minutes = minutes < 10 ? '0' + minutes : minutes;
            el.textContent = 'Last updated: ' + month + ' ' + day + ', ' + year + ' \u00B7 ' + hours + ':' + minutes + ' ' + ampm;
        }
    }

    return { init: init };
})();

// ---- Boot ----
document.addEventListener('DOMContentLoaded', function () {
    DashboardApp.init();
});

// ============================================
// CHARTS MODULE — Chart.js Configurations
// ============================================

const DashboardCharts = (() => {
    let revenueChart = null;
    let forecastChart = null;
    let burnChart = null;
    let pipelineChart = null;

    // Get CSS variable value
    function getCSSVar(name) {
        return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    }

    // Format currency for axis ticks
    function currencyTick(value) {
        if (value >= 1000000) return '$' + (value / 1000000).toFixed(1) + 'M';
        if (value >= 1000) return '$' + (value / 1000).toFixed(0) + 'K';
        return '$' + value;
    }

    // Shared tooltip config
    function tooltipConfig() {
        return {
            backgroundColor: getCSSVar('--bg-secondary') || '#1a1d2e',
            titleColor: getCSSVar('--text-primary') || '#f0f2f5',
            bodyColor: getCSSVar('--text-secondary') || '#8b8fa3',
            borderColor: getCSSVar('--border-color') || 'rgba(255,255,255,0.06)',
            borderWidth: 1,
            cornerRadius: 8,
            padding: 12,
            displayColors: true,
            boxWidth: 8,
            boxHeight: 8,
            boxPadding: 4,
            usePointStyle: true
        };
    }

    // Grid + tick colors
    function axisColors() {
        return {
            grid: getCSSVar('--chart-grid') || 'rgba(255,255,255,0.05)',
            text: getCSSVar('--chart-text') || '#8b8fa3'
        };
    }

    // 1. Revenue Trend — Smooth line with gradient fill
    function createRevenueChart(ctx, data) {
        if (revenueChart) { revenueChart.destroy(); revenueChart = null; }

        var gradient = ctx.createLinearGradient(0, 0, 0, 280);
        gradient.addColorStop(0, 'rgba(52, 211, 153, 0.25)');
        gradient.addColorStop(1, 'rgba(52, 211, 153, 0.0)');

        var colors = axisColors();

        revenueChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(function (d) { return d.label; }),
                datasets: [
                    {
                        label: 'Revenue',
                        data: data.map(function (d) { return d.revenue; }),
                        borderColor: '#34d399',
                        backgroundColor: gradient,
                        borderWidth: 2.5,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 6,
                        pointHoverBackgroundColor: '#34d399',
                        pointHoverBorderColor: '#fff',
                        pointHoverBorderWidth: 2
                    },
                    {
                        label: 'Expenses',
                        data: data.map(function (d) { return d.expenses; }),
                        borderColor: '#f87171',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        borderDash: [6, 4],
                        fill: false,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 5,
                        pointHoverBackgroundColor: '#f87171',
                        pointHoverBorderColor: '#fff',
                        pointHoverBorderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                animation: { duration: 1000, easing: 'easeOutQuart' },
                plugins: {
                    legend: { display: false },
                    tooltip: tooltipConfig()
                },
                scales: {
                    x: {
                        grid: { color: colors.grid, drawBorder: false },
                        ticks: { color: colors.text, font: { size: 11 }, padding: 8 }
                    },
                    y: {
                        grid: { color: colors.grid, drawBorder: false },
                        ticks: { color: colors.text, font: { size: 11 }, padding: 12, callback: currencyTick }
                    }
                }
            }
        });

        return revenueChart;
    }

    // 2. Forecast vs Actual — Grouped bar chart
    function createForecastChart(ctx, data) {
        if (forecastChart) { forecastChart.destroy(); forecastChart = null; }

        var colors = axisColors();

        forecastChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(function (d) { return d.label; }),
                datasets: [
                    {
                        label: 'Actual',
                        data: data.map(function (d) { return d.actual; }),
                        backgroundColor: 'rgba(52, 211, 153, 0.7)',
                        borderColor: '#34d399',
                        borderWidth: 1,
                        borderRadius: 6,
                        borderSkipped: false,
                        barPercentage: 0.7,
                        categoryPercentage: 0.7
                    },
                    {
                        label: 'Forecast',
                        data: data.map(function (d) { return d.forecast; }),
                        backgroundColor: 'rgba(96, 165, 250, 0.5)',
                        borderColor: '#60a5fa',
                        borderWidth: 1,
                        borderRadius: 6,
                        borderSkipped: false,
                        barPercentage: 0.7,
                        categoryPercentage: 0.7
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                animation: { duration: 1000, easing: 'easeOutQuart' },
                plugins: {
                    legend: { display: false },
                    tooltip: tooltipConfig()
                },
                scales: {
                    x: {
                        grid: { color: colors.grid, drawBorder: false },
                        ticks: { color: colors.text, font: { size: 11 }, padding: 8 }
                    },
                    y: {
                        grid: { color: colors.grid, drawBorder: false },
                        ticks: { color: colors.text, font: { size: 11 }, padding: 12, callback: currencyTick }
                    }
                }
            }
        });

        return forecastChart;
    }

    // 3. Burn Rate — Area chart
    function createBurnChart(ctx, data) {
        if (burnChart) { burnChart.destroy(); burnChart = null; }

        var gradient = ctx.createLinearGradient(0, 0, 0, 280);
        gradient.addColorStop(0, 'rgba(248, 113, 113, 0.25)');
        gradient.addColorStop(1, 'rgba(248, 113, 113, 0.0)');

        var colors = axisColors();

        burnChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(function (d) { return d.label; }),
                datasets: [
                    {
                        label: 'Burn Rate',
                        data: data.map(function (d) { return d.burnRate; }),
                        borderColor: '#f87171',
                        backgroundColor: gradient,
                        borderWidth: 2.5,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 6,
                        pointHoverBackgroundColor: '#f87171',
                        pointHoverBorderColor: '#fff',
                        pointHoverBorderWidth: 2
                    },
                    {
                        label: 'Revenue',
                        data: data.map(function (d) { return d.revenue; }),
                        borderColor: '#34d399',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        borderDash: [6, 4],
                        fill: false,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 5,
                        pointHoverBackgroundColor: '#34d399'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                animation: { duration: 1000, easing: 'easeOutQuart' },
                plugins: {
                    legend: { display: false },
                    tooltip: tooltipConfig()
                },
                scales: {
                    x: {
                        grid: { color: colors.grid, drawBorder: false },
                        ticks: { color: colors.text, font: { size: 11 }, padding: 8 }
                    },
                    y: {
                        grid: { color: colors.grid, drawBorder: false },
                        ticks: { color: colors.text, font: { size: 11 }, padding: 12, callback: currencyTick }
                    }
                }
            }
        });

        return burnChart;
    }

    // 4. Sales Pipeline — Horizontal bar chart by stage
    function createPipelineChart(ctx, pipelineData) {
        if (pipelineChart) { pipelineChart.destroy(); pipelineChart = null; }

        var colors = axisColors();
        var bgColors = pipelineData.map(function (d) { return d.color + 'cc'; });
        var borderColors = pipelineData.map(function (d) { return d.color; });

        pipelineChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: pipelineData.map(function (d) { return d.stage; }),
                datasets: [{
                    label: 'Pipeline Value',
                    data: pipelineData.map(function (d) { return d.value; }),
                    backgroundColor: bgColors,
                    borderColor: borderColors,
                    borderWidth: 1,
                    borderRadius: 6,
                    borderSkipped: false,
                    barPercentage: 0.6,
                    categoryPercentage: 0.8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                interaction: { mode: 'index', intersect: false },
                animation: { duration: 1000, easing: 'easeOutQuart' },
                plugins: {
                    legend: { display: false },
                    tooltip: tooltipConfig()
                },
                scales: {
                    x: {
                        grid: { color: colors.grid, drawBorder: false },
                        ticks: { color: colors.text, font: { size: 11 }, padding: 8, callback: currencyTick }
                    },
                    y: {
                        grid: { color: colors.grid, drawBorder: false },
                        ticks: { color: colors.text, font: { size: 11 }, padding: 12 }
                    }
                }
            }
        });

        return pipelineChart;
    }

    // Destroy all charts
    function destroyAll() {
        if (revenueChart) { revenueChart.destroy(); revenueChart = null; }
        if (forecastChart) { forecastChart.destroy(); forecastChart = null; }
        if (burnChart) { burnChart.destroy(); burnChart = null; }
        if (pipelineChart) { pipelineChart.destroy(); pipelineChart = null; }
    }

    return {
        createRevenueChart: createRevenueChart,
        createForecastChart: createForecastChart,
        createBurnChart: createBurnChart,
        createPipelineChart: createPipelineChart,
        destroyAll: destroyAll
    };
})();

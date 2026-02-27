// ============================================
// DATA MODULE — Mock Business Data Generator
// ============================================

const DashboardData = (() => {
  // Date helpers
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Seed random for consistency
  function seededRandom(seed) {
    let s = seed;
    return function () {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  const rand = seededRandom(42);

  // Generate monthly revenue data (growth curve)
  function generateMonthlyData() {
    const data = [];
    let revenue = 82000;
    let expenses = 65000;
    let pipeline = 320000;

    for (let i = 0; i < 12; i++) {
      const monthIndex = (currentMonth - 11 + i + 12) % 12;
      const year = i <= (11 - currentMonth) ? currentYear - 1 : currentYear;

      // Growth with some variance
      const revenueGrowth = 1.04 + rand() * 0.06;
      revenue = Math.round(revenue * revenueGrowth);

      const expenseGrowth = 1.01 + rand() * 0.04;
      expenses = Math.round(expenses * expenseGrowth);

      pipeline = Math.round(pipeline * (0.95 + rand() * 0.15));

      const forecast = Math.round(revenue * (0.9 + rand() * 0.2));
      const teamVelocity = Math.round(60 + rand() * 40);

      data.push({
        month: months[monthIndex],
        year,
        label: `${months[monthIndex]} ${year}`,
        revenue,
        expenses,
        profit: revenue - expenses,
        margin: ((revenue - expenses) / revenue * 100).toFixed(1),
        cashBalance: Math.round(revenue * 3.5 + rand() * 100000),
        burnRate: expenses,
        pipeline,
        forecast,
        actual: revenue,
        teamVelocity,
        newDeals: Math.round(5 + rand() * 15),
        churnRate: (1 + rand() * 3).toFixed(1)
      });
    }

    return data;
  }

  const allData = generateMonthlyData();

  // KPI calculations
  function getKPIs(range = 'all') {
    const data = filterByRange(range);
    const latest = data[data.length - 1];
    const previous = data.length > 1 ? data[data.length - 2] : latest;

    const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);
    const avgBurnRate = Math.round(data.reduce((s, d) => s + d.burnRate, 0) / data.length);

    const revenueChange = ((latest.revenue - previous.revenue) / previous.revenue * 100).toFixed(1);
    const burnChange = ((latest.burnRate - previous.burnRate) / previous.burnRate * 100).toFixed(1);
    const pipelineChange = ((latest.pipeline - previous.pipeline) / previous.pipeline * 100).toFixed(1);

    // Cash runway = cash balance / monthly burn rate
    const cashRunway = (latest.cashBalance / latest.burnRate).toFixed(1);
    const prevRunway = (previous.cashBalance / previous.burnRate).toFixed(1);
    const runwayChange = ((cashRunway - prevRunway) / prevRunway * 100).toFixed(1);

    // Forecast accuracy
    const forecastAccuracy = data.reduce((s, d) => {
      return s + (1 - Math.abs(d.forecast - d.actual) / d.actual);
    }, 0) / data.length * 100;

    const velocityChange = ((latest.teamVelocity - previous.teamVelocity) / previous.teamVelocity * 100).toFixed(1);

    return {
      cashRunway: {
        value: cashRunway,
        unit: 'months',
        change: runwayChange,
        direction: runwayChange >= 0 ? 'up' : 'down',
        subtitle: `$${formatNumber(latest.cashBalance)} balance`
      },
      mrr: {
        value: latest.revenue,
        unit: '$',
        change: revenueChange,
        direction: revenueChange >= 0 ? 'up' : 'down',
        subtitle: `$${formatNumber(totalRevenue)} total`
      },
      burnRate: {
        value: avgBurnRate,
        unit: '$',
        change: burnChange,
        direction: burnChange <= 0 ? 'up' : 'down', // Lower burn is better
        subtitle: `$${formatNumber(latest.profit)} net profit`
      },
      pipeline: {
        value: latest.pipeline,
        unit: '$',
        change: pipelineChange,
        direction: pipelineChange >= 0 ? 'up' : 'down',
        subtitle: `${latest.newDeals} new deals`
      },
      forecastAccuracy: {
        value: forecastAccuracy.toFixed(1),
        unit: '%',
        change: '+2.3',
        direction: 'up',
        subtitle: 'vs. last quarter'
      },
      teamVelocity: {
        value: latest.teamVelocity,
        unit: 'pts',
        change: velocityChange,
        direction: velocityChange >= 0 ? 'up' : 'down',
        subtitle: 'sprint velocity'
      }
    };
  }

  function filterByRange(range) {
    switch (range) {
      case '7d': return allData.slice(-1);
      case '30d': return allData.slice(-1);
      case '90d': return allData.slice(-3);
      case 'ytd': {
        const ytdData = allData.filter(d => d.year === currentYear);
        return ytdData.length ? ytdData : allData.slice(-1);
      }
      default: return allData;
    }
  }

  function getChartData(range = 'all') {
    return filterByRange(range);
  }

  // Pipeline breakdown by stage
  function getPipelineBreakdown() {
    const latest = allData[allData.length - 1];
    const total = latest.pipeline;
    return [
      { stage: 'Qualified Lead', value: Math.round(total * 0.35), color: '#60a5fa' },
      { stage: 'Discovery', value: Math.round(total * 0.25), color: '#a78bfa' },
      { stage: 'Proposal Sent', value: Math.round(total * 0.2), color: '#fbbf24' },
      { stage: 'Negotiation', value: Math.round(total * 0.12), color: '#34d399' },
      { stage: 'Closed Won', value: Math.round(total * 0.08), color: '#22d3ee' }
    ];
  }

  // Team productivity data
  function getTeamData() {
    return [
      { member: 'Sarah Chen', role: 'Engineering', velocity: 87, tasks: 24, status: 'high' },
      { member: 'Marcus Rivera', role: 'Product', velocity: 74, tasks: 18, status: 'high' },
      { member: 'Elena Volkov', role: 'Design', velocity: 69, tasks: 15, status: 'medium' },
      { member: 'James Park', role: 'Sales', velocity: 82, tasks: 31, status: 'high' },
      { member: 'Aria Sharma', role: 'Marketing', velocity: 58, tasks: 12, status: 'medium' }
    ];
  }

  function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return num.toString();
  }

  function formatCurrency(num) {
    if (num >= 1000000) return '$' + (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return '$' + (num / 1000).toFixed(0) + 'K';
    return '$' + num;
  }

  // ---- Custom Entry Management ----
  var STORAGE_KEY = 'exec-dashboard-custom-entries';

  function loadCustomEntries() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }

  function saveCustomEntries(entries) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }

  function addEntry(month, year, revenue, expenditure) {
    var entries = loadCustomEntries();
    var id = Date.now().toString();
    entries.push({
      id: id,
      month: month,
      year: parseInt(year),
      revenue: parseFloat(revenue),
      expenditure: parseFloat(expenditure),
      profit: parseFloat(revenue) - parseFloat(expenditure),
      addedAt: new Date().toISOString()
    });
    saveCustomEntries(entries);

    // Also update the allData array if there's a matching month
    var label = month + ' ' + year;
    for (var i = 0; i < allData.length; i++) {
      if (allData[i].label === label) {
        allData[i].revenue = parseFloat(revenue);
        allData[i].expenses = parseFloat(expenditure);
        allData[i].burnRate = parseFloat(expenditure);
        allData[i].actual = parseFloat(revenue);
        allData[i].profit = parseFloat(revenue) - parseFloat(expenditure);
        allData[i].margin = ((parseFloat(revenue) - parseFloat(expenditure)) / parseFloat(revenue) * 100).toFixed(1);
        break;
      }
    }

    return id;
  }

  function removeEntry(entryId) {
    var entries = loadCustomEntries();
    entries = entries.filter(function (e) { return e.id !== entryId; });
    saveCustomEntries(entries);
  }

  function getCustomEntries() {
    return loadCustomEntries();
  }

  function clearCustomEntries() {
    localStorage.removeItem(STORAGE_KEY);
  }

  return {
    getKPIs: getKPIs,
    getChartData: getChartData,
    getPipelineBreakdown: getPipelineBreakdown,
    getTeamData: getTeamData,
    formatNumber: formatNumber,
    formatCurrency: formatCurrency,
    addEntry: addEntry,
    removeEntry: removeEntry,
    getCustomEntries: getCustomEntries,
    clearCustomEntries: clearCustomEntries,
    allData: allData
  };
})();

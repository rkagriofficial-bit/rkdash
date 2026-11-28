(() => {
  const STORAGE_KEY = 'kseb_bills_v1';
  const CONFIG_KEY = 'kseb_sheets_config_v1';
  const THEME_KEY = 'kseb_theme_v1';

  let bills = [];
  let config = { url: '', secret: '' };
  let theme = 'dark';
  const charts = {};

  // ---------- Helpers ----------
  const num = (v) => (v === '' || v === null || v === undefined ? 0 : Number(v));
  const fmt = (v, d = 0) => Number(v || 0).toLocaleString('en-IN', {
    minimumFractionDigits: d,
    maximumFractionDigits: d
  });
  const fmtSigned = (v, d = 0) => {
    const n = Number(v || 0);
    return `${n > 0 ? '+' : ''}${fmt(n, d)}`;
  };

  function monthKeyToLabel(monthKey) {
    if (!monthKey || !monthKey.includes('-')) return monthKey;
    const [y, m] = monthKey.split('-').map(Number);
    const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${names[m - 1]}-${String(y).slice(-2)}`;
  }

  function nextMonthKey(monthKey) {
    const [y, m] = monthKey.split('-').map(Number);
    const nm = m === 12 ? 1 : m + 1;
    const ny = m === 12 ? y + 1 : y;
    return `${ny}-${String(nm).padStart(2, '0')}`;
  }

  function sortBills(arr) {
    return [...arr].sort((a, b) => String(a.monthKey).localeCompare(String(b.monthKey)));
  }

  // ---------- Theme ----------
  function applyTheme(nextTheme) {
    theme = nextTheme === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    document.getElementById('themeIcon').textContent = theme === 'dark' ? '☀️' : '🌙';
    document.getElementById('themeLabel').textContent = theme === 'dark' ? 'Light' : 'Dark';
    renderAll();
  }

  function getChartColors() {
    const isLight = theme === 'light';
    return {
      text: isLight ? '#374151' : '#d1d5db',
      muted: isLight ? '#6b7280' : '#9ca3af',
      grid: isLight ? 'rgba(17, 24, 39, 0.08)' : 'rgba(255, 255, 255, 0.06)'
    };
  }

  function getBaseChartOptions(extra = {}) {
    const c = getChartColors();
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { labels: { color: c.text, boxWidth: 12 } }
      },
      scales: {
        x: { ticks: { color: c.muted }, grid: { color: c.grid } },
        y: { ticks: { color: c.muted }, grid: { color: c.grid } }
      },
      ...extra
    };
  }

  function upsertChart(id, cfg) {
    if (charts[id]) charts[id].destroy();
    const el = document.getElementById(id);
    if (el) charts[id] = new Chart(el, cfg);
  }

  // ---------- Local & Google Sheets Storage ----------
  function loadLocal() {
    theme = localStorage.getItem(THEME_KEY) || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    document.getElementById('themeIcon').textContent = theme === 'dark' ? '☀️' : '🌙';
    document.getElementById('themeLabel').textContent = theme === 'dark' ? 'Light' : 'Dark';

    config = {
      url: (window.KSEB_CONFIG && window.KSEB_CONFIG.SHEETS_WEB_APP_URL) || '',
      secret: ''
    };

    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      bills = Array.isArray(saved) ? sortBills(saved) : [];
    } catch {
      bills = [];
    }
  }

  function saveLocal() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bills));
  }

  function updateSyncPill(mode, text) {
    const pill = document.getElementById('syncStatus');
    const label = document.getElementById('syncStatusText');
    pill.className = `status-pill ${mode === 'connected' ? 'status-connected' : 'status-local'}`;
    label.textContent = text;
  }

  async function fetchFromSheets(isInitialLoad = false) {
    if (!config.url) {
      updateSyncPill('local', `Local Mode (${bills.length} mo)`);
      return;
    }
    updateSyncPill('local', 'Syncing...');
    try {
      const res = await fetch(config.url);
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Failed to read sheet');
      if (Array.isArray(data.rows)) {
        bills = sortBills(data.rows.map(normalizeRecord));
        saveLocal();
      }
      updateSyncPill('connected', `Google Sheet (${bills.length} mo)`);
      populateSelectors(isInitialLoad);
      if (isInitialLoad) prepareNewEntryForm();
      renderAll();
    } catch (err) {
      updateSyncPill('local', 'Sheet Sync Error');
      console.error(err);
    }
  }

  async function postToSheets(payload) {
    if (!config.url) return { ok: true, localOnly: true };
    const res = await fetch(config.url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ secret: config.secret || '', ...payload })
    });
    return await res.json();
  }

  function normalizeMonthKey(raw) {
    const s = String(raw || '').trim();
    if (/^\d{4}-\d{2}$/.test(s)) return s;
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) {
      // Shift by +05:30 (IST) so Google Sheets midnight-IST dates never shift backward in UTC/western timezones
      const ist = new Date(d.getTime() + 5.5 * 60 * 60 * 1000);
      const y = ist.getUTCFullYear();
      const m = String(ist.getUTCMonth() + 1).padStart(2, '0');
      return `${y}-${m}`;
    }
    return s;
  }

  function normalizeRecord(r) {
    const monthKey = normalizeMonthKey(r.monthKey);
    return {
      monthKey,
      monthLabel: monthKeyToLabel(monthKey),
      prevImport: r.prevImport === '' || r.prevImport === null ? null : Number(r.prevImport),
      currImport: r.currImport === '' || r.currImport === null ? null : Number(r.currImport),
      normalImport: r.normalImport === '' || r.normalImport === null ? null : Number(r.normalImport),
      offPeakImport: r.offPeakImport === '' || r.offPeakImport === null ? null : Number(r.offPeakImport),
      peakImport: r.peakImport === '' || r.peakImport === null ? null : Number(r.peakImport),
      netImport: Number(r.netImport || 0),
      prevExport: Number(r.prevExport || 0),
      currExport: Number(r.currExport || 0),
      netExport: Number(r.netExport || 0),
      solarGeneration: Number(r.solarGeneration || 0),
      exportEfficiency: Number(r.exportEfficiency || 0),
      directUsed: Number(r.directUsed || 0),
      directEfficiency: Number(r.directEfficiency || 0),
      credit: Number(r.credit || 0),
      cumulativeCredit: Number(r.cumulativeCredit || 0),
      billAmount: Number(r.billAmount || 0),
      resetCumulative: r.resetCumulative === true || r.resetCumulative === 'true'
    };
  }

  function getCurrentMonthKey() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  // ---------- Selectors ----------
  function populateSelectors(selectDefault = false) {
    const mSel = document.getElementById('monthlySelect');
    const prevM = mSel.value;
    const reversed = [...bills].reverse();
    mSel.innerHTML = reversed.map((b) => `<option value="${b.monthKey}">${b.monthLabel}</option>`).join('');

    const presentKey = getCurrentMonthKey();
    if (selectDefault) {
      if (bills.some((b) => b.monthKey === presentKey)) mSel.value = presentKey;
      else if (reversed.length) mSel.value = reversed[0].monthKey;
    } else if (prevM && bills.some((b) => b.monthKey === prevM)) {
      mSel.value = prevM;
    } else if (bills.some((b) => b.monthKey === presentKey)) {
      mSel.value = presentKey;
    } else if (reversed.length) {
      mSel.value = reversed[0].monthKey;
    }

    const ySel = document.getElementById('yearlySelect');
    const prevY = ySel.value;
    const years = [...new Set(bills.map((b) => b.monthKey.slice(0, 4)))].sort().reverse();
    ySel.innerHTML = years.map((y) => `<option value="${y}">${y}</option>`).join('');
    const presentYear = String(new Date().getFullYear());
    if (selectDefault) {
      if (years.includes(presentYear)) ySel.value = presentYear;
      else if (years.length) ySel.value = years[0];
    } else if (prevY && years.includes(prevY)) {
      ySel.value = prevY;
    } else if (years.length) {
      ySel.value = years[0];
    }
  }

  // ---------- 1. MONTHLY DASHBOARD ----------
  function renderMonthlyDashboard() {
    if (!bills.length) return;
    const key = document.getElementById('monthlySelect').value || bills[bills.length - 1].monthKey;
    const idx = bills.findIndex((b) => b.monthKey === key);
    const b = bills[idx >= 0 ? idx : bills.length - 1];
    const prev = idx > 0 ? bills[idx - 1] : null;

    document.getElementById('monthlyBadge').textContent = b.resetCumulative
      ? `${b.monthLabel} • May Settlement Reset`
      : b.monthLabel;

    document.getElementById('mKpiSolar').textContent = `${fmt(b.solarGeneration)} kWh`;
    document.getElementById('mKpiSolarSub').textContent = prev
      ? `vs ${prev.monthLabel}: ${b.solarGeneration - prev.solarGeneration >= 0 ? '+' : ''}${fmt(b.solarGeneration - prev.solarGeneration)} kWh`
      : 'First recorded month';

    document.getElementById('mKpiExport').textContent = `${fmt(b.netExport)} kWh`;
    document.getElementById('mKpiExportSub').textContent = `Export eff: ${Number(b.exportEfficiency).toFixed(2)}%`;

    document.getElementById('mKpiImport').textContent = `${fmt(b.netImport)} kWh`;
    document.getElementById('mKpiImportSub').textContent = b.normalImport !== null
      ? `N:${b.normalImport} / OP:${b.offPeakImport} / P:${b.peakImport}`
      : `Meter: ${b.prevImport} → ${b.currImport}`;

    document.getElementById('mKpiDirect').textContent = `${fmt(b.directUsed)} kWh`;
    document.getElementById('mKpiDirectSub').textContent = `Direct usage: ${Number(b.directEfficiency).toFixed(2)}%`;

    document.getElementById('mKpiCredit').textContent = `${fmtSigned(b.credit)} kWh`;
    document.getElementById('mKpiCreditSub').textContent = `Cumulative bank: ${fmt(b.cumulativeCredit)} kWh`;

    document.getElementById('mKpiBill').textContent = `₹${fmt(b.billAmount)}`;
    document.getElementById('mKpiBillSub').textContent = prev
      ? `Prev month (${prev.monthLabel}): ₹${fmt(prev.billAmount)}`
      : 'Monthly KSEB bill';

    const c = getChartColors();

    upsertChart('monthlySolarSplitChart', {
      type: 'doughnut',
      data: {
        labels: ['Net Exported', 'Direct Used'],
        datasets: [{
          data: [b.netExport, Math.max(0, b.directUsed)],
          backgroundColor: ['#10b981', '#f59e0b'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { color: c.text } } }
      }
    });

    const isLegacy = b.normalImport === null;
    upsertChart('monthlyTodChart', {
      type: isLegacy ? 'bar' : 'doughnut',
      data: isLegacy
        ? {
            labels: ['Total Net Import (Pre-ToD)'],
            datasets: [{ label: 'kWh', data: [b.netImport], backgroundColor: ['#38bdf8'] }]
          }
        : {
            labels: ['Normal', 'Off-Peak', 'Peak'],
            datasets: [{
              data: [b.normalImport, b.offPeakImport, b.peakImport],
              backgroundColor: ['#38bdf8', '#a78bfa', '#f43f5e'],
              borderWidth: 0
            }]
          },
      options: isLegacy
        ? getBaseChartOptions()
        : {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { color: c.text } } }
          }
    });

    const compareLabels = ['Solar Gen', 'Net Export', 'Net Import', 'Direct Used', 'Credit'];
    const currVals = [b.solarGeneration, b.netExport, b.netImport, b.directUsed, b.credit];
    const datasets = [{ label: b.monthLabel, data: currVals, backgroundColor: 'rgba(245, 158, 11, 0.85)' }];
    if (prev) {
      datasets.unshift({
        label: prev.monthLabel,
        data: [prev.solarGeneration, prev.netExport, prev.netImport, prev.directUsed, prev.credit],
        backgroundColor: 'rgba(56, 189, 248, 0.55)'
      });
    }
    upsertChart('monthlyCompareChart', {
      type: 'bar',
      data: { labels: compareLabels, datasets },
      options: getBaseChartOptions()
    });

    const currIdx = idx >= 0 ? idx : bills.length - 1;
    const trendSlice = bills.slice(Math.max(0, currIdx - 11), currIdx + 1);
    const base = getBaseChartOptions();
    upsertChart('monthlyCreditTrendChart', {
      type: 'bar',
      data: {
        labels: trendSlice.map((x) => x.monthLabel),
        datasets: [
          {
            label: 'Monthly Credit (kWh)',
            data: trendSlice.map((x) => x.credit),
            backgroundColor: trendSlice.map((x) => (x.credit >= 0 ? 'rgba(56, 189, 248, 0.75)' : 'rgba(244, 63, 94, 0.78)')),
            yAxisID: 'y'
          },
          {
            label: 'Cumulative Bank (kWh)',
            data: trendSlice.map((x) => x.cumulativeCredit),
            type: 'line',
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.14)',
            fill: true,
            tension: 0.25,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        ...base,
        scales: {
          ...base.scales,
          y1: { position: 'right', ticks: { color: '#10b981' }, grid: { drawOnChartArea: false } }
        }
      }
    });
  }

  // ---------- 2. YEARLY DASHBOARD ----------
  function renderYearlyDashboard() {
    if (!bills.length) return;
    const year = document.getElementById('yearlySelect').value || bills[bills.length - 1].monthKey.slice(0, 4);
    const data = bills.filter((b) => b.monthKey.startsWith(year));
    if (!data.length) return;

    const latest = data[data.length - 1];
    document.getElementById('yearlyBadge').textContent = `${year} (${data.length} months)`;

    const totalSolar = data.reduce((s, b) => s + b.solarGeneration, 0);
    const totalExport = data.reduce((s, b) => s + b.netExport, 0);
    const totalImport = data.reduce((s, b) => s + b.netImport, 0);
    const totalDirect = data.reduce((s, b) => s + b.directUsed, 0);
    const totalBill = data.reduce((s, b) => s + b.billAmount, 0);
    const avgExportEff = data.reduce((s, b) => s + b.exportEfficiency, 0) / data.length;
    const avgDirectEff = data.reduce((s, b) => s + b.directEfficiency, 0) / data.length;

    document.getElementById('yKpiSolar').textContent = `${fmt(totalSolar)} kWh`;
    document.getElementById('yKpiSolarSub').textContent = `Avg ${fmt(totalSolar / data.length, 1)} kWh / mo`;

    document.getElementById('yKpiExport').textContent = `${fmt(totalExport)} kWh`;
    document.getElementById('yKpiExportSub').textContent = `Avg export eff: ${avgExportEff.toFixed(1)}%`;

    document.getElementById('yKpiImport').textContent = `${fmt(totalImport)} kWh`;
    document.getElementById('yKpiImportSub').textContent = `Net surplus: ${fmtSigned(totalExport - totalImport)} kWh`;

    document.getElementById('yKpiDirect').textContent = `${fmt(totalDirect)} kWh`;
    document.getElementById('yKpiDirectSub').textContent = `Avg direct usage: ${avgDirectEff.toFixed(1)}%`;

    document.getElementById('yKpiCumCredit').textContent = `${fmt(latest.cumulativeCredit)} kWh`;
    document.getElementById('yKpiCumCreditSub').textContent = `As of ${latest.monthLabel}`;

    document.getElementById('yKpiBills').textContent = `₹${fmt(totalBill)}`;
    document.getElementById('yKpiBillsSub').textContent = `Avg ₹${fmt(totalBill / data.length, 0)} / mo`;

    const labels = data.map((b) => b.monthLabel);
    const base = getBaseChartOptions();

    upsertChart('yearlyEnergyChart', {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Net Export', data: data.map((b) => b.netExport), backgroundColor: 'rgba(16, 185, 129, 0.8)', stack: 's' },
          { label: 'Direct Used', data: data.map((b) => b.directUsed), backgroundColor: 'rgba(245, 158, 11, 0.85)', stack: 's' },
          { label: 'Net Import', data: data.map((b) => b.netImport), backgroundColor: 'rgba(244, 63, 94, 0.8)' },
          { label: 'Solar Gen', data: data.map((b) => b.solarGeneration), type: 'line', borderColor: '#38bdf8', backgroundColor: '#38bdf8', tension: 0.3 }
        ]
      },
      options: base
    });

    upsertChart('yearlyTodChart', {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Normal', data: data.map((b) => b.normalImport ?? 0), backgroundColor: '#38bdf8', stack: 'tod' },
          { label: 'Off-Peak', data: data.map((b) => b.offPeakImport ?? 0), backgroundColor: '#a78bfa', stack: 'tod' },
          { label: 'Peak', data: data.map((b) => b.peakImport ?? 0), backgroundColor: '#f43f5e', stack: 'tod' }
        ]
      },
      options: base
    });

    upsertChart('yearlyCreditChart', {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Monthly Credit', data: data.map((b) => b.credit), backgroundColor: 'rgba(56, 189, 248, 0.7)', yAxisID: 'y' },
          {
            label: 'Cumulative Credit',
            data: data.map((b) => b.cumulativeCredit),
            type: 'line',
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.14)',
            fill: true,
            tension: 0.25,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        ...base,
        scales: {
          ...base.scales,
          y1: { position: 'right', ticks: { color: '#10b981' }, grid: { drawOnChartArea: false } }
        }
      }
    });
  }

  // ---------- 3. TOTAL (ALL-TIME) DASHBOARD ----------
  function renderTotalDashboard() {
    if (!bills.length) return;
    const first = bills[0];
    const latest = bills[bills.length - 1];
    document.getElementById('totalBadge').textContent = `${first.monthLabel} → ${latest.monthLabel} (${bills.length} mo)`;

    const totalSolar = bills.reduce((s, b) => s + b.solarGeneration, 0);
    const totalExport = bills.reduce((s, b) => s + b.netExport, 0);
    const totalImport = bills.reduce((s, b) => s + b.netImport, 0);
    const totalDirect = bills.reduce((s, b) => s + b.directUsed, 0);
    const totalBill = bills.reduce((s, b) => s + b.billAmount, 0);
    const avgExportEff = bills.reduce((s, b) => s + b.exportEfficiency, 0) / bills.length;
    const avgDirectEff = bills.reduce((s, b) => s + b.directEfficiency, 0) / bills.length;
    const peakSolar = bills.reduce((max, b) => (b.solarGeneration > max.solarGeneration ? b : max), bills[0]);

    document.getElementById('tKpiSolar').textContent = `${fmt(totalSolar)} kWh`;
    document.getElementById('tKpiSolarSub').textContent = `Avg ${fmt(totalSolar / bills.length, 1)} kWh / mo`;

    document.getElementById('tKpiExportImport').textContent = `${fmt(totalExport)} / ${fmt(totalImport)}`;
    document.getElementById('tKpiExportImportSub').textContent = `Net surplus: ${fmtSigned(totalExport - totalImport)} kWh`;

    document.getElementById('tKpiDirect').textContent = `${fmt(totalDirect)} kWh`;
    document.getElementById('tKpiDirectSub').textContent = `Avg direct usage: ${avgDirectEff.toFixed(1)}%`;

    document.getElementById('tKpiCumCredit').textContent = `${fmt(latest.cumulativeCredit)} kWh`;
    document.getElementById('tKpiCumCreditSub').textContent = `${latest.monthLabel} credit: ${fmtSigned(latest.credit)} kWh`;

    document.getElementById('tKpiBills').textContent = `₹${fmt(totalBill)}`;
    document.getElementById('tKpiBillsSub').textContent = `Avg ₹${fmt(totalBill / bills.length, 0)} / mo`;

    document.getElementById('tKpiExportEff').textContent = `${avgExportEff.toFixed(1)}%`;
    document.getElementById('tKpiExportEffSub').textContent = `Peak: ${peakSolar.monthLabel} (${fmt(peakSolar.solarGeneration)} kWh)`;

    const labels = bills.map((b) => b.monthLabel);
    const base = getBaseChartOptions();

    upsertChart('totalEnergyChart', {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Net Export', data: bills.map((b) => b.netExport), backgroundColor: 'rgba(16, 185, 129, 0.8)', stack: 's' },
          { label: 'Direct Used', data: bills.map((b) => b.directUsed), backgroundColor: 'rgba(245, 158, 11, 0.85)', stack: 's' },
          { label: 'Net Import', data: bills.map((b) => b.netImport), backgroundColor: 'rgba(244, 63, 94, 0.8)' },
          { label: 'Solar Gen', data: bills.map((b) => b.solarGeneration), type: 'line', borderColor: '#38bdf8', backgroundColor: '#38bdf8', tension: 0.3 }
        ]
      },
      options: base
    });

    const years = [...new Set(bills.map((b) => b.monthKey.slice(0, 4)))].sort();
    const sumByYear = (fn) => years.map((y) => bills.filter((b) => b.monthKey.startsWith(y)).reduce((s, b) => s + fn(b), 0));
    upsertChart('totalYoyChart', {
      type: 'bar',
      data: {
        labels: years,
        datasets: [
          { label: 'Solar Gen', data: sumByYear((b) => b.solarGeneration), backgroundColor: '#38bdf8' },
          { label: 'Net Export', data: sumByYear((b) => b.netExport), backgroundColor: '#10b981' },
          { label: 'Net Import', data: sumByYear((b) => b.netImport), backgroundColor: '#f43f5e' },
          { label: 'Direct Used', data: sumByYear((b) => b.directUsed), backgroundColor: '#f59e0b' }
        ]
      },
      options: base
    });

    upsertChart('totalCreditChart', {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Monthly Credit', data: bills.map((b) => b.credit), backgroundColor: 'rgba(56, 189, 248, 0.7)', yAxisID: 'y' },
          {
            label: 'Cumulative Credit',
            data: bills.map((b) => b.cumulativeCredit),
            type: 'line',
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.14)',
            fill: true,
            tension: 0.25,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        ...base,
        scales: {
          ...base.scales,
          y1: { position: 'right', ticks: { color: '#10b981' }, grid: { drawOnChartArea: false } }
        }
      }
    });

    upsertChart('totalEffBillChart', {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: '% Export Eff', data: bills.map((b) => b.exportEfficiency), borderColor: '#10b981', tension: 0.3, yAxisID: 'y' },
          { label: '% Direct Usage', data: bills.map((b) => b.directEfficiency), borderColor: '#f59e0b', tension: 0.3, yAxisID: 'y' },
          { label: 'Bill (₹)', data: bills.map((b) => b.billAmount), type: 'bar', backgroundColor: 'rgba(167, 139, 250, 0.45)', yAxisID: 'y1' }
        ]
      },
      options: {
        ...base,
        scales: {
          ...base.scales,
          y: { ticks: { color: getChartColors().muted, callback: (v) => `${v}%` }, grid: { color: getChartColors().grid } },
          y1: { position: 'right', ticks: { color: '#a78bfa', callback: (v) => `₹${v}` }, grid: { drawOnChartArea: false } }
        }
      }
    });
  }

  // ---------- Calculations & Entry Form ----------
  function getPreviousMonthCumulative(targetMonthKey) {
    const prior = bills.filter((b) => b.monthKey < targetMonthKey);
    if (!prior.length) return 0;
    return Number(prior[prior.length - 1].cumulativeCredit || 0);
  }

  function computeBillFromForm() {
    const monthKey = document.getElementById('monthKey').value;
    const useLegacy = document.getElementById('useLegacyImport').checked;
    const prevImport = useLegacy ? num(document.getElementById('prevImport').value) : null;
    const currImport = useLegacy ? num(document.getElementById('currImport').value) : null;
    const normalImport = useLegacy ? null : num(document.getElementById('normalImport').value);
    const offPeakImport = useLegacy ? null : num(document.getElementById('offPeakImport').value);
    const peakImport = useLegacy ? null : num(document.getElementById('peakImport').value);

    const netImport = useLegacy
      ? Math.max(0, currImport - prevImport)
      : normalImport + offPeakImport + peakImport;

    const prevExport = num(document.getElementById('prevExport').value);
    const currExport = num(document.getElementById('currExport').value);
    const netExport = Math.max(0, currExport - prevExport);

    const solarGeneration = num(document.getElementById('solarGeneration').value);
    const directUsed = solarGeneration - netExport;
    const exportEfficiency = solarGeneration > 0 ? +(netExport / solarGeneration * 100).toFixed(3) : 0;
    const directEfficiency = solarGeneration > 0 ? +(directUsed / solarGeneration * 100).toFixed(3) : 0;

    const credit = netExport - netImport;
    const resetCumulative = document.getElementById('resetCumulative').checked;
    const overrideToggle = document.getElementById('overrideCumulativeToggle').checked;
    const prevCum = getPreviousMonthCumulative(monthKey);
    const autoCum = resetCumulative ? credit : prevCum + credit;
    const cumulativeCredit = overrideToggle ? num(document.getElementById('manualCumulative').value) : autoCum;
    const billAmount = num(document.getElementById('billAmount').value);

    return {
      monthKey,
      monthLabel: monthKeyToLabel(monthKey),
      prevImport,
      currImport,
      normalImport,
      offPeakImport,
      peakImport,
      netImport,
      prevExport,
      currExport,
      netExport,
      solarGeneration,
      exportEfficiency,
      directUsed,
      directEfficiency,
      credit,
      cumulativeCredit,
      billAmount,
      resetCumulative
    };
  }

  function updatePreview() {
    const calc = computeBillFromForm();
    document.getElementById('prevMonthLabel').textContent = calc.monthLabel || '—';
    document.getElementById('prevNetImport').textContent = `${fmt(calc.netImport)} kWh`;
    document.getElementById('prevNetExport').textContent = `${fmt(calc.netExport)} kWh`;
    document.getElementById('prevDirectUsed').textContent = `${fmt(calc.directUsed)} kWh`;
    document.getElementById('prevExportEff').textContent = `${calc.exportEfficiency.toFixed(2)}%`;
    document.getElementById('prevDirectEff').textContent = `${calc.directEfficiency.toFixed(2)}%`;
    document.getElementById('prevCredit').textContent = `${fmt(calc.credit)} kWh`;
    document.getElementById('prevCumCredit').textContent = `${fmt(calc.cumulativeCredit)} kWh`;
  }

  // ---------- Ledger ----------
  function renderLedger() {
    const tbody = document.getElementById('ledgerBody');
    document.getElementById('ledgerCount').textContent = `${bills.length} months`;
    const reversed = [...bills].reverse();

    tbody.innerHTML = reversed.map((b) => `
      <tr>
        <td>${b.monthLabel}${b.resetCumulative ? ' 🔄' : ''}</td>
        <td>${b.prevImport ?? '—'}</td>
        <td>${b.currImport ?? '—'}</td>
        <td>${b.normalImport ?? '—'}</td>
        <td>${b.offPeakImport ?? '—'}</td>
        <td>${b.peakImport ?? '—'}</td>
        <td><strong>${fmt(b.netImport)}</strong></td>
        <td>${fmt(b.prevExport)}</td>
        <td>${fmt(b.currExport)}</td>
        <td><strong>${fmt(b.netExport)}</strong></td>
        <td>${fmt(b.solarGeneration)}</td>
        <td>${Number(b.exportEfficiency).toFixed(2)}%</td>
        <td>${fmt(b.directUsed)}</td>
        <td>${Number(b.directEfficiency).toFixed(2)}%</td>
        <td>${fmt(b.credit)}</td>
        <td><strong>${fmt(b.cumulativeCredit)}</strong></td>
        <td>₹${fmt(b.billAmount)}</td>
        <td>
          <button class="action-btn" data-edit="${b.monthKey}">Edit</button>
          <button class="action-btn" data-delete="${b.monthKey}">Del</button>
        </td>
      </tr>
    `).join('');
  }

  function renderAll() {
    renderMonthlyDashboard();
    renderYearlyDashboard();
    renderTotalDashboard();
    renderLedger();
    updatePreview();
  }

  // ---------- Tabs & Form Helpers ----------
  function switchTab(name) {
    document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === name));
    document.querySelectorAll('.tab-panel').forEach((p) => p.classList.toggle('active', p.id === `tab-${name}`));
  }

  function prepareNewEntryForm() {
    document.getElementById('billForm').reset();
    document.getElementById('formTitle').textContent = 'Enter Monthly KSEB Bill';
    document.getElementById('useLegacyImport').checked = false;
    document.getElementById('todImportFields').classList.remove('hidden');
    document.getElementById('legacyImportFields').classList.add('hidden');
    document.getElementById('manualCumulativeWrap').classList.add('hidden');

    if (bills.length > 0) {
      const latest = bills[bills.length - 1];
      const nextKey = nextMonthKey(latest.monthKey);
      document.getElementById('monthKey').value = nextKey;
      document.getElementById('prevExport').value = latest.currExport;
      document.getElementById('resetCumulative').checked = nextKey.endsWith('-05');
    }
    updatePreview();
  }

  function loadRecordIntoForm(monthKey) {
    const b = bills.find((x) => x.monthKey === monthKey);
    if (!b) return;
    document.getElementById('formTitle').textContent = `Edit ${b.monthLabel} Bill`;
    document.getElementById('monthKey').value = b.monthKey;
    document.getElementById('billAmount').value = b.billAmount;
    const isLegacy = b.normalImport === null && b.prevImport !== null;
    document.getElementById('useLegacyImport').checked = isLegacy;
    document.getElementById('todImportFields').classList.toggle('hidden', isLegacy);
    document.getElementById('legacyImportFields').classList.toggle('hidden', !isLegacy);

    document.getElementById('normalImport').value = b.normalImport ?? '';
    document.getElementById('offPeakImport').value = b.offPeakImport ?? '';
    document.getElementById('peakImport').value = b.peakImport ?? '';
    document.getElementById('prevImport').value = b.prevImport ?? '';
    document.getElementById('currImport').value = b.currImport ?? '';
    document.getElementById('prevExport').value = b.prevExport;
    document.getElementById('currExport').value = b.currExport;
    document.getElementById('solarGeneration').value = b.solarGeneration;
    document.getElementById('resetCumulative').checked = !!b.resetCumulative;
    document.getElementById('overrideCumulativeToggle').checked = false;
    document.getElementById('manualCumulativeWrap').classList.add('hidden');
    document.getElementById('manualCumulative').value = b.cumulativeCredit;

    updatePreview();
    switchTab('entry');
  }

  // ---------- Event Wiring ----------
  function bindEvents() {
    document.querySelectorAll('.tab').forEach((t) => {
      t.addEventListener('click', () => switchTab(t.dataset.tab));
    });

    document.getElementById('btnTheme').addEventListener('click', () => {
      applyTheme(theme === 'dark' ? 'light' : 'dark');
    });

    document.getElementById('btnOpenEntry').addEventListener('click', () => {
      prepareNewEntryForm();
      switchTab('entry');
    });

    document.getElementById('btnResetForm').addEventListener('click', prepareNewEntryForm);
    document.getElementById('monthlySelect').addEventListener('change', renderMonthlyDashboard);
    document.getElementById('yearlySelect').addEventListener('change', renderYearlyDashboard);

    document.getElementById('useLegacyImport').addEventListener('change', (e) => {
      document.getElementById('todImportFields').classList.toggle('hidden', e.target.checked);
      document.getElementById('legacyImportFields').classList.toggle('hidden', !e.target.checked);
      updatePreview();
    });

    document.getElementById('overrideCumulativeToggle').addEventListener('change', (e) => {
      document.getElementById('manualCumulativeWrap').classList.toggle('hidden', !e.target.checked);
      updatePreview();
    });

    document.getElementById('monthKey').addEventListener('change', (e) => {
      document.getElementById('resetCumulative').checked = e.target.value.endsWith('-05');
      updatePreview();
    });

    document.getElementById('billForm').addEventListener('input', updatePreview);

    document.getElementById('billForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const feedback = document.getElementById('formFeedback');
      feedback.className = 'form-feedback';
      feedback.textContent = 'Saving...';

      const record = computeBillFromForm();
      const idx = bills.findIndex((x) => x.monthKey === record.monthKey);
      if (idx >= 0) bills[idx] = record;
      else bills.push(record);
      bills = sortBills(bills);
      saveLocal();
      populateSelectors();

      try {
        const secret = document.getElementById('writeSecret').value || '';
        const res = await postToSheets({ action: 'upsert', record, secret });
        if (!res.ok) throw new Error(res.error || 'Sheet save failed');
        feedback.textContent = res.localOnly
          ? `Saved ${record.monthLabel} locally!`
          : `Saved ${record.monthLabel} to Google Sheet!`;
      } catch (err) {
        feedback.className = 'form-feedback error';
        feedback.textContent = `Saved locally, but Google Sheet error: ${err.message}`;
      }

      renderAll();
    });

    document.getElementById('ledgerBody').addEventListener('click', async (e) => {
      const editKey = e.target.dataset.edit;
      const delKey = e.target.dataset.delete;
      if (editKey) {
        loadRecordIntoForm(editKey);
      } else if (delKey && confirm(`Delete record for ${delKey}?`)) {
        const secret = config.url ? (prompt('Enter Admin Passphrase (leave blank if none):') || '') : '';
        try {
          const res = await postToSheets({ action: 'delete', monthKey: delKey, secret });
          if (!res.ok) throw new Error(res.error || 'Delete failed');
          bills = bills.filter((b) => b.monthKey !== delKey);
          saveLocal();
          populateSelectors();
          renderAll();
        } catch (err) {
          alert(`Could not delete from Google Sheet: ${err.message}`);
        }
      }
    });
  }

  // ---------- Init ----------
  loadLocal();
  populateSelectors(true);
  bindEvents();
  prepareNewEntryForm();
  renderAll();
  if (config.url) fetchFromSheets(true);
})();

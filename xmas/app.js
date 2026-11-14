/**
 * Christmas Friend Finder - Core Application Logic
 * Pure client-side, zero build step, GitHub Pages subdirectory compatible.
 * With 13+ Flexible Members, WhatsApp Numbers, Fresh Keys per Allotment,
 * Admin Exclusivity, and "Scratch & Find".
 */

(function () {
  'use strict';

  // --- Sound Engine (Web Audio API - Synthesizes bells & jingles, zero external audio assets) ---
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.enabled = true;
    }

    init() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.ctx = new AudioContext();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playScratch() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(550 + Math.random() * 450, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    }

    playChime() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      // Festive jingle arpeggio (C5, E5, G5, C6)
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, index) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        const startTime = this.ctx.currentTime + index * 0.12;
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.7);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.7);
      });
    }

    toggle() {
      this.enabled = !this.enabled;
      return this.enabled;
    }
  }

  const sound = new SoundEngine();

  // --- Default State & Storage ---
  const STORAGE_KEY = 'XMAS_FRIEND_FINDER_V4';
  const DEFAULT_13_MEMBERS = [
    'Friend 1',
    'Friend 2',
    'Friend 3',
    'Friend 4',
    'Friend 5',
    'Friend 6',
    'Friend 7',
    'Friend 8',
    'Friend 9',
    'Friend 10',
    'Friend 11',
    'Friend 12',
    'Friend 13'
  ];

  const state = {
    adminPin: '1225',
    adminExcluded: true, // Admin is organizer only (exclusive of activities)
    isAllotted: false,
    allottedAt: null,
    isFinished: false,   // Once true, no keys are asked, cards are publicly revealed
    finishedAt: null,
    names: [...DEFAULT_13_MEMBERS],
    phones: {},     // name -> WhatsApp phone string (e.g. "+919876543210")
    keys: {},       // giverName -> 4-digit secret key (e.g. "4821")
    pairs: {},      // giverName -> receiverName
    scratched: {},  // giverName -> boolean
    scratchedAt: {},
    salt: Math.random().toString(36).substring(2, 10)
  };

  function generateRandomPin() {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  function ensureKeysExist() {
    if (!state.keys) state.keys = {};
    if (!state.phones) state.phones = {};
    const used = new Set(Object.values(state.keys));
    state.names.forEach(name => {
      if (!state.keys[name]) {
        let pin;
        do {
          pin = generateRandomPin();
        } while (used.has(pin));
        used.add(pin);
        state.keys[name] = pin;
      }
    });
  }

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        Object.assign(state, parsed);
      }
    } catch (e) {
      console.warn('Could not load stored state:', e);
    }
    ensureKeysExist();
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Could not save state:', e);
    }
  }

  // --- Secret Santa Derangement Algorithm (Sattolo's Algorithm + Shuffle) ---
  // Guarantees maximum randomization and that NO friend ever draws themselves.
  function generateDerangement(namesList) {
    const list = [...namesList];
    const n = list.length;
    if (n < 2) return {};

    // 1. Initial Fisher-Yates random shuffle
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }

    // 2. Sattolo's cyclic permutation algorithm (strictly j < i)
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * i);
      [list[i], list[j]] = [list[j], list[i]];
    }

    const mapping = {};
    for (let k = 0; k < n; k++) {
      const giver = list[k];
      const receiver = list[(k + 1) % n];
      mapping[giver] = receiver;
    }
    return mapping;
  }

  // Token obfuscation for remote shareable links
  function encodePairToken(giver, receiver, key, salt) {
    const raw = `${giver}:::${receiver}:::${key}:::${salt}`;
    return btoa(encodeURIComponent(raw));
  }

  function decodePairToken(token) {
    try {
      const raw = decodeURIComponent(atob(token));
      const parts = raw.split(':::');
      if (parts.length >= 3) {
        return { giver: parts[0], receiver: parts[1], key: parts[2] };
      }
    } catch (e) {
      // invalid token format
    }
    return null;
  }

  // --- UI Elements ---
  const friendsGridEl = document.getElementById('friendsGrid');
  const participantCountEl = document.getElementById('participantCount');
  const statusBannerEl = document.getElementById('statusBanner');
  const adminModalEl = document.getElementById('adminModal');
  const adminPinModalEl = document.getElementById('adminPinModal');
  const scratchModalEl = document.getElementById('scratchModal');
  const friendKeyModalEl = document.getElementById('friendKeyModal');
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const openAdminBtn = document.getElementById('openAdminBtn');
  const toastEl = document.getElementById('toastNotice');

  // Friend Key Modal Elements
  const friendKeyTitle = document.getElementById('friendKeyTitle');
  const friendKeySubtitle = document.getElementById('friendKeySubtitle');
  const friendKeyInput = document.getElementById('friendKeyInput');
  const friendKeyError = document.getElementById('friendKeyError');
  const friendKeySubmitBtn = document.getElementById('friendKeySubmitBtn');
  const friendKeyCancelBtn = document.getElementById('friendKeyCancelBtn');

  // Scratch Modal Elements
  const scratchCanvas = document.getElementById('scratchCanvas');
  const modalFriendTitle = document.getElementById('modalFriendTitle');
  const revealedReceiverName = document.getElementById('revealedReceiverName');
  const scratchProgressFill = document.getElementById('scratchProgressFill');
  const scratchProgressText = document.getElementById('scratchProgressText');
  const alreadyRevealedNotice = document.getElementById('alreadyRevealedNotice');
  const closeScratchBtn = document.getElementById('closeScratchBtn');

  let activeScratcher = null;
  let activeReceiver = null;
  let isScratching = false;
  let canvasCtx = null;
  let lastPoint = null;

  // --- Toast notification ---
  function showToast(message, duration = 3000) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('show');
    setTimeout(() => {
      toastEl.classList.remove('show');
    }, duration);
  }

  // --- Snowflakes Generator ---
  function createSnowflakes(count = 35) {
    const container = document.getElementById('snowContainer');
    if (!container) return;
    container.innerHTML = '';
    const icons = ['❄', '❅', '❆', '•', '✧'];
    for (let i = 0; i < count; i++) {
      const flake = document.createElement('div');
      flake.className = 'snowflake';
      flake.textContent = icons[Math.floor(Math.random() * icons.length)];
      flake.style.left = Math.random() * 100 + 'vw';
      flake.style.fontSize = Math.random() * 14 + 10 + 'px';
      flake.style.opacity = (Math.random() * 0.6 + 0.3).toString();
      flake.style.animationDuration = Math.random() * 8 + 6 + 's';
      flake.style.animationDelay = Math.random() * 5 + 's';
      container.appendChild(flake);
    }
  }

  // --- Render Status Banner ---
  function renderStatusBanner() {
    if (!statusBannerEl) return;
    const isReady = state.isAllotted;
    const isFinished = state.isFinished;
    const total = state.names.length;
    const scratchedCount = Object.keys(state.scratched).filter(k => state.scratched[k]).length;

    if (participantCountEl) {
      participantCountEl.textContent = total;
    }

    let bannerTitle = '';
    let bannerDesc = '';
    let actionBtnHtml = '';

    if (isFinished) {
      bannerTitle = '🏆 Game Finished by Admin (All Matches Revealed)';
      bannerDesc = `All ${total} friends can now tap any card to openly view matches without entering any keys!`;
      actionBtnHtml = `
        <button id="bannerAdminBtn" class="btn btn-secondary btn-sm">
          ⚙️ Admin Panel
        </button>
      `;
    } else if (isReady) {
      bannerTitle = `🎅 Allotment Sealed (${total} Members)`;
      bannerDesc = `${scratchedCount} of ${total} friends have scratched and found their secret friend using their private key.`;
      actionBtnHtml = `
        <button id="bannerShareBtn" class="btn btn-gold btn-sm">
          💬 WhatsApp & Keys
        </button>
      `;
    } else {
      bannerTitle = `⏳ Waiting for Admin to Set Allotments (${total} Members)`;
      bannerDesc = 'Friends cannot scratch their card until the Admin sets and seals the draw.';
      actionBtnHtml = `
        <button id="bannerSetupBtn" class="btn btn-primary btn-sm">
          ⚙️ Admin Setup
        </button>
      `;
    }

    statusBannerEl.innerHTML = `
      <div class="status-info">
        <div class="status-dot ${isReady ? 'active' : 'pending'}"></div>
        <div class="status-text">
          <h3>${bannerTitle}</h3>
          <p>${bannerDesc}</p>
        </div>
      </div>
      <div class="status-actions">
        ${actionBtnHtml}
      </div>
    `;

    const shareBtn = document.getElementById('bannerShareBtn');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        promptAdminLogin(() => openAdminModal('tabShare'));
      });
    }

    const setupBtn = document.getElementById('bannerSetupBtn');
    if (setupBtn) {
      setupBtn.addEventListener('click', () => {
        promptAdminLogin(() => openAdminModal('tabDraw'));
      });
    }

    const adminBtn = document.getElementById('bannerAdminBtn');
    if (adminBtn) {
      adminBtn.addEventListener('click', () => {
        promptAdminLogin(() => openAdminModal('tabDraw'));
      });
    }
  }

  // --- Render Friends Grid ---
  function renderFriendsGrid() {
    if (!friendsGridEl) return;
    friendsGridEl.innerHTML = '';

    const avatars = ['🎅', '🎄', '⛄', '🎁', '🦌', '🔔', '🍪', '⭐', '🕯️', '🧦', '❄️', '🎺', '🌟'];

    state.names.forEach((name, idx) => {
      const isScratched = !!state.scratched[name];
      const isFinished = state.isFinished;
      const card = document.createElement('div');
      card.className = `friend-card ${!state.isAllotted ? 'locked-disabled' : ''}`;

      let badgeHtml = '';
      let btnText = '';

      if (!state.isAllotted) {
        badgeHtml = `<span class="friend-badge badge-waiting">⏳ Locked (Draw not set)</span>`;
        btnText = '🔒 Locked';
      } else if (isFinished) {
        badgeHtml = `<span class="friend-badge badge-ready">🎉 Publicly Revealed</span>`;
        btnText = '👀 Reveal Match (No Key)';
      } else if (isScratched) {
        badgeHtml = `<span class="friend-badge badge-scratched">✨ Revealed & Saved</span>`;
        btnText = '👀 View My Friend';
      } else {
        badgeHtml = `<span class="friend-badge badge-ready">🔑 Key Required</span>`;
        btnText = '✨ Scratch & Find';
      }

      const avatarIcon = avatars[idx % avatars.length];

      card.innerHTML = `
        <div class="friend-avatar">
          <span class="hat-decor">🎅</span>
          <span>${avatarIcon}</span>
        </div>
        <div class="friend-name">${escapeHtml(name)}</div>
        ${badgeHtml}
        <button class="btn ${isScratched || isFinished ? 'btn-secondary' : 'btn-primary'} card-action-btn">
          ${btnText}
        </button>
      `;

      card.addEventListener('click', () => {
        handleFriendCardClick(name);
      });

      friendsGridEl.appendChild(card);
    });
  }

  function handleFriendCardClick(name) {
    if (!state.isAllotted) {
      showToast('⚠️ The draw has not been set yet! Please ask Admin to seal the allotments.');
      return;
    }

    // Once Admin finishes the game: DO NOT ASK FOR A KEY!
    if (state.isFinished) {
      openScratchModal(name, null, true); // true = bypass scratch and display directly
      return;
    }

    // While game is active: Ask for friend's personal key
    promptFriendKey(name);
  }

  // --- Friend Key Verification Modal ---
  let pendingFriendName = null;
  let pendingReceiverOverride = null;

  function promptFriendKey(name, forcedReceiver = null) {
    pendingFriendName = name;
    pendingReceiverOverride = forcedReceiver;

    const isAlreadyScratched = !!state.scratched[name];

    // Dynamic button label: "Unlock & View" if already scratched, "Unlock & Scratch" if not
    if (isAlreadyScratched) {
      friendKeyTitle.textContent = `Unlock to View Your Friend`;
      friendKeySubtitle.textContent = `Enter your private passkey to view ${name}'s secret friend.`;
      friendKeySubmitBtn.textContent = `✨ Unlock & View`;
    } else {
      friendKeyTitle.textContent = `Unlock ${name}'s Card`;
      friendKeySubtitle.textContent = `Enter your private passkey to scratch & find ${name}'s secret friend.`;
      friendKeySubmitBtn.textContent = `✨ Unlock & Scratch`;
    }

    friendKeyInput.value = '';
    friendKeyError.textContent = '';
    friendKeyModalEl.classList.add('show');
    friendKeyInput.focus();
  }

  function submitFriendKey() {
    if (!pendingFriendName) return;
    const entered = friendKeyInput.value.trim().toUpperCase();
    const expected = (state.keys[pendingFriendName] || '').trim().toUpperCase();

    if (entered === expected) {
      friendKeyModalEl.classList.remove('show');
      sound.playChime();
      openScratchModal(pendingFriendName, pendingReceiverOverride);
    } else {
      friendKeyError.textContent = '❌ Invalid key! Check the passkey sent by your Admin.';
      sound.playScratch();
      friendKeyInput.select();
    }
  }

  friendKeySubmitBtn.onclick = submitFriendKey;
  friendKeyInput.onkeydown = (e) => {
    if (e.key === 'Enter') submitFriendKey();
  };
  friendKeyCancelBtn.onclick = () => {
    friendKeyModalEl.classList.remove('show');
    pendingFriendName = null;
  };

  // --- Scratch Card Interactive Logic (Scratch & Find) ---
  function openScratchModal(name, forcedReceiver = null, skipScratch = false) {
    activeScratcher = name;
    sound.init();

    const receiver = forcedReceiver || state.pairs[name];
    if (!receiver) {
      showToast('⚠️ No allotment found for ' + name + '. Please check with Admin.');
      return;
    }
    activeReceiver = receiver;

    if (!state.pairs[name]) {
      state.pairs[name] = receiver;
      state.isAllotted = true;
      saveState();
    }

    modalFriendTitle.textContent = `${name}'s Card (Scratch & Find)`;
    revealedReceiverName.textContent = receiver;

    const isAlreadyScratched = !!state.scratched[name];

    // If game is finished by admin or already scratched, reveal instantly without asking for key or foil!
    if (isAlreadyScratched || state.isFinished || skipScratch) {
      scratchCanvas.style.display = 'none';
      scratchProgressFill.style.width = '100%';
      scratchProgressText.textContent = '100%';
      alreadyRevealedNotice.style.display = 'block';

      if (state.isFinished) {
        alreadyRevealedNotice.innerHTML = `
          <p>🎉 <strong>Match Revealed:</strong> <strong>${escapeHtml(name)}</strong> is gifting to <strong>${escapeHtml(receiver)}</strong>!</p>
          <p style="font-size:0.8rem; margin-top:4px; color:#4ade80;">🏆 (Game Finished by Admin - All cards unlocked without keys!)</p>
        `;
        if (window.HolidayConfetti) {
          sound.playChime();
          const rect = scratchModalEl.getBoundingClientRect();
          window.HolidayConfetti.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 70);
        }
      } else {
        alreadyRevealedNotice.innerHTML = `
          <p>🔒 <strong>Assignment Sealed:</strong> Your secret friend is <strong>${escapeHtml(receiver)}</strong>!</p>
          <p style="font-size:0.8rem; margin-top:4px; color:#cbd5e1;">(Once allotted, your friend cannot be changed. Keep it a surprise! 🤫)</p>
        `;
      }
    } else {
      scratchCanvas.style.display = 'block';
      scratchCanvas.style.opacity = '1';
      alreadyRevealedNotice.style.display = 'none';
      scratchProgressFill.style.width = '0%';
      scratchProgressText.textContent = '0%';
      
      requestAnimationFrame(() => {
        initScratchCanvas();
      });
    }

    scratchModalEl.classList.add('show');
  }

  function initScratchCanvas() {
    canvasCtx = scratchCanvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const w = scratchCanvas.offsetWidth || 450;
    const h = scratchCanvas.offsetHeight || 250;

    scratchCanvas.width = w * dpr;
    scratchCanvas.height = h * dpr;

    canvasCtx.setTransform(1, 0, 0, 1, 0, 0);
    canvasCtx.scale(dpr, dpr);

    // Draw Festive Metallic Foil Layer
    const grad = canvasCtx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#e5c158');
    grad.addColorStop(0.25, '#d4af37');
    grad.addColorStop(0.5, '#fef08a');
    grad.addColorStop(0.75, '#d4af37');
    grad.addColorStop(1, '#b45309');

    canvasCtx.fillStyle = grad;
    canvasCtx.fillRect(0, 0, w, h);

    // Sparkles
    canvasCtx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    for (let i = 0; i < 45; i++) {
      const rx = Math.random() * w;
      const ry = Math.random() * h;
      canvasCtx.beginPath();
      canvasCtx.arc(rx, ry, Math.random() * 3 + 1, 0, Math.PI * 2);
      canvasCtx.fill();
    }

    // Border Ribbon
    canvasCtx.strokeStyle = 'rgba(185, 28, 28, 0.7)';
    canvasCtx.lineWidth = 6;
    canvasCtx.strokeRect(10, 10, w - 20, h - 20);

    // Festive Text Overlay: "SCRATCH & FIND"
    canvasCtx.fillStyle = '#1e293b';
    canvasCtx.font = 'bold 18px "Segoe UI", sans-serif';
    canvasCtx.textAlign = 'center';
    canvasCtx.textBaseline = 'middle';
    canvasCtx.fillText('🎄 SCRATCH & FIND 🎄', w / 2, h / 2 - 20);

    canvasCtx.fillStyle = '#475569';
    canvasCtx.font = '13px "Segoe UI", sans-serif';
    canvasCtx.fillText('Swipe or drag to find your Xmas Friend!', w / 2, h / 2 + 15);

    setupCanvasEvents();
  }

  function setupCanvasEvents() {
    scratchCanvas.onmousedown = onPointerDown;
    scratchCanvas.onmousemove = onPointerMove;
    window.onmouseup = onPointerUp;

    scratchCanvas.removeEventListener('touchstart', onPointerDown);
    scratchCanvas.removeEventListener('touchmove', onPointerMove);
    scratchCanvas.addEventListener('touchstart', onPointerDown, { passive: false });
    scratchCanvas.addEventListener('touchmove', onPointerMove, { passive: false });
    window.addEventListener('touchend', onPointerUp, { passive: false });
  }

  function getPointerPos(e) {
    const rect = scratchCanvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const w = scratchCanvas.offsetWidth || rect.width;
    const h = scratchCanvas.offsetHeight || rect.height;

    return {
      x: ((clientX - rect.left) / rect.width) * w,
      y: ((clientY - rect.top) / rect.height) * h
    };
  }

  function onPointerDown(e) {
    if (e.cancelable) e.preventDefault();
    isScratching = true;
    lastPoint = getPointerPos(e);
    scratchAt(lastPoint.x, lastPoint.y);
  }

  function onPointerMove(e) {
    if (!isScratching) return;
    if (e.cancelable) e.preventDefault();
    const currentPoint = getPointerPos(e);
    scratchLine(lastPoint.x, lastPoint.y, currentPoint.x, currentPoint.y);
    lastPoint = currentPoint;

    if (Math.random() < 0.22) {
      sound.playScratch();
      checkScratchPercentage();
    }
  }

  function onPointerUp() {
    if (!isScratching) return;
    isScratching = false;
    checkScratchPercentage();
  }

  function scratchLine(x1, y1, x2, y2) {
    if (!canvasCtx) return;
    canvasCtx.globalCompositeOperation = 'destination-out';
    canvasCtx.lineWidth = 42;
    canvasCtx.lineCap = 'round';
    canvasCtx.lineJoin = 'round';

    canvasCtx.beginPath();
    canvasCtx.moveTo(x1, y1);
    canvasCtx.lineTo(x2, y2);
    canvasCtx.stroke();
  }

  function scratchAt(x, y) {
    if (!canvasCtx) return;
    canvasCtx.globalCompositeOperation = 'destination-out';
    canvasCtx.beginPath();
    canvasCtx.arc(x, y, 22, 0, Math.PI * 2);
    canvasCtx.fill();
  }

  // Calculate Scratch Percentage
  function checkScratchPercentage() {
    if (!canvasCtx || !scratchCanvas) return;
    const w = scratchCanvas.width;
    const h = scratchCanvas.height;

    const sampleStep = 14;
    const imgData = canvasCtx.getImageData(0, 0, w, h);
    const data = imgData.data;
    let transparentPixels = 0;
    let totalSamples = 0;

    for (let y = 0; y < h; y += sampleStep) {
      for (let x = 0; x < w; x += sampleStep) {
        const index = (y * w + x) * 4;
        const alpha = data[index + 3];
        if (alpha < 128) {
          transparentPixels++;
        }
        totalSamples++;
      }
    }

    const pct = Math.min(100, Math.round((transparentPixels / totalSamples) * 100));
    scratchProgressFill.style.width = pct + '%';
    scratchProgressText.textContent = pct + '%';

    // Auto-reveal once 40% scratched
    if (pct >= 40) {
      completeScratchReveal();
    }
  }

  function completeScratchReveal() {
    if (state.scratched[activeScratcher]) return;

    state.scratched[activeScratcher] = true;
    state.scratchedAt[activeScratcher] = new Date().toISOString();
    saveState();

    scratchCanvas.style.transition = 'opacity 0.6s ease';
    scratchCanvas.style.opacity = '0';
    setTimeout(() => {
      scratchCanvas.style.display = 'none';
      alreadyRevealedNotice.style.display = 'block';
      alreadyRevealedNotice.innerHTML = `
        <p>🎉 <strong>Secret Friend Found!</strong> You are buying a gift for <strong>${escapeHtml(activeReceiver || state.pairs[activeScratcher])}</strong>!</p>
        <p style="font-size:0.8rem; margin-top:4px; color:#cbd5e1;">(Cannot be re-allotted. Your assignment is permanently saved!)</p>
      `;
    }, 600);

    scratchProgressFill.style.width = '100%';
    scratchProgressText.textContent = '100%';

    sound.playChime();
    if (window.HolidayConfetti) {
      const rect = scratchModalEl.getBoundingClientRect();
      window.HolidayConfetti.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 140);
    }

    renderStatusBanner();
    renderFriendsGrid();
  }

  closeScratchBtn.addEventListener('click', () => {
    scratchModalEl.classList.remove('show');
  });

  // --- Admin Flow ---
  function promptAdminLogin(onSuccess) {
    adminPinModalEl.classList.add('show');
    const pinInput = document.getElementById('adminPinInput');
    const submitBtn = document.getElementById('adminPinSubmitBtn');
    const cancelBtn = document.getElementById('adminPinCancelBtn');
    const errorEl = document.getElementById('adminPinError');

    pinInput.value = '';
    errorEl.textContent = '';
    pinInput.focus();

    const doSubmit = () => {
      if (pinInput.value.trim() === state.adminPin) {
        adminPinModalEl.classList.remove('show');
        if (typeof onSuccess === 'function') onSuccess();
      } else {
        errorEl.textContent = '❌ Incorrect PIN. Try again (Default: 1225)';
        sound.playScratch();
      }
    };

    submitBtn.onclick = doSubmit;
    pinInput.onkeydown = (e) => {
      if (e.key === 'Enter') doSubmit();
    };

    cancelBtn.onclick = () => {
      adminPinModalEl.classList.remove('show');
    };
  }

  function openAdminModal(defaultTab = 'tabDraw') {
    renderAdminModal();
    switchAdminTab(defaultTab);
    adminModalEl.classList.add('show');
  }

  function renderAdminModal() {
    ensureKeysExist();
    const namesContainer = document.getElementById('adminNamesGrid');
    const adminMemberCountEl = document.getElementById('adminMemberCount');
    const adminExcludedCheckbox = document.getElementById('adminExcludedCheckbox');

    if (adminMemberCountEl) {
      adminMemberCountEl.textContent = state.names.length;
    }

    if (adminExcludedCheckbox) {
      adminExcludedCheckbox.checked = !!state.adminExcluded;
      adminExcludedCheckbox.disabled = state.isAllotted;
      adminExcludedCheckbox.onchange = () => {
        state.adminExcluded = adminExcludedCheckbox.checked;
        saveState();
        showToast(state.adminExcluded 
          ? '🛡️ Admin is excluded from draw (Organizer only).' 
          : '🎁 Admin participates in the exchange.');
      };
    }

    namesContainer.innerHTML = '';

    state.names.forEach((name, i) => {
      const key = state.keys[name] || generateRandomPin();
      state.keys[name] = key;
      const phone = state.phones[name] || '';

      const card = document.createElement('div');
      card.className = 'member-edit-card';
      card.innerHTML = `
        <div class="member-edit-header">
          <span>Member #${i + 1}</span>
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="friend-key-badge">Key: ${escapeHtml(key)}</span>
            ${!state.isAllotted && state.names.length > 2 ? `
              <button class="btn-icon-danger delete-member-btn" data-index="${i}" title="Delete Member">🗑️</button>
            ` : ''}
          </div>
        </div>
        <div class="member-edit-inputs">
          <input type="text" class="name-input name-field" data-index="${i}" placeholder="Member Name" value="${escapeHtml(name)}" ${state.isAllotted ? 'disabled' : ''} style="flex:1; min-width:140px;">
          <input type="text" class="name-input phone-field" data-index="${i}" placeholder="WhatsApp (e.g. +919876543210)" value="${escapeHtml(phone)}" ${state.isAllotted ? 'disabled' : ''} style="flex:1; min-width:160px;">
        </div>
      `;
      namesContainer.appendChild(card);
    });

    // Delete member event
    namesContainer.querySelectorAll('.delete-member-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        const removed = state.names.splice(idx, 1)[0];
        delete state.keys[removed];
        delete state.phones[removed];
        delete state.pairs[removed];
        delete state.scratched[removed];
        saveState();
        renderAdminModal();
        renderFriendsGrid();
        renderStatusBanner();
        showToast(`Removed ${removed}`);
      });
    });

    renderMasterTable();
    renderShareLinks();

    // PIN Display in Settings
    const currentPinDisplay = document.getElementById('currentPinDisplay');
    if (currentPinDisplay) {
      currentPinDisplay.textContent = state.adminPin;
    }

    const statusNote = document.getElementById('adminDrawStatusNote');
    const saveBtn = document.getElementById('saveNamesBtn');
    const triggerBtn = document.getElementById('triggerDrawBtn');
    const finishBtn = document.getElementById('finishGameBtn');
    const reopenBtn = document.getElementById('reopenGameBtn');
    const resetBtn = document.getElementById('resetDrawBtn');
    const addMemberBtn = document.getElementById('addMemberBtn');

    if (addMemberBtn) {
      addMemberBtn.style.display = state.isAllotted ? 'none' : 'inline-flex';
    }

    if (state.isAllotted) {
      if (state.isFinished) {
        statusNote.innerHTML = `
          <div style="background:rgba(34, 197, 94, 0.2); border:1px solid #22c55e; padding:12px 14px; border-radius:8px; margin-bottom:1rem;">
            <strong style="color:#4ade80;">🏆 Game Finished (Public Reveal Active)</strong><br>
            <span style="font-size:0.85rem; color:#cbd5e1;">All cards can now be clicked and viewed freely without requiring any secret passkeys!</span>
          </div>
        `;
        if (finishBtn) finishBtn.style.display = 'none';
        if (reopenBtn) reopenBtn.style.display = 'inline-flex';
      } else {
        statusNote.innerHTML = `
          <div style="background:rgba(34, 197, 94, 0.15); border:1px solid #22c55e; padding:12px 14px; border-radius:8px; margin-bottom:1rem;">
            <strong style="color:#4ade80;">✅ Draw is Sealed & Active!</strong><br>
            <span style="font-size:0.85rem; color:#cbd5e1;">Allotted on ${new Date(state.allottedAt).toLocaleString()}. Friends must enter their secret passkey to scratch. Click <strong>"Finish Game"</strong> to reveal all without keys.</span>
          </div>
        `;
        if (finishBtn) finishBtn.style.display = 'inline-flex';
        if (reopenBtn) reopenBtn.style.display = 'none';
      }

      if (saveBtn) saveBtn.style.display = 'none';
      if (triggerBtn) triggerBtn.style.display = 'none';
      if (resetBtn) resetBtn.style.display = 'inline-flex';
    } else {
      statusNote.innerHTML = `
        <div style="background:rgba(245, 158, 11, 0.15); border:1px solid #f59e0b; padding:10px 14px; border-radius:8px; margin-bottom:1rem;">
          <strong style="color:#fcd34d;">⚠️ Draw is in Draft Mode (${state.names.length} Members)</strong><br>
          <span style="font-size:0.85rem; color:#cbd5e1;">Set member names and WhatsApp numbers above, then click <strong>"Set & Seal Allotments"</strong>. Every allotment generates fresh random keys and complete derangement!</span>
        </div>
      `;
      if (saveBtn) saveBtn.style.display = 'inline-flex';
      if (triggerBtn) triggerBtn.style.display = 'inline-flex';
      if (finishBtn) finishBtn.style.display = 'none';
      if (reopenBtn) reopenBtn.style.display = 'none';
      if (resetBtn) resetBtn.style.display = 'none';
    }
  }

  function renderMasterTable() {
    const tableBody = document.getElementById('masterTableBody');
    if (!tableBody) return;
    tableBody.innerHTML = '';

    if (!state.isAllotted) {
      tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#94a3b8; padding:1.5rem;">Draw has not been conducted yet.</td></tr>`;
      return;
    }

    state.names.forEach((name) => {
      const receiver = state.pairs[name] || 'Not Allotted';
      const key = state.keys[name] || '----';
      const isScratched = state.scratched[name];
      const isFinished = state.isFinished;
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong>${escapeHtml(name)}</strong></td>
        <td><span class="friend-key-badge">${escapeHtml(key)}</span></td>
        <td><span class="spoiler-cell ${isFinished ? '' : 'spoiler-hidden'}" title="Click to reveal">${escapeHtml(receiver)}</span></td>
        <td>${isFinished ? '🏆 Concluded' : (isScratched ? '✅ Revealed' : '⏳ Ready')}</td>
      `;
      tableBody.appendChild(row);
    });

    document.querySelectorAll('.spoiler-cell').forEach(cell => {
      cell.addEventListener('click', () => {
        cell.classList.toggle('spoiler-hidden');
      });
    });
  }

  function renderShareLinks() {
    const container = document.getElementById('shareLinksList');
    if (!container) return;
    container.innerHTML = '';

    if (!state.isAllotted) {
      container.innerHTML = `<p style="color:#94a3b8; text-align:center; padding:1.5rem;">Please set and seal the allotments first to generate WhatsApp share links.</p>`;
      return;
    }

    const baseUrl = window.location.origin + window.location.pathname;

    state.names.forEach(name => {
      const key = state.keys[name] || '----';
      const receiver = state.pairs[name];
      const token = encodePairToken(name, receiver, key, state.salt);
      const url = `${baseUrl}?friend=${encodeURIComponent(name)}&key=${encodeURIComponent(token)}`;
      const isScratched = !!state.scratched[name];
      const rawPhone = state.phones[name] || '';
      const cleanPhone = rawPhone.replace(/[^0-9]/g, '');

      // Festive WhatsApp text format
      const waMessage = `🎄 *Secret Xmas Friend Finder!* 🎅\nHey ${name}, your secret passkey is: *${key}*\n\nTap this link to scratch & find your friend:\n${url}\n\n_Keep your key and friend a secret until gift day! 🤫_`;
      const waUrl = cleanPhone 
        ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMessage)}`
        : `https://wa.me/?text=${encodeURIComponent(waMessage)}`;

      const item = document.createElement('div');
      item.className = 'share-link-item';
      item.innerHTML = `
        <div style="min-width:180px;">
          <div class="share-link-name">
            <span>${escapeHtml(name)}</span>
            <span class="friend-key-badge">Key: ${escapeHtml(key)}</span>
            ${rawPhone ? `<span style="font-size:0.75rem; color:#86efac; font-family:monospace;">📱 ${escapeHtml(rawPhone)}</span>` : ''}
          </div>
          <div style="font-size:0.75rem; color:#94a3b8; margin-top:3px;">
            ${state.isFinished ? 'Status: 🏆 Publicly Revealed' : (isScratched ? 'Status: ✅ Revealed' : 'Status: ⏳ Ready to scratch')}
          </div>
        </div>
        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          <a href="${waUrl}" target="_blank" class="btn btn-gold btn-sm" title="${cleanPhone ? 'Send directly to ' + rawPhone : 'Share via WhatsApp'}">
            💬 WhatsApp ${cleanPhone ? `(${escapeHtml(rawPhone)})` : ''}
          </a>
          <button class="btn btn-secondary btn-sm copy-key-btn" data-key="${escapeHtml(key)}">
            🔑 Copy Key
          </button>
          <button class="btn btn-secondary btn-sm copy-invite-btn" data-msg="${escapeHtml(waMessage)}">
            📋 Copy Invite
          </button>
        </div>
      `;
      container.appendChild(item);
    });

    container.querySelectorAll('.copy-key-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        copyToClipboard(btn.getAttribute('data-key'), '✅ Passkey copied: ' + btn.getAttribute('data-key'));
      });
    });

    container.querySelectorAll('.copy-invite-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        copyToClipboard(btn.getAttribute('data-msg'), '✅ Invite message with key copied!');
      });
    });
  }

  // Copy All Keys Summary Button
  const copyAllKeysSummaryBtn = document.getElementById('copyAllKeysSummaryBtn');
  if (copyAllKeysSummaryBtn) {
    copyAllKeysSummaryBtn.addEventListener('click', () => {
      if (!state.isAllotted) {
        showToast('⚠️ Please seal allotments first!');
        return;
      }
      const baseUrl = window.location.origin + window.location.pathname;
      let text = `🎄 XMAS FRIEND FINDER - SECRET PASSKEYS (${state.names.length} Members) 🎅\n\n`;
      state.names.forEach((name, i) => {
        const phone = state.phones[name] ? ` (${state.phones[name]})` : '';
        text += `${i + 1}. ${name}${phone} -> Key: ${state.keys[name]}\n`;
      });
      text += `\nDraw Website: ${baseUrl}\nShare each key privately with its respective friend! 🤫`;
      copyToClipboard(text, `✅ All ${state.names.length} friend keys copied to clipboard!`);
    });
  }

  function copyToClipboard(text, successMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(successMsg);
      }).catch(() => {
        prompt('Copy text:', text);
      });
    } else {
      prompt('Copy text:', text);
    }
  }

  function switchAdminTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });
    document.querySelectorAll('.tab-content').forEach(content => {
      content.style.display = content.id === tabId ? 'block' : 'none';
    });
  }

  // --- Admin Event Listeners ---
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchAdminTab(btn.getAttribute('data-tab'));
    });
  });

  document.getElementById('closeAdminBtn').addEventListener('click', () => {
    adminModalEl.classList.remove('show');
  });

  openAdminBtn.addEventListener('click', () => {
    promptAdminLogin(() => openAdminModal());
  });

  // Add Member Button
  const addMemberBtn = document.getElementById('addMemberBtn');
  if (addMemberBtn) {
    addMemberBtn.addEventListener('click', () => {
      const nextNum = state.names.length + 1;
      const newName = `Friend ${nextNum}`;
      state.names.push(newName);
      state.keys[newName] = generateRandomPin();
      state.phones[newName] = '';
      saveState();
      renderAdminModal();
      renderFriendsGrid();
      renderStatusBanner();
      showToast(`Added ${newName}`);
    });
  }

  // Save Names & WhatsApp Numbers
  document.getElementById('saveNamesBtn').addEventListener('click', () => {
    const nameInputs = document.querySelectorAll('.name-field');
    const phoneInputs = document.querySelectorAll('.phone-field');
    const newNames = [];
    const newPhones = {};

    nameInputs.forEach((inp, i) => {
      const val = inp.value.trim();
      const pVal = (phoneInputs[i] && phoneInputs[i].value.trim()) || '';
      if (val) {
        newNames.push(val);
        newPhones[val] = pVal;
      }
    });

    if (newNames.length < 2) {
      showToast('⚠️ Please enter at least 2 members.');
      return;
    }

    state.names = newNames;
    state.phones = newPhones;
    ensureKeysExist();
    saveState();
    renderFriendsGrid();
    renderAdminModal();
    renderStatusBanner();
    showToast(`✅ ${newNames.length} Members & WhatsApp numbers saved!`);
  });

  // Trigger Draw (Set & Seal Allotments)
  // Ensures: 1. Completely randomized allotment 2. Fresh new keys generated for everyone
  document.getElementById('triggerDrawBtn').addEventListener('click', () => {
    if (state.names.length < 2) {
      showToast('⚠️ Need at least 2 friends for a Secret Santa draw.');
      return;
    }

    if (!confirm(`🎅 Are you ready to ALLOT & SEAL the Xmas Friends for ${state.names.length} members?\n\n• Every allotment is completely randomized!\n• Completely fresh new keys will be generated for all members!\n• Once allotted, friends cannot change who they get.`)) {
      return;
    }

    // 1. Regenerate FRESH random keys for each member on every allotment
    state.keys = {};
    const usedKeys = new Set();
    state.names.forEach(name => {
      let key;
      do {
        key = generateRandomPin();
      } while (usedKeys.has(key));
      usedKeys.add(key);
      state.keys[name] = key;
    });

    // 2. Run randomized Derangement Algorithm (Guarantees nobody gets themselves)
    const pairs = generateDerangement(state.names);

    // Double check sanity: no self-matches
    for (const giver of state.names) {
      if (pairs[giver] === giver) {
        showToast('Calculation error. Please try again.');
        return;
      }
    }

    state.pairs = pairs;
    state.isAllotted = true;
    state.isFinished = false;
    state.allottedAt = new Date().toISOString();
    state.scratched = {};
    state.scratchedAt = {};
    state.salt = Math.random().toString(36).substring(2, 10);
    saveState();

    sound.playChime();
    showToast(`🎉 Allotment complete! ${state.names.length} friends sealed with brand new keys!`);
    renderAdminModal();
    renderStatusBanner();
    renderFriendsGrid();
  });

  // Finish Game (Reveal All Without Keys)
  const finishGameBtn = document.getElementById('finishGameBtn');
  if (finishGameBtn) {
    finishGameBtn.addEventListener('click', () => {
      if (!confirm('🏁 Are you ready to FINISH THE GAME?\n\nOnce finished, secret passkeys will NO LONGER be asked from anyone. All friends can tap any card to view their match freely!')) {
        return;
      }
      state.isFinished = true;
      state.finishedAt = new Date().toISOString();
      saveState();

      sound.playChime();
      if (window.HolidayConfetti) {
        window.HolidayConfetti.burst(window.innerWidth / 2, window.innerHeight / 2, 160);
      }
      showToast('🏆 Game Finished! Secret keys are now disabled.');
      renderAdminModal();
      renderStatusBanner();
      renderFriendsGrid();
    });
  }

  // Re-lock Game with Keys
  const reopenGameBtn = document.getElementById('reopenGameBtn');
  if (reopenGameBtn) {
    reopenGameBtn.addEventListener('click', () => {
      if (!confirm('🔒 Do you want to re-lock the cards so secret passkeys are required again?')) {
        return;
      }
      state.isFinished = false;
      state.finishedAt = null;
      saveState();

      showToast('🔒 Game re-locked: Keys are now required again.');
      renderAdminModal();
      renderStatusBanner();
      renderFriendsGrid();
    });
  }

  // Reset Draw
  document.getElementById('resetDrawBtn').addEventListener('click', () => {
    const confirmText = prompt('⚠️ Type "RESET" to confirm wiping all current allotments, keys, and scratch statuses:');
    if (confirmText === 'RESET') {
      state.isAllotted = false;
      state.allottedAt = null;
      state.isFinished = false;
      state.finishedAt = null;
      state.pairs = {};
      state.scratched = {};
      state.scratchedAt = {};
      saveState();

      showToast('🔄 Allotments have been reset!');
      renderAdminModal();
      renderStatusBanner();
      renderFriendsGrid();
    } else if (confirmText !== null) {
      showToast('Reset canceled (incorrect confirmation word).');
    }
  });

  // Toggle Master List Spoilers
  const toggleAllSpoilersBtn = document.getElementById('toggleAllSpoilersBtn');
  if (toggleAllSpoilersBtn) {
    let allRevealed = false;
    toggleAllSpoilersBtn.addEventListener('click', () => {
      allRevealed = !allRevealed;
      document.querySelectorAll('.spoiler-cell').forEach(cell => {
        cell.classList.toggle('spoiler-hidden', !allRevealed);
      });
      toggleAllSpoilersBtn.textContent = allRevealed ? '🙈 Hide All Matches' : '👁️ Reveal All Matches';
    });
  }

  // Change Admin PIN in Settings
  const saveNewPinBtn = document.getElementById('saveNewPinBtn');
  const newAdminPinInput = document.getElementById('newAdminPinInput');
  const pinChangeNotice = document.getElementById('pinChangeNotice');

  if (saveNewPinBtn && newAdminPinInput) {
    saveNewPinBtn.addEventListener('click', () => {
      const newPin = newAdminPinInput.value.trim();
      if (newPin.length >= 4) {
        state.adminPin = newPin;
        saveState();
        document.getElementById('currentPinDisplay').textContent = newPin;
        newAdminPinInput.value = '';
        pinChangeNotice.textContent = `✅ Admin PIN successfully updated to: ${newPin}`;
        showToast('✅ Admin PIN updated!');
      } else {
        pinChangeNotice.style.color = '#f87171';
        pinChangeNotice.textContent = '⚠️ PIN must be at least 4 characters/digits.';
      }
    });
  }

  // Sound Toggle
  soundToggleBtn.addEventListener('click', () => {
    const isEnabled = sound.toggle();
    soundToggleBtn.textContent = isEnabled ? '🔔' : '🔕';
    showToast(isEnabled ? 'Sound effects enabled' : 'Sound effects muted');
  });

  // Helper to escape HTML strings
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // --- Check URL for Personal Scratch Link (Remote Friends Mode) ---
  function checkUrlForPersonalCard() {
    const params = new URLSearchParams(window.location.search);
    const friendParam = params.get('friend');
    const keyParam = params.get('key');

    if (friendParam && keyParam) {
      const decoded = decodePairToken(keyParam);
      if (decoded && decoded.giver === friendParam) {
        if (!state.keys[decoded.giver] && decoded.key) {
          state.keys[decoded.giver] = decoded.key;
        }
        if (state.isFinished) {
          openScratchModal(decoded.giver, decoded.receiver, true);
        } else {
          promptFriendKey(decoded.giver, decoded.receiver);
        }
        return;
      }
    } else if (friendParam && state.names.includes(friendParam)) {
      if (state.isFinished) {
        openScratchModal(friendParam, null, true);
      } else {
        promptFriendKey(friendParam);
      }
    }
  }

  // --- App Initialization ---
  function init() {
    loadState();
    createSnowflakes();
    renderStatusBanner();
    renderFriendsGrid();
    checkUrlForPersonalCard();
  }

  window.addEventListener('DOMContentLoaded', init);
})();

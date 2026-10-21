// ===== Data =====
const DHIKRS = [
  { id: 'subhanallah', arabic: 'سُبْحَانَ ٱللَّٰهِ', name: 'SubhanAllah', translation: 'Glory be to Allah', virtue: 'The Prophet ﷺ said: "If one says \'SubhanAllah\' one hundred times, one thousand good deeds will be recorded for him, or one thousand bad deeds will be erased." — Sahih Muslim 2698' },
  { id: 'alhamdulillah', arabic: 'ٱلْحَمْدُ لِلَّٰهِ', name: 'Alhamdulillah', translation: 'All praise is due to Allah', virtue: 'The Prophet ﷺ said: "Alhamdulillah fills the scales (of good deeds)." — Sahih Muslim 223' },
  { id: 'allahuakbar', arabic: 'ٱللَّٰهُ أَكْبَرُ', name: 'Allahu Akbar', translation: 'Allah is the Greatest', virtue: 'The Prophet ﷺ said: "Two words are light on the tongue, heavy on the scales, and beloved to the Most Merciful: SubhanAllahi wa bihamdihi, SubhanAllahil Azeem." — Sahih al-Bukhari 6406' },
  { id: 'lailaha', arabic: 'لَا إِلَٰهَ إِلَّا ٱللَّٰهُ', name: 'La ilaha illallah', translation: 'There is no god but Allah', virtue: 'The Prophet ﷺ said: "The best dhikr is La ilaha illallah, and the best supplication is Alhamdulillah." — Jami\' at-Tirmidhi 3383' },
  { id: 'astaghfirullah', arabic: 'أَسْتَغْفِرُ ٱللَّٰهَ', name: 'Astaghfirullah', translation: 'I seek forgiveness from Allah', virtue: 'The Prophet ﷺ said: "Whoever constantly seeks forgiveness, Allah will appoint for him a way out of every distress, relief from every anxiety, and will provide for him from where he does not expect." — Sunan Abu Dawud 1518' },
  { id: 'lahawla', arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِٱللَّٰهِ', name: 'La hawla wa la quwwata illa billah', translation: 'There is no power except with Allah', virtue: 'The Prophet ﷺ said: "La hawla wa la quwwata illa billah is a treasure from the treasures of Paradise." — Sahih al-Bukhari 4205' },
  { id: 'subhanallahi_wa_bihamdihi', arabic: 'سُبْحَانَ ٱللَّٰهِ وَبِحَمْدِهِ', name: 'SubhanAllahi wa bihamdihi', translation: 'Glory and praise be to Allah', virtue: 'The Prophet ﷺ said: "Whoever says \'SubhanAllahi wa bihamdihi\' one hundred times a day, his sins will be forgiven even if they were like the foam of the sea." — Sahih al-Bukhari 6405' },
  { id: 'salawat', arabic: 'ٱللَّٰهُمَّ صَلِّي عَلَىٰ مُحَمَّدٍ', name: 'Allahumma salli \'ala Muhammad', translation: 'O Allah, send blessings upon Muhammad', virtue: 'The Prophet ﷺ said: "Whoever sends blessings upon me once, Allah will send blessings upon him tenfold." — Sahih Muslim 384' },
];

const SUNNAH_STEPS = [
  { dhikrId: 'subhanallah', count: 33, label: 'SubhanAllah' },
  { dhikrId: 'alhamdulillah', count: 33, label: 'Alhamdulillah' },
  { dhikrId: 'allahuakbar', count: 34, label: 'Allahu Akbar' },
];

const FAQS = [
  { q: 'What is a tasbeeh counter?', a: 'A tasbeeh counter is a tool used by Muslims to count dhikr — the remembrance of Allah. It helps track repetitions of phrases like SubhanAllah (33 times), Alhamdulillah (33 times), and Allahu Akbar (34 times) after prayers.' },
  { q: 'How do I use this counter?', a: 'Select your dhikr, set a goal (33, 66, 99, or custom), and tap the counter button or press Space/Enter to count. You can switch to Sunnah Mode for guided 33-33-34 after-prayer dhikr, or use Focus Mode for a distraction-free experience.' },
  { q: 'Does it save my progress?', a: 'Yes! Every count, streak, and setting is saved automatically to your device. Close the tab, turn off your phone, come back tomorrow — your counter picks up right where you left off.' },
  { q: 'Why recite dhikr 33-33-34 times after prayer?', a: 'The Prophet Muhammad ﷺ taught that saying SubhanAllah 33 times, Alhamdulillah 33 times, and Allahu Akbar 34 times after each prayer is "better than a servant" (Sahih al-Bukhari 6318).' },
  { q: 'What is Focus Mode?', a: 'Focus Mode dims the screen and removes everything except the counter and a gentle breathing reminder. It\'s designed to help you concentrate fully on your dhikr without visual distractions.' },
  { q: 'What is the reward for saying SubhanAllah 100 times?', a: 'The Prophet ﷺ said: "If one says \'SubhanAllah\' one hundred times, one thousand good deeds will be recorded for him, or one thousand bad deeds will be erased." (Sahih Muslim 2698)' },
];

// ===== State =====
let state = {
  count: 0,
  goal: 33,
  selectedDhikr: 'subhanallah',
  totalToday: 0,
  lifetime: 0,
  streak: 0,
  lastDate: getToday(),
  customDhikrs: [],
};

let sunnahState = {
  step: 0,
  counts: [0, 0, 0],
};

// ===== Helpers =====
function getToday() {
  return new Date().toISOString().split('T')[0];
}

function getYesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function loadState() {
  try {
    const saved = localStorage.getItem('mytasbih_state');
    if (saved) {
      const loaded = JSON.parse(saved);
      // Reset daily count if new day
      if (loaded.lastDate !== getToday()) {
        if (loaded.lastDate !== getYesterday()) {
          loaded.streak = 0;
        }
        loaded.totalToday = 0;
        loaded.lastDate = getToday();
      }
      return loaded;
    }
  } catch (e) {
    console.error('Failed to load state', e);
  }
  return state;
}

function saveState() {
  try {
    localStorage.setItem('mytasbih_state', JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state', e);
  }
}

function getAllDhikrs() {
  return [...DHIKRS, ...state.customDhikrs.map(d => ({ ...d, translation: '', virtue: '' }))];
}

function getCurrentDhikr() {
  return getAllDhikrs().find(d => d.id === state.selectedDhikr) || DHIKRS[0];
}

function getProgress() {
  if (state.goal <= 0) return 0;
  return Math.min((state.count / state.goal) * 100, 100);
}

function isGoalReached() {
  return state.goal > 0 && state.count >= state.goal;
}

// ===== DOM Elements =====
const elements = {};

function cacheElements() {
  elements.todayCount = document.getElementById('todayCount');
  elements.lifetimeCount = document.getElementById('lifetimeCount');
  elements.streakCount = document.getElementById('streakCount');
  elements.currentDhikrName = document.getElementById('currentDhikrName');
  elements.arabicText = document.getElementById('arabicText');
  elements.countNumber = document.getElementById('countNumber');
  elements.countGoal = document.getElementById('countGoal');
  elements.progressRing = document.getElementById('progressRing');
  elements.countBtn = document.getElementById('countBtn');
  elements.goalOptions = document.getElementById('goalOptions');
  elements.dhikrModal = document.getElementById('dhikrModal');
  elements.dhikrList = document.getElementById('dhikrList');
  elements.focusOverlay = document.getElementById('focusOverlay');
  elements.focusArabic = document.getElementById('focusArabic');
  elements.focusName = document.getElementById('focusName');
  elements.focusCount = document.getElementById('focusCount');
  elements.sunnahModal = document.getElementById('sunnahModal');
  elements.sunnahContent = document.getElementById('sunnahContent');
  elements.sunnahComplete = document.getElementById('sunnahComplete');
  elements.sunnahIndicators = document.getElementById('sunnahIndicators');
  elements.sunnahArabic = document.getElementById('sunnahArabic');
  elements.sunnahLabel = document.getElementById('sunnahLabel');
  elements.sunnahCount = document.getElementById('sunnahCount');
  elements.sunnahGoalDisplay = document.getElementById('sunnahGoalDisplay');
  elements.guideList = document.getElementById('guideList');
  elements.faqList = document.getElementById('faqList');
  elements.dhikrModalBody = document.getElementById('dhikrModalBody');
  elements.addCustomForm = document.getElementById('addCustomForm');
  // Staircase elements
  elements.staircaseContainer = document.getElementById('staircaseContainer');
  elements.staircaseSteps = document.getElementById('staircaseSteps');
  elements.staircaseClimber = document.getElementById('staircaseClimber');
  elements.staircaseProgressText = document.getElementById('staircaseProgressText');
  elements.staircaseFlag = document.getElementById('staircaseFlag');
  elements.celebrationParticles = document.getElementById('celebrationParticles');
}

// ===== Render Functions =====
function updateUI() {
  const dhikr = getCurrentDhikr();
  const progress = getProgress();
  const reached = isGoalReached();
  const circumference = 2 * Math.PI * 96; // r=96

  // Stats
  elements.todayCount.textContent = state.totalToday;
  elements.lifetimeCount.textContent = state.lifetime.toLocaleString();
  elements.streakCount.textContent = state.streak;

  // Dhikr info
  elements.currentDhikrName.textContent = dhikr.name;
  elements.arabicText.textContent = dhikr.arabic || 'بِسْمِ اللَّهِ';

  // Count
  elements.countNumber.textContent = state.count;
  elements.countGoal.textContent = '/ ' + (state.goal === 0 ? '∞' : state.goal);

  // Progress ring
  const offset = circumference - (progress / 100) * circumference;
  elements.progressRing.style.strokeDashoffset = offset;

  // Goal reached styling
  if (reached) {
    elements.countNumber.classList.add('goal-reached');
    elements.countBtn.classList.add('goal-reached');
    elements.countBtn.textContent = '🤲';
  } else {
    elements.countNumber.classList.remove('goal-reached');
    elements.countBtn.classList.remove('goal-reached');
    elements.countBtn.textContent = '+';
  }

  // Focus mode
  elements.focusArabic.textContent = dhikr.arabic || 'بِسْمِ اللَّهِ';
  elements.focusName.textContent = dhikr.name;
  elements.focusCount.textContent = state.count;

  // Goal options active state
  document.querySelectorAll('.goal-option').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.goal) === state.goal);
  });

  // Update staircase
  renderStaircase();
}

// ===== Staircase Animation =====
function renderStaircase() {
  // For unlimited mode, hide the staircase
  if (state.goal <= 0) {
    elements.staircaseContainer.style.display = 'none';
    return;
  }
  elements.staircaseContainer.style.display = 'block';

  // Determine number of visible steps (max 15 for visual clarity)
  const maxVisibleSteps = 15;
  const goal = state.goal;
  const numSteps = Math.min(goal, maxVisibleSteps);

  // Get scene dimensions
  const scene = elements.staircaseSteps;
  const sceneWidth = scene.offsetWidth || 300;
  const sceneHeight = scene.offsetHeight || 200;

  // Calculate step dimensions - make stairs wider and more visible
  const stepWidth = Math.max(25, (sceneWidth - 60) / numSteps);
  const stepHeight = Math.max(8, (sceneHeight - 70) / numSteps);

  // Generate steps HTML
  let stepsHTML = '';
  for (let i = 0; i < numSteps; i++) {
    const x = 15 + i * stepWidth;
    const w = stepWidth + 3;
    const h = (i + 1) * stepHeight;

    // Determine which actual count this step represents
    const countPerStep = goal / numSteps;
    const stepCountThreshold = Math.ceil((i + 1) * countPerStep);
    const isClimbed = state.count >= stepCountThreshold;

    stepsHTML += `<div class="stair-step ${isClimbed ? 'climbed' : ''}"
      style="left:${x}px; bottom:0; width:${w}px; height:${h}px;"></div>`;
  }
  scene.innerHTML = stepsHTML;

  // Position the climber
  updateClimberPosition(numSteps, stepWidth, stepHeight, sceneHeight, sceneWidth);

  // Update progress text
  elements.staircaseProgressText.textContent = `${state.count} / ${state.goal} steps`;
}

function updateClimberPosition(numSteps, stepWidth, stepHeight, sceneHeight, sceneWidth) {
  if (state.goal <= 0) return;

  const goal = state.goal;
  const progress = Math.min(state.count / goal, 1);

  // Calculate which step the climber is on
  // Use floor to snap to discrete steps for realistic climbing
  const currentStepFloat = progress * numSteps;
  const currentStep = Math.min(Math.floor(currentStepFloat), numSteps - 1);

  // If at the very top (goal reached), place at the last step
  const isComplete = state.count >= goal;
  const finalStep = isComplete ? numSteps - 1 : currentStep;

  // Position climber on top of the current step
  const x = 15 + finalStep * stepWidth + stepWidth * 0.4;
  const climberBottom = (finalStep + 1) * stepHeight;

  elements.staircaseClimber.style.left = x + 'px';
  elements.staircaseClimber.style.bottom = climberBottom + 'px';

  // Add slight lean when climbing (not when celebrating)
  if (!isComplete && state.count > 0) {
    const leanAngle = -5 - (progress * 10); // Lean forward more as progress increases
    elements.staircaseClimber.style.transform = `rotate(${leanAngle}deg)`;
  } else if (isComplete) {
    elements.staircaseClimber.style.transform = 'rotate(0deg)';
  }

  // Celebration when goal reached
  if (isComplete) {
    elements.staircaseClimber.classList.add('celebrating');
    elements.staircaseClimber.classList.remove('walking');
    showCelebration();
  } else {
    elements.staircaseClimber.classList.remove('celebrating');
  }
}

function triggerWalkingAnimation() {
  if (state.count >= state.goal) return;

  // Remove and re-add class to restart animation
  elements.staircaseClimber.classList.remove('walking');
  // Force reflow
  void elements.staircaseClimber.offsetWidth;
  elements.staircaseClimber.classList.add('walking');

  setTimeout(() => {
    elements.staircaseClimber.classList.remove('walking');
  }, 500);
}

function showCelebration() {
  const container = elements.celebrationParticles;
  container.innerHTML = '';

  // Get climber position for particle origin
  const climberRect = elements.staircaseClimber.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  const originX = climberRect.left - containerRect.left + climberRect.width / 2;
  const originY = climberRect.top - containerRect.top;

  // Create 12 particles for more celebration effect
  for (let i = 0; i < 12; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    const angle = (i / 12) * Math.PI * 2;
    const distance = 40 + Math.random() * 40;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance - 30;
    particle.style.setProperty('--tx', tx + 'px');
    particle.style.setProperty('--ty', ty + 'px');
    particle.style.left = originX + 'px';
    particle.style.top = originY + 'px';
    container.appendChild(particle);
  }

  // Clear particles after animation
  setTimeout(() => {
    container.innerHTML = '';
  }, 1300);
}

function renderDhikrList() {
  const allDhikrs = getAllDhikrs();
  elements.dhikrList.innerHTML = allDhikrs.map(d => `
    <button class="dhikr-item ${state.selectedDhikr === d.id ? 'selected' : ''}" data-id="${d.id}">
      <div>
        ${d.arabic ? `<p class="dhikr-arabic">${d.arabic}</p>` : ''}
        <p class="dhikr-name">${d.name}</p>
      </div>
      ${state.selectedDhikr === d.id ? '<span class="check">✓</span>' : ''}
    </button>
  `).join('');

  // Add click handlers
  elements.dhikrList.querySelectorAll('.dhikr-item').forEach(item => {
    item.addEventListener('click', () => {
      state.selectedDhikr = item.dataset.id;
      state.count = 0;
      saveState();
      updateUI();
      closeDhikrModal();
    });
  });
}

function renderGuideList() {
  const visibleDhikrs = DHIKRS.slice(0, 5);
  elements.guideList.innerHTML = visibleDhikrs.map(d => `
    <div class="guide-card">
      <div class="guide-card-info">
        <p class="arabic">${d.arabic}</p>
        <p class="name">${d.name}</p>
        <p class="translation">${d.translation}</p>
      </div>
      <div class="guide-card-virtue">
        <p>${d.virtue}</p>
      </div>
    </div>
  `).join('');
}

function renderAllGuideList() {
  elements.guideList.innerHTML = DHIKRS.map(d => `
    <div class="guide-card">
      <div class="guide-card-info">
        <p class="arabic">${d.arabic}</p>
        <p class="name">${d.name}</p>
        <p class="translation">${d.translation}</p>
      </div>
      <div class="guide-card-virtue">
        <p>${d.virtue}</p>
      </div>
    </div>
  `).join('');
}

function renderFAQ() {
  elements.faqList.innerHTML = FAQS.map((faq, i) => `
    <div class="faq-item" data-index="${i}">
      <button class="faq-question">
        <span>${faq.q}</span>
        <span class="faq-arrow">▼</span>
      </button>
      <div class="faq-answer">${faq.a}</div>
    </div>
  `).join('');

  // Add click handlers
  elements.faqList.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      item.classList.toggle('open');
    });
  });
}

function renderSunnahIndicators() {
  let html = '';
  SUNNAH_STEPS.forEach((step, i) => {
    const cls = i < sunnahState.step ? 'completed' : i === sunnahState.step ? 'active' : '';
    html += `<div class="sunnah-dot ${cls}">${i < sunnahState.step ? '✓' : i + 1}</div>`;
    if (i < SUNNAH_STEPS.length - 1) {
      html += `<div class="sunnah-line ${i < sunnahState.step ? 'completed' : ''}"></div>`;
    }
  });
  elements.sunnahIndicators.innerHTML = html;
}

function updateSunnahUI() {
  if (sunnahState.step >= SUNNAH_STEPS.length) {
    elements.sunnahContent.style.display = 'none';
    elements.sunnahComplete.style.display = 'block';
    return;
  }

  elements.sunnahContent.style.display = 'block';
  elements.sunnahComplete.style.display = 'none';

  const currentStep = SUNNAH_STEPS[sunnahState.step];
  const dhikr = DHIKRS.find(d => d.id === currentStep.dhikrId);

  renderSunnahIndicators();
  elements.sunnahArabic.textContent = dhikr.arabic;
  elements.sunnahLabel.textContent = currentStep.label;
  elements.sunnahCount.textContent = sunnahState.counts[sunnahState.step];
  elements.sunnahGoalDisplay.textContent = '/ ' + currentStep.count;
}

// ===== Actions =====
function handleCount() {
  state.count++;
  state.totalToday++;
  state.lifetime++;

  // Check if new day for streak
  const today = getToday();
  if (state.lastDate !== today) {
    if (state.lastDate === getYesterday()) {
      state.streak++;
    } else {
      state.streak = 1;
    }
    state.lastDate = today;
  } else if (state.streak === 0) {
    state.streak = 1;
  }

  // Reset count if goal reached (and not unlimited)
  if (state.goal > 0 && state.count > state.goal) {
    state.count = 1;
  }

  saveState();
  updateUI();

  // Trigger walking animation
  triggerWalkingAnimation();

  // Vibrate if supported
  if (navigator.vibrate) {
    navigator.vibrate(10);
  }
}

function handleReset() {
  state.count = 0;
  saveState();
  updateUI();
}

function handleSetGoal(goal) {
  state.goal = goal;
  state.count = 0;
  saveState();
  updateUI();
  elements.goalOptions.style.display = 'none';
}

function handleAddCustomDhikr() {
  const name = document.getElementById('customDhikrName').value.trim();
  const arabic = document.getElementById('customDhikrArabic').value.trim();

  if (!name) return;

  const id = 'custom_' + Date.now();
  state.customDhikrs.push({ id, arabic, name });
  state.selectedDhikr = id;
  state.count = 0;
  saveState();
  updateUI();

  // Reset form
  document.getElementById('customDhikrName').value = '';
  document.getElementById('customDhikrArabic').value = '';
  elements.addCustomForm.style.display = 'none';
  elements.dhikrModalBody.style.display = 'block';
  closeDhikrModal();
}

function handleSunnahCount() {
  if (sunnahState.step >= SUNNAH_STEPS.length) return;

  const currentStep = SUNNAH_STEPS[sunnahState.step];
  sunnahState.counts[sunnahState.step]++;

  if (sunnahState.counts[sunnahState.step] >= currentStep.count) {
    if (sunnahState.step < SUNNAH_STEPS.length - 1) {
      sunnahState.step++;
    } else {
      // Complete
    }
  }

  updateSunnahUI();

  if (navigator.vibrate) {
    navigator.vibrate(10);
  }
}

// ===== Modal Controls =====
function openDhikrModal() {
  renderDhikrList();
  elements.dhikrModal.style.display = 'flex';
  elements.dhikrModalBody.style.display = 'block';
  elements.addCustomForm.style.display = 'none';
}

function closeDhikrModal() {
  elements.dhikrModal.style.display = 'none';
}

function openFocusMode() {
  updateUI();
  elements.focusOverlay.style.display = 'flex';
}

function closeFocusMode() {
  elements.focusOverlay.style.display = 'none';
}

function openSunnahMode() {
  sunnahState = { step: 0, counts: [0, 0, 0] };
  updateSunnahUI();
  elements.sunnahModal.style.display = 'flex';
}

function closeSunnahMode() {
  elements.sunnahModal.style.display = 'none';
}

// ===== Dark Mode =====
function toggleDarkMode() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('mytasbih_dark', isDark);
  document.getElementById('darkModeBtn').textContent = isDark ? '☀️' : '🌙';
}

function initDarkMode() {
  const isDark = localStorage.getItem('mytasbih_dark') === 'true';
  if (isDark) {
    document.documentElement.classList.add('dark');
    document.getElementById('darkModeBtn').textContent = '☀️';
  }
}

// ===== Event Listeners =====
function setupEventListeners() {
  // Count button
  elements.countBtn.addEventListener('click', handleCount);

  // Focus overlay click to count
  elements.focusOverlay.addEventListener('click', (e) => {
    if (e.target === elements.focusOverlay || e.target.classList.contains('focus-count') || e.target.classList.contains('focus-hint')) {
      handleCount();
      updateUI();
    }
  });

  // Reset
  document.getElementById('resetBtn').addEventListener('click', handleReset);

  // Dhikr selector
  document.getElementById('dhikrSelectorBtn').addEventListener('click', openDhikrModal);
  document.getElementById('closeDhikrModal').addEventListener('click', closeDhikrModal);
  elements.dhikrModal.addEventListener('click', (e) => {
    if (e.target === elements.dhikrModal) closeDhikrModal();
  });

  // Add custom dhikr
  document.getElementById('showAddCustomBtn').addEventListener('click', () => {
    elements.dhikrModalBody.style.display = 'none';
    elements.addCustomForm.style.display = 'block';
  });
  document.getElementById('cancelCustomBtn').addEventListener('click', () => {
    elements.addCustomForm.style.display = 'none';
    elements.dhikrModalBody.style.display = 'block';
  });
  document.getElementById('saveCustomBtn').addEventListener('click', handleAddCustomDhikr);

  // Goal selector
  document.getElementById('goalSelectorBtn').addEventListener('click', () => {
    elements.goalOptions.style.display = elements.goalOptions.style.display === 'none' ? 'flex' : 'none';
  });

  document.querySelectorAll('.goal-option').forEach(btn => {
    btn.addEventListener('click', () => {
      handleSetGoal(parseInt(btn.dataset.goal));
    });
  });

  document.getElementById('setCustomGoalBtn').addEventListener('click', () => {
    const val = parseInt(document.getElementById('customGoalInput').value);
    if (val > 0) {
      handleSetGoal(val);
      document.getElementById('customGoalInput').value = '';
    }
  });

  // Focus mode
  document.getElementById('focusModeBtn').addEventListener('click', openFocusMode);
  document.getElementById('closeFocusBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    closeFocusMode();
  });

  // Sunnah mode
  document.getElementById('sunnahModeBtn').addEventListener('click', openSunnahMode);
  document.getElementById('startSunnahBtn').addEventListener('click', openSunnahMode);
  document.getElementById('closeSunnahModal').addEventListener('click', closeSunnahMode);
  document.getElementById('sunnahTapBtn').addEventListener('click', handleSunnahCount);
  document.getElementById('closeSunnahComplete').addEventListener('click', closeSunnahMode);
  elements.sunnahModal.addEventListener('click', (e) => {
    if (e.target === elements.sunnahModal) closeSunnahMode();
  });

  // Dark mode
  document.getElementById('darkModeBtn').addEventListener('click', toggleDarkMode);

  // Show all dhikr
  document.getElementById('showAllDhikrBtn').addEventListener('click', () => {
    renderAllGuideList();
    document.getElementById('showAllDhikrBtn').style.display = 'none';
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'Enter') {
      // Don't trigger if typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      // Don't trigger if modals are open
      if (elements.dhikrModal.style.display === 'flex') return;
      if (elements.sunnahModal.style.display === 'flex') return;

      e.preventDefault();

      if (elements.focusOverlay.style.display === 'flex') {
        handleCount();
        updateUI();
      } else {
        handleCount();
      }
    }
  });

  // Resize handler for staircase
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      renderStaircase();
    }, 150);
  });
}

// ===== Initialize =====
function init() {
  cacheElements();
  state = loadState();
  initDarkMode();
  renderGuideList();
  renderFAQ();
  updateUI();
  setupEventListeners();

  // Re-render staircase after layout is complete (for accurate measurements)
  requestAnimationFrame(() => {
    renderStaircase();
  });
}

// Run on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

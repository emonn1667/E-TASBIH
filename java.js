import { useState, useEffect, useCallback, useRef } from 'react';

// Types
interface Dhikr {
  id: string;
  arabic: string;
  name: string;
  translation: string;
}

interface CounterState {
  count: number;
  goal: number;
  selectedDhikr: string;
  totalToday: number;
  lifetime: number;
  streak: number;
  lastDate: string;
  customDhikrs: { id: string; arabic: string; name: string }[];
}

// Constants
const DHIKRS: Dhikr[] = [
  { id: 'subhanallah', arabic: 'سُبْحَانَ ٱللَّٰهِ', name: 'SubhanAllah', translation: 'Glory be to Allah' },
  { id: 'alhamdulillah', arabic: 'ٱلْحَمْدُ لِلَّٰهِ', name: 'Alhamdulillah', translation: 'All praise is due to Allah' },
  { id: 'allahuakbar', arabic: 'ٱللَّٰهُ أَكْبَرُ', name: 'Allahu Akbar', translation: 'Allah is the Greatest' },
  { id: 'lailaha', arabic: 'لَا إِلَٰهَ إِلَّا ٱللَّٰهُ', name: 'La ilaha illallah', translation: 'There is no god but Allah' },
  { id: 'astaghfirullah', arabic: 'أَسْتَغْفِرُ ٱللَّٰهَ', name: 'Astaghfirullah', translation: 'I seek forgiveness from Allah' },
  { id: 'lahawla', arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِٱللَّٰهِ', name: 'La hawla wa la quwwata illa billah', translation: 'There is no power except with Allah' },
  { id: 'subhanallahi_wa_bihamdihi', arabic: 'سُبْحَانَ ٱللَّٰهِ وَبِحَمْدِهِ', name: 'SubhanAllahi wa bihamdihi', translation: 'Glory and praise be to Allah' },
  { id: 'salawat', arabic: 'ٱللَّٰهُمَّ صَلِّي عَلَىٰ مُحَمَّدٍ', name: 'Allahumma salli \'ala Muhammad', translation: 'O Allah, send blessings upon Muhammad' },
];

const GOALS = [33, 66, 99, 0]; // 0 = unlimited
const SUNNAH_STEPS = [
  { dhikr: 'subhanallah', count: 33, label: 'SubhanAllah' },
  { dhikr: 'alhamdulillah', count: 33, label: 'Alhamdulillah' },
  { dhikr: 'allahuakbar', count: 34, label: 'Allahu Akbar' },
];

// Helper functions
function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function loadState(): CounterState {
  try {
    const saved = localStorage.getItem('mytasbih_state');
    if (saved) {
      const state = JSON.parse(saved);
      // Reset daily count if new day
      if (state.lastDate !== getToday()) {
        // Check streak
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        if (state.lastDate !== yesterdayStr) {
          state.streak = 0;
        }
        state.totalToday = 0;
        state.lastDate = getToday();
      }
      return state;
    }
  } catch (e) {
    console.error('Failed to load state', e);
  }
  return {
    count: 0,
    goal: 33,
    selectedDhikr: 'subhanallah',
    totalToday: 0,
    lifetime: 0,
    streak: 0,
    lastDate: getToday(),
    customDhikrs: [],
  };
}

function saveState(state: CounterState) {
  try {
    localStorage.setItem('mytasbih_state', JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state', e);
  }
}

// Components
function ProgressRing({ progress, size = 200, strokeWidth = 8 }: { progress: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="absolute top-0 left-0">
      <circle
        className="text-gray-200 dark:text-gray-700"
        strokeWidth={strokeWidth}
        stroke="currentColor"
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        className="progress-ring-circle text-emerald-500"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference + ' ' + circumference}
        style={{ strokeDashoffset: offset }}
        strokeLinecap="round"
        stroke="currentColor"
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
    </svg>
  );
}

function FocusMode({ count, dhikr, onClose, onCount }: { count: number; dhikr: Dhikr; onClose: () => void; onCount: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center" onClick={onCount}>
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="absolute top-4 right-4 text-white/50 hover:text-white text-2xl"
      >
        ✕
      </button>
      <p className="breathe text-white/40 text-lg mb-8">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
      <p className="text-white/60 text-xl mb-4">{dhikr.arabic}</p>
      <p className="text-white/40 text-sm mb-12">{dhikr.name}</p>
      <div className="text-white text-8xl font-light mb-4">{count}</div>
      <p className="text-white/30 text-sm mt-16 breathe">Tap anywhere to count...</p>
    </div>
  );
}

function DhikrSelector({ dhikrs, selected, onSelect, onClose, customDhikrs, onAddCustom }: {
  dhikrs: Dhikr[];
  selected: string;
  onSelect: (id: string) => void;
  onClose: () => void;
  customDhikrs: { id: string; arabic: string; name: string }[];
  onAddCustom: (arabic: string, name: string) => void;
}) {
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customArabic, setCustomArabic] = useState('');

  const handleAddCustom = () => {
    if (customName.trim()) {
      onAddCustom(customArabic.trim(), customName.trim());
      setCustomName('');
      setCustomArabic('');
      setShowAddCustom(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto p-6 slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Select Dhikr</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white text-xl">✕</button>
        </div>

        {!showAddCustom ? (
          <>
            <button
              onClick={() => setShowAddCustom(true)}
              className="w-full mb-4 p-3 border-2 border-dashed border-emerald-300 dark:border-emerald-700 rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors"
            >
              + Add Custom Dhikr
            </button>
            <div className="space-y-2">
              {dhikrs.map(d => (
                <button
                  key={d.id}
                  onClick={() => { onSelect(d.id); onClose(); }}
                  className={`w-full p-3 rounded-xl text-left transition-all ${
                    selected === d.id
                      ? 'bg-emerald-100 dark:bg-emerald-900/50 border-2 border-emerald-500'
                      : 'bg-gray-50 dark:bg-gray-700 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-arabic text-gray-800 dark:text-white">{d.arabic}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{d.name}</p>
                    </div>
                    {selected === d.id && <span className="text-emerald-500">✓</span>}
                  </div>
                </button>
              ))}
              {customDhikrs.map(d => (
                <button
                  key={d.id}
                  onClick={() => { onSelect(d.id); onClose(); }}
                  className={`w-full p-3 rounded-xl text-left transition-all ${
                    selected === d.id
                      ? 'bg-emerald-100 dark:bg-emerald-900/50 border-2 border-emerald-500'
                      : 'bg-gray-50 dark:bg-gray-700 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      {d.arabic && <p className="text-lg font-arabic text-gray-800 dark:text-white">{d.arabic}</p>}
                      <p className="text-sm text-gray-500 dark:text-gray-400">{d.name}</p>
                    </div>
                    {selected === d.id && <span className="text-emerald-500">✓</span>}
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700 dark:text-gray-300">Add Custom Dhikr</h4>
            <input
              type="text"
              placeholder="Dhikr Name"
              value={customName}
              onChange={e => setCustomName(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            />
            <input
              type="text"
              placeholder="Arabic Text (Optional)"
              value={customArabic}
              onChange={e => setCustomArabic(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-right"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowAddCustom(false)} className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400">Cancel</button>
              <button onClick={handleAddCustom} className="flex-1 p-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600">Save</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SunnahMode({ onComplete, onClose }: { onComplete: () => void; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [counts, setCounts] = useState([0, 0, 0]);

  const currentStep = SUNNAH_STEPS[step];
  const isComplete = step >= SUNNAH_STEPS.length;

  const handleCount = () => {
    if (isComplete) return;
    const newCounts = [...counts];
    newCounts[step] += 1;
    setCounts(newCounts);
    if (newCounts[step] >= currentStep.count) {
      if (step < SUNNAH_STEPS.length - 1) {
        setStep(step + 1);
      } else {
        onComplete();
      }
    }
  };

  if (isComplete) {
    return (
      <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-sm w-full p-8 text-center slide-up" onClick={e => e.stopPropagation()}>
          <div className="text-5xl mb-4">🤲</div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">MashaAllah!</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">You've completed the Sunnah dhikr after prayer.</p>
          <button onClick={onClose} className="w-full p-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4" onClick={handleCount}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-sm w-full p-6 slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Sunnah Mode</h3>
          <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 text-xl">✕</button>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {SUNNAH_STEPS.map((s, i) => (
            <div key={i} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                i < step ? 'bg-emerald-500 text-white' :
                i === step ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border-2 border-emerald-500' :
                'bg-gray-200 dark:bg-gray-700 text-gray-500'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              {i < SUNNAH_STEPS.length - 1 && (
                <div className={`w-8 h-0.5 ${i < step ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="text-center mb-6">
          <p className="text-2xl font-arabic text-gray-800 dark:text-white mb-2">
            {DHIKRS.find(d => d.id === currentStep.dhikr)?.arabic}
          </p>
          <p className="text-gray-500 dark:text-gray-400">{currentStep.label}</p>
        </div>

        <div className="text-center mb-6">
          <span className="text-5xl font-light text-gray-800 dark:text-white">{counts[step]}</span>
          <span className="text-2xl text-gray-400"> / {currentStep.count}</span>
        </div>

        <button
          onClick={handleCount}
          className="w-full p-4 bg-emerald-500 text-white rounded-xl text-lg font-medium hover:bg-emerald-600 active:scale-95 transition-all"
        >
          Tap to Count
        </button>
      </div>
    </div>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const faqs = [
    { q: 'What is a tasbeeh counter?', a: 'A tasbeeh counter is a tool used by Muslims to count dhikr — the remembrance of Allah. It helps track repetitions of phrases like SubhanAllah (33 times), Alhamdulillah (33 times), and Allahu Akbar (34 times) after prayers.' },
    { q: 'How do I use this counter?', a: 'Select your dhikr, set a goal (33, 66, 99, or custom), and tap the counter button or press Space/Enter to count. You can switch to Sunnah Mode for guided 33-33-34 after-prayer dhikr, or use Focus Mode for a distraction-free experience.' },
    { q: 'Does it save my progress?', a: 'Yes! Every count, streak, and setting is saved automatically to your device. Close the tab, turn off your phone, come back tomorrow — your counter picks up right where you left off.' },
    { q: 'Why recite dhikr 33-33-34 times after prayer?', a: 'The Prophet Muhammad ﷺ taught that saying SubhanAllah 33 times, Alhamdulillah 33 times, and Allahu Akbar 34 times after each prayer is "better than a servant" (Sahih al-Bukhari 6318).' },
    { q: 'What is Focus Mode?', a: 'Focus Mode dims the screen and removes everything except the counter and a gentle breathing reminder. It\'s designed to help you concentrate fully on your dhikr without visual distractions.' },
    { q: 'What is the reward for saying SubhanAllah 100 times?', a: 'The Prophet ﷺ said: "If one says \'SubhanAllah\' one hundred times, one thousand good deeds will be recorded for him, or one thousand bad deeds will be erased." (Sahih Muslim 2698)' },
  ];

  return (
    <section className="py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-8">
          ❓ Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full p-4 text-left flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <span className="font-medium text-gray-800 dark:text-white">{faq.q}</span>
                <span className={`text-gray-400 transition-transform ${openIndex === i ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {openIndex === i && (
                <div className="px-4 pb-4 text-gray-600 dark:text-gray-400 fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    { icon: '🧘', title: 'Focus Mode', desc: 'Dims the screen and removes everything except your counter. Just you and your dhikr.' },
    { icon: '🕌', title: 'Sunnah Mode', desc: 'Guides you through the 33-33-34 after-prayer dhikr automatically.' },
    { icon: '📊', title: 'Progress Tracking', desc: 'See your daily count, lifetime total, and consecutive-day streak.' },
    { icon: '🎯', title: 'Custom Goals', desc: 'Choose 33, 66, 99, unlimited, or set any custom target.' },
    { icon: '📴', title: 'Works Offline', desc: 'Once loaded, the counter works without internet. Perfect for the mosque.' },
    { icon: '🌙', title: 'Dark Mode', desc: 'Easier on the eyes during night-time dhikr and Tahajjud prayers.' },
    { icon: '💾', title: 'Auto-Save', desc: 'Close the browser and come back anytime. Your progress is preserved.' },
    { icon: '📿', title: 'Custom Dhikr', desc: 'Add your own dhikr phrases and track them alongside the built-in ones.' },
  ];

  return (
    <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-4">
          What Makes MyTasbih Different
        </h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
          A tasbih counter is a tool for counting dhikr, the remembrance of Allah. MyTasbih is a free digital version with features built for real daily practice.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DhikrGuideSection() {
  const [showAll, setShowAll] = useState(false);
  const visibleDhikrs = showAll ? DHIKRS : DHIKRS.slice(0, 5);

  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-4">
          📿 Complete Guide to Dhikr & Their Virtues
        </h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
          Learn about the most beloved words to Allah and their immense rewards.
        </p>
        <div className="space-y-6">
          {visibleDhikrs.map(d => (
            <div key={d.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="md:w-1/3">
                  <p className="text-2xl font-arabic text-emerald-700 dark:text-emerald-400 mb-1">{d.arabic}</p>
                  <p className="font-semibold text-gray-800 dark:text-white">{d.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{d.translation}</p>
                </div>
                <div className="md:w-2/3 text-gray-600 dark:text-gray-400 text-sm">
                  <p>{d.id === 'subhanallah' && 'The Prophet ﷺ said: "If one says \'SubhanAllah\' one hundred times, one thousand good deeds will be recorded for him, or one thousand bad deeds will be erased." — Sahih Muslim 2698'}
                  {d.id === 'alhamdulillah' && 'The Prophet ﷺ said: "Alhamdulillah fills the scales (of good deeds)." — Sahih Muslim 223'}
                  {d.id === 'allahuakbar' && 'The Prophet ﷺ said: "Two words are light on the tongue, heavy on the scales, and beloved to the Most Merciful: SubhanAllahi wa bihamdihi, SubhanAllahil Azeem." — Sahih al-Bukhari 6406'}
                  {d.id === 'lailaha' && 'The Prophet ﷺ said: "The best dhikr is La ilaha illallah, and the best supplication is Alhamdulillah." — Jami\' at-Tirmidhi 3383'}
                  {d.id === 'astaghfirullah' && 'The Prophet ﷺ said: "Whoever constantly seeks forgiveness, Allah will appoint for him a way out of every distress, relief from every anxiety, and will provide for him from where he does not expect." — Sunan Abu Dawud 1518'}
                  {d.id === 'lahawla' && 'The Prophet ﷺ said: "La hawla wa la quwwata illa billah is a treasure from the treasures of Paradise." — Sahih al-Bukhari 4205'}
                  {d.id === 'subhanallahi_wa_bihamdihi' && 'The Prophet ﷺ said: "Whoever says \'SubhanAllahi wa bihamdihi\' one hundred times a day, his sins will be forgiven even if they were like the foam of the sea." — Sahih al-Bukhari 6405'}
                  {d.id === 'salawat' && 'The Prophet ﷺ said: "Whoever sends blessings upon me once, Allah will send blessings upon him tenfold." — Sahih Muslim 384'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {!showAll && (
          <div className="text-center mt-8">
            <button
              onClick={() => setShowAll(true)}
              className="px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
            >
              Show All Dhikr ({DHIKRS.length - 5} more)
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

// Main App
export default function App() {
  const [state, setState] = useState<CounterState>(loadState);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('mytasbih_dark');
    return saved === 'true';
  });
  const [showDhikrSelector, setShowDhikrSelector] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [sunnahMode, setSunnahMode] = useState(false);
  const [showGoalSelector, setShowGoalSelector] = useState(false);
  const [customGoal, setCustomGoal] = useState('');
  const [vibrate, setVibrate] = useState(true);
  const countRef = useRef<HTMLButtonElement>(null);

  // Save state whenever it changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('mytasbih_dark', String(darkMode));
  }, [darkMode]);

  // Keyboard shortcut
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        if (!showDhikrSelector && !sunnahMode && !showGoalSelector) {
          e.preventDefault();
          handleCount();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showDhikrSelector, sunnahMode, showGoalSelector]);

  const handleCount = useCallback(() => {
    setState(prev => {
      const newCount = prev.count + 1;
      const today = getToday();
      const isNewDay = prev.lastDate !== today;
      return {
        ...prev,
        count: prev.goal > 0 && newCount > prev.goal ? 1 : newCount,
        totalToday: isNewDay ? 1 : prev.totalToday + 1,
        lifetime: prev.lifetime + 1,
        lastDate: today,
        streak: isNewDay && prev.lastDate !== today ? (() => {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          return prev.lastDate === yesterday.toISOString().split('T')[0] ? prev.streak + 1 : 1;
        })() : prev.streak,
      };
    });
    if (vibrate && navigator.vibrate) {
      navigator.vibrate(10);
    }
  }, [vibrate]);

  const handleReset = () => {
    setState(prev => ({ ...prev, count: 0 }));
  };

  const handleSelectDhikr = (id: string) => {
    setState(prev => ({ ...prev, selectedDhikr: id, count: 0 }));
  };

  const handleSetGoal = (goal: number) => {
    setState(prev => ({ ...prev, goal, count: 0 }));
    setShowGoalSelector(false);
  };

  const handleAddCustomDhikr = (arabic: string, name: string) => {
    const id = 'custom_' + Date.now();
    setState(prev => ({
      ...prev,
      customDhikrs: [...prev.customDhikrs, { id, arabic, name }],
      selectedDhikr: id,
      count: 0,
    }));
  };

  const currentDhikr = [...DHIKRS, ...state.customDhikrs.map(d => ({ ...d, translation: '' }))].find(d => d.id === state.selectedDhikr) || DHIKRS[0];
  const progress = state.goal > 0 ? Math.min((state.count / state.goal) * 100, 100) : 0;
  const isGoalReached = state.goal > 0 && state.count >= state.goal;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-white'}`}>
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📿</span>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">MyTasbih</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFocusMode(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
              title="Focus Mode"
            >
              🧘
            </button>
            <button
              onClick={() => setSunnahMode(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
              title="Sunnah Mode"
            >
              🕌
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
              title="Toggle Dark Mode"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Counter Section */}
      <main className="max-w-lg mx-auto px-4 py-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{state.totalToday}</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-500">Today</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/30 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{state.lifetime.toLocaleString()}</p>
            <p className="text-xs text-amber-600 dark:text-amber-500">Lifetime</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/30 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">{state.streak}</p>
            <p className="text-xs text-purple-600 dark:text-purple-500">Streak 🔥</p>
          </div>
        </div>

        {/* Counter Display */}
        <div className="flex flex-col items-center mb-8">
          {/* Dhikr Selector Button */}
          <button
            onClick={() => setShowDhikrSelector(true)}
            className="mb-6 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <span className="text-gray-800 dark:text-white font-medium">{currentDhikr.name}</span>
            <span className="text-gray-400 text-sm">▼</span>
          </button>

          {/* Arabic Text */}
          <p className="text-2xl text-emerald-700 dark:text-emerald-400 mb-8 font-arabic text-center">
            {currentDhikr.arabic || 'بِسْمِ اللَّهِ'}
          </p>

          {/* Progress Ring + Count */}
          <div className="relative w-52 h-52 flex items-center justify-center mb-6">
            <ProgressRing progress={progress} size={208} strokeWidth={8} />
            <div className="text-center z-10">
              <p className={`text-6xl font-light ${isGoalReached ? 'text-emerald-500' : 'text-gray-800 dark:text-white'}`}>
                {state.count}
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                / {state.goal === 0 ? '∞' : state.goal}
              </p>
            </div>
          </div>

          {/* Goal Selector */}
          <button
            onClick={() => setShowGoalSelector(!showGoalSelector)}
            className="mb-6 text-sm text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            🎯 Change Goal
          </button>

          {showGoalSelector && (
            <div className="flex flex-wrap gap-2 justify-center mb-6 fade-in">
              {GOALS.map(g => (
                <button
                  key={g}
                  onClick={() => handleSetGoal(g)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    state.goal === g
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {g === 0 ? '∞ Unlimited' : g}
                </button>
              ))}
              <div className="flex gap-1">
                <input
                  type="number"
                  placeholder="Custom"
                  value={customGoal}
                  onChange={e => setCustomGoal(e.target.value)}
                  className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                />
                <button
                  onClick={() => {
                    const g = parseInt(customGoal);
                    if (g > 0) handleSetGoal(g);
                  }}
                  className="px-3 py-2 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600"
                >
                  Set
                </button>
              </div>
            </div>
          )}

          {/* Count Button */}
          <button
            ref={countRef}
            onClick={handleCount}
            className={`counter-btn w-32 h-32 rounded-full text-white text-4xl font-bold shadow-lg active:scale-95 transition-all ${
              isGoalReached
                ? 'bg-gradient-to-br from-amber-400 to-amber-600 pulse-glow'
                : 'bg-gradient-to-br from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800'
            }`}
          >
            {isGoalReached ? '🤲' : '+'}
          </button>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="mt-6 text-sm text-gray-400 hover:text-red-500 transition-colors"
          >
            Reset Count
          </button>
        </div>

        {/* Sunnah Mode Card */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-5 mb-8 border border-emerald-100 dark:border-emerald-800">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-3">🕌 The Sunnah of 33-33-34</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3 flex-wrap">
            <span className="bg-white dark:bg-gray-800 px-2 py-1 rounded">33× SubhanAllah</span>
            <span>→</span>
            <span className="bg-white dark:bg-gray-800 px-2 py-1 rounded">33× Alhamdulillah</span>
            <span>→</span>
            <span className="bg-white dark:bg-gray-800 px-2 py-1 rounded">34× Allahu Akbar</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 italic mb-4">
            "Shall I not tell you of something better than a servant? When you go to bed, say SubhanAllah 33 times, Alhamdulillah 33 times, and Allahu Akbar 34 times." — Sahih al-Bukhari 6318
          </p>
          <button
            onClick={() => setSunnahMode(true)}
            className="w-full p-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors font-medium"
          >
            Start Sunnah Mode
          </button>
        </div>

        {/* Keyboard hint */}
        <div className="text-center text-sm text-gray-400 dark:text-gray-500 mb-8">
          💡 Tip: Press <kbd className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">Space</kbd> or <kbd className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">Enter</kbd> to count
        </div>
      </main>

      {/* Features Section */}
      <FeaturesSection />

      {/* Dhikr Guide */}
      <DhikrGuideSection />

      {/* When to Use Section */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-12">
            When to Use a Tasbih Counter
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🕌', title: 'After Every Salah', desc: 'Complete the Sunnah of 33-33-34 after each prayer.' },
              { icon: '🌅', title: 'Morning & Evening Adhkar', desc: 'Start and end your day with dhikr at your own pace.' },
              { icon: '🚶', title: 'During Commute or Travel', desc: 'No app to install, no beads to carry. Works offline too.' },
              { icon: '🌙', title: 'Ramadan & Night Prayers', desc: 'Use Focus Mode for a calm, distraction-free dhikr session.' },
              { icon: '📿', title: 'Daily Dhikr Goals', desc: 'Set a goal of 100, 500, or any number and track progress.' },
              { icon: '💻', title: 'At Your Desk', desc: 'Press Space to count quietly between tasks.' },
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Use Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-12">
            How to Use MyTasbih
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { step: '1', icon: '📿', title: 'Choose your dhikr', desc: 'Tap the dhikr name to pick from SubhanAllah, Alhamdulillah, Allahu Akbar, and more.' },
              { step: '2', icon: '🎯', title: 'Set a goal', desc: 'Select 33, 66, 99, unlimited, or type any custom number.' },
              { step: '3', icon: '➕', title: 'Start counting', desc: 'Tap the + button, or press Space / Enter on your keyboard.' },
              { step: '4', icon: '📈', title: 'Track your progress', desc: 'Check your daily total, lifetime count, and streak at the top.' },
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-1">{item.icon} {item.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQSection />

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-center">
        <div className="max-w-4xl mx-auto">
          <p className="text-2xl mb-2">📿</p>
          <p className="text-gray-400 text-sm mb-4">Begin with Allah's remembrance</p>
          <p className="text-gray-500 text-xs">
            MyTasbih — Free Online Tasbih Counter. Count dhikr anytime, anywhere.
          </p>
          <p className="text-gray-600 text-xs mt-4">
            ذِكْرُ اللَّهِ أَكْبَرُ — And the remembrance of Allah is greatest. (Quran 29:45)
          </p>
        </div>
      </footer>

      {/* Modals */}
      {showDhikrSelector && (
        <DhikrSelector
          dhikrs={DHIKRS}
          selected={state.selectedDhikr}
          onSelect={handleSelectDhikr}
          onClose={() => setShowDhikrSelector(false)}
          customDhikrs={state.customDhikrs}
          onAddCustom={handleAddCustomDhikr}
        />
      )}

      {focusMode && (
        <FocusMode
          count={state.count}
          dhikr={currentDhikr}
          onClose={() => setFocusMode(false)}
          onCount={handleCount}
        />
      )}

      {sunnahMode && (
        <SunnahMode
          onComplete={() => {}}
          onClose={() => setSunnahMode(false)}
        />
      )}
    </div>
  );
}

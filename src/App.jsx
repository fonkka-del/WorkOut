import confetti from 'canvas-confetti';
import { ArrowRight, BarChart3, BookOpen, CalendarDays, ChevronLeft, ChevronRight, Dumbbell, Flame, Moon, Settings, Sun, Timer, UserRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { authClient } from './authClient';
import AddExerciseModal from './components/AddExerciseModal';
import ExerciseLibraryView from './components/ExerciseLibraryView';
import ExerciseSelectorModal from './components/ExerciseSelectorModal';
import RestTimer from './components/RestTimer';
import SettingsModal from './components/SettingsModal';
import WorkoutDay from './components/WorkoutDay';
import { apiRequest } from './utils/api';
import { calculateMonthlyStats, calculateWorkoutStats, cleanDemoWorkouts, clearAllData, formatDateKey, formatDisplayDate, getCustomExercises, getSettings, saveCustomExercises } from './utils/storage';

const tabs = [
  { id: 'workout', label: 'Today', icon: CalendarDays },
  { id: 'history', label: 'History', icon: BarChart3 },
  { id: 'library', label: 'Library', icon: BookOpen },
];

function AuthScreen({ mode, setMode, onAuthenticated }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const isSettingPassword = mode === 'reset' && Boolean(new URLSearchParams(window.location.search).get('token'));
  const submit = async (event) => {
    event.preventDefault();
    if (mode !== 'reset' && (!email.trim() || !password.trim())) {
      setNotice('Enter your email and password to continue.');
      return;
    }
    setBusy(true);
    setNotice('');
    try {
      if (isSettingPassword) {
        const result = await authClient.resetPassword({ token: new URLSearchParams(window.location.search).get('token'), newPassword: password });
        if (result?.error) throw result.error;
        window.history.replaceState({}, '', '/sign-in');
        setPassword('');
        setNotice('Your password has been changed. Sign in with your new password.');
        setMode('signin');
      } else if (mode === 'reset') {
        const result = await authClient.requestPasswordReset({ email: email.trim(), redirectTo: `${window.location.origin}/reset-password` });
        if (result?.error) throw result.error;
        setNotice('If an account exists for that address, a reset link is on its way.');
      } else {
        const result = mode === 'signup'
          ? await authClient.signUp.email({ name: name.trim(), email: email.trim(), password })
          : await authClient.signIn.email({ email: email.trim(), password });
        if (result?.error) throw result.error;
        if (mode === 'signup' && !(await authClient.getSession())?.data?.user) {
          setNotice('Your account is created. Check your email for a verification link before signing in.');
          return;
        }
        await onAuthenticated();
      }
    } catch (error) {
      setNotice(error?.message || 'We could not complete that request. Please try again.');
    } finally {
      setBusy(false);
    }
  };
  return <div className="auth-screen"><aside className="auth-story"><a className="brand" href="#top"><span className="brand-mark"><Dumbbell size={18} /></span><span>form<span className="brand-period">.</span></span></a><div className="auth-quote"><p className="eyebrow">STRONGER, ONE SESSION AT A TIME</p><h1>Progress that feels like yours.</h1><p>Build a routine you can return to. Your effort deserves a place to grow.</p></div><p className="auth-caption">Made for the long game. Your training, your pace.</p></aside><main className="auth-main"><form className="auth-panel" onSubmit={submit}><span className="auth-mobile-mark"><Dumbbell size={19} /></span><p className="eyebrow">YOUR TRAINING, YOUR PACE</p><h2>{mode === 'signup' ? 'Create your account.' : mode === 'reset' ? isSettingPassword ? 'Choose a new password.' : 'Reset your password.' : 'Welcome back.'}</h2><p className="auth-intro">{mode === 'signup' ? 'Start building a routine that sticks.' : mode === 'reset' ? isSettingPassword ? 'Choose a secure password for your account.' : 'We’ll email you a link to get back in.' : 'Sign in to pick up right where you left off.'}</p>{mode === 'signup' && <><label htmlFor="auth-name">Your name</label><input id="auth-name" autoComplete="name" placeholder="Alex Morgan" value={name} onChange={e => setName(e.target.value)} required /></>}{!isSettingPassword && <><label htmlFor="auth-email">Email address</label><input id="auth-email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required /></>}{(mode !== 'reset' || isSettingPassword) && <><label htmlFor="auth-password">{isSettingPassword ? 'New password' : 'Password'}</label><input id="auth-password" type="password" autoComplete={mode === 'signup' || isSettingPassword ? 'new-password' : 'current-password'} placeholder="At least 8 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />{(mode === 'signup' || isSettingPassword) && <p className="password-hint">Use at least 8 characters.</p>}</>}<div className="auth-options">{mode === 'signin' ? <button type="button" className="text-button" onClick={() => setMode('reset')}>Forgot password?</button> : <span />}{mode === 'reset' && <button type="button" className="text-button" onClick={() => setMode('signin')}>Back to sign in</button>}</div><button className="button button-primary auth-submit" type="submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : mode === 'reset' ? isSettingPassword ? 'Change password' : 'Send reset link' : 'Sign in'} <ArrowRight size={16} /></button>{notice && <p className="auth-notice" role="status">{notice}</p>}<p className="auth-switch">{mode === 'signup' ? 'Already have an account?' : 'New to Form?'} <button type="button" className="text-button" onClick={() => { setNotice(''); setMode(mode === 'signup' ? 'signin' : 'signup'); }}>{mode === 'signup' ? 'Sign in' : 'Create an account'}</button></p><p className="auth-legal">By continuing, you agree to our Terms of Service and Privacy Policy.</p></form></main></div>;
}

function WeekOverview({ selectedDate, onSelectDate, monthlyStats, workouts, unit }) {
  const [year, month, day] = selectedDate.split('-').map(Number);
  const selected = new Date(year, month - 1, day);
  const monday = new Date(selected);
  monday.setDate(selected.getDate() - ((selected.getDay() + 6) % 7));
  const days = Array.from({ length: 7 }, (_, i) => { const date = new Date(monday); date.setDate(monday.getDate() + i); const key = formatDateKey(date); return { date, key, trained: Boolean(workouts[key]?.exercises?.length) }; });
  return <aside className="overview-side"><section className="card overview-card"><div className="section-heading"><div><h2>Your week</h2><p>Choose a day to view a session.</p></div><CalendarDays size={17} className="muted-icon" /></div><div className="week-strip">{days.map(({ date, key, trained }) => <button key={key} className={`week-day ${trained ? 'trained' : ''} ${key === selectedDate ? 'selected' : ''}`} onClick={() => onSelectDate(key)}><span>{date.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 1)}</span><strong>{date.getDate()}</strong><i /></button>)}</div></section><section className="card overview-card"><div className="section-heading"><h2>This month</h2><span className="soft-tag">{monthlyStats.workoutDaysCount} sessions</span></div><div className="overview-metric"><span>Training volume</span><strong>{monthlyStats.totalVolume.toLocaleString()} <small>{unit}</small></strong></div><div className="overview-metric"><span>Sets logged</span><strong>{monthlyStats.totalSets}</strong></div><div className="overview-metric"><span>Workout days</span><strong>{monthlyStats.workoutDaysCount}</strong></div></section><section className="card overview-streak"><span className="streak-icon"><Flame size={18} /></span><span><strong>{monthlyStats.currentStreak} day streak</strong><small>Keep showing up for yourself.</small></span></section><button className="history-shortcut" onClick={() => document.querySelector('[data-tab="history"]')?.click()}><BarChart3 size={15} /> See your full training history <ArrowRight size={14} /></button></aside>;
}

function HistoryView({ workouts, selectedDate, onSelectDate, onGoToWorkout, unit }) {
  const date = new Date(`${selectedDate}T12:00:00`);
  const year = date.getFullYear();
  const month = date.getMonth();
  const monthWorkouts = Object.entries(workouts).filter(([key, workout]) => key.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`) && workout.exercises?.length).sort(([a], [b]) => b.localeCompare(a));
  const monthStats = calculateMonthlyStats(workouts, year, month);
  const weeks = Array.from({ length: 8 }, (_, i) => {
    const end = new Date(year, month, date.getDate() - (7 - i) * 7);
    const start = new Date(end); start.setDate(end.getDate() - 6);
    const value = Object.entries(workouts).reduce((sum, [key, workout]) => key >= formatDateKey(start) && key <= formatDateKey(end) ? sum + calculateWorkoutStats(workout).totalVolume : sum, 0);
    return { label: start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), value };
  });
  const maxVolume = Math.max(1, ...weeks.map(w => w.value));
  const startWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const previousMonth = () => onSelectDate(formatDateKey(new Date(year, month - 1, Math.min(date.getDate(), new Date(year, month, 0).getDate()))));
  const nextMonth = () => onSelectDate(formatDateKey(new Date(year, month + 1, Math.min(date.getDate(), new Date(year, month + 2, 0).getDate()))));
  return <section className="page-view"><div className="page-heading"><div><p className="eyebrow">YOUR CONSISTENCY, AT A GLANCE</p><h1>Training history</h1><p>Look back on the work you’ve put in. Every session counts.</p></div><div className="month-picker"><button className="icon-button" onClick={previousMonth} aria-label="Previous month"><ChevronLeft /></button><span>{date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span><button className="icon-button" onClick={nextMonth} aria-label="Next month"><ChevronRight /></button></div></div>
    <div className="history-stats"><article className="card stat-card"><span>Workouts this month</span><strong>{monthStats.workoutDaysCount}<small> sessions</small></strong></article><article className="card stat-card"><span>Training volume</span><strong>{monthStats.totalVolume.toLocaleString()}<small> {unit}</small></strong></article><article className="card stat-card"><span>Current streak</span><strong>{monthStats.currentStreak}<small> days</small></strong></article></div>
    <div className="history-grid"><div><section className="card chart-card"><div className="section-heading"><div><h2>Volume over time</h2><p>A steady rhythm beats an occasional sprint.</p></div><span className="soft-tag">Last 8 weeks</span></div><div className="volume-chart">{weeks.map((week, index) => <div className="chart-column" key={`${week.label}-${index}`}><span className="chart-tooltip">{week.value.toLocaleString()} {unit}</span><i style={{ height: `${Math.max(5, week.value / maxVolume * 100)}%` }} className={index === 7 ? 'chart-bar current' : 'chart-bar'} /><span className="chart-label">{week.label}</span></div>)}</div></section><section className="card recent-card"><div className="section-heading"><h2>Recent sessions</h2><span className="soft-tag">{monthWorkouts.length} this month</span></div>{monthWorkouts.length ? monthWorkouts.slice(0, 10).map(([key, workout]) => { const stats = calculateWorkoutStats(workout); const day = new Date(`${key}T12:00:00`); return <button className="history-row" key={key} onClick={() => onGoToWorkout(key)}><span className="history-date"><small>{day.toLocaleDateString(undefined, { month: 'short' })}</small><strong>{day.getDate()}</strong></span><span className="history-name"><strong>{workout.name || 'Training session'}</strong><small>{stats.totalExercises} exercises · {stats.totalSets} sets</small></span><span className="history-volume">{stats.totalVolume.toLocaleString()} {unit}<small>session volume</small></span><ArrowRight size={15} /></button>; }) : <div className="empty-history"><CalendarDays /><p>No sessions logged this month yet.</p></div>}</section></div>
      <section className="card calendar-card"><div className="section-heading"><h2>{date.toLocaleDateString(undefined, { month: 'long' })}</h2><span className="soft-tag">{year}</span></div><div className="history-calendar">{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => <span className="calendar-weekday" key={`${day}${i}`}>{day}</span>)}{Array.from({ length: startWeekday }, (_, i) => <span key={`empty${i}`} />)}{Array.from({ length: days }, (_, i) => { const n = i + 1; const key = formatDateKey(new Date(year, month, n)); const trained = Boolean(workouts[key]?.exercises?.length); return <button key={key} className={`${trained ? 'trained-day' : ''} ${key === selectedDate ? 'selected-day' : ''}`} onClick={() => onSelectDate(key)}>{n}</button> })}</div><p className="calendar-key"><i /> Completed session</p></section></div>
  </section>;
}

export default function App() {
  const [workouts, setWorkouts] = useState({});
  const [customExercises, setCustomExercises] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => formatDateKey(new Date()));
  const [activeTab, setActiveTab] = useState('workout');
  const [settings, setSettings] = useState(() => getSettings());
  const [theme, setTheme] = useState(() => localStorage.getItem('form-theme') || 'light');
  const modeFromPath = () => ({ '/sign-in': 'signin', '/sign-up': 'signup', '/reset-password': 'reset' })[window.location.pathname];
  const [authMode, setAuthMode] = useState(() => modeFromPath() || 'signin');
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataReady, setDataReady] = useState(false);

  const [exerciseSelectorOpen, setExerciseSelectorOpen] = useState(false);
  const [addExerciseOpen, setAddExerciseOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [timerOpen, setTimerOpen] = useState(false);

  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem('form-theme', theme); }, [theme]);
  useEffect(() => {
    const updateCustom = event => setCustomExercises(event.detail || []);
    window.addEventListener('form:custom-exercises', updateCustom);
    return () => window.removeEventListener('form:custom-exercises', updateCustom);
  }, []);
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const session = await authClient.getSession();
        const signedInUser = session?.data?.user;
        if (!signedInUser) {
          if (active && !modeFromPath()) window.history.replaceState({}, '', '/sign-in');
          return;
        }
        const { data: cloudData } = await apiRequest('/api/data');
        let accountData = cloudData;
        if (!accountData) {
          accountData = {
            workouts: cleanDemoWorkouts(),
            customExercises: getCustomExercises(),
            settings: getSettings(),
          };
          await apiRequest('/api/data', { method: 'PUT', body: JSON.stringify({ data: accountData }) });
        }
        if (!active) return;
        clearAllData();
        saveCustomExercises(accountData.customExercises || []);
        setUser(signedInUser);
        setWorkouts(accountData.workouts || {});
        setCustomExercises(accountData.customExercises || []);
        setSettings({ unit: 'kg', restTimerSeconds: 90, autoTimer: true, ...(accountData.settings || {}) });
        setDataReady(true);
        if (modeFromPath()) window.history.replaceState({}, '', '/');
      } catch (error) {
        console.error('Could not load account data:', error.message);
        if (active && !modeFromPath()) window.history.replaceState({}, '', '/sign-in');
      } finally {
        if (active) setAuthLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!dataReady || !user) return undefined;
    const timer = window.setTimeout(() => {
      apiRequest('/api/data', { method: 'PUT', body: JSON.stringify({ data: { workouts, customExercises, settings } }) })
        .catch(error => console.error('Could not save account data:', error.message));
    }, 350);
    return () => window.clearTimeout(timer);
  }, [workouts, customExercises, settings, dataReady, user]);

  const handleUpdateWorkout = updated => {
    const next = { ...workouts, [updated.date]: updated };
    setWorkouts(next);
    if (updated.exercises?.length && updated.exercises.every(ex => ex.sets?.length && ex.sets.every(set => set.isCompleted))) confetti({ particleCount: 55, spread: 55, origin: { y: .8 } });
  };
  const handleAddExercise = exercise => {
    const workout = workouts[selectedDate] || { id: `workout_${selectedDate}`, date: selectedDate, name: '', notes: '', exercises: [] };
    handleUpdateWorkout({ ...workout, exercises: [...workout.exercises, { exerciseId: exercise.id, exerciseName: exercise.name, category: exercise.category, sets: [{ id: `set_${Date.now()}`, setNumber: 1, weight: 0, reps: 10, isCompleted: false, type: 'normal' }] }] });
  };
  const currentWorkout = workouts[selectedDate];
  const monthlyStats = useMemo(() => calculateMonthlyStats(workouts, new Date(`${selectedDate}T12:00:00`).getFullYear(), new Date(`${selectedDate}T12:00:00`).getMonth()), [workouts, selectedDate]);
  const navigateToWorkout = date => { setSelectedDate(date); setActiveTab('workout'); };
  const setAuthRoute = mode => {
    const pathname = mode === 'signup' ? '/sign-up' : mode === 'reset' ? '/reset-password' : '/sign-in';
    window.history.pushState({}, '', pathname);
    setAuthMode(mode);
  };
  const completeSignIn = async () => {
    const session = await authClient.getSession();
    if (!session?.data?.user) throw new Error('Your account session could not be started. Please try signing in again.');
    const { data: cloudData } = await apiRequest('/api/data');
    let accountData = cloudData;
    if (!accountData) {
      accountData = { workouts: cleanDemoWorkouts(), customExercises: getCustomExercises(), settings: getSettings() };
      await apiRequest('/api/data', { method: 'PUT', body: JSON.stringify({ data: accountData }) });
    }
    clearAllData();
    saveCustomExercises(accountData.customExercises || []);
    setUser(session.data.user);
    setWorkouts(accountData.workouts || {});
    setCustomExercises(accountData.customExercises || []);
    setSettings({ unit: 'kg', restTimerSeconds: 90, autoTimer: true, ...(accountData.settings || {}) });
    setDataReady(true);
    window.history.replaceState({}, '', '/');
  };
  const signOut = async () => {
    setSettingsOpen(false);
    try { await authClient.signOut(); } catch (error) { console.error('Sign-out request failed:', error.message); }
    setDataReady(false);
    setUser(null);
    setWorkouts({});
    setCustomExercises([]);
    setSettings(getSettings());
    saveCustomExercises([]);
    window.history.replaceState({}, '', '/sign-in');
    setAuthMode('signin');
  };
  if (authLoading) return <div className="auth-loading" role="status">Loading your account…</div>;
  if (!user) return <AuthScreen mode={authMode} setMode={setAuthRoute} onAuthenticated={completeSignIn} />;
  return <div className="app-shell" id="top"><header className="app-header"><div className="header-inner"><a className="brand" href="#top"><span className="brand-mark"><Dumbbell size={18} /></span><span>form<span className="brand-period">.</span></span></a><nav className="main-nav" aria-label="Main navigation">{tabs.map(({ id, label, icon: Icon }) => <button key={id} className={activeTab === id ? 'nav-item active' : 'nav-item'} data-tab={id} onClick={() => setActiveTab(id)}><Icon size={16} /><span>{label}</span></button>)}</nav><div className="header-actions">{monthlyStats.currentStreak > 0 && <span className="streak-pill"><Flame size={15} />{monthlyStats.currentStreak} day streak</span>}<button className="icon-button" onClick={() => setTimerOpen(true)} title="Rest timer" aria-label="Open rest timer"><Timer size={17} /></button><button className="icon-button" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} aria-label="Toggle color theme">{theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}</button><button className="account-button" onClick={() => setSettingsOpen(true)}><span className="avatar"><UserRound size={16} /></span><span>{user.name || user.email || 'Account'}</span></button><button className="icon-button settings-trigger" onClick={() => setSettingsOpen(true)} title="Settings" aria-label="Open settings"><Settings size={17} /></button></div></div></header>
    <main className="main-content">{activeTab === 'workout' && <section className="page-view"><div className="page-heading"><div><p className="eyebrow">{new Date(`${selectedDate}T12:00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()}</p><h1>{selectedDate === formatDateKey(new Date()) ? 'Good to see you.' : formatDisplayDate(selectedDate)}</h1><p>A little progress adds up. Let’s get after it.</p></div><span className="subtle"><span className="status-dot" /> Your progress is saved to your account</span></div><div className="workout-layout"><div className="workout-editor"><WorkoutDay dateKey={selectedDate} workout={currentWorkout} allWorkouts={workouts} onUpdateWorkout={handleUpdateWorkout} onOpenExerciseSelector={() => setExerciseSelectorOpen(true)} onStartRestTimer={() => setTimerOpen(true)} onNavigateDate={setSelectedDate} unit={settings.unit} /></div><WeekOverview selectedDate={selectedDate} onSelectDate={setSelectedDate} monthlyStats={monthlyStats} workouts={workouts} unit={settings.unit} /></div></section>}
      {activeTab === 'history' && <HistoryView workouts={workouts} selectedDate={selectedDate} onSelectDate={setSelectedDate} onGoToWorkout={navigateToWorkout} unit={settings.unit} />}
      {activeTab === 'library' && <ExerciseLibraryView allWorkouts={workouts} onOpenCreateExercise={() => setAddExerciseOpen(true)} onAddToToday={exercise => { handleAddExercise(exercise); setActiveTab('workout'); }} unit={settings.unit} />}
    </main><footer className="app-footer"><span>form<span className="brand-period">.</span> &nbsp; Train at your pace.</span><span className="footer-account">{user.email}</span></footer>
    <RestTimer initialSeconds={settings.restTimerSeconds || 90} isOpen={timerOpen} setIsOpen={setTimerOpen} /><ExerciseSelectorModal isOpen={exerciseSelectorOpen} onClose={() => setExerciseSelectorOpen(false)} onSelectExercise={handleAddExercise} onOpenCreateExercise={() => { setExerciseSelectorOpen(false); setAddExerciseOpen(true); }} alreadyAddedIds={(currentWorkout?.exercises || []).map(e => e.exerciseId)} /><AddExerciseModal isOpen={addExerciseOpen} onClose={() => setAddExerciseOpen(false)} onExerciseCreated={handleAddExercise} /><SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} settings={settings} data={{ workouts, customExercises, settings }} onUpdateSettings={setSettings} onImportData={next => { setWorkouts(next.workouts || {}); saveCustomExercises(next.customExercises || []); setCustomExercises(next.customExercises || []); setSettings({ ...settings, ...(next.settings || {}) }); }} onClearData={() => setWorkouts({})} onSignOut={signOut} />
  </div>;
}

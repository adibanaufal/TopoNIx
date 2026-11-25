/**
 * js/app.js
 * Root React 18 Application untuk TopoNix — SMKN 1 Bojonegoro.
 * Menggunakan React + Tailwind CSS + Supabase.
 */

import { React, createRoot, html } from './reactHtm.js';
import { store } from './store.js';
import {
  StudentDashboard,
  MateriView,
  SimulatorView,
  QuizView,
  GplView,
  LeaderboardView,
  ProfilView
} from './views-student.js';
import { TeacherDashboard, AdminDashboard } from './views-staff.js';

const { useState, useEffect, useCallback } = React;

function getNavItems(user) {
  if (user.role === 'guru') {
    return [
      { id: 'guru-panel', label: 'Panel Guru & Penilaian', icon: '👩‍🏫' },
      { id: 'materi', label: 'Pratinjau Materi', icon: '📘' },
      { id: 'simulator', label: 'Network Simulator', icon: '🔌' },
      { id: 'leaderboard', label: 'Papan Peringkat', icon: '🏆' }
    ];
  }
  if (user.role === 'admin') {
    return [
      { id: 'admin-panel', label: 'Panel Admin Sistem', icon: '⚙️' },
      { id: 'guru-panel', label: 'Pantau Nilai & Proyek', icon: '📊' },
      { id: 'leaderboard', label: 'Papan Peringkat', icon: '🏆' }
    ];
  }

  const unreadFb = store.getFeedbacksForStudent(user).filter((f) => !f.readBy.includes(user.id)).length;
  return [
    { id: 'dashboard', label: 'Dashboard Belajar', icon: '🏠', badge: unreadFb || null },
    { id: 'materi', label: 'Materi Interaktif', icon: '📘' },
    { id: 'simulator', label: 'Network Simulator', icon: '🔌' },
    { id: 'kuis', label: 'Kuis Adaptif', icon: '📝' },
    { id: 'gpl', label: 'Proyek GPL', icon: '🎮' },
    { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
    { id: 'profil', label: 'Profil & Lencana', icon: '🏅' }
  ];
}

function AuthScreen({ onLoginSuccess, toast }) {
  const [registerMode, setRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regKelas, setRegKelas] = useState('X TKJ 1');
  const [regPassword, setRegPassword] = useState('123');

  function handleLogin(e) {
    e.preventDefault();
    const res = store.login(username, password);
    if (!res.ok) {
      toast(res.message, 'error');
      return;
    }
    toast(`Berhasil masuk sebagai ${res.user.name}`, 'success');
    onLoginSuccess(res.user);
  }

  function handleRegister(e) {
    e.preventDefault();
    const res = store.registerStudent({
      name: regName,
      username: regUsername,
      kelas: regKelas,
      password: regPassword
    });
    if (!res.ok) {
      toast(res.message, 'error');
      return;
    }
    toast(`Selamat datang di TopoNix, ${res.user.name}!`, 'success');
    onLoginSuccess(res.user);
  }

  function quickLogin(uid) {
    store.loginAsId(uid);
    const u = store.getCurrentUser();
    toast(`Masuk cepat sebagai ${u.name} (${u.role.toUpperCase()})`, 'success');
    onLoginSuccess(u);
  }

  return html`
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] bg-slate-900">
      <section className="relative p-8 lg:p-12 text-slate-100 flex flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        <div className="auth-grid-bg absolute inset-0 pointer-events-none"></div>

        <div className="relative z-10 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-sky-500/30 shrink-0">
            TN
          </div>
          <div>
            <strong className="text-lg block text-white leading-tight">TopoNix SMKN 1 Bojonegoro</strong>
            <span className="text-xs text-slate-400">Platform Pembelajaran Informatika • Kelas X</span>
          </div>
        </div>

        <div className="relative z-10 max-w-xl my-10">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-sky-400/20 text-sky-300">
            Gamified Project Learning (GPL) • React + Supabase
          </span>
          <h1 className="text-3xl lg:text-4xl font-extrabold leading-tight mt-4 mb-4 text-white">
            Kuasai Topologi Jaringan Secara Interaktif, Adaptif, dan Menyenangkan.
          </h1>
          <p className="text-slate-300 text-base mb-6">
            Pelajari topologi Bus, Star, Ring, Mesh, dan Tree melalui simulasi alur data langsung, rancang jaringan di Network Simulator virtual, uji pemahaman lewat kuis adaptif, dan taklukkan misi proyek SMKN 1 Bojonegoro.
          </p>
          <div className="flex flex-wrap gap-2.5">
            <span className="px-3.5 py-2 rounded-full text-xs font-medium bg-white/10 border border-white/15 text-slate-200">📘 5 Materi + Animasi Paket</span>
            <span className="px-3.5 py-2 rounded-full text-xs font-medium bg-white/10 border border-white/15 text-slate-200">🔌 Network Simulator Drag & Drop</span>
            <span className="px-3.5 py-2 rounded-full text-xs font-medium bg-white/10 border border-white/15 text-slate-200">🧭 Adaptive Learning</span>
            <span className="px-3.5 py-2 rounded-full text-xs font-medium bg-white/10 border border-white/15 text-slate-200">🗄️ Terintegrasi Supabase</span>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-400">
          TopoNix — Media Pembelajaran Informatika SMKN 1 Bojonegoro
        </div>
      </section>

      <section className="bg-white flex items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-1">
            ${registerMode ? 'Daftar Akun Siswa' : 'Masuk ke TopoNix'}
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            ${registerMode
              ? 'Buat akun siswa baru untuk mulai mengumpulkan XP.'
              : 'Masuk sebagai Siswa, Guru, atau Admin menggunakan akun Anda.'}
          </p>

          ${registerMode
            ? html`
              <form onSubmit=${handleRegister} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap</label>
                  <input required value=${regName} onChange=${(e) => setRegName(e.target.value)} placeholder="Contoh: Budi Santoso" className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Username</label>
                    <input required value=${regUsername} onChange=${(e) => setRegUsername(e.target.value)} placeholder="budi10" className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Kelas</label>
                    <select value=${regKelas} onChange=${(e) => setRegKelas(e.target.value)} className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl bg-white">
                      <option value="X TKJ 1">X TKJ 1</option>
                      <option value="X TKJ 2">X TKJ 2</option>
                      <option value="X RPL 1">X RPL 1</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kata Sandi</label>
                  <input type="password" required value=${regPassword} onChange=${(e) => setRegPassword(e.target.value)} className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl" />
                </div>
                <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition">
                  Daftar & Masuk
                </button>
              </form>
              <p className="text-xs text-slate-500 mt-4 text-center">
                Sudah punya akun? <button type="button" onClick=${() => setRegisterMode(false)} className="text-blue-600 font-semibold hover:underline">Masuk di sini</button>
              </p>
            `
            : html`
              <form onSubmit=${handleLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Username</label>
                  <input required value=${username} onChange=${(e) => setUsername(e.target.value)} placeholder="rizky / guru / admin" className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kata Sandi</label>
                  <input type="password" required value=${password} onChange=${(e) => setPassword(e.target.value)} placeholder="123" className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl" />
                </div>
                <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition">
                  Masuk ke Platform
                </button>
              </form>
              <p className="text-xs text-slate-500 mt-4 text-center">
                Siswa baru? <button type="button" onClick=${() => setRegisterMode(true)} className="text-blue-600 font-semibold hover:underline">Daftar akun siswa</button>
              </p>

              <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-dashed border-slate-300">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">Masuk Cepat Akun Demo (Sandi: 123)</h4>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick=${() => quickLogin('u-siswa-1')} className="py-2 px-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-xs font-semibold">👨‍🎓 Siswa</button>
                  <button type="button" onClick=${() => quickLogin('u-guru-1')} className="py-2 px-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-xs font-semibold">👩‍🏫 Guru</button>
                  <button type="button" onClick=${() => quickLogin('u-admin-1')} className="py-2 px-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-xs font-semibold">⚙️ Admin</button>
                </div>
              </div>
            `}
        </div>
      </section>
    </div>
  `;
}

function App() {
  const [appState, setAppState] = useState(store.state);
  const [route, setRoute] = useState('dashboard');
  const [routeParams, setRouteParams] = useState({});
  const [mobileMenu, setMobileMenu] = useState(false);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const unsub = store.subscribe((next) => setAppState(next));
    store.initSupabase();
    return unsub;
  }, []);

  const toast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  const navigate = useCallback((nextRoute, params = {}) => {
    setRoute(nextRoute);
    setRouteParams(params);
    setMobileMenu(false);
  }, []);

  const user = store.getCurrentUser();

  const toastPortal = html`
    <div className="fixed top-[74px] right-5 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none" aria-live="polite">
      ${toasts.map((t) => {
        const borderCls =
          t.type === 'success' ? 'border-l-emerald-500' :
          t.type === 'warning' ? 'border-l-amber-500' :
          t.type === 'error' ? 'border-l-rose-500' : 'border-l-sky-500';
        return html`
          <div key=${t.id} className=${`toast-enter bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-sm font-medium border-l-4 ${borderCls}`}>
            ${t.message}
          </div>
        `;
      })}
    </div>
  `;

  if (!user) {
    return html`
      <div>
        <${AuthScreen}
          toast=${toast}
          onLoginSuccess=${(u) => {
            setRoute(u.role === 'guru' ? 'guru-panel' : u.role === 'admin' ? 'admin-panel' : 'dashboard');
            setRouteParams({});
          }}
        />
        ${toastPortal}
      </div>
    `;
  }

  const navItems = getNavItems(user);
  const effectiveRoute = navItems.some((n) => n.id === route) ? route : navItems[0].id;
  const activeNav = navItems.find((n) => n.id === effectiveRoute);
  const lvInfo = store.getLevelInfo(user.xp);

  const dbBadge =
    store.supabaseStatus === 'connected'
      ? { label: 'Supabase Terhubung', cls: 'bg-emerald-100 text-emerald-700' }
      : store.supabaseStatus === 'error'
      ? { label: 'Supabase Error', cls: 'bg-rose-100 text-rose-700' }
      : { label: 'Mode Lokal', cls: 'bg-slate-100 text-slate-600' };

  return html`
    <div className="flex min-h-screen">
      ${mobileMenu && html`
        <div className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden" onClick=${() => setMobileMenu(false)}></div>
      `}

      <aside className=${`w-[264px] bg-slate-900 text-slate-200 flex flex-col fixed inset-y-0 left-0 z-40 transition-transform duration-200 ${
        mobileMenu ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white font-extrabold shadow-md shrink-0">
            TN
          </div>
          <div>
            <strong className="block text-base text-white leading-tight">TopoNix</strong>
            <span className="block text-xs text-slate-400">SMKN 1 Bojonegoro</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto" aria-label="Menu Utama">
          <div className="text-[11px] uppercase tracking-wider text-slate-500 px-3 pb-2 font-bold">
            Menu ${user.role.toUpperCase()}
          </div>
          ${navItems.map((item) => {
            const isAct = item.id === effectiveRoute;
            return html`
              <button
                key=${item.id}
                type="button"
                onClick=${() => navigate(item.id)}
                className=${`w-full flex items-center gap-2.5 px-3 py-2.5 mb-1 rounded-xl text-sm text-left transition ${
                  isAct
                    ? 'bg-gradient-to-r from-blue-700 to-sky-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white font-medium'
                }`}
              >
                <span>${item.icon}</span>
                <span>${item.label}</span>
                ${item.badge && html`
                  <span className="ml-auto bg-rose-500 text-white text-[11px] px-2 py-0.5 rounded-full font-bold">${item.badge}</span>
                `}
              </button>
            `;
          })}
        </nav>

        <div className="p-4 border-t border-white/10 text-xs text-slate-400">
          <div className="mb-2.5">
            <strong className="text-white block text-sm">${user.name}</strong>
            <span>${user.kelas}</span>
          </div>
          <button
            type="button"
            onClick=${() => store.logout()}
            className="w-full py-2 px-3 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-xs transition"
          >
            Keluar / Ganti Akun
          </button>
        </div>
      </aside>

      <div className="flex-1 lg:ml-[264px] flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 px-4 lg:px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button type="button" onClick=${() => setMobileMenu(!mobileMenu)} className="lg:hidden px-2.5 py-1.5 rounded-lg border border-slate-300 text-sm" aria-label="Buka Menu">☰</button>
            <h1 className="text-base lg:text-lg font-bold text-slate-900">
              ${activeNav ? `${activeNav.icon} ${activeNav.label}` : 'TopoNix'}
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <span className=${`hidden sm:inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${dbBadge.cls}`}>
              🗄️ ${dbBadge.label}
            </span>
            ${user.role === 'siswa'
              ? html`<div className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">⚡ ${user.xp} XP • Lv.${lvInfo.current.level}</div>`
              : html`<span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700">${user.role.toUpperCase()}</span>`}
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
              ${user.name[0]}
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-6 max-w-[1360px] w-full mx-auto">
          ${effectiveRoute === 'dashboard' && html`<${StudentDashboard} state=${appState} navigate=${navigate} toast=${toast} />`}
          ${effectiveRoute === 'materi' && html`<${MateriView} state=${appState} params=${routeParams} navigate=${navigate} toast=${toast} />`}
          ${effectiveRoute === 'simulator' && html`<${SimulatorView} state=${appState} params=${routeParams} toast=${toast} />`}
          ${effectiveRoute === 'kuis' && html`<${QuizView} state=${appState} params=${routeParams} navigate=${navigate} toast=${toast} />`}
          ${effectiveRoute === 'gpl' && html`<${GplView} state=${appState} toast=${toast} />`}
          ${effectiveRoute === 'leaderboard' && html`<${LeaderboardView} state=${appState} toast=${toast} />`}
          ${effectiveRoute === 'profil' && html`<${ProfilView} state=${appState} />`}
          ${effectiveRoute === 'guru-panel' && html`<${TeacherDashboard} state=${appState} toast=${toast} />`}
          ${effectiveRoute === 'admin-panel' && html`<${AdminDashboard} state=${appState} toast=${toast} />`}
        </main>
      </div>

      ${toastPortal}
    </div>
  `;
}

const root = createRoot(document.getElementById('root'));
root.render(html`<${App} />`);

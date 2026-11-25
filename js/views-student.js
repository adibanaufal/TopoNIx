/**
 * js/views-student.js
 * Komponen React + Tailwind CSS untuk Siswa SMKN 1 Bojonegoro:
 * StudentDashboard, MateriView, SimulatorView, QuizView, GplView, LeaderboardView, ProfilView.
 */

import { React, html } from './reactHtm.js';
import { store } from './store.js';
import { MaterialSimulator, FullNetworkSimulator } from './simulator.js';

const { useState, useEffect } = React;

const STATUS_LABELS = {
  belum: { text: 'Belum Diuji', cls: 'bg-slate-200 text-slate-700' },
  perlu_penguatan: { text: 'Perlu Penguatan', cls: 'bg-rose-100 text-rose-700' },
  menguasai: { text: 'Lulus KKM', cls: 'bg-emerald-100 text-emerald-700' },
  mahir: { text: 'Mahir (HOTS)', cls: 'bg-purple-100 text-purple-700' }
};

// ============================================================================
// 1. DASHBOARD SISWA
// ============================================================================
export function StudentDashboard({ state, navigate }) {
  const user = store.getCurrentUser();
  const lvInfo = store.getLevelInfo(user.xp);
  const adaptive = store.getAdaptiveProfile(user.id);
  const feedbacks = store.getFeedbacksForStudent(user);
  const unreadCount = feedbacks.filter((f) => !f.readBy.includes(user.id)).length;
  const completedStages = new Set(
    state.gplSubmissions.filter((s) => s.userId === user.id).map((s) => s.projectId)
  ).size;

  function goAdaptive() {
    const act = adaptive.primaryAction;
    if (act.type === 'remedial' || act.type === 'materi') navigate('materi', { topicId: act.topicId });
    else if (act.type === 'kuis') navigate('kuis', { topicId: act.topicId, difficulty: act.difficulty });
    else navigate('gpl');
  }

  return html`
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl shrink-0">⚡</div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 leading-tight">${user.xp} XP</div>
            <div className="text-xs text-slate-500 mt-0.5">Lv.${lvInfo.current.level} ${lvInfo.current.name}</div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-xl shrink-0">📘</div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 leading-tight">${user.readMaterials.length}/${state.topologies.length}</div>
            <div className="text-xs text-slate-500 mt-0.5">Materi Topologi Selesai</div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl shrink-0">🎮</div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 leading-tight">${completedStages}/${state.gplProjects.length}</div>
            <div className="text-xs text-slate-500 mt-0.5">Tahap Proyek GPL</div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-xl shrink-0">🏅</div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 leading-tight">${user.unlockedBadges.length}/${state.badges.length}</div>
            <div className="text-xs text-slate-500 mt-0.5">Lencana Terbuka</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        <div className="bg-white border border-slate-200 border-t-4 border-t-blue-600 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h3 className="text-base font-bold text-slate-900">🧭 Rekomendasi Adaptive Learning</h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700">KKM: ${state.settings.kkm}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 text-sm mb-4">
            <strong className="block">Langkah Berikutnya: ${adaptive.primaryAction.label}</strong>
            <p className="mt-1 text-sky-800">${adaptive.primaryAction.detail}</p>
          </div>

          <div className="flex flex-wrap gap-2.5 mb-5">
            <button type="button" onClick=${goAdaptive} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition">
              ▶ Jalankan Rekomendasi
            </button>
            <button type="button" onClick=${() => navigate('simulator')} className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm transition">
              🔌 Buka Simulator
            </button>
          </div>

          <h4 className="text-sm font-bold text-slate-800 mb-2">Peta Penguasaan 5 Topologi</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase">
                  <th className="py-2.5 px-3 border-b border-slate-200">Topik</th>
                  <th className="py-2.5 px-3 border-b border-slate-200">Materi</th>
                  <th className="py-2.5 px-3 border-b border-slate-200">Sim</th>
                  <th className="py-2.5 px-3 border-b border-slate-200">Skor</th>
                  <th className="py-2.5 px-3 border-b border-slate-200">Status Adaptif</th>
                </tr>
              </thead>
              <tbody>
                ${adaptive.topicStatuses.map((t) => {
                  const st = STATUS_LABELS[t.status];
                  return html`
                    <tr key=${t.topicId} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">${t.topicName}</td>
                      <td className="py-2.5 px-3">${t.read ? '✅' : '⏳'}</td>
                      <td className="py-2.5 px-3">${t.simDone ? '✅' : '⏳'}</td>
                      <td className="py-2.5 px-3 font-bold">${t.latestScore !== null ? t.latestScore : '-'}</td>
                      <td className="py-2.5 px-3">
                        <span className=${`px-2.5 py-0.5 rounded-full text-xs font-semibold ${st.cls}`}>${st.text}</span>
                      </td>
                    </tr>
                  `;
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-slate-900">📈 Progres Level Kamu</h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">Lv.${lvInfo.current.level}</span>
            </div>
            <p className="text-sm text-slate-600 mb-3">
              ${lvInfo.next
                ? html`Butuh <strong>${lvInfo.next.minXp - user.xp} XP</strong> lagi menuju <strong>Lv.${lvInfo.next.level} (${lvInfo.next.name})</strong>`
                : 'Selamat! Kamu mencapai level tertinggi!'}
            </p>
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-600 to-sky-500 rounded-full transition-all duration-300" style=${{ width: `${lvInfo.progressPct}%` }}></div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900">💬 Umpan Balik & Notifikasi Guru</h3>
              ${unreadCount > 0
                ? html`<span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">${unreadCount} Baru</span>`
                : html`<span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">Terbaca</span>`}
            </div>
            ${feedbacks.length === 0
              ? html`<p className="text-sm text-slate-500">Belum ada pesan umpan balik dari guru.</p>`
              : html`
                <div className="space-y-3">
                  ${feedbacks.slice(0, 4).map((fb) => {
                    const isRead = fb.readBy.includes(user.id);
                    return html`
                      <div key=${fb.id} className=${`p-3.5 rounded-xl border text-sm ${isRead ? 'bg-slate-50 border-slate-200' : 'bg-amber-50 border-amber-200'}`}>
                        <div className="flex items-center justify-between gap-2">
                          <strong className="text-slate-900">${fb.title}</strong>
                          <span className="text-xs text-slate-500 shrink-0">${fb.date}</span>
                        </div>
                        <p className="my-1.5 text-slate-700">${fb.message}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-slate-500">Dari: ${fb.fromName}</span>
                          ${!isRead
                            ? html`<button type="button" onClick=${() => store.markFeedbackRead(fb.id, user.id)} className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-100">Tandai Dibaca</button>`
                            : html`<span className="text-xs text-slate-400">✓ Dibaca</span>`}
                        </div>
                      </div>
                    `;
                  })}
                </div>
              `}
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============================================================================
// 2. MATERI INTERAKTIF
// ============================================================================
export function MateriView({ state, params, navigate, toast }) {
  const user = store.getCurrentUser();
  const topologies = state.topologies;
  const [topicId, setTopicId] = useState(params?.topicId || topologies[0]?.id || 'bus');

  useEffect(() => {
    if (params?.topicId && topologies.some((t) => t.id === params.topicId)) {
      setTopicId(params.topicId);
    }
  }, [params?.topicId]);

  const active = topologies.find((t) => t.id === topicId) || topologies[0];
  const isRead = user.readMaterials.includes(active.id);
  const isSim = user.simulatedMaterials.includes(active.id);

  function handleMarkRead() {
    const res = store.markMaterialRead(user.id, active.id);
    if (res.newlyRead) {
      toast(`+${state.settings.xpRules.readMaterial} XP! Materi ${active.name} selesai dibaca.`, 'success');
      if (res.unlocked) toast(`🏅 Lencana Terbuka: ${res.unlocked.name} (+${res.unlocked.xpBonus} XP)!`, 'warning');
      if (res.xpResult?.leveledUp) toast(`🎉 Naik Level! Sekarang Lv.${res.xpResult.newLevel.level} ${res.xpResult.newLevel.name}`, 'warning');
    }
  }

  return html`
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        ${topologies.map((t) => {
          const done = user.readMaterials.includes(t.id);
          const isCur = t.id === active.id;
          return html`
            <button
              key=${t.id}
              type="button"
              onClick=${() => setTopicId(t.id)}
              className=${`px-4 py-2 rounded-xl border text-sm font-semibold flex items-center gap-2 transition ${
                isCur ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span>${done ? '✅' : '📘'}</span>
              <span>${t.name}</span>
            </button>
          `;
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800">${active.cableType}</span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-2">${active.name}</h2>
              <p className="text-sm text-slate-500">${active.tagline}</p>
            </div>
            <button
              type="button"
              disabled=${isRead}
              onClick=${handleMarkRead}
              className=${`px-4 py-2 rounded-xl text-sm font-semibold text-white transition ${
                isRead ? 'bg-emerald-600 opacity-80 cursor-default' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              ${isRead ? '✓ Sudah Dibaca' : `✓ Selesai Baca (+${state.settings.xpRules.readMaterial} XP)`}
            </button>
          </div>

          <h4 className="font-bold text-slate-900 text-sm mb-1">1. Pengertian</h4>
          <p className="text-sm text-slate-700 mb-3 leading-relaxed">${active.pengertian}</p>

          <h4 className="font-bold text-slate-900 text-sm mb-1">2. Cara Kerja & Alur Data</h4>
          <p className="text-sm text-slate-700 mb-4 leading-relaxed">${active.caraKerja}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <strong className="text-sm text-emerald-900">✅ Kelebihan</strong>
              <ul className="mt-2 pl-4 list-disc text-xs text-emerald-900 space-y-1">
                ${active.kelebihan.map((k, i) => html`<li key=${i}>${k}</li>`)}
              </ul>
            </div>
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200">
              <strong className="text-sm text-rose-900">⚠️ Kekurangan</strong>
              <ul className="mt-2 pl-4 list-disc text-xs text-rose-900 space-y-1">
                ${active.kekurangan.map((k, i) => html`<li key=${i}>${k}</li>`)}
              </ul>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-sm text-sky-900">
            <strong>🏫 Contoh Penerapan di SMK:</strong>
            <p className="mt-1">${active.contohPenerapan}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <h3 className="text-base font-bold text-slate-900">⚡ Simulasi Interaktif Alur Data</h3>
              <span className=${`px-2.5 py-0.5 rounded-full text-xs font-semibold ${isSim ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}>
                ${isSim ? '✓ Simulasi Selesai' : `+${state.settings.xpRules.runMaterialSim} XP`}
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Jalankan paket data untuk melihat rute transmisi, lalu klik salah satu kabel atau perangkat untuk mengamati dampaknya saat terjadi gangguan.
            </p>
            <${MaterialSimulator}
              topology=${active}
              onSimRun=${(isFault) => {
                const res = store.markMaterialSimulated(user.id, active.id, isFault);
                if (res.newlySim) toast(`+${state.settings.xpRules.runMaterialSim} XP dari menjalankan simulasi ${active.name}!`, 'success');
                if (res.badge) toast(`🏅 Lencana Terbuka: ${res.badge.name} (+${res.badge.xpBonus} XP)!`, 'warning');
              }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100">
            <button type="button" onClick=${() => navigate('simulator', { target: active.id })} className="px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-semibold hover:bg-slate-50">
              🔌 Rancang Sendiri di Simulator
            </button>
            <button type="button" onClick=${() => navigate('kuis', { topicId: active.id })} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold">
              📝 Kerjakan Kuis ${active.name} →
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============================================================================
// 3. NETWORK SIMULATOR LAB
// ============================================================================
export function SimulatorView({ state, params, toast }) {
  const user = store.getCurrentUser();
  const target = params?.target || 'star';

  return html`
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">🔌 Laboratorium Virtual Network Simulator</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Seret perangkat ke kanvas, hubungkan kabel antar perangkat, uji pengiriman data & putus kabel, lalu klik <strong>Periksa Topologi</strong>.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
          Tervalidasi: ${user.validatedTopologies.length}/5 Topologi
        </span>
      </div>

      <${FullNetworkSimulator}
        initialTarget=${target}
        presets=${state.topologies}
        onValidateSuccess=${(topologyId, testedFault) => {
          const res = store.recordSimulatorValidation(user.id, topologyId, testedFault);
          if (res.newlyValidated) {
            toast(`+${state.settings.xpRules.simulatorPass} XP! Validasi topologi ${topologyId.toUpperCase()} berhasil.`, 'success');
          }
          res.badges.forEach((b) => toast(`🏅 Lencana Terbuka: ${b.name} (+${b.xpBonus} XP)!`, 'warning'));
        }}
      />
    </div>
  `;
}

// ============================================================================
// 4. KUIS ADAPTIF
// ============================================================================
export function QuizView({ state, params, navigate, toast }) {
  const user = store.getCurrentUser();
  const adaptive = store.getAdaptiveProfile(user.id);
  const kkm = state.settings.kkm;

  const [selectedTopic, setSelectedTopic] = useState(params?.topicId || adaptive.primaryAction.topicId || 'bus');
  const topicRec = adaptive.topicStatuses.find((t) => t.topicId === selectedTopic);
  const [selectedDiff, setSelectedDiff] = useState(params?.difficulty || topicRec?.recommendedDifficulty || 'mudah');
  const [session, setSession] = useState(null);
  const [finalResult, setFinalResult] = useState(null);

  const myHistory = state.quizResults.filter((r) => r.userId === user.id);
  const matchingQuestions = state.questions.filter(
    (q) => (selectedTopic === 'campuran' || q.topic === selectedTopic) && (selectedDiff === 'semua' || q.difficulty === selectedDiff)
  );

  function startQuiz() {
    const questions = matchingQuestions.slice(0, 8);
    setFinalResult(null);
    setSession({
      topic: selectedTopic,
      difficulty: selectedDiff,
      questions,
      index: 0,
      answers: [],
      answeredCurrent: null
    });
  }

  function pickOption(idx) {
    if (!session || session.answeredCurrent !== null) return;
    const q = session.questions[session.index];
    setSession({
      ...session,
      answeredCurrent: idx,
      answers: [...session.answers, { questionId: q.id, selectedIndex: idx }]
    });
  }

  function nextQuestion() {
    if (session.index + 1 < session.questions.length) {
      setSession({ ...session, index: session.index + 1, answeredCurrent: null });
    } else {
      const res = store.submitQuizAttempt(user.id, session.topic, session.difficulty, session.answers);
      if (res.badge) toast(`🏅 Lencana Terbuka: ${res.badge.name}!`, 'warning');
      setSession(null);
      setFinalResult(res);
    }
  }

  if (finalResult) {
    const { record, earnedXp } = finalResult;
    return html`
      <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center">
        <div className="text-5xl mb-2">${record.passed ? '🎉' : '📘'}</div>
        <h2 className="text-2xl font-extrabold text-slate-900">Skor Akhir: ${record.score} / 100</h2>
        <p className="text-sm text-slate-500 mt-1 mb-4">Benar ${record.correct} dari ${record.total} soal • Batas KKM: ${kkm}</p>
        <div className="flex flex-wrap justify-center gap-2 mb-5">
          <span className=${`px-3.5 py-1 rounded-full text-sm font-bold ${record.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
            ${record.passed ? 'LULUS KKM' : 'PERLU PENGUATAN (< KKM)'}
          </span>
          <span className="px-3.5 py-1 rounded-full text-sm font-bold bg-amber-100 text-amber-800">+${earnedXp} XP Diperoleh</span>
        </div>
        <div className=${`p-4 rounded-xl border text-left text-sm mb-6 ${record.passed ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
          <strong>Rekomendasi Sistem Adaptif:</strong>
          <p className="mt-1">
            ${record.passed
              ? record.score >= 90
                ? 'Luar biasa! Kamu sudah siap mengerjakan soal tingkat Sulit atau melanjutkan proyek GPL di Network Simulator.'
                : 'Bagus! Kamu lulus KKM. Lanjutkan ke tahap proyek GPL atau tingkatkan pemahaman ke level Sulit.'
              : 'Skor masih di bawah KKM. Sistem menyarankan kamu membuka kembali Materi & Simulasi topik ini sebelum mengulang kuis tingkat Mudah.'}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" onClick=${() => setFinalResult(null)} className="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-sm hover:bg-slate-50">
            Kembali ke Daftar Kuis
          </button>
          ${!record.passed && record.topic !== 'campuran'
            ? html`<button type="button" onClick=${() => navigate('materi', { topicId: record.topic })} className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700">Ulangi Materi ${record.topic.toUpperCase()}</button>`
            : html`<button type="button" onClick=${() => navigate('gpl')} className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700">Lanjut ke Proyek GPL →</button>`}
        </div>
      </div>
    `;
  }

  if (session) {
    const q = session.questions[session.index];
    const keys = ['A', 'B', 'C', 'D'];
    const answered = session.answeredCurrent;
    const pct = Math.round(((session.index + 1) / session.questions.length) * 100);

    return html`
      <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">Soal ${session.index + 1} dari ${session.questions.length}</span>
          <div className="flex gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800">${q.topic.toUpperCase()}</span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">Tingkat: ${q.difficulty.toUpperCase()}</span>
          </div>
        </div>
        <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden mb-5">
          <div className="h-full bg-blue-600 transition-all duration-300" style=${{ width: `${pct}%` }}></div>
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-5 leading-relaxed">${q.question}</h3>
        <div className="space-y-2.5">
          ${q.options.map((opt, idx) => {
            let cls = 'border-slate-200 bg-white hover:border-blue-500 hover:bg-blue-50';
            if (answered !== null) {
              if (idx === q.answerIndex) cls = 'border-emerald-500 bg-emerald-50 text-emerald-900';
              else if (idx === answered) cls = 'border-rose-500 bg-rose-50 text-rose-900';
              else cls = 'border-slate-200 bg-slate-50 opacity-75';
            }
            return html`
              <button key=${idx} type="button" disabled=${answered !== null} onClick=${() => pickOption(idx)}
                className=${`w-full text-left px-4 py-3.5 rounded-xl border-2 flex items-center gap-3 font-medium text-sm transition ${cls}`}>
                <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-xs shrink-0">${keys[idx]}</span>
                <span>${opt}</span>
              </button>
            `;
          })}
        </div>
        ${answered !== null && html`
          <div className=${`mt-4 p-4 rounded-xl border text-sm ${answered === q.answerIndex ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
            <strong>${answered === q.answerIndex ? '✅ Jawaban Benar!' : '❌ Jawaban Kurang Tepat'}</strong>
            <p className="mt-1">${q.explanation}</p>
          </div>
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-slate-500">Umpan balik langsung aktif</span>
            <button type="button" onClick=${nextQuestion} className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm">
              ${session.index + 1 < session.questions.length ? 'Soal Berikutnya →' : 'Lihat Hasil & Nilai Akhir'}
            </button>
          </div>
        `}
      </div>
    `;
  }

  return html`
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900">📝 Mulai Kuis Interaktif</h3>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700">KKM: ${kkm}</span>
        </div>
        ${topicRec && html`
          <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 text-sm mb-4">
            <strong>Rekomendasi Adaptif untuk ${topicRec.topicName}:</strong>
            <p className="mt-1 text-xs">${topicRec.recommendationText}</p>
          </div>
        `}
        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Topik Topologi</label>
            <select value=${selectedTopic} onChange=${(e) => {
              const v = e.target.value;
              setSelectedTopic(v);
              const rec = adaptive.topicStatuses.find((t) => t.topicId === v);
              if (rec) setSelectedDiff(rec.recommendedDifficulty);
            }} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white">
              ${state.topologies.map((t) => html`<option key=${t.id} value=${t.id}>${t.name}</option>`)}
              <option value="campuran">Evaluasi Campuran (Semua Topologi)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tingkat Kesulitan (Adaptif)</label>
            <select value=${selectedDiff} onChange=${(e) => setSelectedDiff(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white">
              <option value="mudah">Mudah (Dasar Konsep)</option>
              <option value="sedang">Sedang (Analisis Cara Kerja)</option>
              <option value="sulit">Sulit (HOTS & Troubleshooting)</option>
              <option value="semua">Semua Tingkat (Paket Lengkap)</option>
            </select>
          </div>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Tersedia <strong>${matchingQuestions.length} soal</strong> (+${state.settings.xpRules.quizCorrect} XP/benar, bonus +${state.settings.xpRules.quizPassBonus} XP bila ≥ KKM).
        </p>
        <button type="button" disabled=${matchingQuestions.length === 0} onClick=${startQuiz}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm transition">
          ▶ Mulai Mengerjakan Kuis
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900">📊 Riwayat Nilai Kuis Kamu</h3>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">${myHistory.length} Sesi</span>
        </div>
        ${myHistory.length === 0
          ? html`<p className="text-sm text-slate-500">Belum ada riwayat kuis.</p>`
          : html`
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase">
                    <th className="py-2 px-3 border-b">Tanggal</th>
                    <th className="py-2 px-3 border-b">Topik</th>
                    <th className="py-2 px-3 border-b">Level</th>
                    <th className="py-2 px-3 border-b">Skor</th>
                    <th className="py-2 px-3 border-b">Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${myHistory.map((h) => html`
                    <tr key=${h.id} className="border-b border-slate-100">
                      <td className="py-2 px-3 text-xs text-slate-500">${h.date}</td>
                      <td className="py-2 px-3 font-bold">${h.topic.toUpperCase()}</td>
                      <td className="py-2 px-3"><span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700">${h.difficulty}</span></td>
                      <td className="py-2 px-3"><strong>${h.score}</strong> (${h.correct}/${h.total})</td>
                      <td className="py-2 px-3">
                        <span className=${`px-2.5 py-0.5 rounded-full text-xs font-semibold ${h.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          ${h.passed ? 'Lulus KKM' : 'Remedial'}
                        </span>
                      </td>
                    </tr>
                  `)}
                </tbody>
              </table>
            </div>
          `}
      </div>
    </div>
  `;
}

// ============================================================================
// 5. GAMIFIED PROJECT LEARNING (GPL)
// ============================================================================
export function GplView({ state, toast }) {
  const user = store.getCurrentUser();
  const [activeProj, setActiveProj] = useState(null);
  const projects = [...state.gplProjects].sort((a, b) => a.stage - b.stage);
  const mySubs = state.gplSubmissions.filter((s) => s.userId === user.id);
  const completedStages = new Set(
    mySubs.map((s) => projects.find((p) => p.id === s.projectId)?.stage).filter(Boolean)
  );

  return html`
    <div className="space-y-4">
      <div className="rounded-2xl p-6 text-white bg-gradient-to-r from-blue-900 to-sky-600 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="max-w-2xl">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20">Gamified Project Learning (GPL)</span>
          <h2 className="text-xl font-extrabold mt-2 mb-1">Peta Misi Proyek Jaringan SMKN 1 Bojonegoro</h2>
          <p className="text-sm text-sky-100">
            Selesaikan setiap misi proyek secara bertahap memakai Network Simulator. Setiap tahap yang selesai memberi XP, membuka misi berikutnya, dan dinilai oleh Guru.
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-extrabold">${completedStages.size}/${projects.length}</div>
          <div className="text-xs text-sky-200">Misi Selesai</div>
        </div>
      </div>

      <div className="space-y-4">
        ${projects.map((proj) => {
          const sub = mySubs.find((s) => s.projectId === proj.id);
          const unlocked = proj.stage === 1 || completedStages.has(proj.stage - 1) || Boolean(sub);
          const borderCls = sub ? 'border-l-emerald-500' : !unlocked ? 'border-l-slate-300 opacity-75' : 'border-l-blue-600';

          return html`
            <div key=${proj.id} className=${`bg-white border border-slate-200 border-l-[6px] ${borderCls} rounded-2xl p-5 shadow-sm`}>
              <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800">Tahap ${proj.stage}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">+${proj.xpReward} XP</span>
                    ${sub
                      ? sub.status === 'reviewed'
                        ? html`<span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">Dinilai Guru: ${sub.teacherScore}/100</span>`
                        : html`<span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">Terkumpul • Menunggu Penilaian</span>`
                      : unlocked
                      ? html`<span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">Misi Terbuka</span>`
                      : html`<span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-600">🔒 Terkunci</span>`}
                  </div>
                  <h3 className="text-base font-bold text-slate-900">${proj.title}</h3>
                </div>
                <button
                  type="button"
                  disabled=${!unlocked}
                  onClick=${() => setActiveProj({ proj, existingSub: sub })}
                  className=${`px-4 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-50 ${
                    sub ? 'border border-slate-300 bg-white hover:bg-slate-50 text-slate-800' : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  ${sub ? '✏️ Buka / Perbarui Desain' : '🚀 Kerjakan Misi di Simulator'}
                </button>
              </div>
              <p className="text-sm text-slate-700 mb-2">${proj.scenario}</p>
              <strong className="text-xs text-slate-700">Target & Kriteria Kelulusan:</strong>
              <ul className="list-disc pl-5 mt-1 text-xs text-slate-600 space-y-0.5">
                ${proj.deliverables.map((d, idx) => html`<li key=${idx}>${d}</li>`)}
              </ul>
              ${sub && sub.teacherComment && html`
                <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-900">
                  <strong>💬 Komentar Guru:</strong> ${sub.teacherComment}
                </div>
              `}
            </div>
          `;
        })}
      </div>

      ${activeProj && html`
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4" onClick=${(e) => { if (e.target === e.currentTarget) setActiveProj(null); }}>
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">${activeProj.proj.title} — Workspace Simulator</h3>
              <button type="button" onClick=${() => setActiveProj(null)} className="px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-500 hover:bg-slate-100">✕ Tutup</button>
            </div>
            <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-sm text-sky-900 mb-4">
              <strong>Skenario:</strong> ${activeProj.proj.scenario}
            </div>
            <${FullNetworkSimulator}
              initialGraph=${activeProj.existingSub ? activeProj.existingSub.graph : { nodes: [], links: [] }}
              initialTarget=${activeProj.proj.targetTopology}
              initialNotes=${activeProj.existingSub ? activeProj.existingSub.notes : ''}
              minDevices=${activeProj.proj.minDevices}
              projectMode=${true}
              onSubmitProject=${({ graph, notes, validationSummary }) => {
                const res = store.submitGplProject(user.id, activeProj.proj.id, { graph, notes, validationSummary });
                if (res.isFirstComplete) toast(`🎉 Misi GPL Tahap ${activeProj.proj.stage} selesai! +${res.xpAwarded} XP!`, 'success');
                else toast(`Rancangan Misi ${activeProj.proj.stage} berhasil diperbarui.`, 'success');
                if (res.badge) toast(`🏅 Lencana Terbuka: ${res.badge.name} (+${res.badge.xpBonus} XP)!`, 'warning');
                setActiveProj(null);
              }}
            />
          </div>
        </div>
      `}
    </div>
  `;
}

// ============================================================================
// 6. LEADERBOARD
// ============================================================================
export function LeaderboardView({ state, toast }) {
  const user = store.getCurrentUser();
  const students = state.users.filter((u) => u.role === 'siswa');
  const classes = ['Semua', ...new Set(students.map((s) => s.kelas))];
  const [selectedClass, setSelectedClass] = useState('Semua');

  const filtered = students
    .filter((s) => selectedClass === 'Semua' || s.kelas === selectedClass)
    .sort((a, b) => b.xp - a.xp);

  return html`
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">🏆 Papan Peringkat XP Siswa SMKN 1 Bojonegoro</h3>
          <p className="text-xs text-slate-500 mt-0.5">Kumpulkan XP dari membaca materi, simulator, kuis, dan menyelesaikan proyek GPL.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select value=${selectedClass} onChange=${(e) => setSelectedClass(e.target.value)} className="px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white">
            ${classes.map((c) => html`<option key=${c} value=${c}>Kelas: ${c}</option>`)}
          </select>
          ${user.role === 'siswa' && html`
            <label className="flex items-center gap-2 text-xs font-semibold bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 cursor-pointer">
              <input type="checkbox" checked=${user.hideOnLeaderboard} onChange=${() => {
                store.toggleLeaderboardPrivacy(user.id);
                toast(store.getCurrentUser().hideOnLeaderboard ? 'Namamu disembunyikan bagi siswa lain.' : 'Namamu kini tampil di papan peringkat.');
              }} />
              <span>Sembunyikan nama saya</span>
            </label>
          `}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase">
              <th className="py-3 px-3 border-b">Peringkat</th>
              <th className="py-3 px-3 border-b">Nama Siswa</th>
              <th className="py-3 px-3 border-b">Kelas</th>
              <th className="py-3 px-3 border-b">Level</th>
              <th className="py-3 px-3 border-b">Lencana</th>
              <th className="py-3 px-3 border-b">Total XP</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map((s, idx) => {
              const rank = idx + 1;
              const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
              const lv = store.getLevelInfo(s.xp).current;
              const isMe = s.id === user.id;
              const displayName = s.hideOnLeaderboard && !isMe && user.role === 'siswa' ? `Siswa Anonim #${s.id.slice(-3)}` : s.name;
              return html`
                <tr key=${s.id} className=${`border-b border-slate-100 ${isMe ? 'bg-blue-50/70' : 'hover:bg-slate-50'}`}>
                  <td className="py-3 px-3 font-bold">${medal}</td>
                  <td className="py-3 px-3">
                    <strong>${displayName}</strong>
                    ${isMe && html`<span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">Kamu</span>`}
                  </td>
                  <td className="py-3 px-3">${s.kelas}</td>
                  <td className="py-3 px-3">Lv.${lv.level} ${lv.name}</td>
                  <td className="py-3 px-3">🏅 ${s.unlockedBadges.length}</td>
                  <td className="py-3 px-3 font-extrabold text-slate-900">${s.xp} XP</td>
                </tr>
              `;
            })}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ============================================================================
// 7. PROFIL & LENCANA
// ============================================================================
export function ProfilView({ state }) {
  const user = store.getCurrentUser();
  const lvInfo = store.getLevelInfo(user.xp);
  const badges = state.badges;

  return html`
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center font-extrabold text-xl shrink-0">${user.name[0]}</div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">${user.name}</h2>
            <p className="text-sm text-slate-500">${user.kelas} • Username: @${user.username}</p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 mb-5">
          <strong className="text-sm text-sky-900">Lv.${lvInfo.current.level} — ${lvInfo.current.name} (${user.xp} XP)</strong>
          <div className="w-full h-2.5 bg-sky-200 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-blue-600 rounded-full" style=${{ width: `${lvInfo.progressPct}%` }}></div>
          </div>
        </div>

        <h3 className="text-base font-bold text-slate-900 mb-3">🏅 Koleksi Lencana (${user.unlockedBadges.length}/${badges.length})</h3>
        <div className="space-y-2.5">
          ${badges.map((b) => {
            const unlocked = user.unlockedBadges.includes(b.id);
            return html`
              <div key=${b.id} className=${`flex items-center gap-3 p-3 rounded-xl border ${unlocked ? 'bg-amber-50/70 border-amber-300' : 'bg-slate-50 border-slate-200 opacity-60 grayscale'}`}>
                <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center text-xl shrink-0">${b.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <strong className="text-sm text-slate-900">${b.name}</strong>
                    <span className=${`px-2.5 py-0.5 rounded-full text-xs font-bold ${unlocked ? 'bg-amber-200 text-amber-900' : 'bg-slate-200 text-slate-600'}`}>
                      ${unlocked ? 'Terbuka' : `+${b.xpBonus} XP`}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">${b.description}</p>
                </div>
              </div>
            `;
          })}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900">📜 Riwayat Perolehan XP</h3>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">${user.xp} XP Total</span>
        </div>
        ${user.xpHistory.length === 0
          ? html`<p className="text-sm text-slate-500">Belum ada aktivitas XP.</p>`
          : html`
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase">
                    <th className="py-2 px-3 border-b">Waktu</th>
                    <th className="py-2 px-3 border-b">Aktivitas</th>
                    <th className="py-2 px-3 border-b">XP</th>
                  </tr>
                </thead>
                <tbody>
                  ${user.xpHistory.map((item) => html`
                    <tr key=${item.id} className="border-b border-slate-100">
                      <td className="py-2 px-3 text-xs text-slate-500">${item.date}</td>
                      <td className="py-2 px-3">${item.source}</td>
                      <td className="py-2 px-3"><span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">+${item.xp} XP</span></td>
                    </tr>
                  `)}
                </tbody>
              </table>
            </div>
          `}
      </div>
    </div>
  `;
}

/**
 * js/views-staff.js
 * Komponen React + Tailwind CSS untuk Panel Guru dan Panel Admin (+ Konfigurasi Supabase).
 */

import { React, html } from './reactHtm.js';
import { store } from './store.js';
import { ReadOnlyGraphPreview } from './simulator.js';
import { getSupabaseConfig, saveSupabaseConfig } from './config.js';
import { testSupabaseConnection } from './supabaseClient.js';

const { useState } = React;

// ============================================================================
// PANEL GURU
// ============================================================================
export function TeacherDashboard({ state, toast }) {
  const [activeTab, setActiveTab] = useState('rekap');
  const students = state.users.filter((u) => u.role === 'siswa');
  const pendingSubs = state.gplSubmissions.filter((s) => s.status === 'submitted');
  const avgQuiz = state.quizResults.length
    ? Math.round(state.quizResults.reduce((acc, q) => acc + q.score, 0) / state.quizResults.length)
    : 0;

  const tabs = [
    { id: 'rekap', label: '📊 Rekap Nilai & Progres Siswa' },
    { id: 'proyek', label: `🛠️ Nilai Proyek GPL (${state.gplSubmissions.length})` },
    { id: 'feedback', label: '💬 Kirim Umpan Balik' },
    { id: 'soal', label: '📝 Kelola Bank Soal' },
    { id: 'materi', label: '📘 Kelola Materi & Misi GPL' }
  ];

  return html`
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-xl">👨‍🎓</div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">${students.length}</div>
            <div className="text-xs text-slate-500">Total Siswa Terdaftar</div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl">📊</div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">${avgQuiz}</div>
            <div className="text-xs text-slate-500">Rata-rata Nilai Kuis</div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl">📂</div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">${pendingSubs.length}</div>
            <div className="text-xs text-slate-500">Proyek Menunggu Nilai</div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-xl">📝</div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">${state.questions.length}</div>
            <div className="text-xs text-slate-500">Total Bank Soal</div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        ${tabs.map((t) => html`
          <button key=${t.id} type="button" onClick=${() => setActiveTab(t.id)}
            className=${`px-4 py-2 rounded-xl border text-sm font-semibold transition ${
              activeTab === t.id ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}>
            ${t.label}
          </button>
        `)}
      </div>

      ${activeTab === 'rekap' && html`<${TeacherRekapTab} state=${state} students=${students} />`}
      ${activeTab === 'proyek' && html`<${TeacherProyekTab} state=${state} toast=${toast} />`}
      ${activeTab === 'feedback' && html`<${TeacherFeedbackTab} state=${state} students=${students} toast=${toast} />`}
      ${activeTab === 'soal' && html`<${TeacherSoalTab} state=${state} toast=${toast} />`}
      ${activeTab === 'materi' && html`<${TeacherMateriTab} state=${state} toast=${toast} />`}
    </div>
  `;
}

function TeacherRekapTab({ state, students }) {
  return html`
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-slate-900">Rekap Perkembangan & Jalur Adaptif Siswa</h3>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700">KKM: ${state.settings.kkm}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase">
                <th className="py-2.5 px-3 border-b">Nama Siswa</th>
                <th className="py-2.5 px-3 border-b">Kelas</th>
                <th className="py-2.5 px-3 border-b">XP & Level</th>
                <th className="py-2.5 px-3 border-b">Materi</th>
                <th className="py-2.5 px-3 border-b">Simulator</th>
                <th className="py-2.5 px-3 border-b">Rekomendasi Sistem</th>
              </tr>
            </thead>
            <tbody>
              ${students.map((s) => {
                const lv = store.getLevelInfo(s.xp).current;
                const adp = store.getAdaptiveProfile(s.id);
                return html`
                  <tr key=${s.id} className="border-b border-slate-100">
                    <td className="py-2.5 px-3 font-semibold">${s.name}</td>
                    <td className="py-2.5 px-3">${s.kelas}</td>
                    <td className="py-2.5 px-3">${s.xp} XP (Lv.${lv.level})</td>
                    <td className="py-2.5 px-3">${s.readMaterials.length}/${state.topologies.length}</td>
                    <td className="py-2.5 px-3">${s.validatedTopologies.length}/5</td>
                    <td className="py-2.5 px-3">
                      <span className=${`px-2.5 py-0.5 rounded-full text-xs font-semibold ${adp.primaryAction.type === 'remedial' ? 'bg-rose-100 text-rose-700' : 'bg-sky-100 text-sky-800'}`}>
                        ${adp.primaryAction.label}
                      </span>
                    </td>
                  </tr>
                `;
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-3">Riwayat Nilai Kuis Terbaru Semua Siswa</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase">
                <th className="py-2.5 px-3 border-b">Tanggal</th>
                <th className="py-2.5 px-3 border-b">Siswa</th>
                <th className="py-2.5 px-3 border-b">Topik</th>
                <th className="py-2.5 px-3 border-b">Tingkat</th>
                <th className="py-2.5 px-3 border-b">Skor</th>
                <th className="py-2.5 px-3 border-b">Status</th>
              </tr>
            </thead>
            <tbody>
              ${state.quizResults.map((qr) => {
                const u = state.users.find((x) => x.id === qr.userId);
                return html`
                  <tr key=${qr.id} className="border-b border-slate-100">
                    <td className="py-2.5 px-3 text-xs text-slate-500">${qr.date}</td>
                    <td className="py-2.5 px-3 font-semibold">${u ? u.name : qr.userId}</td>
                    <td className="py-2.5 px-3">${qr.topic.toUpperCase()}</td>
                    <td className="py-2.5 px-3">${qr.difficulty}</td>
                    <td className="py-2.5 px-3"><strong>${qr.score}</strong> (${qr.correct}/${qr.total})</td>
                    <td className="py-2.5 px-3">
                      <span className=${`px-2.5 py-0.5 rounded-full text-xs font-semibold ${qr.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        ${qr.passed ? 'Lulus' : 'Remedial'}
                      </span>
                    </td>
                  </tr>
                `;
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function TeacherProyekTab({ state, toast }) {
  const [drafts, setDrafts] = useState({});

  if (state.gplSubmissions.length === 0) {
    return html`<div className="bg-white border border-slate-200 rounded-2xl p-6 text-sm text-slate-500">Belum ada pengumpulan proyek GPL dari siswa.</div>`;
  }

  return html`
    <div className="space-y-4">
      ${state.gplSubmissions.map((sub) => {
        const student = state.users.find((u) => u.id === sub.userId);
        const proj = state.gplProjects.find((p) => p.id === sub.projectId);
        const scoreVal = drafts[sub.id]?.score ?? (sub.teacherScore ?? 88);
        const commentVal = drafts[sub.id]?.comment ?? sub.teacherComment;

        return html`
          <div key=${sub.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800">${proj ? proj.title : sub.projectId}</span>
                <h4 className="text-base font-bold text-slate-900 mt-1.5">${student ? student.name : sub.userId} (${student?.kelas || '-'})</h4>
                <span className="text-xs text-slate-500">Dikumpulkan: ${sub.submittedAt}</span>
              </div>
              <span className=${`px-3 py-1 rounded-full text-xs font-bold ${sub.status === 'reviewed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}>
                ${sub.status === 'reviewed' ? `Dinilai: ${sub.teacherScore}/100` : 'Menunggu Penilaian'}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <strong className="block text-xs text-slate-700 mb-1.5">Pratinjau Desain Topologi Siswa:</strong>
                <${ReadOnlyGraphPreview} graph=${sub.graph} />
              </div>
              <div className="space-y-3">
                <p className="text-sm"><strong>Validasi Simulator:</strong> ${sub.validationSummary}</p>
                <p className="text-sm"><strong>Catatan Analisis Siswa:</strong><br/>${sub.notes}</p>
                <hr className="border-slate-200" />
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nilai Proyek (0–100)</label>
                  <input type="number" min="0" max="100" value=${scoreVal}
                    onChange=${(e) => setDrafts({ ...drafts, [sub.id]: { score: e.target.value, comment: commentVal } })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Komentar / Umpan Balik Guru</label>
                  <textarea value=${commentVal}
                    onChange=${(e) => setDrafts({ ...drafts, [sub.id]: { score: scoreVal, comment: e.target.value } })}
                    placeholder="Berikan catatan evaluasi rancangan..."
                    className="w-full p-2.5 text-sm border border-slate-300 rounded-xl min-h-[76px]" />
                </div>
                <button type="button" onClick=${() => {
                  store.gradeGplSubmission(sub.id, scoreVal, commentVal);
                  toast('Nilai & umpan balik proyek berhasil disimpan dan dikirim ke siswa!', 'success');
                }} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm">
                  💾 Simpan Nilai & Kirim Notifikasi
                </button>
              </div>
            </div>
          </div>
        `;
      })}
    </div>
  `;
}

function TeacherFeedbackTab({ state, students, toast }) {
  const teacher = store.getCurrentUser();
  const classes = [...new Set(students.map((s) => s.kelas))];
  const [targetType, setTargetType] = useState('class');
  const [targetValue, setTargetValue] = useState(classes[0] || 'X TKJ 1');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    store.addFeedback({
      fromName: teacher.name,
      targetType,
      targetValue: targetType === 'all' ? 'Semua' : targetValue,
      title,
      message
    });
    setTitle('');
    setMessage('');
    toast('Umpan balik berhasil dikirim ke siswa!', 'success');
  }

  return html`
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-3">Kirim Umpan Balik Kelas / Siswa</h3>
        <form onSubmit=${handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target Penerima</label>
            <select value=${targetType} onChange=${(e) => {
              const mode = e.target.value;
              setTargetType(mode);
              if (mode === 'class') setTargetValue(classes[0] || 'X TKJ 1');
              else if (mode === 'student') setTargetValue(students[0]?.id || '');
            }} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white">
              <option value="class">Satu Kelas</option>
              <option value="student">Siswa Tertentu</option>
              <option value="all">Semua Siswa</option>
            </select>
          </div>
          ${targetType !== 'all' && html`
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Kelas / Siswa</label>
              <select value=${targetValue} onChange=${(e) => setTargetValue(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white">
                ${targetType === 'class'
                  ? classes.map((c) => html`<option key=${c} value=${c}>${c}</option>`)
                  : students.map((s) => html`<option key=${s.id} value=${s.id}>${s.name} (${s.kelas})</option>`)}
              </select>
            </div>
          `}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Judul Umpan Balik</label>
            <input required value=${title} onChange=${(e) => setTitle(e.target.value)} placeholder="Contoh: Penguatan Topologi Bus" className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Isi Pesan / Arahan</label>
            <textarea required value=${message} onChange=${(e) => setMessage(e.target.value)} placeholder="Tulis catatan pembimbingan untuk siswa..." className="w-full p-2.5 text-sm border border-slate-300 rounded-xl min-h-[90px]" />
          </div>
          <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm">📨 Kirim Umpan Balik</button>
        </form>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
        <h3 className="text-base font-bold text-slate-900">Riwayat Umpan Balik Terkirim</h3>
        ${state.feedbacks.map((f) => html`
          <div key=${f.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm">
            <div className="flex items-center justify-between gap-2">
              <strong>${f.title}</strong>
              <span className="px-2 py-0.5 rounded-full text-xs bg-slate-200 text-slate-700">${f.targetType}: ${f.targetValue}</span>
            </div>
            <p className="my-1.5 text-slate-700">${f.message}</p>
            <span className="text-xs text-slate-400">${f.date}</span>
          </div>
        `)}
      </div>
    </div>
  `;
}

function TeacherSoalTab({ state, toast }) {
  const [topic, setTopic] = useState(state.topologies[0]?.id || 'bus');
  const [diff, setDiff] = useState('mudah');
  const [question, setQuestion] = useState('');
  const [opts, setOpts] = useState(['', '', '', '']);
  const [ans, setAns] = useState(0);
  const [exp, setExp] = useState('');

  function handleAdd(e) {
    e.preventDefault();
    store.addOrUpdateQuestion({
      topic,
      difficulty: diff,
      question: question.trim(),
      options: opts.map((o) => o.trim()),
      answerIndex: Number(ans),
      explanation: exp.trim()
    });
    setQuestion('');
    setOpts(['', '', '', '']);
    setExp('');
    toast('Soal baru berhasil ditambahkan!', 'success');
  }

  return html`
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-3">Tambah Soal Kuis Baru</h3>
        <form onSubmit=${handleAdd} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Topik</label>
              <select value=${topic} onChange=${(e) => setTopic(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white">
                ${state.topologies.map((t) => html`<option key=${t.id} value=${t.id}>${t.name}</option>`)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kesulitan</label>
              <select value=${diff} onChange=${(e) => setDiff(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white">
                <option value="mudah">Mudah</option>
                <option value="sedang">Sedang</option>
                <option value="sulit">Sulit</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Pertanyaan</label>
            <textarea required value=${question} onChange=${(e) => setQuestion(e.target.value)} className="w-full p-2.5 text-sm border border-slate-300 rounded-xl min-h-[76px]" />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            ${['A', 'B', 'C', 'D'].map((lbl, idx) => html`
              <input key=${lbl} required placeholder=${`Opsi ${lbl}`} value=${opts[idx]}
                onChange=${(e) => {
                  const next = [...opts];
                  next[idx] = e.target.value;
                  setOpts(next);
                }}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl" />
            `)}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kunci Jawaban</label>
              <select value=${ans} onChange=${(e) => setAns(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white">
                <option value="0">Opsi A</option>
                <option value="1">Opsi B</option>
                <option value="2">Opsi C</option>
                <option value="3">Opsi D</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Pembahasan</label>
              <input required value=${exp} onChange=${(e) => setExp(e.target.value)} placeholder="Alasan singkat..." className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl" />
            </div>
          </div>
          <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm">+ Tambah ke Bank Soal</button>
        </form>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-3">Daftar Bank Soal (${state.questions.length})</h3>
        <div className="max-h-[520px] overflow-y-auto space-y-2.5 pr-1">
          ${state.questions.map((q) => html`
            <div key=${q.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm">
              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">${q.topic.toUpperCase()}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">${q.difficulty}</span>
                </div>
                <button type="button" onClick=${() => { store.deleteQuestion(q.id); toast('Soal dihapus.'); }} className="text-xs font-semibold text-rose-600 hover:underline">Hapus</button>
              </div>
              <p className="font-semibold text-slate-800 mt-1.5">${q.question}</p>
              <span className="text-xs text-slate-500">Kunci: ${q.options[q.answerIndex]}</span>
            </div>
          `)}
        </div>
      </div>
    </div>
  `;
}

function TeacherMateriTab({ state, toast }) {
  const [edits, setEdits] = useState({});

  return html`
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
        <h3 className="text-base font-bold text-slate-900">Edit Ringkasan Materi Topologi</h3>
        ${state.topologies.map((t) => {
          const val = edits[t.id] ?? t.pengertian;
          return html`
            <div key=${t.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <strong className="text-sm text-slate-900">${t.name}</strong>
              <textarea value=${val} onChange=${(e) => setEdits({ ...edits, [t.id]: e.target.value })}
                className="w-full p-2 text-xs border border-slate-300 rounded-lg mt-1.5 min-h-[68px]" />
              <button type="button" onClick=${() => {
                store.updateTopologyMaterial(t.id, { pengertian: val });
                toast('Materi berhasil diperbarui!', 'success');
              }} className="mt-1.5 px-3 py-1 rounded-lg border border-slate-300 bg-white text-xs font-semibold hover:bg-slate-100">
                Simpan Perubahan
              </button>
            </div>
          `;
        })}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
        <h3 className="text-base font-bold text-slate-900">Daftar Tugas Proyek GPL (${state.gplProjects.length})</h3>
        ${state.gplProjects.map((p) => html`
          <div key=${p.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm">
            <div className="flex items-center justify-between gap-2">
              <strong>${p.title}</strong>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">+${p.xpReward} XP</span>
            </div>
            <p className="text-xs text-slate-600 mt-1.5">${p.scenario}</p>
          </div>
        `)}
      </div>
    </div>
  `;
}

// ============================================================================
// PANEL ADMIN (+ PENGATURAN SUPABASE POSTGRESQL)
// ============================================================================
export function AdminDashboard({ state, toast }) {
  const currentUser = store.getCurrentUser();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('123');
  const [role, setRole] = useState('siswa');
  const [kelas, setKelas] = useState('X TKJ 1');

  const [kkm, setKkm] = useState(state.settings.kkm);
  const [xpRead, setXpRead] = useState(state.settings.xpRules.readMaterial);
  const [xpSimMat, setXpSimMat] = useState(state.settings.xpRules.runMaterialSim);
  const [xpSimPass, setXpSimPass] = useState(state.settings.xpRules.simulatorPass);
  const [xpQCorrect, setXpQCorrect] = useState(state.settings.xpRules.quizCorrect);
  const [xpQPass, setXpQPass] = useState(state.settings.xpRules.quizPassBonus);

  const initialSb = getSupabaseConfig();
  const [sbUrl, setSbUrl] = useState(initialSb.url);
  const [sbKey, setSbKey] = useState(initialSb.anonKey);
  const [sbMsg, setSbMsg] = useState('');
  const [testingSb, setTestingSb] = useState(false);

  function handleAddUser(e) {
    e.preventDefault();
    const res = store.adminSaveUser({ name, username, password, role, kelas });
    if (!res.ok) {
      toast(res.message, 'error');
      return;
    }
    setName('');
    setUsername('');
    toast('Akun pengguna baru berhasil ditambahkan!', 'success');
  }

  function handleSaveSettings(e) {
    e.preventDefault();
    store.updateSystemSettings({
      kkm: Number(kkm),
      xpRules: {
        readMaterial: Number(xpRead),
        runMaterialSim: Number(xpSimMat),
        simulatorPass: Number(xpSimPass),
        quizCorrect: Number(xpQCorrect),
        quizPassBonus: Number(xpQPass)
      }
    });
    toast('Pengaturan sistem KKM & XP berhasil disimpan!', 'success');
  }

  async function handleConnectSupabase(e) {
    e.preventDefault();
    setTestingSb(true);
    saveSupabaseConfig(sbUrl, sbKey);
    const res = await testSupabaseConnection();
    setSbMsg(res.message);
    if (res.ok) {
      await store.initSupabase();
      toast('Terhubung & tersinkronisasi dengan Supabase!', 'success');
    } else {
      toast(res.message, 'error');
    }
    setTestingSb(false);
  }

  return html`
    <div className="space-y-5">
      <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_1fr] gap-5 items-start">
        <!-- Manajemen Akun -->
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">👥 Manajemen Akun Pengguna</h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700">${state.users.length} Akun</span>
          </div>

          <form onSubmit=${handleAddUser} className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-4">
            <strong className="text-xs text-slate-700 block mb-2.5">Tambah Akun Baru (Siswa / Guru / Admin)</strong>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input required value=${name} onChange=${(e) => setName(e.target.value)} placeholder="Nama Lengkap" className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl" />
              <input required value=${username} onChange=${(e) => setUsername(e.target.value)} placeholder="Username" className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl" />
              <input required value=${password} onChange=${(e) => setPassword(e.target.value)} placeholder="Password" className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl" />
              <select value=${role} onChange=${(e) => setRole(e.target.value)} className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl">
                <option value="siswa">Siswa</option>
                <option value="guru">Guru</option>
                <option value="admin">Admin</option>
              </select>
              <input value=${kelas} onChange=${(e) => setKelas(e.target.value)} placeholder="Kelas (mis. X TKJ 1)" className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl" />
              <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm">+ Tambah Akun</button>
            </div>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase">
                  <th className="py-2.5 px-2.5 border-b">Nama</th>
                  <th className="py-2.5 px-2.5 border-b">Username</th>
                  <th className="py-2.5 px-2.5 border-b">Peran</th>
                  <th className="py-2.5 px-2.5 border-b">Kelas</th>
                  <th className="py-2.5 px-2.5 border-b text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                ${state.users.map((u) => html`
                  <tr key=${u.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2.5 px-2.5 font-semibold text-slate-900">${u.name}</td>
                    <td className="py-2.5 px-2.5"><code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">${u.username}</code></td>
                    <td className="py-2.5 px-2.5"><span className="px-2 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800">${u.role.toUpperCase()}</span></td>
                    <td className="py-2.5 px-2.5 text-xs text-slate-600">${u.kelas}</td>
                    <td className="py-2.5 px-2.5 text-right">
                      <button type="button" disabled=${u.id === currentUser.id}
                        onClick=${() => { store.adminDeleteUser(u.id); toast('Akun dihapus.'); }}
                        className="text-xs font-semibold text-rose-600 hover:underline disabled:opacity-40">
                        Hapus
                      </button>
                    </td>
                  </tr>
                `)}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pengaturan Sistem & Supabase -->
        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900">🗄️ Koneksi Database Supabase</h3>
              <span className=${`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                store.supabaseStatus === 'connected' ? 'bg-emerald-100 text-emerald-700' :
                store.supabaseStatus === 'error' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
              }`}>
                ${store.supabaseStatus === 'connected' ? 'Terhubung' : store.supabaseStatus === 'error' ? 'Error' : 'Mode Demo Lokal'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Jalankan skrip <code className="bg-slate-100 px-1 py-0.5 rounded">supabase/schema.sql</code> di Supabase SQL Editor, lalu masukkan Project URL dan Anon Public Key di bawah ini.
            </p>
            <form onSubmit=${handleConnectSupabase} className="space-y-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Supabase Project URL</label>
                <input value=${sbUrl} onChange=${(e) => setSbUrl(e.target.value)} placeholder="https://xxxxx.supabase.co" className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Supabase Anon Key</label>
                <input type="password" value=${sbKey} onChange=${(e) => setSbKey(e.target.value)} placeholder="eyJhbGciOi..." className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl" />
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="submit" disabled=${testingSb} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs">
                  ${testingSb ? 'Menguji Koneksi...' : '🔗 Simpan & Sinkronkan Supabase'}
                </button>
                <button type="button" onClick=${() => {
                  saveSupabaseConfig('', '');
                  setSbUrl('');
                  setSbKey('');
                  store.initSupabase();
                  setSbMsg('Kembali ke mode penyimpanan lokal.');
                }} className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold hover:bg-slate-50">
                  Putuskan
                </button>
              </div>
              ${sbMsg && html`<p className="text-xs text-slate-600 mt-1">${sbMsg}</p>`}
            </form>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-3">⚙️ Pengaturan KKM & Aturan XP</h3>
            <form onSubmit=${handleSaveSettings} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Batas KKM (0–100)</label>
                <input type="number" min="50" max="100" value=${kkm} onChange=${(e) => setKkm(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">XP Baca Materi</label>
                  <input type="number" value=${xpRead} onChange=${(e) => setXpRead(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">XP Simulasi Materi</label>
                  <input type="number" value=${xpSimMat} onChange=${(e) => setXpSimMat(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">XP Validasi Simulator</label>
                  <input type="number" value=${xpSimPass} onChange=${(e) => setXpSimPass(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">XP/Soal Benar</label>
                  <input type="number" value=${xpQCorrect} onChange=${(e) => setXpQCorrect(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bonus XP Lulus Kuis</label>
                  <input type="number" value=${xpQPass} onChange=${(e) => setXpQPass(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl" />
                </div>
              </div>
              <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm">💾 Simpan Pengaturan</button>
            </form>

            <hr className="my-4 border-slate-200" />
            <h4 className="text-xs font-bold text-slate-700 mb-2">Daftar Lencana Sistem (${state.badges.length})</h4>
            <div className="flex flex-wrap gap-1.5 mb-4">
              ${state.badges.map((b) => html`<span key=${b.id} className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900">${b.icon} ${b.name} (+${b.xpBonus} XP)</span>`)}
            </div>
            <button type="button" onClick=${() => { store.resetDemoData(); toast('Seluruh data dikembalikan ke kondisi demo awal.', 'warning'); }}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs">
              ↺ Reset Seluruh Data Demo ke Awal
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

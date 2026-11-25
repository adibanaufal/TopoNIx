/**
 * js/store.js
 * State Management (React-reactive + localStorage + Supabase PostgreSQL Sync)
 * untuk TopoNix SMKN 1 Bojonegoro.
 */

import {
  INITIAL_SETTINGS,
  BADGE_DEFINITIONS,
  INITIAL_TOPOLOGIES,
  INITIAL_QUIZ_QUESTIONS,
  INITIAL_GPL_PROJECTS,
  INITIAL_USERS,
  INITIAL_QUIZ_RESULTS,
  INITIAL_GPL_SUBMISSIONS,
  INITIAL_FEEDBACKS
} from './data.js';
import {
  getSupabaseClient,
  isSupabaseConfigured,
  syncWithSupabase,
  seedSupabaseFromState,
  profileToRow,
  topologyToRow,
  questionToRow,
  quizResultToRow,
  submissionToRow,
  feedbackToRow
} from './supabaseClient.js';

const STORAGE_KEY = 'toponix_smkn1bjn_v1';

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function nowFormatted() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function createInitialState() {
  return {
    settings: deepClone(INITIAL_SETTINGS),
    badges: deepClone(BADGE_DEFINITIONS),
    topologies: deepClone(INITIAL_TOPOLOGIES),
    questions: deepClone(INITIAL_QUIZ_QUESTIONS),
    gplProjects: deepClone(INITIAL_GPL_PROJECTS),
    users: deepClone(INITIAL_USERS),
    quizResults: deepClone(INITIAL_QUIZ_RESULTS),
    gplSubmissions: deepClone(INITIAL_GPL_SUBMISSIONS),
    feedbacks: deepClone(INITIAL_FEEDBACKS),
    currentUserId: null
  };
}

class TopoStore {
  constructor() {
    this.state = this.load();
    this.listeners = new Set();
    this.supabaseStatus = isSupabaseConfigured() ? 'connecting' : 'local';
    this.supabaseError = '';
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return createInitialState();
      const parsed = JSON.parse(raw);
      return { ...createInitialState(), ...parsed };
    } catch {
      return createInitialState();
    }
  }

  notify() {
    this.listeners.forEach((fn) => fn({ ...this.state, _tick: Date.now() }));
  }

  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    this.notify();
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  async initSupabase() {
    if (!isSupabaseConfigured()) {
      this.supabaseStatus = 'local';
      this.supabaseError = '';
      this.notify();
      return;
    }
    this.supabaseStatus = 'connecting';
    this.notify();
    try {
      const res = await syncWithSupabase(this.state);
      if (res.synced) {
        if (res.state) {
          this.state = res.state;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        }
        this.supabaseStatus = 'connected';
        this.supabaseError = '';
      } else {
        this.supabaseStatus = 'error';
        this.supabaseError = res.error || 'Gagal terhubung ke Supabase';
      }
    } catch (err) {
      this.supabaseStatus = 'error';
      this.supabaseError = err.message || 'Gagal sinkronisasi Supabase';
    }
    this.notify();
  }

  async pushToSupabase(task) {
    const sb = getSupabaseClient();
    if (!sb) return;
    try {
      await task(sb);
      this.supabaseStatus = 'connected';
      this.supabaseError = '';
    } catch (err) {
      this.supabaseStatus = 'error';
      this.supabaseError = err.message || 'Gagal menulis ke Supabase';
      this.notify();
    }
  }

  resetDemoData() {
    const fresh = createInitialState();
    fresh.currentUserId = this.state.currentUserId;
    if (!fresh.users.some((u) => u.id === fresh.currentUserId)) {
      fresh.currentUserId = null;
    }
    this.state = fresh;
    this.save();
    this.pushToSupabase((sb) => seedSupabaseFromState(sb, fresh));
  }

  // ---------- Auth ----------
  getCurrentUser() {
    return this.state.users.find((u) => u.id === this.state.currentUserId) || null;
  }

  login(username, password) {
    const user = this.state.users.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
    );
    if (!user) return { ok: false, message: 'Username atau kata sandi salah.' };
    this.state.currentUserId = user.id;
    this.save();
    return { ok: true, user };
  }

  loginAsId(userId) {
    const user = this.state.users.find((u) => u.id === userId);
    if (!user) return false;
    this.state.currentUserId = user.id;
    this.save();
    return true;
  }

  registerStudent({ name, username, password, kelas }) {
    const cleanUser = username.trim().toLowerCase();
    if (!name.trim() || !cleanUser || !password) {
      return { ok: false, message: 'Semua field wajib diisi.' };
    }
    if (this.state.users.some((u) => u.username.toLowerCase() === cleanUser)) {
      return { ok: false, message: 'Username sudah terdaftar.' };
    }
    const newUser = {
      id: 'u-' + Date.now(),
      username: cleanUser,
      password,
      name: name.trim(),
      role: 'siswa',
      kelas: kelas || 'X TKJ 1',
      xp: 0,
      hideOnLeaderboard: false,
      readMaterials: [],
      simulatedMaterials: [],
      validatedTopologies: [],
      testedFaultSim: false,
      unlockedBadges: [],
      xpHistory: []
    };
    this.state.users.push(newUser);
    this.state.currentUserId = newUser.id;
    this.save();
    this.pushToSupabase((sb) => sb.from('profiles').upsert(profileToRow(newUser)));
    return { ok: true, user: newUser };
  }

  logout() {
    this.state.currentUserId = null;
    this.save();
  }

  // ---------- Level & Gamification ----------
  getLevelInfo(xp) {
    const levels = [...this.state.settings.levels].sort((a, b) => a.minXp - b.minXp);
    let current = levels[0];
    let next = null;
    for (let i = 0; i < levels.length; i++) {
      if (xp >= levels[i].minXp) {
        current = levels[i];
        next = levels[i + 1] || null;
      }
    }
    const progressPct = next
      ? Math.min(100, Math.round(((xp - current.minXp) / (next.minXp - current.minXp)) * 100))
      : 100;
    return { current, next, progressPct };
  }

  awardXp(userId, amount, source) {
    if (!amount || amount <= 0) return { leveledUp: false };
    const user = this.state.users.find((u) => u.id === userId);
    if (!user || user.role !== 'siswa') return { leveledUp: false };

    const beforeLv = this.getLevelInfo(user.xp).current.level;
    user.xp += amount;
    user.xpHistory.unshift({
      id: 'xh-' + Date.now() + Math.random().toString(16).slice(2, 6),
      date: nowFormatted(),
      source,
      xp: amount
    });
    const afterLv = this.getLevelInfo(user.xp).current;
    this.save();
    this.pushToSupabase((sb) => sb.from('profiles').upsert(profileToRow(user)));
    return { leveledUp: afterLv.level > beforeLv, newLevel: afterLv };
  }

  unlockBadge(userId, badgeId) {
    const user = this.state.users.find((u) => u.id === userId);
    const badge = this.state.badges.find((b) => b.id === badgeId);
    if (!user || !badge || user.role !== 'siswa') return null;
    if (user.unlockedBadges.includes(badgeId)) return null;

    user.unlockedBadges.push(badgeId);
    if (badge.xpBonus > 0) {
      user.xp += badge.xpBonus;
      user.xpHistory.unshift({
        id: 'xh-' + Date.now() + Math.random().toString(16).slice(2, 6),
        date: nowFormatted(),
        source: `Lencana "${badge.name}"`,
        xp: badge.xpBonus
      });
    }
    this.save();
    this.pushToSupabase((sb) => sb.from('profiles').upsert(profileToRow(user)));
    return badge;
  }

  // ---------- Student Learning Actions ----------
  markMaterialRead(userId, topicId) {
    const user = this.state.users.find((u) => u.id === userId);
    if (!user || user.role !== 'siswa') return { newlyRead: false };
    if (user.readMaterials.includes(topicId)) return { newlyRead: false };

    user.readMaterials.push(topicId);
    const topo = this.state.topologies.find((t) => t.id === topicId);
    const xpResult = this.awardXp(
      userId,
      this.state.settings.xpRules.readMaterial,
      `Membaca Materi ${topo ? topo.name : topicId}`
    );

    let unlocked = null;
    if (this.state.topologies.every((t) => user.readMaterials.includes(t.id))) {
      unlocked = this.unlockBadge(userId, 'penjelajah-materi');
    }
    this.save();
    this.pushToSupabase((sb) => sb.from('profiles').upsert(profileToRow(user)));
    return { newlyRead: true, xpResult, unlocked };
  }

  markMaterialSimulated(userId, topicId, isFaultTest = false) {
    const user = this.state.users.find((u) => u.id === userId);
    if (!user || user.role !== 'siswa') return { newlySim: false };

    let newlySim = false;
    if (!user.simulatedMaterials.includes(topicId)) {
      user.simulatedMaterials.push(topicId);
      const topo = this.state.topologies.find((t) => t.id === topicId);
      this.awardXp(
        userId,
        this.state.settings.xpRules.runMaterialSim,
        `Simulasi Alur Data ${topo ? topo.name : topicId}`
      );
      newlySim = true;
    }

    let badge = null;
    if (isFaultTest && !user.testedFaultSim) {
      user.testedFaultSim = true;
      badge = this.unlockBadge(userId, 'detektif-kerusakan');
    }
    this.save();
    this.pushToSupabase((sb) => sb.from('profiles').upsert(profileToRow(user)));
    return { newlySim, badge };
  }

  recordSimulatorValidation(userId, topologyId, testedFault = false) {
    const user = this.state.users.find((u) => u.id === userId);
    if (!user || user.role !== 'siswa') return { newlyValidated: false, badges: [] };

    const badges = [];
    let newlyValidated = false;
    if (!user.validatedTopologies.includes(topologyId)) {
      user.validatedTopologies.push(topologyId);
      this.awardXp(
        userId,
        this.state.settings.xpRules.simulatorPass,
        `Validasi Simulator Topologi ${topologyId.toUpperCase()}`
      );
      newlyValidated = true;
    }

    if (topologyId === 'star') {
      const b = this.unlockBadge(userId, 'penyusun-star');
      if (b) badges.push(b);
    }
    if (topologyId === 'mesh') {
      const b = this.unlockBadge(userId, 'arsitek-mesh');
      if (b) badges.push(b);
    }
    if (testedFault && !user.testedFaultSim) {
      user.testedFaultSim = true;
      const b = this.unlockBadge(userId, 'detektif-kerusakan');
      if (b) badges.push(b);
    }
    this.save();
    this.pushToSupabase((sb) => sb.from('profiles').upsert(profileToRow(user)));
    return { newlyValidated, badges };
  }

  submitQuizAttempt(userId, topic, difficulty, answers) {
    const kkm = this.state.settings.kkm;
    let correct = 0;
    const details = answers.map((ans) => {
      const q = this.state.questions.find((item) => item.id === ans.questionId);
      const isCorrect = q && ans.selectedIndex === q.answerIndex;
      if (isCorrect) correct++;
      return { question: q, selectedIndex: ans.selectedIndex, isCorrect };
    });

    const total = answers.length || 1;
    const score = Math.round((correct / total) * 100);
    const passed = score >= kkm;

    const record = {
      id: 'qr-' + Date.now(),
      userId,
      topic,
      difficulty,
      score,
      correct,
      total,
      passed,
      date: nowFormatted()
    };
    this.state.quizResults.unshift(record);
    this.pushToSupabase((sb) => sb.from('quiz_results').upsert(quizResultToRow(record)));

    const rules = this.state.settings.xpRules;
    const earnedXp = correct * rules.quizCorrect + (passed ? rules.quizPassBonus : 0);
    if (earnedXp > 0) {
      const topicLabel = topic === 'campuran' ? 'Evaluasi Campuran' : `Topologi ${topic.toUpperCase()}`;
      this.awardXp(userId, earnedXp, `Kuis ${topicLabel} (${difficulty}, Skor ${score})`);
    }

    let badge = null;
    if (score === 100) {
      badge = this.unlockBadge(userId, 'kuis-sempurna');
    }
    this.save();
    return { record, details, earnedXp, badge };
  }

  submitGplProject(userId, projectId, { graph, notes, validationSummary }) {
    const project = this.state.gplProjects.find((p) => p.id === projectId);
    if (!project) return null;

    const existingIdx = this.state.gplSubmissions.findIndex(
      (s) => s.userId === userId && s.projectId === projectId
    );
    const isFirstComplete = existingIdx === -1;

    const submission = {
      id: existingIdx !== -1 ? this.state.gplSubmissions[existingIdx].id : 'sub-' + Date.now(),
      projectId,
      userId,
      submittedAt: nowFormatted(),
      notes: notes.trim(),
      graph: deepClone(graph),
      validationSummary,
      status: 'submitted',
      teacherScore: null,
      teacherComment: ''
    };

    if (existingIdx !== -1) {
      this.state.gplSubmissions[existingIdx] = submission;
    } else {
      this.state.gplSubmissions.unshift(submission);
    }
    this.pushToSupabase((sb) => sb.from('gpl_submissions').upsert(submissionToRow(submission)));

    let badge = null;
    if (isFirstComplete) {
      this.awardXp(userId, project.xpReward, `Menyelesaikan ${project.title}`);
      if (project.badgeUnlock) {
        badge = this.unlockBadge(userId, project.badgeUnlock);
      }
      const completedProjectIds = new Set(
        this.state.gplSubmissions.filter((s) => s.userId === userId).map((s) => s.projectId)
      );
      if (this.state.gplProjects.every((p) => completedProjectIds.has(p.id))) {
        const juara = this.unlockBadge(userId, 'juara-gpl');
        if (juara) badge = juara;
      }
    }

    this.save();
    return { submission, isFirstComplete, xpAwarded: isFirstComplete ? project.xpReward : 0, badge };
  }

  toggleLeaderboardPrivacy(userId) {
    const user = this.state.users.find((u) => u.id === userId);
    if (!user) return;
    user.hideOnLeaderboard = !user.hideOnLeaderboard;
    this.save();
    this.pushToSupabase((sb) => sb.from('profiles').upsert(profileToRow(user)));
  }

  // ---------- Rule-Based Adaptive Learning Engine ----------
  getAdaptiveProfile(userId) {
    const user = this.state.users.find((u) => u.id === userId);
    const kkm = this.state.settings.kkm;
    if (!user) return null;

    const userQuizzes = this.state.quizResults.filter((q) => q.userId === userId);

    const topicStatuses = this.state.topologies.map((topo) => {
      const read = user.readMaterials.includes(topo.id);
      const simDone = user.validatedTopologies.includes(topo.id);
      const attempts = userQuizzes.filter((q) => q.topic === topo.id);
      const latestQuiz = attempts[0] || null;
      const bestScore = attempts.length ? Math.max(...attempts.map((a) => a.score)) : null;

      let status = 'belum';
      let recommendedDifficulty = 'mudah';
      let recommendationText = `Pelajari materi ${topo.name} dan uji di simulator.`;

      if (latestQuiz) {
        if (latestQuiz.score < kkm) {
          status = 'perlu_penguatan';
          recommendedDifficulty = 'mudah';
          recommendationText = `Skor terakhir ${latestQuiz.score} (< KKM ${kkm}). Ulangi materi ${topo.name}, coba simulasi putus kabel, lalu kerjakan kuis tingkat Mudah.`;
        } else if (latestQuiz.score < 90) {
          status = 'menguasai';
          recommendedDifficulty = 'sedang';
          recommendationText = `Sudah lulus KKM (${latestQuiz.score}). Siap naik ke soal tingkat Sedang & proyek GPL ${topo.name}.`;
        } else {
          status = 'mahir';
          recommendedDifficulty = 'sulit';
          recommendationText = `Penguasaan sangat baik (${latestQuiz.score})! Coba tantangan kuis tingkat Sulit (HOTS).`;
        }
      } else if (read && simDone) {
        recommendedDifficulty = 'sedang';
        recommendationText = `Materi & simulator selesai! Uji pemahaman dengan kuis ${topo.name} tingkat Sedang.`;
      } else if (read) {
        recommendedDifficulty = 'mudah';
        recommendationText = `Materi sudah dibaca. Lanjutkan praktik menyusun ${topo.name} di Network Simulator.`;
      }

      return {
        topicId: topo.id,
        topicName: topo.name,
        read,
        simDone,
        attemptsCount: attempts.length,
        latestScore: latestQuiz ? latestQuiz.score : null,
        bestScore,
        status,
        recommendedDifficulty,
        recommendationText
      };
    });

    const needsReinforcement = topicStatuses.find((t) => t.status === 'perlu_penguatan');
    const unread = topicStatuses.find((t) => !t.read);
    const unquizzed = topicStatuses.find((t) => t.latestScore === null);
    const nextChallenge = topicStatuses.find((t) => t.status === 'menguasai');

    let primaryAction = {
      type: 'gpl',
      label: 'Lanjutkan Proyek GPL',
      detail: 'Seluruh topik dasar tercapai! Tantang dirimu pada misi Gamified Project Learning berikutnya.',
      topicId: 'tree',
      difficulty: 'sulit'
    };

    if (needsReinforcement) {
      primaryAction = {
        type: 'remedial',
        label: `Penguatan ${needsReinforcement.topicName}`,
        detail: needsReinforcement.recommendationText,
        topicId: needsReinforcement.topicId,
        difficulty: 'mudah'
      };
    } else if (unread) {
      primaryAction = {
        type: 'materi',
        label: `Pelajari ${unread.topicName}`,
        detail: unread.recommendationText,
        topicId: unread.topicId,
        difficulty: 'mudah'
      };
    } else if (unquizzed) {
      primaryAction = {
        type: 'kuis',
        label: `Ambil Kuis ${unquizzed.topicName}`,
        detail: unquizzed.recommendationText,
        topicId: unquizzed.topicId,
        difficulty: unquizzed.recommendedDifficulty
      };
    } else if (nextChallenge) {
      primaryAction = {
        type: 'kuis',
        label: `Tantangan Lanjut ${nextChallenge.topicName}`,
        detail: nextChallenge.recommendationText,
        topicId: nextChallenge.topicId,
        difficulty: 'sulit'
      };
    }

    return { topicStatuses, primaryAction };
  }

  // ---------- Teacher Feedback ----------
  getFeedbacksForStudent(user) {
    return this.state.feedbacks.filter(
      (f) =>
        f.targetType === 'all' ||
        (f.targetType === 'class' && f.targetValue === user.kelas) ||
        (f.targetType === 'student' && f.targetValue === user.id)
    );
  }

  markFeedbackRead(feedbackId, userId) {
    const fb = this.state.feedbacks.find((f) => f.id === feedbackId);
    if (fb && !fb.readBy.includes(userId)) {
      fb.readBy.push(userId);
      this.save();
      this.pushToSupabase((sb) => sb.from('feedbacks').upsert(feedbackToRow(fb)));
    }
  }

  addFeedback({ fromName, targetType, targetValue, title, message }) {
    const fb = {
      id: 'fb-' + Date.now(),
      fromName,
      targetType,
      targetValue,
      title: title.trim(),
      message: message.trim(),
      date: nowFormatted(),
      readBy: []
    };
    this.state.feedbacks.unshift(fb);
    this.save();
    this.pushToSupabase((sb) => sb.from('feedbacks').upsert(feedbackToRow(fb)));
  }

  gradeGplSubmission(submissionId, score, comment) {
    const sub = this.state.gplSubmissions.find((s) => s.id === submissionId);
    if (!sub) return;
    sub.status = 'reviewed';
    sub.teacherScore = Number(score);
    sub.teacherComment = comment.trim();
    this.pushToSupabase((sb) => sb.from('gpl_submissions').upsert(submissionToRow(sub)));

    const proj = this.state.gplProjects.find((p) => p.id === sub.projectId);
    const teacher = this.getCurrentUser();
    this.addFeedback({
      fromName: teacher ? teacher.name : 'Guru Informatika',
      targetType: 'student',
      targetValue: sub.userId,
      title: `Penilaian Proyek: ${proj ? proj.title : sub.projectId}`,
      message: `Nilai: ${sub.teacherScore}/100. Catatan Guru: ${sub.teacherComment || 'Sudah diperiksa.'}`
    });
    this.save();
  }

  // ---------- Guru & Admin CRUD ----------
  updateTopologyMaterial(topicId, updates) {
    const t = this.state.topologies.find((x) => x.id === topicId);
    if (!t) return;
    Object.assign(t, updates);
    this.save();
    this.pushToSupabase((sb) => sb.from('topologies').upsert(topologyToRow(t)));
  }

  addOrUpdateQuestion(qData) {
    let saved = qData;
    if (qData.id) {
      const idx = this.state.questions.findIndex((q) => q.id === qData.id);
      if (idx !== -1) {
        this.state.questions[idx] = { ...this.state.questions[idx], ...qData };
        saved = this.state.questions[idx];
        this.save();
        this.pushToSupabase((sb) => sb.from('quiz_questions').upsert(questionToRow(saved)));
        return;
      }
    }
    saved = { ...qData, id: 'q-' + Date.now() };
    this.state.questions.unshift(saved);
    this.save();
    this.pushToSupabase((sb) => sb.from('quiz_questions').upsert(questionToRow(saved)));
  }

  deleteQuestion(questionId) {
    this.state.questions = this.state.questions.filter((q) => q.id !== questionId);
    this.save();
    this.pushToSupabase((sb) => sb.from('quiz_questions').delete().eq('id', questionId));
  }

  adminSaveUser(userData) {
    const exists = this.state.users.some(
      (u) => u.username.toLowerCase() === userData.username.trim().toLowerCase()
    );
    if (exists) return { ok: false, message: 'Username sudah dipakai.' };
    const newUser = {
      id: 'u-' + Date.now(),
      username: userData.username.trim().toLowerCase(),
      password: userData.password || '123',
      name: userData.name.trim(),
      role: userData.role || 'siswa',
      kelas: userData.kelas || 'X TKJ 1',
      xp: 0,
      hideOnLeaderboard: false,
      readMaterials: [],
      simulatedMaterials: [],
      validatedTopologies: [],
      testedFaultSim: false,
      unlockedBadges: [],
      xpHistory: []
    };
    this.state.users.push(newUser);
    this.save();
    this.pushToSupabase((sb) => sb.from('profiles').upsert(profileToRow(newUser)));
    return { ok: true };
  }

  adminDeleteUser(userId) {
    if (userId === this.state.currentUserId) return false;
    this.state.users = this.state.users.filter((u) => u.id !== userId);
    this.save();
    this.pushToSupabase((sb) => sb.from('profiles').delete().eq('id', userId));
    return true;
  }

  updateSystemSettings(newSettings) {
    this.state.settings = {
      ...this.state.settings,
      ...newSettings,
      xpRules: {
        ...this.state.settings.xpRules,
        ...(newSettings.xpRules || {})
      }
    };
    this.save();
    this.pushToSupabase((sb) =>
      sb.from('system_settings').upsert({
        id: 'default',
        school_name: this.state.settings.schoolName,
        subject_name: this.state.settings.subjectName,
        kkm: this.state.settings.kkm,
        xp_rules: this.state.settings.xpRules,
        levels: this.state.settings.levels
      })
    );
  }
}

export const store = new TopoStore();

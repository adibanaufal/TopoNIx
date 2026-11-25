/**
 * js/supabaseClient.js
 * Klien resmi @supabase/supabase-js (ESM) dan sinkronisasi database PostgreSQL Supabase.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getSupabaseConfig } from './config.js';

let clientInstance = null;
let lastUrl = '';
let lastKey = '';

export function getSupabaseClient() {
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey) {
    clientInstance = null;
    lastUrl = '';
    lastKey = '';
    return null;
  }
  if (!clientInstance || url !== lastUrl || anonKey !== lastKey) {
    clientInstance = createClient(url, anonKey);
    lastUrl = url;
    lastKey = anonKey;
  }
  return clientInstance;
}

export function isSupabaseConfigured() {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(url && anonKey);
}

// Mapping helpers camelCase <-> snake_case
export function profileToRow(u) {
  return {
    id: u.id,
    username: u.username,
    password: u.password,
    name: u.name,
    role: u.role,
    kelas: u.kelas,
    xp: u.xp || 0,
    hide_on_leaderboard: Boolean(u.hideOnLeaderboard),
    read_materials: u.readMaterials || [],
    simulated_materials: u.simulatedMaterials || [],
    validated_topologies: u.validatedTopologies || [],
    tested_fault_sim: Boolean(u.testedFaultSim),
    unlocked_badges: u.unlockedBadges || [],
    xp_history: u.xpHistory || []
  };
}

export function rowToProfile(r) {
  return {
    id: r.id,
    username: r.username,
    password: r.password,
    name: r.name,
    role: r.role,
    kelas: r.kelas,
    xp: r.xp ?? 0,
    hideOnLeaderboard: Boolean(r.hide_on_leaderboard),
    readMaterials: r.read_materials || [],
    simulatedMaterials: r.simulated_materials || [],
    validatedTopologies: r.validated_topologies || [],
    testedFaultSim: Boolean(r.tested_fault_sim),
    unlockedBadges: r.unlocked_badges || [],
    xpHistory: r.xp_history || []
  };
}

export function topologyToRow(t) {
  return {
    id: t.id,
    name: t.name,
    tagline: t.tagline,
    cable_type: t.cableType,
    pengertian: t.pengertian,
    cara_kerja: t.caraKerja,
    kelebihan: t.kelebihan || [],
    kekurangan: t.kekurangan || [],
    contoh_penerapan: t.contohPenerapan,
    preset_graph: t.presetGraph || { nodes: [], links: [] }
  };
}

export function rowToTopology(r) {
  return {
    id: r.id,
    name: r.name,
    tagline: r.tagline,
    cableType: r.cable_type,
    pengertian: r.pengertian,
    caraKerja: r.cara_kerja,
    kelebihan: r.kelebihan || [],
    kekurangan: r.kekurangan || [],
    contohPenerapan: r.contoh_penerapan,
    presetGraph: r.preset_graph || { nodes: [], links: [] }
  };
}

export function questionToRow(q) {
  return {
    id: q.id,
    topic: q.topic,
    difficulty: q.difficulty,
    question: q.question,
    options: q.options || [],
    answer_index: q.answerIndex,
    explanation: q.explanation
  };
}

export function rowToQuestion(r) {
  return {
    id: r.id,
    topic: r.topic,
    difficulty: r.difficulty,
    question: r.question,
    options: r.options || [],
    answerIndex: r.answer_index,
    explanation: r.explanation
  };
}

export function projectToRow(p) {
  return {
    id: p.id,
    stage: p.stage,
    title: p.title,
    scenario: p.scenario,
    target_topology: p.targetTopology,
    min_devices: p.minDevices || {},
    xp_reward: p.xpReward,
    badge_unlock: p.badgeUnlock || null,
    deliverables: p.deliverables || []
  };
}

export function rowToProject(r) {
  return {
    id: r.id,
    stage: r.stage,
    title: r.title,
    scenario: r.scenario,
    targetTopology: r.target_topology,
    minDevices: r.min_devices || {},
    xpReward: r.xp_reward,
    badgeUnlock: r.badge_unlock || null,
    deliverables: r.deliverables || []
  };
}

export function quizResultToRow(qr) {
  return {
    id: qr.id,
    user_id: qr.userId,
    topic: qr.topic,
    difficulty: qr.difficulty,
    score: qr.score,
    correct: qr.correct,
    total: qr.total,
    passed: Boolean(qr.passed),
    date: qr.date
  };
}

export function rowToQuizResult(r) {
  return {
    id: r.id,
    userId: r.user_id,
    topic: r.topic,
    difficulty: r.difficulty,
    score: r.score,
    correct: r.correct,
    total: r.total,
    passed: Boolean(r.passed),
    date: r.date
  };
}

export function submissionToRow(s) {
  return {
    id: s.id,
    project_id: s.projectId,
    user_id: s.userId,
    submitted_at: s.submittedAt,
    notes: s.notes,
    graph: s.graph,
    validation_summary: s.validationSummary,
    status: s.status,
    teacher_score: s.teacherScore,
    teacher_comment: s.teacherComment || ''
  };
}

export function rowToSubmission(r) {
  return {
    id: r.id,
    projectId: r.project_id,
    userId: r.user_id,
    submittedAt: r.submitted_at,
    notes: r.notes,
    graph: r.graph,
    validationSummary: r.validation_summary,
    status: r.status,
    teacherScore: r.teacher_score,
    teacherComment: r.teacher_comment || ''
  };
}

export function feedbackToRow(f) {
  return {
    id: f.id,
    from_name: f.fromName,
    target_type: f.targetType,
    target_value: f.targetValue,
    title: f.title,
    message: f.message,
    date: f.date,
    read_by: f.readBy || []
  };
}

export function rowToFeedback(r) {
  return {
    id: r.id,
    fromName: r.from_name,
    targetType: r.target_type,
    targetValue: r.target_value,
    title: r.title,
    message: r.message,
    date: r.date,
    readBy: r.read_by || []
  };
}

export async function testSupabaseConnection() {
  const sb = getSupabaseClient();
  if (!sb) return { ok: false, message: 'URL atau Anon Key Supabase belum diisi.' };
  const { error } = await sb.from('system_settings').select('id').limit(1);
  if (error) {
    return { ok: false, message: `Koneksi gagal: ${error.message}` };
  }
  return { ok: true, message: 'Terhubung ke Supabase PostgreSQL!' };
}

/**
 * Mengunggah seed data lokal ke Supabase apabila tabel masih kosong, atau menarik data dari Supabase.
 */
export async function syncWithSupabase(localState) {
  const sb = getSupabaseClient();
  if (!sb) return { synced: false, reason: 'not_configured' };

  const [
    { data: settingsRows, error: errSet },
    { data: profilesRows, error: errProf },
    { data: topoRows },
    { data: qRows },
    { data: projRows },
    { data: qrRows },
    { data: subRows },
    { data: fbRows }
  ] = await Promise.all([
    sb.from('system_settings').select('*'),
    sb.from('profiles').select('*'),
    sb.from('topologies').select('*'),
    sb.from('quiz_questions').select('*'),
    sb.from('gpl_projects').select('*').order('stage', { ascending: true }),
    sb.from('quiz_results').select('*').order('created_at', { ascending: false }),
    sb.from('gpl_submissions').select('*').order('created_at', { ascending: false }),
    sb.from('feedbacks').select('*').order('created_at', { ascending: false })
  ]);

  if (errSet || errProf) {
    return { synced: false, error: (errSet || errProf).message };
  }

  // If Supabase database is empty, seed initial data automatically
  if (!profilesRows || profilesRows.length === 0) {
    await seedSupabaseFromState(sb, localState);
    return { synced: true, seeded: true };
  }

  const next = { ...localState };
  if (settingsRows && settingsRows.length > 0) {
    const s = settingsRows[0];
    next.settings = {
      schoolName: s.school_name,
      subjectName: s.subject_name,
      kkm: s.kkm,
      xpRules: s.xp_rules,
      levels: s.levels
    };
  }
  next.users = profilesRows.map(rowToProfile);
  if (topoRows && topoRows.length > 0) next.topologies = topoRows.map(rowToTopology);
  if (qRows && qRows.length > 0) next.questions = qRows.map(rowToQuestion);
  if (projRows && projRows.length > 0) next.gplProjects = projRows.map(rowToProject);
  if (qrRows) next.quizResults = qrRows.map(rowToQuizResult);
  if (subRows) next.gplSubmissions = subRows.map(rowToSubmission);
  if (fbRows) next.feedbacks = fbRows.map(rowToFeedback);

  return { synced: true, state: next };
}

export async function seedSupabaseFromState(sb, st) {
  await sb.from('system_settings').upsert({
    id: 'default',
    school_name: st.settings.schoolName,
    subject_name: st.settings.subjectName,
    kkm: st.settings.kkm,
    xp_rules: st.settings.xpRules,
    levels: st.settings.levels
  });
  if (st.users.length) await sb.from('profiles').upsert(st.users.map(profileToRow));
  if (st.topologies.length) await sb.from('topologies').upsert(st.topologies.map(topologyToRow));
  if (st.questions.length) await sb.from('quiz_questions').upsert(st.questions.map(questionToRow));
  if (st.gplProjects.length) await sb.from('gpl_projects').upsert(st.gplProjects.map(projectToRow));
  if (st.quizResults.length) await sb.from('quiz_results').upsert(st.quizResults.map(quizResultToRow));
  if (st.gplSubmissions.length) await sb.from('gpl_submissions').upsert(st.gplSubmissions.map(submissionToRow));
  if (st.feedbacks.length) await sb.from('feedbacks').upsert(st.feedbacks.map(feedbackToRow));
}

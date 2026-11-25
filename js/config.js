/**
 * js/config.js
 * Konfigurasi koneksi Supabase untuk TopoNix SMKN 1 Bojonegoro.
 * Anda dapat mengisi URL & Anon Key di sini atau langsung melalui Panel Admin di UI.
 */

const CONFIG_KEY = 'toponix_supabase_config_v1';

export const DEFAULT_SUPABASE_CONFIG = {
  url: '',
  anonKey: ''
};

export function getSupabaseConfig() {
  try {
    const saved = localStorage.getItem(CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.url && parsed.anonKey) {
        return { url: parsed.url.trim(), anonKey: parsed.anonKey.trim() };
      }
    }
  } catch {
    // ignore
  }
  return { ...DEFAULT_SUPABASE_CONFIG };
}

export function saveSupabaseConfig(url, anonKey) {
  const clean = { url: (url || '').trim(), anonKey: (anonKey || '').trim() };
  if (!clean.url || !clean.anonKey) {
    localStorage.removeItem(CONFIG_KEY);
  } else {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(clean));
  }
  return clean;
}

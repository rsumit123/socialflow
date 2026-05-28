import { handleAuthErrors } from './index';

const BASE = import.meta.env.VITE_BACKEND_URL;

const auth = (token) => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' });

export async function fetchFeed(token, navigate, { category, lang = 'hinglish' } = {}) {
  const url = new URL(`${BASE}/api/roast/feed/`);
  if (category) url.searchParams.set('category', category);
  url.searchParams.set('lang', lang);
  const r = await fetch(url, { headers: auth(token) });
  if (handleAuthErrors(r, navigate)) throw new Error('feed auth');
  return r.json();
}

export async function submitRoast(token, navigate, scenarioId, userReply) {
  const r = await fetch(`${BASE}/api/roast/${scenarioId}/submit/`, {
    method: 'POST', headers: auth(token), body: JSON.stringify({ user_reply: userReply }),
  });
  if (handleAuthErrors(r, navigate)) throw new Error('submit auth');
  return r.json();
}

export async function toggleSave(token, navigate, attemptId) {
  const r = await fetch(`${BASE}/api/roast/attempt/${attemptId}/save/`, {
    method: 'POST', headers: auth(token),
  });
  if (handleAuthErrors(r, navigate)) throw new Error('save auth');
  return r.json();
}

export async function fetchMe(token, navigate) {
  const r = await fetch(`${BASE}/api/roast/me/`, { headers: auth(token) });
  if (handleAuthErrors(r, navigate)) throw new Error('me auth');
  return r.json();
}

export function shareCardUrl(attemptId) {
  return `${BASE}/api/roast/share/${attemptId}.png`;
}

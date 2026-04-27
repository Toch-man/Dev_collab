// lib/api.ts

import { revalidatePath } from "next/cache";

const API = process.env.NEXT_PUBLIC_API_URL;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const get_token = () =>
  typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

const auth_headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${get_token()}`,
});

// cache lives here at module level — survives across page navigations
const cache: Record<string, { data: unknown; timestamp: number }> = {};

const is_fresh = (key: string) =>
  cache[key] && Date.now() - cache[key].timestamp < CACHE_DURATION;

// generic cached fetch — used by all get functions below
const cached_fetch = async (url: string, force = false) => {
  if (!force && is_fresh(url)) return cache[url].data; // return cached instantly

  const res = await fetch(url, {
    headers: auth_headers(),
    credentials: "include",
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);

  const data = await res.json();
  cache[url] = { data, timestamp: Date.now() }; // store in cache
  return data;
};

// invalidate forces a fresh fetch next time
export const invalidate = (url: string) => {
  delete cache[url];
};

// ── projects ──────────────────────────────────────────────────────────────────
export const KEYS = {
  projects: `${API}/api/project`,
  project: (id: string) => `${API}/api/project/${id}`,
};

export const get_projects = (force = false) =>
  cached_fetch(KEYS.projects, force);

export const get_project = (id: string, force = false) =>
  cached_fetch(KEYS.project(id), force);

export const create_project = async (body: {
  project_name: string;
  description: string;
  techStack: string[];
  isPublic: boolean;
}) => {
  const res = await fetch(`${API}/api/project/create_project`, {
    method: "POST",
    headers: auth_headers(),
    credentials: "include",
    body: JSON.stringify(body),
  });
  const data = await res.json();
  invalidate(KEYS.projects); // clear cache so next fetch gets fresh data
  return data;
};

export const send_invite = async (project_id: string, receiver_id: string) => {
  const res = await fetch(`${API}/api/project/send_invite/${project_id}`, {
    method: "POST",
    headers: auth_headers(),
    credentials: "include",
    body: JSON.stringify({ receiver_id }),
  });
  return res.json();
};

export const accept_invite = async (invite_id: string) => {
  const res = await fetch(`${API}/api/project/accept_invite`, {
    method: "POST",
    headers: auth_headers(),
    credentials: "include",
    body: JSON.stringify({ invite_id }),
  });
  return res.json();
};

// ── auth ──────────────────────────────────────────────────────────────────────
export const login = async (email: string, password: string) => {
  const res = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  return res.json();
};

export const sign_up = async (body: {
  full_name: string;
  username: string;
  email: string;
  password: string;
  niche: string;
  bio: string;
  skills: string[];
}) => {
  const res = await fetch(`${API}/api/auth/sign_up`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  return res.json();
};

export const refresh_token = async () => {
  const res = await fetch(`${API}/api/auth/refresh_token`, {
    method: "POST",
    credentials: "include",
  });
  return res.json();
};

//tasks
export const TASK_KEYS = {
  tasks: `${API}/api/tasks`,
  project: (id: string) => `${API}/api/tasks/${id}`,
};

export const assign_task = async (
  project_id: String,
  body: {
    title: string;
    description: string;
    assignedTo: string;
    priority: string;
    due_date: string;
  }
) => {
  const res = await fetch(`${API}/api/tasks/assign_task/:${project_id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  return res.json();
};
export const get_tasks = (force = false) =>
  cached_fetch(TASK_KEYS.tasks, force);

export const submit_task = async (task_id: String, file: File) => {
  const res = await fetch(`${API}/api/task/${task_id}`);
  return res.json();
};

export const get_my_invites = (force = false) =>
  cached_fetch(`${API}/api/project/get_invites`, force);

export const get_all_users = async (niche?: string) => {
  const url = niche
    ? `${API}/api/auth/get_all_users?niche=${encodeURIComponent(niche)}`
    : `${API}/api/auth/get_all_users`;
  const res = await fetch(`${url}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  return res.json();
};

export const reject_invite = async (invite_id: String) => {
  const res = await fetch(`${API}/api/project/reject_invite${invite_id}`);
  return res.json();
};

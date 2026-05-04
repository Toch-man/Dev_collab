// lib/api.ts

const API = process.env.NEXT_PUBLIC_API_URL;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const get_token = () => localStorage.getItem("access_token");
let logout_callback: (() => void) | null = null;

export const register_logout = (fn: () => void) => {
  logout_callback = fn;
};
const auth_headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${get_token()}`,
});

export const isTokenExpired = (token: string) => {
  try {
    const [, payload] = token.split(".");
    const decoded = JSON.parse(atob(payload));
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now;
  } catch (e) {
    return true; // if decoding fails, treat as expired
  }
};

export const getRefreshToken = async () => {
  const res = await fetch(`${API}/api/auth/refresh_token`, {
    method: "GET",
    headers: auth_headers(),
    credentials: "include",
  });
  return res.json();
};

const cache: Record<string, { data: unknown; timestamp: number }> = {};

const is_fresh = (key: string) =>
  cache[key] && Date.now() - cache[key].timestamp < CACHE_DURATION;

const cached_fetch = async (url: string, force = false) => {
  if (!force && is_fresh(url)) return cache[url].data;

  const res = await fetch(url, {
    headers: auth_headers(),
    credentials: "include",
  });

  //  auto logout on 401
  if (res.status === 401) {
    if (logout_callback) logout_callback();
    throw new Error("Unauthorised — logged out");
  }

  if (!res.ok) throw new Error(`Request failed: ${res.status}`);

  const data = await res.json();
  cache[url] = { data, timestamp: Date.now() };
  return data;
};

export const invalidate = (url: string) => {
  delete cache[url];
};

// projects
export const KEYS = {
  projects: `${API}/api/project/view_projects`,
  project: (id: string) => `${API}/api/project/project_details/${id}`,
};

export const get_my_projects = (force = false) =>
  cached_fetch(KEYS.projects, force);

export const get_project = (id: string, force = false) =>
  cached_fetch(KEYS.project(id), force);

export const get_all_projects = (force = false) =>
  cached_fetch(`${API}/api/project/all_projects`, force);

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
  invalidate(KEYS.projects);
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

export const reject_invite = async (invite_id: string) => {
  const res = await fetch(`${API}/api/project/reject_invite/${invite_id}`, {
    method: "POST",
    headers: auth_headers(),
    credentials: "include",
  });
  return res.json();
};

export const get_my_invites = (force = false) =>
  cached_fetch(`${API}/api/project/get_invites`, force);

//  auth
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

export const get_all_users = async (niche?: string) => {
  const url = niche
    ? `${API}/api/auth/get_all_users?niche=${encodeURIComponent(niche)}`
    : `${API}/api/auth/get_all_users`;
  const res = await fetch(url, {
    method: "GET",
    headers: auth_headers(),
    credentials: "include",
  });
  return res.json();
};

// tasks
export const TASK_KEYS = {
  tasks: `${API}/api/tasks/get_tasks`,
  task: (id: string) => `${API}/api/tasks/get_task${id}`,
};

export const get_tasks = (force = false) =>
  cached_fetch(TASK_KEYS.tasks, force);

export const update_task_data = async (task_id: string, project_id: string) => {
  const res = await fetch(
    `${API}/api/tasks/update_task_data/${task_id}/${project_id}`
  );

  return res.json();
};
export const assign_task = async (
  project_id: string,
  body: {
    title: string;
    description: string;
    assignedTo: string;
    priority: string;
    due_date: string;
  }
) => {
  const res = await fetch(`${API}/api/tasks/assign_task/${project_id}`, {
    method: "POST",
    headers: auth_headers(),
    credentials: "include",
    body: JSON.stringify(body),
  });
  return res.json();
};

export const submit_task = async (task_id: string, file: File) => {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API}/api/tasks/submit_task/${task_id}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${get_token()}` },
    credentials: "include",
    body: form,
  });
  return res.json();
};
export const get_submitted_task = async (project_id: string) => {
  const res = await fetch(`${API}/api/tasks/get_submitted_task/${project_id}`);
  return res.json();
};

export const get_notification = async () => {
  const res = await fetch(`${API}/api/notifications/get_notification`, {
    method: "GET",
    headers: auth_headers(),
    credentials: "include",
  });

  return res.json();
};

export const mark_as_read = async (notification_id: string) => {
  const res = await fetch(`${API}/notifications/mark_as_read`, {
    method: "POST",
    headers: auth_headers(),
    credentials: "include",
    body: JSON.stringify({ notification_id }),
  });

  return res.json();
};

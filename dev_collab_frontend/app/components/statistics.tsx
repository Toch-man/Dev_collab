import { get_all_users } from "@/lib/api";
import { get_all_projects } from "@/lib/api";
import { User } from "@/types";

const niche = (user: User[]) => {
  const unique_niches = new Set(user.map((u) => u.niche));
  return unique_niches.size;
};
export const user_detail = async () => {
  const data = await get_all_users();
  const user_count = data.users.length;
  const niche_count = niche(data.user);
  return { user_count, niche_count };
};

export const project_count = async () => {
  const data = await get_all_projects();
  const project_count = data.total_project;
  return project_count;
};

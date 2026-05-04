"use client";
import { get_all_users } from "@/lib/api";
import { get_all_projects } from "@/lib/api";
import { User } from "@/types";
import { useEffect, useState } from "react";

const Stats = () => {
  const [stats, set_stats] = useState({ user: 0, projects: 0, niches: 0 });
  const [loading, set_loading] = useState(false);
  useEffect(() => {
    async () => {
      set_loading(true);

      const users = await get_all_users();
      const project = await get_all_projects();
      const unique_niche = new Set(users.users.map((u: User) => u.niche)).size;

      set_stats({
        user: users.users.length,
        projects: project.total_project,
        niches: unique_niche,
      });
    };
    set_loading(false);
  }, []);
  return (
    <div className="max-w-4xl mx-auto grid grid-cols-3 divide-x divide-gray-200">
      {[
        { num: `${loading ? "..." : stats.user}`, label: "Developers" },
        {
          num: `${loading ? "..." : stats.projects}`,
          label: "Active projects",
        },
        { num: `${loading ? "..." : stats.niches}`, label: "Niches" },
      ].map((s) => (
        <div key={s.label} className="py-10 text-center">
          <p className="text-3xl font-extrabold text-green-700">{s.num}</p>
          <p className="text-sm text-gray-500 mt-1">{s.label}</p>
        </div>
      ))}
    </div>
  );
};
export default Stats;

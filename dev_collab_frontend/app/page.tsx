import Nav_bar from "./components/nav_bar";
import Link from "next/link";
import Stats from "./components/statistics";

const CodeIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#15803d"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const UsersIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#15803d"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const TaskIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#15803d"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

const LockIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#15803d"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const ArrowRight = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const features = [
  {
    icon: <UsersIcon />,
    title: "Team matching",
    desc: "Find collaborators by niche — frontend, backend, design, DevOps. Send and accept invites in seconds.",
  },
  {
    icon: <CodeIcon />,
    title: "Project management",
    desc: "Create public or private projects, define your tech stack, and keep your team aligned.",
  },
  {
    icon: <TaskIcon />,
    title: "Task tracking",
    desc: "Assign tasks, set priorities, and track progress so nothing falls through the cracks.",
  },
  {
    icon: <LockIcon />,
    title: "Public & private projects",
    desc: "Open your project to join requests, or keep it private and invite only the people you trust.",
  },
];

const steps = [
  {
    num: "01",
    title: "Create an account",
    desc: "Sign up with your niche and skills so the right collaborators can find you.",
  },
  {
    num: "02",
    title: "Start a project",
    desc: "Define your idea, set your tech stack, and choose public or private visibility.",
  },
  {
    num: "03",
    title: "Invite your team",
    desc: "Send invites directly or accept join requests from developers who want in.",
  },
  {
    num: "04",
    title: "Ship together",
    desc: "Assign tasks, track progress, and build something real as a team.",
  },
];

const stacks = [
  "Web development",
  "Mobile",
  "Machine learning",
  "DevOps",
  "UI / UX design",
  "Blockchain",
  "Game dev",
  "Open source",
];

export default async function Home() {
  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Nav_bar />

      {/* HERO */}
      <section className="px-6 pt-24 pb-16 text-center max-w-3xl mx-auto">
        <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full mb-6 tracking-wide uppercase">
          Now in beta
        </span>
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-gray-900">
          Build together.
          <br />
          <span className="text-green-700">Ship faster.</span>
        </h1>
        <p className="mt-6 text-lg text-gray-500 leading-relaxed max-w-xl mx-auto">
          DevCollab connects developers, designers, and creators to collaborate
          on real projects — find your team, assign tasks, and ship.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/login">
            <button className="flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white text-base font-semibold px-8 py-3 rounded-xl transition-colors duration-200">
              Get started free <ArrowRight />
            </button>
          </Link>

          <button className="flex items-center justify-center gap-2 border-2 border-green-700 text-green-700 hover:bg-green-700 hover:text-white text-base font-semibold px-8 py-3 rounded-xl transition-all duration-200">
            See how it works
          </button>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-gray-200 bg-white">
        <Stats />
      </section>

      {/* FEATURES */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <p className="text-green-700 text-sm font-semibold uppercase tracking-widest mb-2">
          Features
        </p>
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
          Everything you need to collaborate
        </h2>
        <p className="text-gray-500 text-lg max-w-xl mb-12">
          From finding your first team member to shipping your product —
          DevCollab has the tools to keep you moving.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white border-y border-gray-200 px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <p className="text-green-700 text-sm font-semibold uppercase tracking-widest mb-2">
            How it works
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-12">
            From idea to team in minutes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((s) => (
              <div key={s.num} className="bg-gray-50 rounded-2xl p-6">
                <p className="text-xs font-bold text-green-700 mb-3">{s.num}</p>
                <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TECH STACKS */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <p className="text-green-700 text-sm font-semibold uppercase tracking-widest mb-2">
          Tech stacks
        </p>
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
          Whatever you&apos;re building
        </h2>
        <p className="text-gray-500 text-lg mb-8">
          DevCollab supports teams across every stack and discipline.
        </p>
        <div className="flex flex-wrap gap-3">
          {stacks.map((s) => (
            <span
              key={s}
              className="bg-white border border-gray-200 text-gray-600 text-sm px-4 py-2 rounded-full hover:border-green-700 hover:text-green-700 transition-colors duration-200"
            >
              {s}
            </span>
          ))}
        </div>
      </section>

      <section className="bg-green-700 px-6 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
          Ready to find your team?
        </h2>
        <p className="text-green-100 text-lg mb-8 max-w-md mx-auto">
          Join thousands of developers already building on DevCollab.
        </p>
        <Link href="/auth/login">
          <button className="flex items-center justify-center gap-2 mx-auto bg-white text-green-700 hover:bg-green-50 font-bold text-base px-10 py-3 rounded-xl transition-colors duration-200">
            Start building <ArrowRight />
          </button>
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 px-6 py-10 text-center">
        <p className="text-2xl font-extrabold text-white mb-1">DevCollab</p>
        <p className="text-gray-500 text-sm">
          © {new Date().getFullYear()} DevCollab. Built by developers, for
          developers.
        </p>
      </footer>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";

const Nav_bar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-black px-5 md:px-10 py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center border-2 border-white w-10 h-10">
            <h1 className="font-extrabold text-2xl text-white">D</h1>
          </div>
          <p className="font-extrabold text-lg md:text-xl text-white">
            Dev_collab
          </p>
        </div>

        {/* Desktop buttons */}
        <div className="hidden md:flex gap-4">
          <Link href="/auth/login">
            <button className="px-5 py-2 bg-green-700 rounded-xl text-white hover:bg-green-600 transition">
              Log in
            </button>
          </Link>

          <Link href="/auth/signUp">
            <button className="px-5 py-2 bg-green-700 rounded-xl text-white hover:bg-green-600 transition">
              Sign up
            </button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-white text-2xl"
        >
          ☰
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="flex flex-col gap-3 mt-4 md:hidden">
          <Link href="/auth/login">
            <button className="w-full py-2 bg-green-700 rounded-xl text-white">
              Log in
            </button>
          </Link>

          <Link href="/auth/signUp">
            <button className="w-full py-2 bg-green-700 rounded-xl text-white">
              Sign up
            </button>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Nav_bar;

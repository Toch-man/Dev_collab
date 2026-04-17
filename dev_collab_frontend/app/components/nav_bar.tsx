"use client";
import Link from "next/link";

const Nav_bar = () => {
  return (
    <div className=" flex flex-row justify-between bg-black px-10 py-5">
      <div className="flex flex-row  items-center gap-3">
        <div className="flex flex-row p-3 justify-center items-center border-3 border-white">
          <h1 className="font-extrabold text-4xl text-white">D</h1>
        </div>
        <p className="font-extrabold text-xl text-center text-white">
          Dev_collab
        </p>
      </div>

      <div className="flex gap-5 ">
        <Link href="/login">
          <button className="p-2 w-30 h-10 bg-green-700 rounded-2xl text-center text-white text-xl hover:bg-gray-200 hover:border-2 hover:border-green-700 transition-all duration-300">
            Log in
          </button>
        </Link>

        <button className="p-2  w-30 h-10 bg-green-700 rounded-2xl text-center text-white text-xl hover:bg-gray-200 hover:border-2 hover:border-green-700 transition-all duration-300">
          Sign up
        </button>
      </div>
    </div>
  );
};
export default Nav_bar;

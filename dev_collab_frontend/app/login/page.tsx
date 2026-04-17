"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const Login = () => {
  const [email, set_email] = useState("");
  const [password, set_password] = useState("");
  const router = useRouter();

  const ArrowLeft = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="w-6 h-6"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
    </svg>
  );

  return (
    <div className="p-20 bg-gray-200">
      <div
        onClick={() => router.back()}
        className="flex justify-center items-center p-3 border-2 border-green-700 w-10 hover:bg-gray-400"
      >
        <ArrowLeft />
      </div>

      <div className="flex flex-col gap-10 justify-center items-center p-10">
        <div className="flex flex-row gap-3 mb-10 items-center">
          <div className="flex p-3 justify-center items-center bg-black border-2 border-green-700">
            <h1 className="font-extrabold text-4xl text-white">D</h1>
          </div>

          <p className="font-extrabold text-xl text-black">Dev_collab</p>
        </div>

        <form className="flex flex-col">
          <label htmlFor="email" className="text-xl font-black">
            Email:
          </label>
          <input
            id="email"
            name="email"
            className=" p-3 rounded-xl border-green-700 border-2 w-100 h-9 mb-5 hover:scale-105  transition-all duration-300"
            placeholder="Email..."
            type="textarea"
            value={email}
            onChange={(e) => set_email(e.target.value)}
          ></input>
          <label htmlFor="password" className="text-xl font-black">
            Password:
          </label>
          <input
            id="password"
            name="password"
            className=" p-3 rounded-xl border-green-700 border-2 w-100 h-9 mb-5 hover:scale-105 transition-all duration-300"
            placeholder="password.."
            type="password"
            value={password}
            onChange={(e) => set_password(e.target.value)}
          ></input>
          <div className="flex items-center justify-center">
            <button className="w-40 h-12 text-white bg-green-700 rounded-lg hover:scale-105">
              Log in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

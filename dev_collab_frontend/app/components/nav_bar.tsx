"use client";

const Nav_bar = () => {
  return (
    <div className=" flex flex-row bg-black p-10">
      <div className="flex flex-row p-3 justify-center items-center border-3 border-white">
        <h1 className="font-extrabold text-4xl text-white">D</h1>
      </div>
      <p className="font-extrabold text-xl text-white">Dev_collab</p>
      <div className="flex justify-between">
        <button className="p-5 bg-green-500 rounded-2xl text-center text-white text-xl">
          Log in
        </button>
        <button className="p-5 bg-green-500 rounded-2xl text-center text-white text-xl">
          Sign up
        </button>
      </div>
    </div>
  );
};
export default Nav_bar;

import Image from "next/image";
import Nav_bar from "./components/nav_bar";

export default function Home() {
  return (
    <div>
      <Nav_bar />
      <div>
        <div className=" flex  flex-row justify-center items-center  border-2 border-green-500 rounded-2xl p-10">
          <p className="text-2xl text-green-500">hello world</p>
        </div>
        <div className=" flex justify-center items-center p-10">
          <p className="text-2xl text-green-500">hello world</p>
        </div>
        <div className=" flex justify-center items-center p-10">
          <p className="text-2xl text-green-500">hello world</p>
        </div>
      </div>
    </div>
  );
}

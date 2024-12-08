import React from "react";
import Image from "next/image";
import about from "../../../assets/about.png";

export default function About() {
  return (
    <div className="max-w-[1440px] mx-auto">
      <div className="flex md:flex-row flex-col md:gap-0  gap-8 items-center  mt-20 mb-10">
        <Image src="/about.png" width={734} height={500} alt="about" unoptimized />
        <div className="md:pl-20 px-5 text-white ">
          <h6>About DEFI AI</h6>
          <h2 className="text-[38px] leading-[45px] mt-2">
            Unlock the Future: <br className="md:block hidden " /> Experience the Power Of{" "}
            <br className="md:block hidden " /> Our Web3 Platform
          </h2>
          <p className="text-sm w-[400px] mt-4">
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ipsum incidunt ti.\ Lorem ipsum dolor sit, amet
            consectetur adipisicing
          </p>
          <button className="h-[38px] px-5 bg-[#8f259b] mt-6 rounded-full text-sm">Get Started</button>
        </div>
      </div>
    </div>
  );
}

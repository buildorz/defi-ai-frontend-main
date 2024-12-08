import React from "react";
import about from "../../../assets/about.png";
import Image from "next/image";

export default function Feauture() {
  return (
    <div className="max-w-[1440px] mx-auto">
      <div className="grid md:grid-cols-2 grid-cols-1  flex-col md:gap-0  gap-8 items-center  mt-20 mb-10">
        <div className=" px-5 text-white  md:order-first order-last">
          <h2 className="text-[38px] leading-[45px] mt-2">
            Voice feauture: <br className="md:block hidden " /> Interact with the AI <br className="md:block hidden " />{" "}
            With your voice
          </h2>
          <p className="text-sm w-[400px] mt-4">
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ipsum incidunt ti.\ Lorem ipsum dolor sit, amet
            consectetur adipisicing
          </p>
          <button className="h-[38px] px-5 bg-[#8f259b] mt-6 rounded-full text-sm">Get Started</button>
        </div>
        <div className="pl-[100px] ">
          <Image src="/about.png" width={734} height={500} alt="about" unoptimized />
        </div>
      </div>
    </div>
  );
}

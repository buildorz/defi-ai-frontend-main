import React from "react";
import Image from "next/image";
import Link from "next/link";
import about from "../../../assets/about.png";

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
            {`DeFi AI lets you manage your crypto hands-free with simple voice commands. From checking trends to making transactions, it's DeFi made effortless.`}
          </p>
          <Link href="/chat">
            {" "}
            <button className="h-[38px] px-5 bg-[#8f259b] mt-6 rounded-full text-sm">Get Started</button>
          </Link>
        </div>
        <div className="pl-[100px] ">
          <Image src="/voicee.png" width={734} height={500} alt="voice" unoptimized />
        </div>
      </div>
    </div>
  );
}

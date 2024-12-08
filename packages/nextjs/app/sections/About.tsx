import React from "react";
import Image from "next/image";
import about from "../../../assets/about.png";
import Link from "next/link";

export default function About() {
  return (
    <div id="about" className="max-w-[1440px] mx-auto">
      <div className="flex md:flex-row flex-col md:gap-0  gap-8 items-center  mt-20 mb-10">
        <Image src="/about.png" width={734} height={500} alt="about" unoptimized />
        <div className="md:pl-20 px-5 text-white ">
          <h6>About DEFI AI</h6>
          <h2 className="text-[38px] leading-[45px] mt-2">
           Simplifying Crypto, <br/>Empowering Everyone.
          </h2>
          <p className="text-sm w-[400px] mt-4">
           At DeFi AI, we believe decentralized finance should be simple, accessible, and efficient for everyone. Our mission is to transform how you interact with cryptocurrencies, providing a seamless and intelligent assistant that bridges the gap between technology and user convenience.

          </p>
   <Link href="/chat">       <button className="h-[38px] px-5 bg-[#8f259b] mt-6 rounded-full text-sm">Get Started</button></Link>
        </div>
      </div>
    </div>
  );
}

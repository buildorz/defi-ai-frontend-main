import React from "react";
import Image from "next/image";
import { hardhat } from "viem/chains";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { useGlobalState } from "~~/services/store/store";

export const Footer = () => {
  return (
    <div className=" mt-[70px]">
      <div className="max-w-[1440px] mx-auto md:px-5 py-10">
        <div className="flex md:flex-row flex-col items-center justify-between">
          <nav className="flex gap-7 items-center text-sm text-white">
            <a href="/">
              <h5>Home</h5>
            </a>
            <a href="#features">
              {" "}
              <h5>Features</h5>
            </a>
            <a href="#about">
              {" "}
              <h5>About</h5>
            </a>

            <h5>Contact</h5>
          </nav>
        </div>
        <p className="md:px-0 px-5 text-center text-white mt-[30px] hover:text-[#8f259b] cursor-pointer ease-in-out transition duration-300">
          © DEFI AI . Powered by Blockhack. All Rights Reserved.
        </p>
      </div>
    </div>
  );
};

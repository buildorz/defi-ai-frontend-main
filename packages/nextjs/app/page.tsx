"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import InteractiveBlocks from "~~/components/InteractiveBlock";
import About from "./sections/About";
import Feauture from "./sections/Feauture";
import WhyDefi from "./sections/WhyDefi";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <>
      <div className=" overflow-hidden">
        <InteractiveBlocks/>
        <About/>
        <Feauture/>
        <WhyDefi/>
     
      </div>
    </>
  );
};

export default Home;

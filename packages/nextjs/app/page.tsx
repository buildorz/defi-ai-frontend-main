"use client";

import Link from "next/link";
import About from "./sections/About";
import Feauture from "./sections/Feauture";
import WhyDefi from "./sections/WhyDefi";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Footer } from "~~/components/Footer";
import InteractiveBlocks from "~~/components/InteractiveBlock";
import { Address } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <>
      <div className=" overflow-hidden">
        <InteractiveBlocks />
        <About />
        <Feauture />
        <WhyDefi />
        <Footer />
      </div>
    </>
  );
};

export default Home;

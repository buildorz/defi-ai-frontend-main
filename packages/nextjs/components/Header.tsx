"use client";

import React, { useCallback, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bars3Icon, BugAntIcon } from "@heroicons/react/24/outline";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useOutsideClick } from "~~/hooks/scaffold-eth";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Home",
    href: "/",
  },

  {
    label: "Feauturess",
    href: "/feautures",
  },
  {
    label: "About",
    href: "/about",
  },
  {
    label: "Contact",
    href: "/contact",
  },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              className={`${
                isActive ? "hover:text-[#8f259b]" : ""
              } text-sm `}
            >
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

/**
 * Site header
 */
export const Header = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const burgerMenuRef = useRef<HTMLDivElement>(null);
  useOutsideClick(
    burgerMenuRef,
    useCallback(() => setIsDrawerOpen(false), []),
  );

  return (
 
   <div className="fixed top-5 z-[100000] md:w-auto w-full px-5 md:px-0">
      <div className=" md:w-[600px]  w-full flex  justify-between items-center  bg-[#ffffff1a] border border-gray-600/20  backdrop-blur-[100px] p-1.5  rounded-full">
        <Link href="/" passHref className="">
          <div className="flex relative w-10 h-10">
            <Image alt="defiai logo" className="cursor-pointer" fill src="/DefiAIlogo.png" />
          </div>
        </Link>
        <ul className="hidden lg:flex gap-7">
          <HeaderMenuLinks />
        </ul>
      <Link href='/chat'>   <button className="bg-[#8f259b] px-5 h-[40px] text-white text-sm rounded-full cursor-pointer ">
          Try now
        </button></Link>
      </div>
    </div>

  );
};

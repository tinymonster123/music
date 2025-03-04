"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const TopBar = () => {
  const [isStart, setStart] = useState(false);
  const path = usePathname();
  const isHome = path === "/";

  useEffect(() => {
    setStart(true);
  }, []);

  return (
    // <TextFade direction="down" delay={5} >
    <header
      className={` top-0 left-0 right-0 bg-white backdrop-blur-sm z-50 transition-transform ease-in-out duration-3000 delay-3000 ${
        isStart ? "transition-y-0" : "-transition-y-full"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14 md:h-16">
        <div className="flex items-center gap-6">
          <Link
            href="https://github.com/tinymonster123"
            className="font-medium hover:text-pinky-deepRed transition-colors text-black"
          >
            About Me
          </Link>
          {!isHome ? (
            <Link
              href="/"
              className="font-medium hover:text-pinky-deepRed transition-colors text-black"
            >
              HomePage
            </Link>
          ) : (
            <Link
              href="/pages/showpage"
              className="font-medium hover:text-pinky-deepRed transition-colors text-black"
            >
              Data Page
            </Link>
          )}
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="/pages/signup"
            className="hover:text-pinky-deepRed transition-colors text-black"
          >
            Sign Up
          </Link>
          <Link
            href="/pages/login"
            className="px-6 py-2 h-12 bg-pinky-deepRed text-black rounded-lg hover:bg-pinky-lightRed transition-colors "
          >
            Log In
          </Link>
        </div>
      </nav>
    </header>
    // </TextFade>
  );
};

export default TopBar;

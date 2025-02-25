"use client"
import Link from "next/link";
import { useEffect, useState } from "react";

const TopBar = () => {
  const [isStart,setStart] = useState(false)

  useEffect(() => {
    setStart(true)
  },[])

  return (
    <header className={`fixed top-0 left-0 right-0 bg-white backdrop-blur-sm z-50 transition-transform delay-5000 duration-3000 ease-in-out ${isStart ? "translate-y-0" : "-translate-y-full"}`}>
      <nav className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14 md:h-16">
        <Link
          href="https://github.com/tinymonster123"
          className="font-medium hover:text-pinky-deepRed transition-colors text-black"
        >
          About Me
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/signup"
            className="hover:text-pinky-deepRed transition-colors text-black"
          >
            Sign Up
          </Link>
          <Link
            href="/login"
            className="px-6 py-2 h-12 bg-pinky-deepRed text-black rounded-lg hover:bg-pinky-lightRed transition-colors "
          >
            Log In
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default TopBar;

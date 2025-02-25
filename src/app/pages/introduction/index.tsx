"use client";
import { useEffect, useState } from "react";
import SvgIcon from "@/app/component/passionate";
import SVGLetter from "../../../assets/images/letter.svg";
import TextFade from "@/app/component/textfade";

const Introduction = () => {
  const [ifStart, setStart] = useState(false);

  useEffect(() => {
    setStart(true);
  }, []);

  return (
    <div className="bg-white w-full min-h-screen flex items-center">
      <div className="container mx-auto py-16 px-4 md:px-8 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div
            className={`transition-all duration-1000 ease-in-out ${
              ifStart
                ? "translate-x-0 opacity-100"
                : "-translate-x-full opacity-0"
            }`}
          >
            <div className="flex justify-center md:justify-end">
              <SvgIcon className="w-32 h-32 md:w-48 md:h-48 transform-gpu hover:scale-105 transition-transform" />
            </div>
          </div>

          <TextFade
            direction="down"
            className="flex flex-col items-center md:items-start space-y-8"
          >
            <div className="flex justify-center md:justify-start w-full">
              <SVGLetter className="w-4/5 max-w-md transform-gpu hover:scale-105 transition-transform" />
            </div>

            <div className="flex flex-col items-center md:items-start gap-6 text-black">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Build for music <span className="text-[#ff0000]">Lover</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-700 font-medium">
                Search for music that suits your taste
              </p>
              <button className="mt-4 px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all">
                Get Started
              </button>
              <p className="text-sm text-gray-500 mt-8">
                @copyright Database from{" "}
                <a
                  href="https://metabrainz.org/datasets/postgres-dumps#musicbrainz"
                  className="text-blue-600 hover:text-blue-800 underline transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  MusicBrainz Database
                </a>
              </p>
            </div>
          </TextFade>
        </div>
      </div>
    </div>
  );
};

export default Introduction;

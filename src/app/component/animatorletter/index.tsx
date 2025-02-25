"use client";
import Animator from "../../animation";
import SVGPath from "@/app/animation/path";
import { createElement } from "react";

const AnimatorLetter = () => {
  console.log(SVGPath);

  return (
    <div className="w-full h-screen flex items-center justify-center bg-white">
      <Animator
        animate={true}
        shouldLoop={true}
        loopOptions="reverse"
        slots={[SVGPath]}
        pathAnimation={{
          type: "tween",
          duration: 3,
        }}
        endCircle={false}
      />
    </div>
  );
};

export default AnimatorLetter;

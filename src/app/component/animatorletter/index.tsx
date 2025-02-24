"use client";
import Animator from "@/app/animation";
import SVGPath from "@/app/animation/path";

const AnimatorLetter = () => {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-white">
      <Animator
        animate={true}
        shouldLoop={true}
        loopOptions="reverse"
        slots={[SVGPath]}
        pathAnimation={{
          type: "tween",
          duration: 2,
        }}
      />
    </div>
  );
};

export default AnimatorLetter;

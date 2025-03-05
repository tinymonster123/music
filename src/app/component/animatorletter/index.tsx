"use client";
import { useEffect } from "react";
import Animator from "../../animation";
import SVGPath from "@/app/animation/path";

interface AnimationComplete {
  handleAnimationComplete: () => void;
}

const AnimatorLetter = ({ handleAnimationComplete }: AnimationComplete) => {
  // console.log(SVGPath);
  const animationDuration = 5000;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (handleAnimationComplete) {
        handleAnimationComplete();
      }
    }, animationDuration);

    return () => clearTimeout(timer);
  }, [handleAnimationComplete]);

  return (
    <div className="w-full h-screen flex items-center justify-center bg-white transform-gpu">
      <Animator
        pathAnimation={{
          type: "tween",
          duration: 5, // 閹镐胶鐢婚弮鍫曟？閸欘垯浜掗弽瑙勫祦闂団偓鐟曚浇鐨熼弫锟�
          ease: "easeInOut",
        }}
        from={0}
        to={100}
        animate={true}
        shouldLoop={false}
        loopOptions="reverse"
        endCircle={false}
        slots={[SVGPath]}
      />
    </div>
  );
};

export default AnimatorLetter;

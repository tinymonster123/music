"use client";
import Animator from "../../animation";
import SVGPath from "@/app/animation/path";

const AnimatorLetter = () => {
  // console.log(SVGPath);

  return (
    <div className="w-full h-screen flex items-center justify-center bg-white transform-gpu">
      <Animator
        pathAnimation={{
          type: "tween",
          duration: 5, // 鎸佺画鏃堕棿鍙互鏍规嵁闇€瑕佽皟鏁�
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

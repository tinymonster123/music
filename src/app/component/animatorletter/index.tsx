"use client";
import Animator from "../../animation";
import SVGPath from "@/app/animation/path";

const AnimatorLetter = () => {
  console.log(SVGPath);

  return (
    <div className="w-full h-screen flex items-center justify-center bg-white">
      <Animator
        pathAnimation={{
          type: "tween",
          duration: 5, // 持续时间可以根据需要调整
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

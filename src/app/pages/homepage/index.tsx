"use client";
import TopBar from "@/app/component/topBar";
import AnimatorLetter from "@/app/component/animatorletter";
import Letter from "../../../assets/images/letter.svg";
import LazyLoader from "@/app/component/lazyloader";
import Introduction from "../introduction";
import { useEffect, useState } from "react";

const StaticLetter = () => {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-white transform-gpu">
      <Letter />
    </div>
  );
};

const HomePage = () => {
  const [showAnimation, setShowAnimation] = useState(false);
  const key = "hasBeenWatched";

  const hasBeenWatchedAnimation = sessionStorage.getItem(key);

  useEffect(() => {
    if (!hasBeenWatchedAnimation) {
      setShowAnimation(true);
      sessionStorage.setItem(key, "true");
    }
  }, []);

  const handleAnimationComplete = () => {
    setShowAnimation(false);
  };

  return (
    <>
      <TopBar />
      {showAnimation ? (
        <AnimatorLetter handleAnimationComplete={handleAnimationComplete} />
      ) : (
        <StaticLetter />
      )}
      <LazyLoader>
        <Introduction />
      </LazyLoader>
    </>
  );
};

export default HomePage;

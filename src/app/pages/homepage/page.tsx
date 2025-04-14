"use client";
import TopBar from "@/app/component/topBar";
import SessionTopBar from "@/app/component/sessionTopBar";
import AnimatorLetter from "@/app/component/animatorletter";
import Image from "next/image";
import LazyLoader from "@/app/component/lazyloader";
import Introduction from "../introduction";
import { useEffect, useState } from "react";
import { useSession, SessionProvider } from "next-auth/react";

const StaticLetter = () => {
  return (
    <div className="w-full h-screen bg-white transform-gpu">
      <Image
        src="/letter.svg"
        alt="Letter"
        width={681} // 与动画组件中的 SVG 宽度保持一致
        height={131} // 与动画组件中的 SVG 高度保持一致
        className="w-full"
        style={{
          display: "block",
          maxWidth: "681px",
          height: "auto",
          margin: "0 auto",
        }}
        loading="eager"
        priority={true}
      />
    </div>
  );
};

const AuthTopBar = () => {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  return isAuthenticated ? <SessionTopBar /> : <TopBar />;
};

export const SessionLayout = () => {
  return (
    <SessionProvider>
      <AuthTopBar />
    </SessionProvider>
  );
};

const HomePage = () => {
  const [showAnimation, setShowAnimation] = useState(false);
  const key = "hasBeenWatched";

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasBeenWatchedAnimation = sessionStorage.getItem(key);
      if (!hasBeenWatchedAnimation) {
        setShowAnimation(true);
        sessionStorage.setItem(key, "true");
      }
    }
  }, []);

  const handleAnimationComplete = () => {
    setShowAnimation(false);
  };

  return (
    <>
      <SessionLayout />
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

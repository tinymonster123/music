"use client";
import TopBar from "@/app/component/topBar";
import SessionTopBar from "@/app/component/sessionTopBar";
import AnimatorLetter from "@/app/component/animatorletter";
import Image from "next/image";
import letterSvg from "../../../assets/images/letter.svg";
import LazyLoader from "@/app/component/lazyloader";
import Introduction from "../introduction";
import { useEffect, useState } from "react";
import { useSession, SessionProvider } from "next-auth/react";

const StaticLetter = () => {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-white transform-gpu">
      {/* 使用 Image 组件替代直接的 SVG 组件 */}
      <Image src={letterSvg} alt="Letter" width={400} height={400} />
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

  // 处理动画逻辑
  const hasBeenWatchedAnimation =
    typeof window !== "undefined" ? sessionStorage.getItem(key) : null;

  useEffect(() => {
    if (!hasBeenWatchedAnimation) {
      setShowAnimation(true);
      if (typeof window !== "undefined") {
        sessionStorage.setItem(key, "true");
      }
    }
  }, [hasBeenWatchedAnimation]);

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

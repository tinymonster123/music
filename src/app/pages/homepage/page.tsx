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
    <div className="w-full h-screen flex items-center justify-center bg-white transform-gpu">
      <div className="w-full" style={{ maxWidth: "681pt" }}>
        <Image
          src="/letter.svg"
          alt="Letter"
          width={681}
          height={131}
          className="w-full"
          style={{
            height: "auto",
          }}
          loading="eager"
          priority={true}
          unoptimized={true} // 阻止 Next.js 优化图像以保持与 SVG 相同的渲染方式
        />
      </div>
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

"use client";
import AlbumDateDisplay from "@/app/request/albumdatedisplay";
import SkeletonCard from "../skeleton";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const InteractiveBar = dynamic(() => import("@/app/component/interactivebar"), {
  loading: () => <SkeletonCard />,
  ssr: false,
});

const ShowPage = () => {
  return (
    <>
      <AlbumDateDisplay />
      <Suspense fallback={<SkeletonCard />}>
        <InteractiveBar />
      </Suspense>
    </>
  );
};

export default ShowPage;

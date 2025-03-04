"use client";
import AlbumDateDisplay from "@/app/request/albumdatedisplay";
import SkeletonCard from "../skeleton";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import PieChartData from "@/app/request/piechartdata";
import LazyLoader from "@/app/component/lazyloader";

const InteractiveBar = dynamic(() => import("@/app/component/interactivebar"), {
  loading: () => <SkeletonCard />,
  ssr: false,
});

const PieBar = dynamic(() => import("@/app/component/piebar"), {
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
      <PieChartData />
      <LazyLoader>
        <Suspense fallback={<SkeletonCard />}>
          <PieBar />
        </Suspense>
      </LazyLoader>
    </>
  );
};

export default ShowPage;

"use client";
import AlbumDateDisplay from "@/app/request/albumdatedisplay";
import SkeletonCard from "../skeleton";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import PieChartData from "@/app/request/piechartdata";

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
      <Suspense fallback={<SkeletonCard />}>
        <PieBar />
      </Suspense>
    </>
  );
};

export default ShowPage;

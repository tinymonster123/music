"use client";
import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import AlbumDateDisplay from "@/app/request/albumdatedisplay";
import useAlbumStore from "@/app/hooks/albumdate";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  views: {
    label: "Album Views",
  },
  album_id: {
    label: "Album ID",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const InteractiveBar = () => {
  // 将钩子调用移到组件内部
  const { album } = useAlbumStore();
  
  // 计算总数
  const total = React.useMemo(
    () => album.reduce((acc, curr) => acc + curr.album_id, 0),
    [album]
  );

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Album Data Chart</CardTitle>
          <CardDescription>
            Showing album creation dates
          </CardDescription>
        </div>
        <div className="flex">
          <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left sm:border-l sm:border-t-0 sm:px-8 sm:py-6">
            <span className="text-xs text-muted-foreground">
              {chartConfig.album_id.label}
            </span>
            <span className="text-lg font-bold leading-none sm:text-3xl">
              {total.toLocaleString()}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={album}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="album_date_created"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                // 假设 value 已经是 YYYY-MM-DD 格式
                const [year, month, day] = value.split("-");
                return `${month}/${day}`;
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="views"
                  labelFormatter={(value) => {
                    // 假设 value 已经是 YYYY-MM-DD 格式
                    const [year, month, day] = value.split("-");
                    return `${month}/${day}/${year}`;
                  }}
                />
              }
            />
            <Bar dataKey="album_id" fill="var(--color-desktop)" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default InteractiveBar;
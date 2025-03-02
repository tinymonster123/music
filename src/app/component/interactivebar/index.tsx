"use client";
import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
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

interface AlbumDateCount {
  date: string;
  count: number;
}

const chartConfig = {
  views: {
    label: "Albums Per Day", // 更新标签
  },
  count: {
    // 改为 "count"
    label: "Number of Albums",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const InteractiveBar = () => {
  // 灏嗛挬瀛愯皟鐢ㄧЩ鍒扮粍浠跺唴閮�
  const { album } = useAlbumStore();
  const { albumDateArray, total } = React.useMemo(() => {
    const albumMap = new Map<string, number>();

    // 统计每个日期的专辑数量
    album.forEach((item) => {
      if (albumMap.has(item.album_date_created)) {
        albumMap.set(
          item.album_date_created,
          (albumMap.get(item.album_date_created) || 0) + 1
        );
      } else {
        albumMap.set(item.album_date_created, 1);
      }
    });

    // 将统计结果转换为数组
    const dateCountArray: AlbumDateCount[] = [];
    albumMap.forEach((count, date) => {
      dateCountArray.push({
        date,
        count,
      });
    });

    // 计算总数
    const totalAlbums = dateCountArray.reduce(
      (acc, curr) => acc + curr.count,
      0
    );

    return {
      albumDateArray: dateCountArray,
      total: totalAlbums,
    };
  }, [album]);

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Album Data Chart</CardTitle>
          <CardDescription>Showing album creation dates</CardDescription>
        </div>
        <div className="flex">
          <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left sm:border-l sm:border-t-0 sm:px-8 sm:py-6">
            <span className="text-xs text-muted-foreground">
              {chartConfig.count.label} 
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
            data={albumDateArray}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date" // 改为 "date"
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
                  nameKey="count"
                  labelFormatter={(value) => {
                    // 鍋囪 value 宸茬粡鏄� YYYY-MM-DD 鏍煎紡
                    const [year, month, day] = value.split("-");
                    return `${month}/${day}/${year}`;
                  }}
                />
              }
            />
            <Bar dataKey="count" fill="var(--color-desktop)" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default InteractiveBar;

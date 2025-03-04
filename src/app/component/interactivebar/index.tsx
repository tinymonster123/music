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
import findTop10Element from "@/app/utils/prioritysort";

export interface AlbumDateCount {
  date: string;
  count: number;
}

const chartConfig = {
  views: {
    label: "Albums Per Day", // 閺囧瓨鏌婇弽鍥╊劮
  },
  count: {
    // 閺€閫涜礋 "count"
    label: "Number of Albums",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const InteractiveBar = () => {
  // 閻忓繐妫濋幐顒傗偓娑欏姌閻ㄧ喖鎮介妸顬晠宕氶幍顔剧煁濞寸姾娉涢崬鎾焾閿燂拷
  const { album } = useAlbumStore();
  const [total, setTotalAlbums] = React.useState(0);
  const { albumDateArray, dateCountArray } = React.useMemo(() => {
    if (!album || album.length === 0) {
      return { albumDateArray: [], dateCountArray: [] };
    }

    const albumMap = new Map<string, number>();

    // 娴ｈ法鏁� reduce 閺囧じ鍞� forEach 閹绘劙鐝幀褑鍏�
    album.reduce((map, item) => {
      const count = map.get(item.album_date_created) || 0;
      map.set(item.album_date_created, count + 1);
      return map;
    }, albumMap);

    // 娴兼ê瀵查弫鎵矋鏉烆剚宕�
    const dateCountArray = Array.from(albumMap, ([date, count]) => ({
      date,
      count,
    }));

    const top10CountArray = findTop10Element(albumMap);

    let totalAlbums = 0;

    return { albumDateArray: top10CountArray, dateCountArray: dateCountArray };
  }, [album]);

  React.useEffect(() => {
    const loadPriority = window.requestIdleCallback || setTimeout;

    loadPriority(() => {
      const totalAlbums = dateCountArray.reduce(
        (acc, curr) => acc + curr.count,
        0
      );
      setTotalAlbums(totalAlbums);
    });
  }, [dateCountArray]);

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Album Data Chart</CardTitle>
          <CardDescription>
            Showing top 10 number of album creation dates
          </CardDescription>
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
              dataKey="date" // 閺€閫涜礋 "date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
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
                    // 闁稿娲╅锟� value 鐎规瓕灏欑划锟犲及閿燂拷 YYYY-MM-DD 闁哄秶鍘х槐锟�
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

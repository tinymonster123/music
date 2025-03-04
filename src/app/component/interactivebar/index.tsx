"use client";
import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import useAlbumStore from "@/app/hooks/albumdate";
import { CalendarIcon, BarChart2Icon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export interface AlbumDateCount {
  date: string;
  count: number;
}

// 更加丰富的色彩配置
const chartConfig = {
  views: {
    label: "Albums Per Day",
  },
  count: {
    label: "Number of Albums",
    color: "#dd0025", // 主色调
  },
} satisfies ChartConfig;

const colorConfig = {
  gradientFrom: "#dd0025",
  gradientTo: "#ff704d", // 渐变结束色
  hoverColor: "#b3001e", // 悬停色
};

const InteractiveBar = () => {
  const { album } = useAlbumStore();
  const [total, setTotalAlbums] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [hoverIndex, setHoverIndex] = React.useState<number | null>(null);

  const { albumDateArray, dateCountArray } = React.useMemo(() => {
    if (!album || album.length === 0) {
      return { albumDateArray: [], dateCountArray: [] };
    }

    setLoading(false);
    const albumMap = new Map<string, number>();

    album.reduce((map, item) => {
      const count = map.get(item.album_date_created) || 0;
      map.set(item.album_date_created, count + 1);
      return map;
    }, albumMap);

    const dateCountArray = Array.from(albumMap, ([date, count]) => ({
      date,
      count,
    }));

    const top10CountArray = findTop10Element(albumMap);

    return { albumDateArray: top10CountArray, dateCountArray: dateCountArray };
  }, [album]);

  React.useEffect(() => {
    const loadPriority = window.requestIdleCallback || setTimeout;

    loadPriority(() => {
      if (dateCountArray.length > 0) {
        const totalAlbums = dateCountArray.reduce(
          (acc, curr) => acc + curr.count,
          0
        );
        setTotalAlbums(totalAlbums);
      }
    });
  }, [dateCountArray]);

  // 计算百分比
  const getPercentage = (count: number) => {
    return total > 0 ? Math.round((count / total) * 100) : 0;
  };

  // 自定义tooltip内容
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = getPercentage(data.count);

      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="text-sm font-semibold mb-1 flex items-center gap-1">
            <CalendarIcon size={14} className="text-gray-500" />
            {label.split("-")[1]}/{label.split("-")[2]}/{label.split("-")[0]}
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: chartConfig.count.color }}
            />
            <span className="font-bold">{data.count.toLocaleString()}</span>
            <Badge variant="outline" className="ml-1 text-xs">
              {percentage}%
            </Badge>
          </div>
        </div>
      );
    }
    return null;
  };

  // 格式化日期显示
  const formatDate = (value: string) => {
    const [year, month, day] = value.split("-");
    return `${month}/${day}`;
  };

  // 自定义渐变条形图
  const renderCustomBar = (props: any) => {
    const { x, y, width, height, index } = props;
    const isHovered = index === hoverIndex;

    const radius = 4;
    const fill = isHovered ? colorConfig.hoverColor : chartConfig.count.color;

    return (
      <g
        key={`bar-${index}`}
        onMouseEnter={() => setHoverIndex(index)}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient
            id={`barGradient-${index}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor={colorConfig.gradientFrom}
              stopOpacity={0.9}
            />
            <stop
              offset="100%"
              stopColor={colorConfig.gradientTo}
              stopOpacity={0.8}
            />
          </linearGradient>
        </defs>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          rx={radius}
          ry={radius}
          fill={isHovered ? fill : `url(#barGradient-${index})`}
          style={{
            filter: isHovered
              ? "drop-shadow(0 4px 6px rgba(221, 0, 37, 0.3))"
              : "none",
            transition: "all 0.3s ease",
          }}
        />
      </g>
    );
  };

  return (
    <Card className="overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 bg-gray-50 dark:bg-gray-900 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <div className="flex items-center gap-2">
            <BarChart2Icon className="h-5 w-5 text-gray-500" />
            <CardTitle>Album Distribution</CardTitle>
          </div>
          <CardDescription className="text-gray-500">
            Top 10 dates with the highest number of albums created
          </CardDescription>
        </div>
        <div className="flex">
          <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 bg-white dark:bg-gray-800 text-left sm:border-l sm:border-t-0 sm:px-8 sm:py-6">
            <span className="text-xs text-gray-500 uppercase tracking-wider">
              {chartConfig.count.label}
            </span>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <span className="text-lg font-bold leading-none sm:text-3xl">
                {total.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-[250px] w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        ) : (
          <div className="aspect-auto h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={albumDateArray}
                margin={{ top: 20, right: 20, left: 10, bottom: 30 }}
                barGap={8}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e0e0e0"
                />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={{ stroke: "#e0e0e0" }}
                  tickMargin={12}
                  minTickGap={30}
                  tick={{ fontSize: 12, fill: "#666" }}
                  tickFormatter={formatDate}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "#666" }}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
                />
                <Bar
                  dataKey="count"
                  shape={renderCustomBar}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-t flex justify-between items-center text-sm text-gray-500">
        <span>Data updated {new Date().toLocaleDateString()}</span>
        {!loading && albumDateArray.length > 0 && (
          <Badge variant="outline">
            Showing {albumDateArray.length} of {dateCountArray.length} dates
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
};

export default InteractiveBar;

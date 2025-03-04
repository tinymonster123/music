"use client";

import * as React from "react";
import { PieChart as PieIcon, ExternalLink } from "lucide-react";
import {
  Cell,
  Label,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import useListenStore, { PieData } from "@/app/hooks/listensdata";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

// 修改为与InteractiveBar完全一致的颜色系统
const colorConfig = {
  baseColor: "#dd0025", // 主色调，与InteractiveBar一致
  gradientFrom: "#dd0025",
  gradientTo: "#ff704d",
  hoverColor: "#b3001e", // 悬停色
};

// 定义饼图的扇形颜色数组，以主色调为中心扩展
const CHART_COLORS = [
  colorConfig.baseColor, // 主色调
  "#b3001e", // 暗色调
  "#ff3d3d", // 亮色调
  "#ff704d", // 渐变结束色
  "#8d0000", // 深色调
];

// 动态生成图表配置
const generateChartConfig = (data: PieData[]) => {
  const config: Record<string, any> = {
    listens: {
      label: "Listens",
      color: colorConfig.baseColor,
    },
  };

  // 取前5个数据项设置颜色
  data.slice(0, 5).forEach((item, index) => {
    const shortTitle =
      item.title.length > 15 ? `${item.title.substring(0, 15)}...` : item.title;

    config[item.title] = {
      label: shortTitle,
      color: CHART_COLORS[index % CHART_COLORS.length],
    };
  });

  return config as ChartConfig;
};

const PieBar = () => {
  const { listendata } = useListenStore();
  const [loading, setLoading] = React.useState(true);
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  // 处理数据：取前5个收听量最大的专辑
  const processedListenData = React.useMemo(() => {
    if (!listendata || listendata.length === 0) {
      return [];
    }

    setLoading(false);

    // 复制数组，排序，并取前5个
    return [...listendata]
      .filter((item) => item.listens > 0) // 过滤掉收听量为0的
      .sort((a, b) => b.listens - a.listens) // 按收听量降序
      .slice(0, 5) // 取前5个
      .map((item, index) => {
        // 为每个项生成渐变ID
        const gradientId = `pieGradient-${index}`;
        return {
          ...item,
          fill: CHART_COLORS[index % CHART_COLORS.length],
          gradientId,
        };
      });
  }, [listendata]);

  // 计算总收听量
  const totalListens = React.useMemo(() => {
    return processedListenData.reduce((acc, curr) => acc + curr.listens, 0);
  }, [processedListenData]);

  // 动态生成图表配置
  const chartConfig = React.useMemo(
    () => generateChartConfig(processedListenData),
    [processedListenData]
  );

  // 计算百分比
  const getPercentage = (count: number) => {
    return totalListens > 0 ? Math.round((count / totalListens) * 100) : 0;
  };

  // 自定义tooltip内容
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = Math.round((data.listens / totalListens) * 100);

      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="text-sm font-semibold mb-1 truncate max-w-[200px]">
            {data.title}
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: data.fill }}
            />
            <span className="font-bold">{data.listens.toLocaleString()}</span>
            <Badge variant="outline" className="ml-1 text-xs">
              {percentage}%
            </Badge>
          </div>
        </div>
      );
    }
    return null;
  };

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  // 为饼图定义渐变
  const renderGradients = () => {
    return processedListenData.map((entry, index) => (
      <linearGradient
        key={`gradient-${index}`}
        id={entry.gradientId}
        x1="0"
        y1="0"
        x2="1"
        y2="1"
      >
        <stop
          offset="0%"
          stopColor={CHART_COLORS[index % CHART_COLORS.length]}
          stopOpacity={0.95}
        />
        <stop
          offset="100%"
          stopColor={
            index === 0
              ? colorConfig.gradientTo
              : CHART_COLORS[(index + 1) % CHART_COLORS.length]
          }
          stopOpacity={0.85}
        />
      </linearGradient>
    ));
  };

  return (
    <Card className="overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 bg-gray-50 dark:bg-gray-900 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <div className="flex items-center gap-2">
            <PieIcon className="h-5 w-5 text-gray-500" />
            <CardTitle>Album Popularity</CardTitle>
          </div>
          <CardDescription className="text-gray-500">
            Top {processedListenData.length} most listened albums
          </CardDescription>
        </div>
        <div className="flex">
          <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 bg-white dark:bg-gray-800 text-left sm:border-l sm:border-t-0 sm:px-8 sm:py-6">
            <span className="text-xs text-gray-500 uppercase tracking-wider">
              Total Listens
            </span>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <span className="text-lg font-bold leading-none sm:text-3xl">
                {totalListens.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {loading ? (
          <div className="flex justify-center items-center h-[250px]">
            <Skeleton className="h-[200px] w-[200px] rounded-full" />
          </div>
        ) : (
          <div className="aspect-square h-[300px] mx-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>{renderGradients()}</defs>
                <Tooltip content={<CustomTooltip />} />
                <Pie
                  data={processedListenData}
                  dataKey="listens"
                  nameKey="title"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                  strokeWidth={2}
                  stroke="#ffffff"
                >
                  {processedListenData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        activeIndex === index
                          ? entry.fill
                          : `url(#${entry.gradientId})`
                      }
                      fillOpacity={activeIndex === index ? 1 : 0.9}
                      style={{
                        filter:
                          activeIndex === index
                            ? "drop-shadow(0 4px 6px rgba(221, 0, 37, 0.3))"
                            : "none",
                        transition: "all 0.3s ease",
                      }}
                    />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <g>
                            {/* 添加浅色背景圆形 */}
                            <circle
                              cx={viewBox.cx}
                              cy={viewBox.cy}
                              r={58}
                              fill="white"
                              filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.05))"
                            />
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-foreground text-3xl font-bold"
                              >
                                {totalListens.toLocaleString()}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className="fill-muted-foreground"
                              >
                                Total Listens
                              </tspan>
                            </text>
                          </g>
                        );
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-t flex justify-between items-center text-sm text-gray-500">
        <span>Data based on album plays</span>
        {!loading && processedListenData.length > 0 && (
          <Badge variant="outline" className="flex items-center gap-1">
            <span>Top {processedListenData.length} albums</span>
            <div
              className="h-3 w-3 rounded-full ml-1"
              style={{ backgroundColor: colorConfig.baseColor, opacity: 0.75 }}
            ></div>
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
};

export default PieBar;

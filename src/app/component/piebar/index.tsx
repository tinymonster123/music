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

// 娣囶喗鏁兼稉杞扮瑢InteractiveBar鐎瑰苯鍙忔稉鈧懛瀵告畱妫版粏澹婄化鑽ょ埠
const colorConfig = {
  baseColor: "#ff0000", // 涓昏壊璋冿紝绾孩鑹�
  gradientFrom: "#ff0000",
  gradientTo: "#ff6666", // 杈冩祬鐨勭孩鑹�
  hoverColor: "#cc0000", // 娣辩孩鑹诧紝鎮仠鑹�
};

// 瀹氫箟楗煎浘鐨勬墖褰㈤鑹叉暟缁勶紝浠ヤ富鑹茶皟涓轰腑蹇冩墿灞�
const CHART_COLORS = [
  colorConfig.baseColor, // 涓昏壊璋� - 绾孩鑹�
  "#cc0000", // 娣辩孩鑹�
  "#ff3333", // 浜孩鑹�
  "#ff6666", // 娴呯孩鑹�
  "#990000", // 鏆楃孩鑹�
];

// 閸斻劍鈧胶鏁撻幋鎰禈鐞涖劑鍘ょ純锟�
const generateChartConfig = (data: PieData[]) => {
  const config: Record<string, any> = {
    listens: {
      label: "Listens",
      color: colorConfig.baseColor,
    },
  };

  // 閸欐牕澧�5娑擃亝鏆熼幑顕€銆嶇拋鍓х枂妫版粏澹�
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

  // 婢跺嫮鎮婇弫鐗堝祦閿涙艾褰囬崜锟�5娑擃亝鏁归崥顒勫櫤閺堚偓婢堆呮畱娑撴捁绶�
  const processedListenData = React.useMemo(() => {
    if (!listendata || listendata.length === 0) {
      return [];
    }

    setLoading(false);

    // 婢跺秴鍩楅弫鎵矋閿涘本甯撴惔蹇ョ礉楠炶泛褰囬崜锟�5娑擄拷
    return [...listendata]
      .filter((item) => item.listens > 0) // 鏉╁洦鎶ら幒澶嬫暪閸氼剟鍣烘稉锟�0閻拷
      .sort((a, b) => b.listens - a.listens) // 閹稿鏁归崥顒勫櫤闂勫秴绨�
      .slice(0, 5) // 閸欐牕澧�5娑擄拷
      .map((item, index) => {
        // 娑撶儤鐦℃稉顏堛€嶉悽鐔稿灇濞撴劕褰塈D
        const gradientId = `pieGradient-${index}`;
        return {
          ...item,
          fill: CHART_COLORS[index % CHART_COLORS.length],
          gradientId,
        };
      });
  }, [listendata]);

  // 鐠侊紕鐣婚幀缁樻暪閸氼剟鍣�
  const totalListens = React.useMemo(() => {
    return processedListenData.reduce((acc, curr) => acc + curr.listens, 0);
  }, [processedListenData]);

  // 閸斻劍鈧胶鏁撻幋鎰禈鐞涖劑鍘ょ純锟�
  const chartConfig = React.useMemo(
    () => generateChartConfig(processedListenData),
    [processedListenData]
  );

  // 鐠侊紕鐣婚惂鎯у瀻濮ｏ拷
  const getPercentage = (count: number) => {
    return totalListens > 0 ? Math.round((count / totalListens) * 100) : 0;
  };

  // 閼奉亜鐣炬稊濉紀oltip閸愬懎顔�
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = Math.round((data.listens / totalListens) * 100);

      return (
        <div className="bg-white dark:bg-gray-800 p-3  shadow-lg border border-gray-200 dark:border-gray-700">
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

  // 鏇存柊娓愬彉瀹氫箟
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
    <Card className="overflow-hidden  shadow-md hover:shadow-lg transition-shadow duration-300">
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
                    // 鏇存柊Cell鏍峰紡
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
                            ? "drop-shadow(0 4px 6px rgba(255, 0, 0, 0.3))"
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
                            {/* 濞ｈ濮炲ù鍛板閼冲本娅欓崷鍡楄埌 */}
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

"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";

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
import useListenStore, { PieData } from "@/app/hooks/listensdata";

// 定义图表颜色数组
const CHART_COLORS = ["#8d0000", "#dd0025", "#FF3D3D", "#f35d74", "#ffc3d4"];

// 动态生成图表配置
const generateChartConfig = (data: PieData[]) => {
  const config: Record<string, any> = {
    listens: {
      label: "Listens",
    },
  };

  // 只取前5个数据项设置颜色
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

  // 处理数据：取前5个收听量最大的专辑
  const processedListenData = React.useMemo(() => {
    if (!listendata || listendata.length === 0) {
      return [];
    }

    // 复制数组，排序，并取前5个
    return [...listendata]
      .filter((item) => item.listens > 0) // 过滤掉收听量为0的
      .sort((a, b) => b.listens - a.listens) // 按收听量降序
      .slice(0, 5) // 取前5个
      .map((item, index) => ({
        ...item,
        fill: CHART_COLORS[index % CHART_COLORS.length], // 添加颜色
      }));
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

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Top Albums by Listens</CardTitle>
        <CardDescription>Showing most played albums</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Pie
              data={processedListenData}
              dataKey="listens"
              nameKey="title"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
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
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Top {processedListenData.length} albums by listen count
        </div>
      </CardFooter>
    </Card>
  );
};

export default PieBar;

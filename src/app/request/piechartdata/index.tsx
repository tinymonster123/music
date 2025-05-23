import { useCallback, useEffect, useState } from "react";
import useListenStore from "@/app/hooks/listensdata";
import axios from "axios";
import { PieData } from "@/app/hooks/listensdata";

const PieChartData = () => {
  const { setListen } = useListenStore();
  const [isLoading, setIsLoading] = useState(false);

  const getListen = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const cacheKey = "album_listens";
      let data;

      const [dataFromCache, response] = await Promise.all([
        new Promise((resolve) => {
          const cacheData = localStorage.getItem(cacheKey);
          if (cacheData) {
            try {
              resolve(JSON.parse(cacheData));
            } catch (error) {
              console.error(error);
              resolve(null);
            }
          } else {
            resolve(null);
          }
        }),
        axios.get("/api/pieData"),
      ]);
      data =
        dataFromCache || response.status === 304
          ? dataFromCache // 如果是304，使用缓存数据
          : response.status === 200 && response.data.success
          ? response.data.data
          : null;

      // console.log(data);

      if (data) {
        const listenMessages: PieData[] = data.map((item: any) => ({
          listens: item.album_listens,
          title: item.album_title,
        }));

        // console.log(listenMessages);

        // 保存数据到 localStorage，以便在收到 304 响应时使用
        try {
          const CACHE_DURATION = 24 * 60 * 60 * 1000; // 例如24小时
          localStorage.setItem(cacheKey, JSON.stringify(data));
          localStorage.setItem(
            `${cacheKey}_expiry`,
            String(Date.now() + CACHE_DURATION)
          );
        } catch (error) {
          console.error("Failed to cache data:", error);
        }

        setListen(listenMessages);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [setListen]);

  useEffect(() => {
    getListen();
  }, [getListen]);

  return null;
};

export default PieChartData;

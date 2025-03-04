import { useEffect } from "react";
import useListenStore from "@/app/hooks/listensdata";
import axios from "axios";
import { PieData } from "@/app/hooks/listensdata";

const PieChartData = () => {
  const { setListen } = useListenStore();

  useEffect(() => {
    const getListen = async () => {
      try {
        const cacheKey = "album_listens";
        let data;

        const [dataFromCache, response] = await Promise.all([
          new Promise((resolve) => {
            const cacheData = sessionStorage.getItem(cacheKey);
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
          dataFromCache || (response.status === 200 && response.data.success)
            ? response.data.data
            : null;

        // console.log(data);

        if (data) {
          const listenMessages: PieData[] = [];
          data.forEach((item: any) => {
            // console.log(item);

            listenMessages.push({
              listens: item.album_listens,
              title: item.album_title,
            });
          });

          // console.log(listenMessages);

          setListen(listenMessages);
        }
      } catch (error) {
        console.error(error);
      }
    };

    getListen();

    // loadPriority(() => {
    //   getAlbum();
    // });
  }, [setListen]);

  return null;
};

export default PieChartData;

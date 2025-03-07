import { useEffect } from "react";
import useAlbumStore from "../../hooks/albumdate";
import axios from "axios";
import { AlbumMessage } from "../../hooks/albumdate";

const AlbumDateDisplay = () => {
  const { setAlbum } = useAlbumStore();

  useEffect(() => {
    const getAlbum = async () => {
      try {
        const cacheKey = "album_date_cache";
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
          axios.get("/api/dataStatics"),
        ]);
        data =
          dataFromCache || (response.status === 200 && response.data.success)
            ? response.data.data
            : null;

        if (data) {
          const dataMessages: AlbumMessage[] = [];
          data.forEach((item: AlbumMessage) => {
            let album_date_created = item.album_date_created.split(" ")[0];
            let [day, month, year] = album_date_created.split("/");
            album_date_created = `${year}-${month}-${day}`;
            let newAlbum = {
              album_id: item.album_id,
              album_date_created: album_date_created,
            };

            dataMessages.push(newAlbum);
          });

          setAlbum(dataMessages);
        }
      } catch (error) {
        console.error(error);
      }
    };

    getAlbum();
  }, [setAlbum]);

  return null;
};

export default AlbumDateDisplay;

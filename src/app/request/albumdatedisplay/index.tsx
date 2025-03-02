import { useEffect } from "react";
import useAlbumStore from "../../hooks/albumdate";
import axios from "axios";
import { AlbumMessage } from "../../hooks/albumdate";

const AlbumDateDisplay = () => {
  const { setAlbum } = useAlbumStore();

  useEffect(() => {
    const loadPriority = window.requestIdleCallback || setTimeout;

    const getAlbum = async () => {
      try {
        const response = await axios.get("/api/dataStatics");
        const cacheKey = "album_date_cache";
        let data;

        const cacheData = sessionStorage.getItem(cacheKey);
        if (cacheData) {
          data = JSON.parse(cacheData);
          console.log(data);
          
        } else {
          if (response.status === 200 && response.data.success) {
            data = response.data.data;
            sessionStorage.setItem(cacheKey, JSON.stringify(data));
          }
        }

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

    loadPriority(() => {
      getAlbum();
    });
  }, [setAlbum]);

  return null;
};

export default AlbumDateDisplay;

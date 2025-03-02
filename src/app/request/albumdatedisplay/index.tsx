import { useEffect } from "react";
import useAlbumStore from "../../hooks/albumdate";
import axios from "axios";
import { AlbumMessage } from "../../hooks/albumdate";

const AlbumDateDisplay = () => {
  const { setAlbum } = useAlbumStore();

  useEffect(() => {
    const getAlbum = async () => {
      try {
        const response = await axios.get("/api/dataStatics");
        if (response.status === 200 && response.data.success) {
          const data = response.data.data;
          const dataMessages:AlbumMessage[] = [];
          data.forEach((item: AlbumMessage) => {
            let album_date_created = item.album_date_created.split("")[0];
            let [day, month, year] = album_date_created.split("/");
            album_date_created = `${year}-${month}-${day}`;

            let newAlbum = {
              album_id: item.album_id,
              album_date_created: album_date_created,
            };

            dataMessages.push(newAlbum);
            console.log(newAlbum);
            
          });

          setAlbum(dataMessages)
        }
      } catch (error) {
        console.error(error);
      }
    };

    getAlbum();
  }, []);
};

export default AlbumDateDisplay;

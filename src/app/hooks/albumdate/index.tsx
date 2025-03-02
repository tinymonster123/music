import { create } from "zustand";

export interface AlbumMessage {
  album_id: Number;
  album_date_created: string;
}

export interface AlbumState {
  album: AlbumMessage;
  setAlbum: (album: AlbumMessage) => void;
}

const useAlbumStore = create<AlbumState>((set) => ({
    album:{
        album_id:0,
        album_date_created:"",
    },
    setAlbum:(album) => set({album})
}))

export default useAlbumStore
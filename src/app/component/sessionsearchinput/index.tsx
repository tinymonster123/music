import SearchInput from "@/app/component/searchInput";
import { SessionProvider } from "next-auth/react";

const SessionSearchInput = () => {
  return (
    <SessionProvider>
      <SearchInput />
    </SessionProvider>
  );
};

export default SessionSearchInput;

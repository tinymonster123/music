import { useSession } from "next-auth/react";
import TopBar from "@/app/component/topBar";
import SessionTopBar from "@/app/component/sessionTopBar";

const AuthTopBar = () => {
	const { data: session, status } = useSession();
	const isAuthenticated = status === "authenticated";

	return isAuthenticated ? <SessionTopBar /> : <TopBar />;
};

export default AuthTopBar;

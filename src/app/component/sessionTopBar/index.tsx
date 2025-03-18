import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import Link from "next/link";

const SessionTopBar = () => {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <header className="sticky top-0 left-0 right-0 bg-white/95 shadow-sm backdrop-blur-sm z-50 border-b border-gray-100">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* 左侧导航链接 */}
        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className="text-gray-700 hover:text-pinky-deepRed transition-colors font-medium"
          >
            HomePage
          </Link>
          <Link
            href="/pages/showpage"
            className="text-gray-700 hover:text-pinky-deepRed transition-colors font-medium"
          >
            Data Page
          </Link>
        </div>

        {/* 右侧用户信息和退出按钮 */}
        <div className="flex items-center space-x-6">
          {/* 用户信息 */}
          <div className="flex items-center space-x-3">
            <Avatar className="h-9 w-9 rounded-full ring-2 ring-white overflow-hidden">
              {session?.user?.image ? (
                <AvatarImage
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <AvatarImage
                  src="https://xsgames.co/randomusers/avatar.php?g=pixel"
                  alt="Default avatar"
                  className="h-full w-full object-cover"
                />
              )}
              <AvatarFallback className="bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-medium">
                {session?.user?.name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block text-sm font-medium text-gray-700">
              {session?.user?.name || "用户"}
            </div>
          </div>

          <button
            className="px-4 py-2 rounded-md bg-[#ff0000] text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pinky-deepRed"
            onClick={async () => {
              await signOut({ redirect: false });
              router.push("/");
              router.refresh();
            }}
          >
            Sign Out
          </button>
        </div>
      </nav>
    </header>
  );
};

export default SessionTopBar;

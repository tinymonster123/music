"use client";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSQLStore } from "@/app/hooks/sqldate";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";
import { debounce } from "lodash";

const SearchInput = () => {
  const { status } = useSession();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const { setSQL, setColumns } = useSQLStore();
  const ifAuth = status === "authenticated";
  const router = useRouter();
  const currentPage = usePathname();
  const cancelTokenRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel("组件卸载,请求取消");
      }
    };
  }, []);

  const handleClick = () => {
    if (currentPage === "/pages/showpage") {
      router.push("/");
    } else if (currentPage === "/pages/virtualizedList") {
      router.push("/pages/showpage");
    }
  };
  const handleSubmit = debounce(async () => {
    if (!ifAuth) {
      console.log("请先进行登录");

      toast({
        description: "请先进行登录",
        variant: "destructive",
      });
      return;
    }

    console.log(query);

    if (!query.trim()) {
      console.log("搜索内容不能为空");
      toast({
        description: "搜索内容不能为空",
        variant: "destructive",
      });
      return;
    }
    try {
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel("之前的请求取消");
      }

      cancelTokenRef.current = axios.CancelToken.source();

      const response = await axios.post(
        "/api/text2sql",
        {
          question: query.trim(),
        },
        {
          cancelToken: cancelTokenRef.current.token,
        }
      );
      const data = response.data;
      console.log(data);

      if (data.status === 200 && data.success) {
        setSQL(data.data);
        setColumns(data.columns);
        console.log("成功实现 text to sql");

        toast({
          description: "成功实现 text to sql",
        });
        cancelTokenRef.current = null;
        router.push("/pages/virtualizedList");
      } else {
        switch (data.status) {
          case 400:
            console.log("未登录错误");

            toast({
              description: "未登录错误",
              variant: "destructive",
            });
            break;
          case 401:
            console.log("请求错误");

            toast({
              description: "请求错误",
              variant: "destructive",
            });
            break;
          default:
            console.log("请求错误");

            toast({
              description: "请求错误",
              variant: "destructive",
            });
        }
      }
    } catch (error: any) {
      // console.error(error.response.data.message);
      if (axios.isCancel(error)) {
        console.error("请求被取消:", error.message);
        return;
      }
      console.error(error);
      const errorMessage = error.response.data.message || "请求错误";
      toast({
        description: `${errorMessage}`,
        variant: "destructive",
      });
    }
  }, 300);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("将要执行函数");
    handleSubmit();
    console.log("执行结束函数");
  };

  return (
    <form
      className="h-20 flex justify-center items-center w-full px-4 md:px-8"
      onSubmit={onSubmit}
    >
      <div
        className="h-6 w-6 rounded-full bg-[#ff0000] text-primary-foreground mr-5"
        onClick={handleClick}
      >
        <ArrowLeft />
      </div>
      <div className="flex flex-row gap-2 md:gap-4 w-full max-w-2xl">
        <div className="relative flex-1">
          <Input
            placeholder="Search for music"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="pr-10 h-11 rounded-lg border-gray-300 focus:ring-2 focus:ring-red-100 focus:border-none transition-all"
          />
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
        <Button className="bg-[#ff0000] hover:bg-red-700 text-white font-medium h-11 px-6 rounded-lg shadow-sm transition-colors">
          Search
        </Button>
      </div>
    </form>
  );
};

export default SearchInput;

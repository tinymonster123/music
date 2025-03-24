"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSQLStore } from "@/app/hooks/sqldate";
import { useSession } from "next-auth/react";
import axios from "axios";

const SearchInput = () => {
  const { status } = useSession();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const { setSQL, setColumns } = useSQLStore();
  const ifAuth = status === "authenticated";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!ifAuth) {
      toast({
        description: "请先进行登录",
        variant: "destructive",
      });
      return;
    }

    console.log(query);

    if (!query.trim()) {
      toast({
        description: "搜索内容不能为空",
        variant: "destructive",
      });
      return;
    }
    try {
      const response = await axios.post("/api/text2sql", {
        question: query.trim(),
      });
      const data = response.data;
      console.log(data);

      if (data.status === 200 && data.success) {
        setSQL(data.data);
        setColumns(data.columns);
        toast({
          description: "成功实现 text to sql",
        });
      } else {
        switch (data.status) {
          case 400:
            toast({
              description: "未登录错误",
              variant: "destructive",
            });
            break;
          case 401:
            toast({
              description: "请求错误",
              variant: "destructive",
            });
            break;
          default:
            toast({
              description: "请求错误",
              variant: "destructive",
            });
        }
      }
    } catch (error: any) {
      // console.error(error.response.data.message);
      console.error(error);
      const errorMessage = error.response.data.message || "请求错误";
      toast({
        description: `${errorMessage}`,
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <form
      className="h-20 flex justify-center items-center w-full px-4 md:px-8"
      onSubmit={handleSubmit}
    >
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

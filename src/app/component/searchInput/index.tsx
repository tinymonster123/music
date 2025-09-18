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
import { useGlobalLoading } from "@/app/hooks/loading";

const SearchInput = () => {
	const { status } = useSession();
	const { toast } = useToast();
	const [query, setQuery] = useState("");
	const { setLoading, isLoading } = useGlobalLoading();
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
			setLoading("searchInput", false); // 重置加载状态
			return;
		}

		console.log(query);

		if (!query.trim()) {
			console.log("搜索内容不能为空");
			toast({
				description: "搜索内容不能为空",
				variant: "destructive",
			});
			setLoading("searchInput", false); // 重置加载状态
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
				},
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
				setLoading("searchInput", false); // 重置加载状态
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
			setLoading("searchInput", false); // 错误状态下也重置加载状态
		} catch (error: any) {
			// console.error(error.response.data.message);
			if (axios.isCancel(error)) {
				console.error("请求被取消:", error.message);
				setLoading("searchInput", false); // 请求取消时也需要重置加载状态
				return;
			}
			console.error(error);
			const errorMessage = error.response?.data?.message || "请求错误";
			toast({
				description: `${errorMessage}`,
				variant: "destructive",
			});
			setLoading("searchInput", false); // 错误时重置加载状态
		}
	}, 300);

	const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		console.log("将要执行函数");
		setLoading("searchInput", true); // 设置加载状态为 true
		handleSubmit();
		console.log("执行结束函数");
	};

	return (
		<form
			className="h-20 flex justify-center items-center w-full px-4 md:px-8"
			onSubmit={onSubmit}
		>
			<button
				type="button"
				className="h-6 w-6 rounded-full bg-[#ff0000] text-primary-foreground mr-5 flex items-center justify-center"
				onClick={handleClick}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						handleClick();
					}
				}}
			>
				<ArrowLeft />
			</button>
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
							<title>Search</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							/>
						</svg>
					</div>
				</div>
				<Button
					className="bg-[#ff0000] hover:bg-red-700 text-white font-medium h-11 px-6 rounded-lg shadow-sm transition-colors"
					disabled={isLoading("searchInput")}
				>
					{isLoading("searchInput") ? (
						<div className="flex items-center">
							<svg
								className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<title>Loading</title>
								<circle
									className="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="4"
								></circle>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							搜索中...
						</div>
					) : (
						"Search"
					)}
				</Button>
			</div>
		</form>
	);
};

export default SearchInput;

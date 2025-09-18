"use client";
import AnimatorLetter from "@/app/component/animatorletter";
import Image from "next/image";
import LazyLoader from "@/app/component/lazyloader";
import Introduction from "../introduction";
import { useEffect, useState } from "react";
import AuthTopBar from "@/app/component/authTopBar";

const StaticLetter = () => {
	return (
		<div className="w-full h-screen flex items-center justify-center bg-white transform-gpu">
			<div className="w-full" style={{ maxWidth: "681pt" }}>
				<Image
					src="/letter.svg"
					alt="Letter"
					width={681}
					height={131}
					className="w-full"
					style={{
						height: "auto",
					}}
					loading="eager"
					priority={true}
					unoptimized={true}
				/>
			</div>
		</div>
	);
};

const HomePage = () => {
	const [showAnimation, setShowAnimation] = useState(false);
	const key = "hasBeenWatched";

	useEffect(() => {
		if (typeof window !== "undefined") {
			const hasBeenWatchedAnimation = sessionStorage.getItem(key);
			if (!hasBeenWatchedAnimation) {
				setShowAnimation(true);
				sessionStorage.setItem(key, "true");
			}
		}
	}, []);

	const handleAnimationComplete = () => {
		setShowAnimation(false);
	};

	return (
		<>
			<AuthTopBar />
			{showAnimation ? (
				<AnimatorLetter handleAnimationComplete={handleAnimationComplete} />
			) : (
				<StaticLetter />
			)}
			<LazyLoader>
				<Introduction />
			</LazyLoader>
		</>
	);
};

export default HomePage;

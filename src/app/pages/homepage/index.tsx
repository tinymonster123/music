import TopBar from "@/app/component/topBar"
import AnimatorLetter from "@/app/component/animatorletter"
import LazyLoader from "@/app/component/lazyloader"

const HomePage = () => {
    return (
        <>
        <TopBar />
        <AnimatorLetter />
        <LazyLoader>
            <div className="w-100% h-100%">
                <h1>你好</h1>
            </div>
        </LazyLoader>
        </>
    )

}

export default HomePage
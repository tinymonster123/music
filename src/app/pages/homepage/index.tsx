import TopBar from "@/app/component/topBar";
import AnimatorLetter from "@/app/component/animatorletter";
import LazyLoader from "@/app/component/lazyloader";
import Introduction from "../introduction";

const HomePage = () => {
  return (
    <>
      <TopBar />
      <AnimatorLetter />
      <LazyLoader>
        <Introduction />
      </LazyLoader>
    </>
  );
};

export default HomePage;

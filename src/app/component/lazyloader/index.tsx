"use client"
import { useState, useEffect, useRef } from "react";

import { ReactNode } from "react";

const LazyLoader = ({ children }: { children: ReactNode }) => {
  const [visibility, setVisibility] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    // 声明 intersectionobserver api 用于监视页面懒加载
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibility(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "0px",
        threshold: 0.1,
      }
    );

    if (ref.current) observer.observe(ref.current);

    // useEffect 返回清理函数，当组件卸载时取消观察
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-opacity duration-500 ease-in-out ${
        visibility ? "opacity-100" : "opacity-0"
      }`}
    >
      {visibility && children}
    </div>
  );
};

export default LazyLoader;

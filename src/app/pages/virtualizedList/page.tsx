"use client";
import { SessionLayout } from "../homepage";
import SessionSearchInput from "@/app/component/sessionsearchinput";
import React, { useState, useCallback, useEffect, useMemo } from "react";
import { default as Virtual } from "react-virtualized-list";
import { useSQLStore } from "@/app/hooks/sqldate";

type DynamicDataItem = Record<string, any>;

const PAGESIZE = 20;

export const DataList = () => {
  const { columns, sqlColumns } = useSQLStore();
  const [listData, setListData] = useState<DynamicDataItem[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const [initialLoad, setInitialLoad] = useState<boolean>(true);

  // 修复依赖项和无限循环问题
  const loadMoreData = useCallback(async () => {
    if (!Array.isArray(sqlColumns)) return;

    const startIndex = page * PAGESIZE;
    const endIndex = startIndex + PAGESIZE;
    const newItemData = sqlColumns.slice(startIndex, endIndex);

    if (newItemData.length > 0) {
      setListData((prevData) => [...prevData, ...newItemData]);
      setPage((prevPage) => prevPage + 1);
    }

    // 检查是否还有更多数据
    if (
      newItemData.length < PAGESIZE ||
      (sqlColumns && startIndex + PAGESIZE >= sqlColumns.length)
    ) {
      setHasMore(false);
    }

    return Promise.resolve();
  }, [sqlColumns, page]);

  // 仅在初始化加载或sqlColumns变化时加载数据
  useEffect(() => {
    // 清除现有数据，重置分页
    setListData([]);
    setPage(0);
    setHasMore(true);
    setInitialLoad(true);
  }, [sqlColumns]); // 当数据源变化时重置

  // 处理初始加载
  useEffect(() => {
    if (initialLoad && Array.isArray(sqlColumns)) {
      loadMoreData();
      setInitialLoad(false);
    }
  }, [initialLoad, loadMoreData, sqlColumns]);

  // 动态渲染每个项目，根据columns显示所有字段
  const renderItem = useCallback(
    (item: DynamicDataItem, fetchData?: any): JSX.Element => {
      if (!columns || columns.length === 0) {
        return (
          <div className="p-3 border-b">
            <pre className="text-sm overflow-x-auto">
              {JSON.stringify(item, null, 2)}
            </pre>
          </div>
        );
      }

      return (
        <div className="p-3 border-b hover:bg-gray-50">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {columns.map((column, index) => (
              <div key={index} className="flex flex-col">
                <span className="text-xs text-gray-500 font-medium">
                  {column}
                </span>
                <span className="text-sm truncate">
                  {item[column] !== undefined && item[column] !== null
                    ? String(item[column])
                    : "-"}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    },
    [columns]
  );

  // 表头渲染
  const renderHeader = useMemo(() => {
    if (!columns || columns.length === 0) return null;

    return (
      <div className="sticky top-0 bg-gray-100 p-3 border-b grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 font-medium text-sm">
        {columns.map((column, index) => (
          <div key={index} className="truncate">
            {column}
          </div>
        ))}
      </div>
    );
  }, [columns]);

  return (
    <div className="border rounded-lg overflow-hidden">
      {renderHeader}

      <Virtual
        listData={listData}
        renderItem={renderItem}
        onLoadMore={loadMoreData}
        hasMore={hasMore}
        containerHeight="500px"
        itemClassName="hover:bg-gray-50 transition-colors"
        itemLoader={
          <div className="p-3 text-center">
            <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
            <span className="ml-2">加载中...</span>
          </div>
        }
        loader={
          <div className="p-4 flex justify-center">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
            <span className="ml-2">加载中...</span>
          </div>
        }
        endMessage={
          <div className="p-4 text-center text-gray-500 text-sm">
            {listData.length > 0 ? "已加载所有数据" : "没有数据"}
          </div>
        }
        emptyListMessage={
          <div className="p-8 text-center text-gray-500">
            没有查询结果或未执行查询
          </div>
        }
      />
    </div>
  );
};

const VirtualizedList = () => {
  return (
    <>
      <SessionLayout />
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <SessionSearchInput />
        </div>
        <DataList />
      </div>
    </>
  );
};

export default VirtualizedList;

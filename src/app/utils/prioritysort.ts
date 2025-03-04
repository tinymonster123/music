import { AlbumDateCount } from "../component/interactivebar";

const findTop10Element = (map: Map<string, number>) => {
  const heap: AlbumDateCount[] = [];

  const heapPush = (albumDateCount: AlbumDateCount) => {
    heap.push(albumDateCount);
    let index = heap.length - 1;
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (heap[parentIndex].count <= heap[index].count) break;
      [heap[parentIndex], heap[index]] = [heap[index], heap[parentIndex]];
      index = parentIndex;
    }
  };

  const heapify = (arr: AlbumDateCount[]) => {
    for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i--) {
      bubbleDown(arr, i);
    }
  };

  const bubbleDown = (arr: AlbumDateCount[], i: number) => {
    let smallest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    const n = arr.length;

    if (left < n && arr[left].count < arr[smallest].count) {
      smallest = left;
    }

    if (right < n && arr[right].count < arr[smallest].count) {
      smallest = right;
    }

    if (smallest !== i) {
      [arr[i], arr[smallest]] = [arr[smallest], arr[i]];
      bubbleDown(arr, smallest);
    }
  };

  for (const [date, count] of map) {
    if (heap.length < 10) {
      heapPush({ date: date, count: count });
    } else {
      if (count > heap[0].count) {
        heap[0] = { date: date, count: count };
        bubbleDown(heap, 0);
      }
    }
  }

  heapify(heap);
  heap.sort((a, b) => b.count - a.count);

  return heap;
};

export default findTop10Element;

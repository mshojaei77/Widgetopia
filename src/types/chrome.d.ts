// Chrome Extension API type declarations

declare namespace chrome {
  namespace history {
    interface HistoryItem {
      id?: string;
      url?: string;
      title?: string;
      lastVisitTime?: number;
      visitCount?: number;
      typedCount?: number;
    }

    interface SearchQuery {
      text: string;
      startTime?: number;
      endTime?: number;
      maxResults?: number;
    }

    function search(query: SearchQuery, callback?: (results: HistoryItem[]) => void): Promise<HistoryItem[]>;
    function getVisits(details: { url: string }, callback?: (results: any[]) => void): Promise<any[]>;
    function addUrl(details: { url: string }, callback?: () => void): Promise<void>;
    function deleteUrl(details: { url: string }, callback?: () => void): Promise<void>;
    function deleteRange(range: { startTime: number; endTime: number }, callback?: () => void): Promise<void>;
    function deleteAll(callback?: () => void): Promise<void>;

    namespace onVisited {
      function addListener(callback: (result: HistoryItem) => void): void;
    }

    namespace onVisitRemoved {
      function addListener(callback: (removed: { allHistory: boolean; urls?: string[] }) => void): void;
    }
  }

  namespace storage {
    namespace sync {
      function get(keys?: string | string[] | { [key: string]: any }, callback?: (result: { [key: string]: any }) => void): Promise<{ [key: string]: any }>;
      function set(items: { [key: string]: any }, callback?: () => void): Promise<void>;
      function remove(keys: string | string[], callback?: () => void): Promise<void>;
      function clear(callback?: () => void): Promise<void>;
    }

    namespace local {
      function get(keys?: string | string[] | { [key: string]: any }, callback?: (result: { [key: string]: any }) => void): Promise<{ [key: string]: any }>;
      function set(items: { [key: string]: any }, callback?: () => void): Promise<void>;
      function remove(keys: string | string[], callback?: () => void): Promise<void>;
      function clear(callback?: () => void): Promise<void>;
    }
  }
}

// Make chrome available globally
declare const chrome: typeof chrome; 
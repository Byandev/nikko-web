export interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  }
  
  export interface PaginatedList<T> {
    data: T[];
    meta: PaginationMeta;
  }
  
  export const initialPaginatedList = {
    data: [],
    meta: {
      current_page: 1,
      last_page: 0,
      per_page: 0,
      total: 0,
    },
  };
  
export interface SavedItem {
  id: string;
  label: string;
  timestamp: number;
}

export interface ShareData {
  items: SavedItem[];
}

export type ViewState = 'MAIN' | 'EDIT';
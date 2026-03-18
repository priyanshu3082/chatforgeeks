export interface ChartData {
  chart_type: "bar" | "line" | "area" | "pie" | "scatter" | "heatmap";
  x_axis: string;
  y_axis: string;
  color_key?: string | null;
  title: string;
  data: Record<string, unknown>[];
  columns: string[];
}

export interface QueryResponse {
  session_id: string;
  prompt: string;
  sql_query?: string | null;
  explanation?: string | null;
  error_message?: string | null;
  charts: ChartData[];
  follow_up_questions?: string[];
  download_url?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  queryResponse?: QueryResponse;
}

export interface SchemaColumn {
  name: string;
  type: string;
}

export interface SchemaResponse {
  tables: Record<string, SchemaColumn[]>;
}

export interface UploadResponse {
  table_name: string;
  rows_loaded: number;
  columns: SchemaColumn[];
  preview: Record<string, unknown>[];
  error?: string;
}

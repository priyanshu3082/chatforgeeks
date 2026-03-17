import axios from "axios";
import { QueryResponse, SchemaResponse, UploadResponse } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 120000,
});

export async function sendQuery(
  prompt: string,
  sessionId: string,
  activeTable?: string
): Promise<QueryResponse> {
  const { data } = await api.post<QueryResponse>("/query", {
    prompt,
    session_id: sessionId,
    active_table: activeTable || null,
  });
  return data;
}

export async function getSchema(): Promise<SchemaResponse> {
  const { data } = await api.get<SchemaResponse>("/schema");
  return data;
}

export async function uploadCSV(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post<UploadResponse>("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function clearSession(sessionId: string): Promise<void> {
  await api.delete(`/session/${sessionId}`);
}

import { ScheduleItem } from '@/app/types/schedule';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!apiBaseUrl) {
  console.warn('VITE_API_BASE_URL is missing. Schedule API calls will fail until configured.');
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function fetchLessons(): Promise<ScheduleItem[]> {
  return request<ScheduleItem[]>('/lessons');
}

export async function createLesson(
  lesson: Omit<ScheduleItem, 'id'>
): Promise<ScheduleItem> {
  return request<ScheduleItem>('/lessons', {
    method: 'POST',
    body: JSON.stringify(lesson),
  });
}

export async function updateLesson(lesson: ScheduleItem): Promise<ScheduleItem> {
  return request<ScheduleItem>(`/lessons/${lesson.id}`, {
    method: 'PUT',
    body: JSON.stringify(lesson),
  });
}

export async function removeLesson(lessonId: string): Promise<void> {
  await request<void>(`/lessons/${lessonId}`, {
    method: 'DELETE',
  });
}

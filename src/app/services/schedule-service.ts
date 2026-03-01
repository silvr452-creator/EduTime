import {
  LessonUpsertPayload,
  LookupItem,
  ScheduleItem,
  ScheduleReferenceData,
  WeekDay,
} from '@/app/types/schedule';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!apiBaseUrl) {
  console.warn('VITE_API_BASE_URL is missing. Schedule API calls will fail until configured.');
}

interface ApiLesson {
  id: number;
  day: WeekDay;
  lessonType: ScheduleItem['type'];
  startTime: string;
  endTime: string;
  subjectId: number;
  subjectName: string;
  teacherId: number;
  teacherFullName: string;
  groupId: number;
  groupName: string;
  classroomId: number;
  roomNumber: string;
}

interface ApiReferenceResponse {
  subjects: Array<{ id: number; subjectName: string }>;
  teachers: Array<{ id: number; fullName: string }>;
  groups: Array<{ id: number; groupName: string }>;
  classrooms: Array<{ id: number; roomNumber: string }>;
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

const mapLesson = (lesson: ApiLesson): ScheduleItem => ({
  id: String(lesson.id),
  day: lesson.day,
  startTime: lesson.startTime,
  endTime: lesson.endTime,
  time: `${lesson.startTime} - ${lesson.endTime}`,
  subjectId: lesson.subjectId,
  subject: lesson.subjectName,
  teacherId: lesson.teacherId,
  teacher: lesson.teacherFullName,
  groupId: lesson.groupId,
  group: lesson.groupName,
  classroomId: lesson.classroomId,
  room: lesson.roomNumber,
  type: lesson.lessonType,
});

const mapLookup = (
  rows: Array<Record<string, string | number>>,
  nameField: string
): LookupItem[] => rows.map((row) => ({ id: Number(row.id), name: String(row[nameField]) }));

export async function fetchLessons(): Promise<ScheduleItem[]> {
  const data = await request<ApiLesson[]>('/schedule/lessons');
  return data.map(mapLesson);
}

export async function fetchReferenceData(): Promise<ScheduleReferenceData> {
  const data = await request<ApiReferenceResponse>('/schedule/reference-data');

  return {
    subjects: mapLookup(data.subjects, 'subjectName'),
    teachers: mapLookup(data.teachers, 'fullName'),
    groups: mapLookup(data.groups, 'groupName'),
    classrooms: mapLookup(data.classrooms, 'roomNumber'),
  };
}

export async function createLesson(
  lesson: LessonUpsertPayload
): Promise<ScheduleItem> {
  const data = await request<ApiLesson>('/schedule/lessons', {
    method: 'POST',
    body: JSON.stringify(lesson),
  });

  return mapLesson(data);
}

export async function updateLesson(
  lessonId: string,
  lesson: LessonUpsertPayload
): Promise<ScheduleItem> {
  const data = await request<ApiLesson>(`/schedule/lessons/${lessonId}`, {
    method: 'PUT',
    body: JSON.stringify(lesson),
  });

  return mapLesson(data);
}

export async function removeLesson(lessonId: string): Promise<void> {
  await request<void>(`/schedule/lessons/${lessonId}`, {
    method: 'DELETE',
  });
}

export type LessonType = 'lecture' | 'practice' | 'lab';
export type WeekDay =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday';

export interface LookupItem {
  id: number;
  name: string;
}

export interface ScheduleReferenceData {
  subjects: LookupItem[];
  teachers: LookupItem[];
  groups: LookupItem[];
  classrooms: LookupItem[];
}

export interface ScheduleItem {
  id: string;
  day: WeekDay;
  startTime: string;
  endTime: string;
  time: string;
  subjectId: number;
  subject: string;
  teacherId: number;
  teacher: string;
  groupId: number;
  group: string;
  classroomId: number;
  room: string;
  type: LessonType;
}

export interface LessonUpsertPayload {
  day: WeekDay;
  startTime: string;
  endTime: string;
  subjectId: number;
  teacherId: number;
  groupId: number;
  classroomId: number;
  type: LessonType;
}

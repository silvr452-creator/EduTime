export type LessonType = 'lecture' | 'practice' | 'lab';

export interface ScheduleItem {
  id: string;
  day: string;
  subject: string;
  time: string;
  room: string;
  teacher: string;
  group: string;
  type: LessonType;
}

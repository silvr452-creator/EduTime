import { ScheduleItem } from '@/app/types/schedule';

export const WEEK_DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const;

export type WeekDay = (typeof WEEK_DAYS)[number];

export const createEmptySchedule = (): Record<string, ScheduleItem[]> => ({
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
});

export const toScheduleMap = (lessons: ScheduleItem[]) => {
  const schedule = createEmptySchedule();

  lessons.forEach((lesson) => {
    if (!schedule[lesson.day]) {
      schedule[lesson.day] = [];
    }
    schedule[lesson.day].push(lesson);
  });

  return schedule;
};

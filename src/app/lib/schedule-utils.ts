import { ScheduleItem, WeekDay } from '@/app/types/schedule';

export const WEEK_DAYS: WeekDay[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

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

    const withTime = {
      ...lesson,
      time: `${lesson.startTime} - ${lesson.endTime}`,
    };

    schedule[lesson.day].push(withTime);
  });

  return schedule;
};

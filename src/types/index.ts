export interface CourseCategory {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface Course {
  id: string;
  name: string;
  categoryId: string;
  classroomId: string;
  duration: number;
  weeklyClassCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export const FREE_ACTIVITY_COURSE_ID = '__free_activity__';

export interface Chapter {
  id: string;
  courseId: string;
  name: string;
  order: number;
  sections: number;
  createdAt: string;
}

export interface Teacher {
  id: string;
  name: string;
  avatar?: string;
  phone?: string;
  email?: string;
  courseIds: string[];
  createdAt: string;
}

export interface TimeSlot {
  id: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  startTime: string;
  endTime: string;
}

export interface Classroom {
  id: string;
  name: string;
  capacity: number;
}

export interface ScheduleItem {
  id: string;
  courseId: string;
  chapterId: string;
  sectionIndex: number;
  teacherId: string;
  timeSlotId: string;
  classroomId: string;
  date: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
}

export type SchedulingRule = 'round-robin' | 'random';

export interface SchedulingConfig {
  rule: SchedulingRule;
  courses: Course[];
  chapters: Chapter[];
  teachers: Teacher[];
  timeSlots: TimeSlot[];
  classrooms: Classroom[];
  startDate: string;
  weeks: number;
  dailyClassCount: number;
}

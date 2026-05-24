import Dexie, { type EntityTable } from 'dexie';
import { CourseCategory, Course, Chapter, Teacher, TimeSlot, Classroom, ScheduleItem } from '@/types';

export class AppDatabase extends Dexie {
  categories!: EntityTable<CourseCategory, 'id'>;
  courses!: EntityTable<Course, 'id'>;
  chapters!: EntityTable<Chapter, 'id'>;
  teachers!: EntityTable<Teacher, 'id'>;
  timeSlots!: EntityTable<TimeSlot, 'id'>;
  classrooms!: EntityTable<Classroom, 'id'>;
  schedules!: EntityTable<ScheduleItem, 'id'>;

  constructor() {
    super('SchedulingPlatformDB');

    this.version(1).stores({
      categories: 'id, name',
      courses: 'id, name, categoryId',
      chapters: 'id, courseId',
      teachers: 'id, name',
      timeSlots: 'id',
      classrooms: 'id, name',
      schedules: 'id, date, courseId, teacherId',
    });
  }
}

export const db = new AppDatabase();

export const initializeDatabase = async () => {
  const categoryCount = await db.categories.count();
  if (categoryCount > 0) return;

  const now = new Date().toISOString();

  await db.categories.bulkAdd([
    { id: 'cat-1', name: '语文', description: '语言文学类课程', createdAt: now },
    { id: 'cat-2', name: '数学', description: '数学逻辑类课程', createdAt: now },
    { id: 'cat-3', name: '英语', description: '英语语言类课程', createdAt: now },
  ]);

  await db.classrooms.bulkAdd([
    { id: 'room-1', name: '101教室', capacity: 40 },
    { id: 'room-2', name: '102教室', capacity: 35 },
    { id: 'room-3', name: '103教室', capacity: 30 },
  ]);

  await db.courses.bulkAdd([
    { id: 'course-1', name: '语文基础', categoryId: 'cat-1', classroomId: 'room-1', duration: 45, weeklyClassCount: 1, status: 'active', createdAt: now },
    { id: 'course-2', name: '数学基础', categoryId: 'cat-2', classroomId: 'room-2', duration: 45, weeklyClassCount: 3, status: 'active', createdAt: now },
    { id: 'course-3', name: '英语口语', categoryId: 'cat-3', classroomId: 'room-3', duration: 40, weeklyClassCount: 2, status: 'active', createdAt: now },
  ]);

  await db.chapters.bulkAdd([
    { id: 'ch-1', courseId: 'course-1', name: '第一章', order: 1, sections: 4, createdAt: now },
    { id: 'ch-2', courseId: 'course-1', name: '第二章', order: 2, sections: 4, createdAt: now },
    { id: 'ch-3', courseId: 'course-2', name: '第一章', order: 1, sections: 4, createdAt: now },
    { id: 'ch-4', courseId: 'course-2', name: '第二章', order: 2, sections: 4, createdAt: now },
    { id: 'ch-5', courseId: 'course-3', name: 'Unit 1', order: 1, sections: 3, createdAt: now },
    { id: 'ch-6', courseId: 'course-3', name: 'Unit 2', order: 2, sections: 3, createdAt: now },
  ]);

  await db.teachers.bulkAdd([
    { id: 'teacher-1', name: '张老师', phone: '13800138001', email: 'zhang@example.com', courseIds: ['course-1'], createdAt: now },
    { id: 'teacher-2', name: '李老师', phone: '13800138002', email: 'li@example.com', courseIds: ['course-2'], createdAt: now },
    { id: 'teacher-3', name: '王老师', phone: '13800138003', email: 'wang@example.com', courseIds: ['course-3'], createdAt: now },
  ]);

  await db.timeSlots.bulkAdd([
    { id: 'slot-1', dayOfWeek: 1, startTime: '08:00', endTime: '08:45' },
    { id: 'slot-2', dayOfWeek: 1, startTime: '09:00', endTime: '09:45' },
    { id: 'slot-3', dayOfWeek: 1, startTime: '10:00', endTime: '10:45' },
    { id: 'slot-4', dayOfWeek: 2, startTime: '08:00', endTime: '08:45' },
    { id: 'slot-5', dayOfWeek: 2, startTime: '09:00', endTime: '09:45' },
    { id: 'slot-6', dayOfWeek: 2, startTime: '10:00', endTime: '10:45' },
    { id: 'slot-7', dayOfWeek: 3, startTime: '08:00', endTime: '08:45' },
    { id: 'slot-8', dayOfWeek: 3, startTime: '09:00', endTime: '09:45' },
    { id: 'slot-9', dayOfWeek: 3, startTime: '10:00', endTime: '10:45' },
  ]);
};

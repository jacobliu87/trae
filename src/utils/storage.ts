const STORAGE_KEYS: Record<string, string> = {
  categories: 'scheduling_categories',
  courses: 'scheduling_courses',
  chapters: 'scheduling_chapters',
  teachers: 'scheduling_teachers',
  schedules: 'scheduling_schedules',
  timeSlots: 'scheduling_time_slots',
  classrooms: 'scheduling_classrooms',
};

export const storage = {
  get<T>(key: string): T[] {
    const data = localStorage.getItem(STORAGE_KEYS[key]);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  set<T>(key: string, value: T[]): void {
    localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(value));
  },

  clear(key: string): void {
    localStorage.removeItem(STORAGE_KEYS[key]);
  },

  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },
};

export const initializeDefaultData = () => {
  if (storage.get('categories').length === 0) {
    storage.set('categories', [
      { id: 'cat-1', name: '语文', description: '语言文学类课程', createdAt: new Date().toISOString() },
      { id: 'cat-2', name: '数学', description: '数学逻辑类课程', createdAt: new Date().toISOString() },
      { id: 'cat-3', name: '英语', description: '英语语言类课程', createdAt: new Date().toISOString() },
    ]);
  }

  if (storage.get('courses').length === 0) {
    storage.set('courses', [
      { id: 'course-1', name: '语文基础', categoryId: 'cat-1', duration: 45, status: 'active', createdAt: new Date().toISOString() },
      { id: 'course-2', name: '数学基础', categoryId: 'cat-2', duration: 45, status: 'active', createdAt: new Date().toISOString() },
      { id: 'course-3', name: '英语口语', categoryId: 'cat-3', duration: 40, status: 'active', createdAt: new Date().toISOString() },
    ]);
  }

  if (storage.get('chapters').length === 0) {
    storage.set('chapters', [
      { id: 'ch-1', courseId: 'course-1', name: '第一章', order: 1, sections: 4, createdAt: new Date().toISOString() },
      { id: 'ch-2', courseId: 'course-1', name: '第二章', order: 2, sections: 4, createdAt: new Date().toISOString() },
      { id: 'ch-3', courseId: 'course-2', name: '第一章', order: 1, sections: 4, createdAt: new Date().toISOString() },
      { id: 'ch-4', courseId: 'course-2', name: '第二章', order: 2, sections: 4, createdAt: new Date().toISOString() },
      { id: 'ch-5', courseId: 'course-3', name: 'Unit 1', order: 1, sections: 3, createdAt: new Date().toISOString() },
      { id: 'ch-6', courseId: 'course-3', name: 'Unit 2', order: 2, sections: 3, createdAt: new Date().toISOString() },
    ]);
  }

  if (storage.get('teachers').length === 0) {
    storage.set('teachers', [
      { id: 'teacher-1', name: '张老师', phone: '13800138001', email: 'zhang@example.com', courseIds: ['course-1'], createdAt: new Date().toISOString() },
      { id: 'teacher-2', name: '李老师', phone: '13800138002', email: 'li@example.com', courseIds: ['course-2'], createdAt: new Date().toISOString() },
      { id: 'teacher-3', name: '王老师', phone: '13800138003', email: 'wang@example.com', courseIds: ['course-3'], createdAt: new Date().toISOString() },
    ]);
  }

  if (storage.get('timeSlots').length === 0) {
    storage.set('timeSlots', [
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
  }

  if (storage.get('classrooms').length === 0) {
    storage.set('classrooms', [
      { id: 'room-1', name: '101教室', capacity: 40 },
      { id: 'room-2', name: '102教室', capacity: 35 },
      { id: 'room-3', name: '103教室', capacity: 30 },
    ]);
  }
};

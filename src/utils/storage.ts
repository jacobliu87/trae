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
    ]);
  }
};

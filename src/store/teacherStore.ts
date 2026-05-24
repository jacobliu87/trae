import { create } from 'zustand';
import { Teacher } from '@/types';
import { db } from '@/utils/database';
import { generateId } from '@/utils/helpers';

interface TeacherState {
  teachers: Teacher[];
  initialize: () => Promise<void>;
  addTeacher: (teacher: Omit<Teacher, 'id' | 'createdAt'>) => Promise<void>;
  updateTeacher: (id: string, updates: Partial<Teacher>) => Promise<void>;
  deleteTeacher: (id: string) => Promise<void>;
  getTeacherById: (id: string) => Teacher | undefined;
  getTeachersByCourse: (courseId: string) => Teacher[];
}

export const useTeacherStore = create<TeacherState>((set, get) => ({
  teachers: [],

  initialize: async () => {
    const teachers = await db.teachers.toArray();
    set({ teachers });
  },

  addTeacher: async (teacher) => {
    const newTeacher: Teacher = {
      ...teacher,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    await db.teachers.add(newTeacher);
    set({ teachers: [...get().teachers, newTeacher] });
  },

  updateTeacher: async (id, updates) => {
    await db.teachers.update(id, updates);
    const updated = get().teachers.map(teacher =>
      teacher.id === id ? { ...teacher, ...updates } : teacher
    );
    set({ teachers: updated });
  },

  deleteTeacher: async (id) => {
    await db.teachers.delete(id);
    set({ teachers: get().teachers.filter(teacher => teacher.id !== id) });
  },

  getTeacherById: (id) => {
    return get().teachers.find(teacher => teacher.id === id);
  },

  getTeachersByCourse: (courseId) => {
    return get().teachers.filter(teacher => teacher.courseIds.includes(courseId));
  },
}));

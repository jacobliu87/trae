import { create } from 'zustand';
import { Course, CourseCategory } from '@/types';
import { db } from '@/utils/database';
import { generateId } from '@/utils/helpers';

interface CourseState {
  categories: CourseCategory[];
  courses: Course[];
  selectedCategoryId: string | null;
  initialize: () => Promise<void>;
  addCategory: (category: Omit<CourseCategory, 'id' | 'createdAt'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<CourseCategory>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addCourse: (course: Omit<Course, 'id' | 'createdAt'>) => Promise<void>;
  updateCourse: (id: string, updates: Partial<Course>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  selectCategory: (id: string | null) => void;
  getCourseById: (id: string) => Course | undefined;
  getCategoryById: (id: string) => CourseCategory | undefined;
  getCoursesByCategory: (categoryId: string) => Course[];
}

export const useCourseStore = create<CourseState>((set, get) => ({
  categories: [],
  courses: [],
  selectedCategoryId: null,

  initialize: async () => {
    const categories = await db.categories.toArray();
    const courses = await db.courses.toArray();
    set({ categories, courses });
  },

  addCategory: async (category) => {
    const newCategory: CourseCategory = {
      ...category,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    await db.categories.add(newCategory);
    set({ categories: [...get().categories, newCategory] });
  },

  updateCategory: async (id, updates) => {
    await db.categories.update(id, updates);
    const updated = get().categories.map(cat =>
      cat.id === id ? { ...cat, ...updates } : cat
    );
    set({ categories: updated });
  },

  deleteCategory: async (id) => {
    await db.categories.delete(id);
    const coursesToDelete = get().courses.filter(c => c.categoryId === id);
    await db.courses.bulkDelete(coursesToDelete.map(c => c.id));
    set({
      categories: get().categories.filter(cat => cat.id !== id),
      courses: get().courses.filter(course => course.categoryId !== id),
    });
  },

  addCourse: async (course) => {
    const newCourse: Course = {
      ...course,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    await db.courses.add(newCourse);
    set({ courses: [...get().courses, newCourse] });
  },

  updateCourse: async (id, updates) => {
    await db.courses.update(id, updates);
    const updated = get().courses.map(course =>
      course.id === id ? { ...course, ...updates } : course
    );
    set({ courses: updated });
  },

  deleteCourse: async (id) => {
    await db.courses.delete(id);
    const chaptersToDelete = await db.chapters.where('courseId').equals(id).toArray();
    await db.chapters.bulkDelete(chaptersToDelete.map(ch => ch.id));
    set({ courses: get().courses.filter(course => course.id !== id) });
  },

  selectCategory: (id) => {
    set({ selectedCategoryId: id });
  },

  getCourseById: (id) => {
    return get().courses.find(course => course.id === id);
  },

  getCategoryById: (id) => {
    return get().categories.find(cat => cat.id === id);
  },

  getCoursesByCategory: (categoryId) => {
    return get().courses.filter(course => course.categoryId === categoryId);
  },
}));

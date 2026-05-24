import { create } from 'zustand';
import { Chapter } from '@/types';
import { db } from '@/utils/database';
import { generateId } from '@/utils/helpers';

interface ChapterState {
  chapters: Chapter[];
  initialize: () => Promise<void>;
  addChapter: (chapter: Omit<Chapter, 'id' | 'createdAt'>) => Promise<void>;
  updateChapter: (id: string, updates: Partial<Chapter>) => Promise<void>;
  deleteChapter: (id: string) => Promise<void>;
  getChaptersByCourse: (courseId: string) => Chapter[];
}

export const useChapterStore = create<ChapterState>((set, get) => ({
  chapters: [],

  initialize: async () => {
    const chapters = await db.chapters.toArray();
    set({ chapters });
  },

  addChapter: async (chapter) => {
    const newChapter: Chapter = {
      ...chapter,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    await db.chapters.add(newChapter);
    set({ chapters: [...get().chapters, newChapter] });
  },

  updateChapter: async (id, updates) => {
    await db.chapters.update(id, updates);
    const updated = get().chapters.map(ch =>
      ch.id === id ? { ...ch, ...updates } : ch
    );
    set({ chapters: updated });
  },

  deleteChapter: async (id) => {
    await db.chapters.delete(id);
    set({ chapters: get().chapters.filter(ch => ch.id !== id) });
  },

  getChaptersByCourse: (courseId) => {
    return get().chapters
      .filter(ch => ch.courseId === courseId)
      .sort((a, b) => a.order - b.order);
  },
}));

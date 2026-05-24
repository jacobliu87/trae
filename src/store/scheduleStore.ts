import { create } from 'zustand';
import { ScheduleItem, TimeSlot, Classroom } from '@/types';
import { db } from '@/utils/database';
import { generateId } from '@/utils/helpers';

interface ScheduleState {
  schedules: ScheduleItem[];
  timeSlots: TimeSlot[];
  classrooms: Classroom[];
  initialize: () => Promise<void>;
  addSchedule: (schedule: Omit<ScheduleItem, 'id' | 'createdAt'>) => Promise<void>;
  updateSchedule: (id: string, updates: Partial<ScheduleItem>) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
  clearSchedules: () => Promise<void>;
  getTimeSlotById: (id: string) => TimeSlot | undefined;
  getClassroomById: (id: string) => Classroom | undefined;
  getSchedulesByDate: (date: string) => ScheduleItem[];
  getSchedulesByWeek: (startDate: string, endDate: string) => ScheduleItem[];
  addTimeSlot: (slot: Omit<TimeSlot, 'id'>) => Promise<void>;
  deleteTimeSlot: (id: string) => Promise<void>;
  addClassroom: (room: Omit<Classroom, 'id'>) => Promise<void>;
  deleteClassroom: (id: string) => Promise<void>;
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  schedules: [],
  timeSlots: [],
  classrooms: [],

  initialize: async () => {
    const schedules = await db.schedules.toArray();
    const timeSlots = await db.timeSlots.toArray();
    const classrooms = await db.classrooms.toArray();
    set({ schedules, timeSlots, classrooms });
  },

  addSchedule: async (schedule) => {
    const newSchedule: ScheduleItem = {
      ...schedule,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    await db.schedules.add(newSchedule);
    set({ schedules: [...get().schedules, newSchedule] });
  },

  updateSchedule: async (id, updates) => {
    await db.schedules.update(id, updates);
    const updated = get().schedules.map(schedule =>
      schedule.id === id ? { ...schedule, ...updates } : schedule
    );
    set({ schedules: updated });
  },

  deleteSchedule: async (id) => {
    await db.schedules.delete(id);
    set({ schedules: get().schedules.filter(schedule => schedule.id !== id) });
  },

  clearSchedules: async () => {
    await db.schedules.clear();
    set({ schedules: [] });
  },

  getTimeSlotById: (id) => {
    return get().timeSlots.find(slot => slot.id === id);
  },

  getClassroomById: (id) => {
    return get().classrooms.find(room => room.id === id);
  },

  getSchedulesByDate: (date) => {
    return get().schedules.filter(schedule => schedule.date === date);
  },

  getSchedulesByWeek: (startDate, endDate) => {
    return get().schedules.filter(schedule =>
      schedule.date >= startDate && schedule.date <= endDate
    );
  },

  addTimeSlot: async (slot) => {
    const newSlot: TimeSlot = {
      ...slot,
      id: generateId(),
    };
    await db.timeSlots.add(newSlot);
    set({ timeSlots: [...get().timeSlots, newSlot] });
  },

  deleteTimeSlot: async (id) => {
    await db.timeSlots.delete(id);
    set({ timeSlots: get().timeSlots.filter(slot => slot.id !== id) });
  },

  addClassroom: async (room) => {
    const newRoom: Classroom = {
      ...room,
      id: generateId(),
    };
    await db.classrooms.add(newRoom);
    set({ classrooms: [...get().classrooms, newRoom] });
  },

  deleteClassroom: async (id) => {
    await db.classrooms.delete(id);
    set({ classrooms: get().classrooms.filter(room => room.id !== id) });
  },
}));

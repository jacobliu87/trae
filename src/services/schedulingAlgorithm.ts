import { Course, Teacher, ScheduleItem, SchedulingConfig, Chapter, FREE_ACTIVITY_COURSE_ID } from '@/types';
import { addDays, format } from 'date-fns';
import { generateId } from '@/utils/helpers';

interface TeachingUnit {
  courseId: string;
  chapterId: string;
  sectionIndex: number;
  label: string;
}

interface CourseState {
  courseId: string;
  units: TeachingUnit[];
  nextIndex: number;
  weeklyCount: number;
  weeklyLimit: number;
}

const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const buildCourseStates = (courses: Course[], chapters: Chapter[]): CourseState[] => {
  return courses.map(course => {
    const courseChapters = chapters
      .filter(ch => ch.courseId === course.id)
      .sort((a, b) => a.order - b.order);

    const units: TeachingUnit[] = [];
    for (const chapter of courseChapters) {
      for (let i = 1; i <= chapter.sections; i++) {
        units.push({
          courseId: course.id,
          chapterId: chapter.id,
          sectionIndex: i,
          label: `${chapter.name}第${i}节`,
        });
      }
    }

    return {
      courseId: course.id,
      units,
      nextIndex: 0,
      weeklyCount: 0,
      weeklyLimit: course.weeklyClassCount,
    };
  }).filter(cs => cs.units.length > 0);
};

const assignTeacher = (courseId: string, teachers: Teacher[], position: number, useRandom: boolean): Teacher | null => {
  const courseTeachers = teachers.filter(t => t.courseIds.includes(courseId));
  if (courseTeachers.length === 0) return null;
  if (useRandom) {
    return courseTeachers[Math.floor(Math.random() * courseTeachers.length)];
  }
  return courseTeachers[position % courseTeachers.length];
};

export const generateChapterSchedule = (config: SchedulingConfig): ScheduleItem[] => {
  const { courses, chapters, teachers, timeSlots, classrooms, startDate, weeks, dailyClassCount, rule } = config;

  const courseStates = buildCourseStates(courses, chapters);
  if (courseStates.length === 0) return [];

  let remainingUnits = 0;
  for (let w = 0; w < weeks; w++) {
    for (const cs of courseStates) {
      const unitsLeft = cs.units.length - cs.nextIndex;
      remainingUnits += Math.min(unitsLeft, cs.weeklyLimit);
    }
  }

  const start = new Date(startDate);
  const isRandom = rule === 'random';
  const shuffledTimeSlots = isRandom ? shuffleArray(timeSlots) : timeSlots;
  const schedules: ScheduleItem[] = [];
  let courseRotationIndex = 0;

  for (let week = 0; week < weeks; week++) {
    for (const cs of courseStates) {
      cs.weeklyCount = 0;
    }

    for (let day = 0; day < 7; day++) {
      const dayIndex = week * 7 + day;
      const currentDate = addDays(start, dayIndex);
      const dateStr = format(currentDate, 'yyyy-MM-dd');

      for (let slot = 0; slot < dailyClassCount; slot++) {
        const timeSlot = shuffledTimeSlots[slot % shuffledTimeSlots.length];

        let selectedState: CourseState | null = null;

        if (isRandom) {
          const eligible = courseStates.filter(
            cs => cs.nextIndex < cs.units.length && cs.weeklyCount < cs.weeklyLimit
          );
          if (eligible.length > 0) {
            selectedState = eligible[Math.floor(Math.random() * eligible.length)];
          }
        } else {
          for (let i = 0; i < courseStates.length; i++) {
            const idx = (courseRotationIndex + i) % courseStates.length;
            const cs = courseStates[idx];
            if (cs.nextIndex < cs.units.length && cs.weeklyCount < cs.weeklyLimit) {
              selectedState = cs;
              courseRotationIndex = (idx + 1) % courseStates.length;
              break;
            }
          }
        }

        if (!selectedState) {
          schedules.push({
            id: generateId(),
            courseId: FREE_ACTIVITY_COURSE_ID,
            chapterId: '',
            sectionIndex: 0,
            teacherId: '',
            timeSlotId: timeSlot.id,
            classroomId: '',
            date: dateStr,
            status: 'scheduled',
            createdAt: new Date().toISOString(),
          });
          continue;
        }

        const unit = selectedState.units[selectedState.nextIndex];
        selectedState.nextIndex++;
        selectedState.weeklyCount++;

        const course = courses.find(c => c.id === unit.courseId);
        const defaultClassroom = course ? classrooms.find(r => r.id === course.classroomId) : undefined;
        const classroom = defaultClassroom || classrooms[0];
        const teacher = assignTeacher(unit.courseId, teachers, schedules.length, isRandom);

        if (!teacher) {
          continue;
        }

        schedules.push({
          id: generateId(),
          courseId: unit.courseId,
          chapterId: unit.chapterId,
          sectionIndex: unit.sectionIndex,
          teacherId: teacher.id,
          timeSlotId: timeSlot.id,
          classroomId: classroom?.id || '',
          date: dateStr,
          status: 'scheduled',
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  return schedules;
};

export const generateSchedule = (config: SchedulingConfig): ScheduleItem[] => {
  return generateChapterSchedule(config);
};

import React, { useEffect, useState } from 'react';
import { List, Calendar as CalendarIcon, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardBody } from '@/components/Common/Card';
import { Badge } from '@/components/Common/Switch';
import { useCourseStore } from '@/store/courseStore';
import { useTeacherStore } from '@/store/teacherStore';
import { useScheduleStore } from '@/store/scheduleStore';
import { useChapterStore } from '@/store/chapterStore';
import { FREE_ACTIVITY_COURSE_ID } from '@/types';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, parseISO, isSameDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';

type ViewMode = 'list' | 'calendar';

export const ScheduleDisplay: React.FC = () => {
  const { courses, initialize: initCourses } = useCourseStore();
  const { teachers, initialize: initTeachers } = useTeacherStore();
  const { schedules, timeSlots, classrooms, initialize: initSchedule } = useScheduleStore();
  const { chapters, initialize: initChapters } = useChapterStore();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [filterCourseId, setFilterCourseId] = useState<string>('all');
  const [filterTeacherId, setFilterTeacherId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    initCourses();
    initTeachers();
    initSchedule();
    initChapters();
  }, []);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    return date;
  });

  const filteredSchedules = schedules.filter(schedule => {
    if (schedule.courseId === FREE_ACTIVITY_COURSE_ID) return true;
    if (filterCourseId !== 'all' && schedule.courseId !== filterCourseId) return false;
    if (filterTeacherId !== 'all' && schedule.teacherId !== filterTeacherId) return false;

    const course = courses.find(c => c.id === schedule.courseId);
    const teacher = teachers.find(t => t.id === schedule.teacherId);
    const courseMatch = course?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const teacherMatch = teacher?.name.toLowerCase().includes(searchTerm.toLowerCase());
    return courseMatch || teacherMatch;
  });

  const getSchedulesByDay = (date: Date) => {
    return filteredSchedules
      .filter(s => isSameDay(parseISO(s.date), date))
      .sort((a, b) => {
        const slotA = timeSlots.find(s => s.id === a.timeSlotId);
        const slotB = timeSlots.find(s => s.id === b.timeSlotId);
        return (slotA?.startTime || '').localeCompare(slotB?.startTime || '');
      });
  };

  const getDayName = (day: number) => ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][day];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">课程表</h1>
          <p className="text-gray-600 mt-1">查看和管理课程安排</p>
        </div>
      </div>

      <Card>
        <CardBody>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <List size={18} />
                列表视图
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  viewMode === 'calendar' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <CalendarIcon size={18} />
                日历视图
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索课程或教师..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <select
                value={filterCourseId}
                onChange={(e) => setFilterCourseId(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">全部课程</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.name}</option>
                ))}
              </select>

              <select
                value={filterTeacherId}
                onChange={(e) => setFilterTeacherId(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">全部教师</option>
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                ))}
              </select>
            </div>
          </div>

          {viewMode === 'list' ? (
            <div className="overflow-x-auto">
              {filteredSchedules.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarIcon size={64} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">暂无课程安排</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">日期</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">时间段</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">课程</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">章节</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">教师</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">教室</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">状态</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredSchedules.map((schedule) => {
                      const isFree = schedule.courseId === FREE_ACTIVITY_COURSE_ID;
                      const course = isFree ? null : courses.find(c => c.id === schedule.courseId);
                      const teacher = isFree ? null : teachers.find(t => t.id === schedule.teacherId);
                      const timeSlot = timeSlots.find(s => s.id === schedule.timeSlotId);
                      const classroom = isFree ? null : classrooms.find(r => r.id === schedule.classroomId);
                      const chapter = isFree ? null : chapters.find(ch => ch.id === schedule.chapterId);

                      return (
                        <tr key={schedule.id} className={`hover:bg-gray-50 ${isFree ? 'bg-green-50' : ''}`}>
                          <td className="px-4 py-3 text-sm">{schedule.date}</td>
                          <td className="px-4 py-3">
                            {timeSlot && (
                              <Badge variant="secondary">
                                {timeSlot.startTime}-{timeSlot.endTime}
                              </Badge>
                            )}
                          </td>
                          <td className={`px-4 py-3 font-medium ${isFree ? 'text-green-600' : 'text-gray-900'}`}>
                            {isFree ? '自由活动' : (course?.name || '-')}
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-sm">
                            {isFree ? '-' : (chapter ? `${chapter.name}第${schedule.sectionIndex}节` : '-')}
                          </td>
                          <td className="px-4 py-3 text-gray-600">{isFree ? '-' : (teacher?.name || '-')}</td>
                          <td className="px-4 py-3 text-gray-600">{isFree ? '-' : (classroom?.name || '-')}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}>
                              {schedule.status === 'scheduled' ? '已排课' : schedule.status === 'completed' ? '已完成' : '已取消'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <h3 className="text-lg font-semibold text-gray-900">
                  {format(weekStart, 'yyyy年MM月dd日', { locale: zhCN })} - {format(weekEnd, 'MM月dd日', { locale: zhCN })}
                </h3>
                <button
                  onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-4">
                {weekDays.map((day, index) => {
                  const daySchedules = getSchedulesByDay(day);
                  return (
                    <div key={index} className="min-h-[400px]">
                      <div className="bg-gray-100 rounded-lg p-3 mb-2 text-center">
                        <p className="text-sm font-medium text-gray-700">{getDayName(index)}</p>
                        <p className="text-lg font-bold text-gray-900">{format(day, 'd')}</p>
                      </div>
                      <div className="space-y-2">
                        {daySchedules.length === 0 ? (
                          <div className="p-4 text-center text-sm text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                            暂无课程
                          </div>
                        ) : (
                          daySchedules.map((schedule) => {
                            const isFree = schedule.courseId === FREE_ACTIVITY_COURSE_ID;
                            const course = isFree ? null : courses.find(c => c.id === schedule.courseId);
                            const teacher = isFree ? null : teachers.find(t => t.id === schedule.teacherId);
                            const timeSlot = timeSlots.find(s => s.id === schedule.timeSlotId);
                            const classroom = isFree ? null : classrooms.find(r => r.id === schedule.classroomId);
                            const chapter = isFree ? null : chapters.find(ch => ch.id === schedule.chapterId);

                            return (
                              <div
                                key={schedule.id}
                                className={`p-3 rounded-lg hover:shadow-md transition-shadow ${
                                  isFree
                                    ? 'bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200'
                                    : 'bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200'
                                }`}
                              >
                                <p className={`font-semibold text-sm mb-1 ${isFree ? 'text-green-700' : 'text-primary-900'}`}>
                                  {isFree ? '自由活动' : (course?.name || '未知课程')}
                                </p>
                                {!isFree && chapter && (
                                  <p className="text-xs text-primary-600 mb-1">
                                    {chapter.name}第{schedule.sectionIndex}节
                                  </p>
                                )}
                                <p className={`text-xs mb-1 ${isFree ? 'text-green-600' : 'text-primary-700'}`}>
                                  {timeSlot?.startTime}-{timeSlot?.endTime}
                                </p>
                                {!isFree && (
                                  <>
                                    <p className="text-xs text-primary-600">{teacher?.name || '未知教师'}</p>
                                    <p className="text-xs text-primary-500">{classroom?.name || '未知教室'}</p>
                                  </>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <p>共 {filteredSchedules.length} 条课程安排</p>
        <p>第 {Math.ceil(filteredSchedules.length / 10)} 页</p>
      </div>
    </div>
  );
};
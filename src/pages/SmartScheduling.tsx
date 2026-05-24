import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, RotateCcw, CalendarPlus, Clock, Sun } from 'lucide-react';
import { Card, CardBody } from '@/components/Common/Card';
import { Button } from '@/components/Common/Button';
import { Switch } from '@/components/Common/Switch';
import { Badge } from '@/components/Common/Switch';
import { Toast } from '@/components/Common/Toast';
import { useCourseStore } from '@/store/courseStore';
import { useTeacherStore } from '@/store/teacherStore';
import { useScheduleStore } from '@/store/scheduleStore';
import { useChapterStore } from '@/store/chapterStore';
import { generateSchedule } from '@/services/schedulingAlgorithm';
import { SchedulingRule, ScheduleItem, FREE_ACTIVITY_COURSE_ID } from '@/types';
import { ToastType } from '@/components/Common/Toast';
import { format } from 'date-fns';

export const SmartScheduling: React.FC = () => {
  const navigate = useNavigate();
  const { courses, initialize: initCourses } = useCourseStore();
  const { teachers, initialize: initTeachers } = useTeacherStore();
  const { timeSlots, classrooms, initialize: initSchedule, addSchedule, clearSchedules } = useScheduleStore();
  const { chapters, initialize: initChapters } = useChapterStore();

  const [rule, setRule] = useState<SchedulingRule>('round-robin');
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>([]);
  const [selectedTimeSlotIds, setSelectedTimeSlotIds] = useState<string[]>([]);
  const [weeks, setWeeks] = useState(1);
  const [dailyClassCount, setDailyClassCount] = useState(3);
  const [previewSchedules, setPreviewSchedules] = useState<ScheduleItem[]>([]);
  const [toast, setToast] = useState<{ show: boolean; type: ToastType; message: string }>({ show: false, type: 'success', message: '' });

  useEffect(() => {
    initCourses();
    initTeachers();
    initSchedule();
    initChapters();
  }, []);

  useEffect(() => {
    setSelectedCourseIds(courses.filter(c => c.status === 'active').map(c => c.id));
    setSelectedTeacherIds(teachers.map(t => t.id));
    setSelectedTimeSlotIds(timeSlots.map(s => s.id));
  }, [courses, teachers, timeSlots]);

  const toggleItem = (id: string, selectedIds: string[], setSelectedIds: (ids: string[]) => void) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handlePreview = () => {
    if (selectedCourseIds.length === 0 || selectedTeacherIds.length === 0 || selectedTimeSlotIds.length === 0) {
      setToast({ show: true, type: 'warning', message: '请至少选择课程、教师和时间段' });
      return;
    }

    const selectedCourses = courses.filter(c => selectedCourseIds.includes(c.id));
    const selectedTeachers = teachers.filter(t => selectedTeacherIds.includes(t.id));
    const selectedTimeSlots = timeSlots.filter(s => selectedTimeSlotIds.includes(s.id));

    const preview = generateSchedule({
      rule,
      courses: selectedCourses,
      chapters,
      teachers: selectedTeachers,
      timeSlots: selectedTimeSlots,
      classrooms,
      startDate: format(new Date(), 'yyyy-MM-dd'),
      weeks,
      dailyClassCount,
    });

    setPreviewSchedules(preview);
    setToast({ show: true, type: 'info', message: `预览生成 ${preview.length} 条排课记录` });
  };

  const handleExecute = () => {
    if (previewSchedules.length === 0) {
      setToast({ show: true, type: 'warning', message: '请先生成预览' });
      return;
    }

    clearSchedules();
    previewSchedules.forEach(schedule => {
      addSchedule({
        courseId: schedule.courseId,
        chapterId: schedule.chapterId,
        sectionIndex: schedule.sectionIndex,
        teacherId: schedule.teacherId,
        timeSlotId: schedule.timeSlotId,
        classroomId: schedule.classroomId,
        date: schedule.date,
        status: schedule.status,
      });
    });

    setToast({ show: true, type: 'success', message: '排课执行成功！' });
    setTimeout(() => navigate('/schedule'), 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">智能排课</h1>
          <p className="text-gray-600 mt-1">根据规则自动生成课程安排</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardBody>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">排课规则</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => setRule('round-robin')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    rule === 'round-robin' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <CalendarPlus size={32} className={`mb-2 ${rule === 'round-robin' ? 'text-primary-600' : 'text-gray-400'}`} />
                  <h3 className="font-semibold text-gray-900">轮流排课</h3>
                  <p className="text-sm text-gray-600 mt-1">按顺序依次分配，保证公平性</p>
                </button>
                <button
                  onClick={() => setRule('random')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    rule === 'random' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <RotateCcw size={32} className={`mb-2 ${rule === 'random' ? 'text-primary-600' : 'text-gray-400'}`} />
                  <h3 className="font-semibold text-gray-900">随机排课</h3>
                  <p className="text-sm text-gray-600 mt-1">随机分配，增加多样性</p>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">排课周期</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="1"
                      max="4"
                      value={weeks}
                      onChange={(e) => setWeeks(parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-lg font-semibold text-primary-600 w-20">{weeks} 周</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">每天课节数</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="1"
                      max="6"
                      value={dailyClassCount}
                      onChange={(e) => setDailyClassCount(parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-lg font-semibold text-primary-600 w-20">{dailyClassCount} 节</span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">选择课程</h2>
                <Switch
                  checked={selectedCourseIds.length === courses.filter(c => c.status === 'active').length}
                  onChange={(checked) => {
                    if (checked) {
                      setSelectedCourseIds(courses.filter(c => c.status === 'active').map(c => c.id));
                    } else {
                      setSelectedCourseIds([]);
                    }
                  }}
                  label="全选"
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {courses.filter(c => c.status === 'active').map(course => {
                  const classroom = classrooms.find(r => r.id === course.classroomId);
                  return (
                    <label key={course.id} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCourseIds.includes(course.id)}
                        onChange={() => toggleItem(course.id, selectedCourseIds, setSelectedCourseIds)}
                        className="w-4 h-4 text-primary-600 rounded"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm">{course.name}</span>
                        {classroom && (
                          <span className="text-xs text-gray-500">{classroom.name}</span>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">选择教师</h2>
                <Switch
                  checked={selectedTeacherIds.length === teachers.length}
                  onChange={(checked) => {
                    if (checked) {
                      setSelectedTeacherIds(teachers.map(t => t.id));
                    } else {
                      setSelectedTeacherIds([]);
                    }
                  }}
                  label="全选"
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {teachers.map(teacher => (
                  <label key={teacher.id} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTeacherIds.includes(teacher.id)}
                      onChange={() => toggleItem(teacher.id, selectedTeacherIds, setSelectedTeacherIds)}
                      className="w-4 h-4 text-primary-600 rounded"
                    />
                    <span className="text-sm">{teacher.name}</span>
                  </label>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">排课预览</h2>
              {previewSchedules.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <CalendarPlus size={48} className="mx-auto mb-3 opacity-50" />
                  <p>点击"生成预览"查看排课结果</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-3 text-left font-medium text-gray-700">日期</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">时间段</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">课程</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">章节</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">教师</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">教室</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {previewSchedules.slice(0, 20).map((schedule, index) => {
                        const isFree = schedule.courseId === FREE_ACTIVITY_COURSE_ID;
                        const course = isFree ? null : courses.find(c => c.id === schedule.courseId);
                        const teacher = isFree ? null : teachers.find(t => t.id === schedule.teacherId);
                        const timeSlot = timeSlots.find(s => s.id === schedule.timeSlotId);
                        const classroom = isFree ? null : classrooms.find(r => r.id === schedule.classroomId);
                        const chapter = isFree ? null : chapters.find(ch => ch.id === schedule.chapterId);
                        return (
                          <tr key={index} className={`hover:bg-gray-50 ${isFree ? 'bg-green-50' : ''}`}>
                            <td className="px-4 py-3">{schedule.date}</td>
                            <td className="px-4 py-3">
                              <Badge variant={isFree ? 'secondary' : 'secondary'}>
                                {timeSlot ? timeSlot.startTime : '-'}
                              </Badge>
                            </td>
                            <td className={`px-4 py-3 font-medium ${isFree ? 'text-green-600' : ''}`}>
                              {isFree ? '自由活动' : (course?.name || '-')}
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {isFree ? '-' : (chapter ? `${chapter.name}第${schedule.sectionIndex}节` : '-')}
                            </td>
                            <td className="px-4 py-3">{isFree ? '-' : (teacher?.name || '-')}</td>
                            <td className="px-4 py-3">{isFree ? '-' : (classroom?.name || '-')}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {previewSchedules.length > 20 && (
                    <p className="text-center py-3 text-sm text-gray-500">
                      还有 {previewSchedules.length - 20} 条记录未显示...
                    </p>
                  )}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardBody>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">配置摘要</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Sun size={20} className="text-gray-600" />
                    <span className="text-sm">每天课节</span>
                  </div>
                  <Badge variant="primary">{dailyClassCount} 节</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock size={20} className="text-gray-600" />
                    <span className="text-sm">时间段</span>
                  </div>
                  <Badge variant="primary">{selectedTimeSlotIds.length} 个</Badge>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">操作</h2>
              <div className="space-y-3">
                <Button onClick={handlePreview} className="w-full" variant="secondary">
                  <Play size={18} />
                  <span className="ml-2">生成预览</span>
                </Button>
                <Button onClick={handleExecute} className="w-full" disabled={previewSchedules.length === 0}>
                  <CalendarPlus size={18} />
                  <span className="ml-2">执行排课</span>
                </Button>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100">
            <CardBody>
              <h3 className="font-semibold text-gray-900 mb-2">提示</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>按课程章节逐节排课</li>
                <li>课程使用默认教室</li>
                <li>每天可设置1-6节课</li>
                <li>建议先预览再执行</li>
              </ul>
            </CardBody>
          </Card>
        </div>
      </div>

      {toast.show && <Toast type={toast.type} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />}
    </div>
  );
};

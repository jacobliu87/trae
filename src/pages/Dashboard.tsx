import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, CalendarPlus, Calendar, TrendingUp } from 'lucide-react';
import { Card, CardBody } from '@/components/Common/Card';
import { useCourseStore } from '@/store/courseStore';
import { useTeacherStore } from '@/store/teacherStore';
import { useScheduleStore } from '@/store/scheduleStore';
import { formatDate } from '@/utils/helpers';
import { format, startOfWeek, endOfWeek } from 'date-fns';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { courses, initialize: initCourses } = useCourseStore();
  const { teachers, initialize: initTeachers } = useTeacherStore();
  const { schedules, initialize: initSchedules } = useScheduleStore();

  useEffect(() => {
    initCourses();
    initTeachers();
    initSchedules();
  }, []);

  const activeCourses = courses.filter(c => c.status === 'active').length;
  const weekStart = format(startOfWeek(new Date()), 'yyyy-MM-dd');
  const weekEnd = format(endOfWeek(new Date()), 'yyyy-MM-dd');
  const weekSchedules = schedules.filter(s => s.date >= weekStart && s.date <= weekEnd);

  const quickActions = [
    { icon: BookOpen, label: '课程管理', path: '/courses', color: 'bg-blue-500' },
    { icon: Users, label: '教师管理', path: '/teachers', color: 'bg-green-500' },
    { icon: CalendarPlus, label: '智能排课', path: '/scheduling', color: 'bg-purple-500' },
    { icon: Calendar, label: '查看课表', path: '/schedule', color: 'bg-orange-500' },
  ];

  const recentSchedules = schedules.slice(-5).reverse();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">仪表盘</h1>
          <p className="text-gray-600 mt-1">欢迎使用智能排课管理系统</p>
        </div>
        <div className="text-sm text-gray-500">
          {format(new Date(), 'yyyy年MM月dd日')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">课程总数</p>
                <p className="text-4xl font-bold mt-2">{activeCourses}</p>
                <p className="text-blue-100 text-xs mt-1">共 {courses.length} 门课程</p>
              </div>
              <BookOpen size={48} className="text-blue-200 opacity-50" />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">教师总数</p>
                <p className="text-4xl font-bold mt-2">{teachers.length}</p>
                <p className="text-green-100 text-xs mt-1">在编教师</p>
              </div>
              <Users size={48} className="text-green-200 opacity-50" />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">本周排课</p>
                <p className="text-4xl font-bold mt-2">{weekSchedules.length}</p>
                <p className="text-purple-100 text-xs mt-1">节课</p>
              </div>
              <CalendarPlus size={48} className="text-purple-200 opacity-50" />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">排课完成率</p>
                <p className="text-4xl font-bold mt-2">
                  {courses.length > 0 ? Math.round((schedules.length / courses.length) * 100) : 0}%
                </p>
                <p className="text-orange-100 text-xs mt-1">
                  <TrendingUp size={12} className="inline mr-1" />
                  进度良好
                </p>
              </div>
              <TrendingUp size={48} className="text-orange-200 opacity-50" />
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardBody>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">快捷操作</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickActions.map((action) => (
                  <button
                    key={action.path}
                    onClick={() => navigate(action.path)}
                    className="flex flex-col items-center gap-3 p-6 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
                  >
                    <div className={`${action.color} p-4 rounded-xl text-white group-hover:scale-110 transition-transform`}>
                      <action.icon size={24} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{action.label}</span>
                  </button>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        <div>
          <Card>
            <CardBody>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">最近排课</h2>
              {recentSchedules.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar size={48} className="mx-auto mb-3 opacity-50" />
                  <p>暂无排课记录</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentSchedules.map((schedule) => {
                    const course = courses.find(c => c.id === schedule.courseId);
                    const teacher = teachers.find(t => t.id === schedule.teacherId);
                    return (
                      <div key={schedule.id} className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium text-gray-900">{course?.name || '未知课程'}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {teacher?.name || '未知教师'} · {formatDate(schedule.date)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

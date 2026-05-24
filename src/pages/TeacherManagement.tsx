import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search, User } from 'lucide-react';
import { Card, CardBody } from '@/components/Common/Card';
import { Button } from '@/components/Common/Button';
import { Modal } from '@/components/Common/Modal';
import { Input } from '@/components/Common/Input';
import { ConfirmDialog } from '@/components/Common/ConfirmDialog';
import { Toast } from '@/components/Common/Toast';
import { Badge } from '@/components/Common/Switch';
import { useTeacherStore } from '@/store/teacherStore';
import { useCourseStore } from '@/store/courseStore';
import { Teacher } from '@/types';
import { ToastType } from '@/components/Common/Toast';

export const TeacherManagement: React.FC = () => {
  const { teachers, initialize, addTeacher, updateTeacher, deleteTeacher } = useTeacherStore();
  const { courses, initialize: initCourses } = useCourseStore();

  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: string }>({ show: false, id: '' });
  const [toast, setToast] = useState<{ show: boolean; type: ToastType; message: string }>({ show: false, type: 'success', message: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTeacher, setExpandedTeacher] = useState<string | null>(null);

  const [teacherForm, setTeacherForm] = useState({
    name: '',
    phone: '',
    email: '',
    courseIds: [] as string[],
  });

  useEffect(() => {
    initialize();
    initCourses();
  }, []);

  const filteredTeachers = teachers.filter(t =>
    t.name.includes(searchTerm) || t.phone?.includes(searchTerm) || t.email?.includes(searchTerm)
  );

  const handleSave = () => {
    if (!teacherForm.name.trim()) {
      setToast({ show: true, type: 'error', message: '请输入教师姓名' });
      return;
    }

    if (editingTeacher) {
      updateTeacher(editingTeacher.id, teacherForm);
      setToast({ show: true, type: 'success', message: '教师信息更新成功' });
    } else {
      addTeacher(teacherForm);
      setToast({ show: true, type: 'success', message: '教师添加成功' });
    }
    setShowModal(false);
    setTeacherForm({ name: '', phone: '', email: '', courseIds: [] });
    setEditingTeacher(null);
  };

  const handleDelete = () => {
    deleteTeacher(deleteConfirm.id);
    setToast({ show: true, type: 'success', message: '教师删除成功' });
  };

  const toggleCourse = (courseId: string) => {
    const newCourseIds = teacherForm.courseIds.includes(courseId)
      ? teacherForm.courseIds.filter(id => id !== courseId)
      : [...teacherForm.courseIds, courseId];
    setTeacherForm({ ...teacherForm, courseIds: newCourseIds });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">教师管理</h1>
          <p className="text-gray-600 mt-1">维护教师信息和授课安排</p>
        </div>
      </div>

      <Card>
        <CardBody>
          <div className="flex items-center justify-between mb-6">
            <div className="relative flex-1 max-w-md">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜索教师姓名、电话或邮箱..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <Button onClick={() => {
              setEditingTeacher(null);
              setTeacherForm({ name: '', phone: '', email: '', courseIds: [] });
              setShowModal(true);
            }}>
              <Plus size={18} />
              <span className="ml-2">添加教师</span>
            </Button>
          </div>

          {filteredTeachers.length === 0 ? (
            <div className="text-center py-12">
              <User size={64} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">暂无教师信息</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTeachers.map((teacher) => {
                const teacherCourses = courses.filter(c => teacher.courseIds.includes(c.id));
                const isExpanded = expandedTeacher === teacher.id;

                return (
                  <div
                    key={teacher.id}
                    className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                            {teacher.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{teacher.name}</h3>
                            <p className="text-sm text-gray-500">教授 {teacherCourses.length} 门课程</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        {teacher.phone && <p>电话: {teacher.phone}</p>}
                        {teacher.email && <p>邮箱: {teacher.email}</p>}
                      </div>

                      {isExpanded && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">教授课程:</h4>
                          <div className="flex flex-wrap gap-2">
                            {teacherCourses.length === 0 ? (
                              <Badge variant="warning">暂无授课</Badge>
                            ) : (
                              teacherCourses.map(course => (
                                <Badge key={course.id} variant="primary">{course.name}</Badge>
                              ))
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedTeacher(isExpanded ? null : teacher.id)}
                        >
                          {isExpanded ? '收起' : '查看详情'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingTeacher(teacher);
                            setTeacherForm({
                              name: teacher.name,
                              phone: teacher.phone || '',
                              email: teacher.email || '',
                              courseIds: teacher.courseIds,
                            });
                            setShowModal(true);
                          }}
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm({ show: true, id: teacher.id })}
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingTeacher ? '编辑教师' : '添加教师'}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowModal(false)}>取消</Button>
            <Button onClick={handleSave}>保存</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="教师姓名"
            value={teacherForm.name}
            onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
            placeholder="请输入教师姓名"
          />
          <Input
            label="联系电话"
            value={teacherForm.phone}
            onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })}
            placeholder="请输入联系电话（可选）"
          />
          <Input
            label="电子邮箱"
            value={teacherForm.email}
            onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
            placeholder="请输入电子邮箱（可选）"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">教授课程</label>
            <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-300 rounded-lg p-3">
              {courses.map(course => (
                <label key={course.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={teacherForm.courseIds.includes(course.id)}
                    onChange={() => toggleCourse(course.id)}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm">{course.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, id: '' })}
        onConfirm={handleDelete}
        title="确认删除"
        message="确定要删除这位教师吗？该操作不可恢复。"
      />

      {toast.show && <Toast type={toast.type} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />}
    </div>
  );
};

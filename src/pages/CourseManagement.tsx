import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search, FolderTree, ListOrdered } from 'lucide-react';
import { Card, CardBody } from '@/components/Common/Card';
import { Button } from '@/components/Common/Button';
import { Modal } from '@/components/Common/Modal';
import { Input, Select, Textarea } from '@/components/Common/Input';
import { Badge } from '@/components/Common/Switch';
import { ConfirmDialog } from '@/components/Common/ConfirmDialog';
import { Toast } from '@/components/Common/Toast';
import { useCourseStore } from '@/store/courseStore';
import { useChapterStore } from '@/store/chapterStore';
import { useScheduleStore } from '@/store/scheduleStore';
import { Course, CourseCategory, Chapter } from '@/types';
import { ToastType } from '@/components/Common/Toast';

export const CourseManagement: React.FC = () => {
  const {
    categories,
    courses,
    selectedCategoryId,
    initialize,
    addCategory,
    updateCategory,
    deleteCategory,
    addCourse,
    updateCourse,
    deleteCourse,
    selectCategory,
  } = useCourseStore();

  const { initialize: initChapters, addChapter, updateChapter, deleteChapter, getChaptersByCourse } = useChapterStore();
  const { classrooms, initialize: initSchedule } = useScheduleStore();

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [chapterCourseId, setChapterCourseId] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<CourseCategory | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; type: 'category' | 'course' | 'chapter'; id: string }>({ show: false, type: 'category', id: '' });
  const [toast, setToast] = useState<{ show: boolean; type: ToastType; message: string }>({ show: false, type: 'success', message: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [courseForm, setCourseForm] = useState({ name: '', categoryId: '', classroomId: '', duration: 45, weeklyClassCount: 2, status: 'active' as 'active' | 'inactive' });
  const [chapterForm, setChapterForm] = useState({ name: '', sections: 4 });

  useEffect(() => {
    initialize();
    initChapters();
    initSchedule();
  }, []);

  const filteredCourses = selectedCategoryId
    ? courses.filter(c => c.categoryId === selectedCategoryId && c.name.includes(searchTerm))
    : courses.filter(c => c.name.includes(searchTerm));

  const handleSaveCategory = () => {
    if (!categoryForm.name.trim()) {
      setToast({ show: true, type: 'error', message: '请输入分类名称' });
      return;
    }

    if (editingCategory) {
      updateCategory(editingCategory.id, categoryForm);
      setToast({ show: true, type: 'success', message: '分类更新成功' });
    } else {
      addCategory(categoryForm);
      setToast({ show: true, type: 'success', message: '分类添加成功' });
    }
    setShowCategoryModal(false);
    setCategoryForm({ name: '', description: '' });
    setEditingCategory(null);
  };

  const handleSaveCourse = () => {
    if (!courseForm.name.trim() || !courseForm.categoryId) {
      setToast({ show: true, type: 'error', message: '请填写完整信息' });
      return;
    }

    if (editingCourse) {
      updateCourse(editingCourse.id, courseForm);
      setToast({ show: true, type: 'success', message: '课程更新成功' });
    } else {
      addCourse(courseForm);
      setToast({ show: true, type: 'success', message: '课程添加成功' });
    }
    setShowCourseModal(false);
    setCourseForm({ name: '', categoryId: '', classroomId: '', duration: 45, weeklyClassCount: 2, status: 'active' });
    setEditingCourse(null);
  };

  const handleSaveChapter = () => {
    if (!chapterForm.name.trim() || !chapterCourseId) {
      setToast({ show: true, type: 'error', message: '请填写完整信息' });
      return;
    }

    if (editingChapter) {
      updateChapter(editingChapter.id, chapterForm);
      setToast({ show: true, type: 'success', message: '章节更新成功' });
    } else {
      const courseChapters = getChaptersByCourse(chapterCourseId);
      addChapter({
        name: chapterForm.name,
        courseId: chapterCourseId,
        sections: chapterForm.sections,
        order: courseChapters.length + 1,
      });
      setToast({ show: true, type: 'success', message: '章节添加成功' });
    }
    setShowChapterModal(false);
    setChapterForm({ name: '', sections: 4 });
    setEditingChapter(null);
  };

  const handleDelete = () => {
    if (deleteConfirm.type === 'category') {
      deleteCategory(deleteConfirm.id);
      setToast({ show: true, type: 'success', message: '分类删除成功' });
    } else if (deleteConfirm.type === 'course') {
      deleteCourse(deleteConfirm.id);
      setToast({ show: true, type: 'success', message: '课程删除成功' });
    } else {
      deleteChapter(deleteConfirm.id);
      setToast({ show: true, type: 'success', message: '章节删除成功' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">课程管理</h1>
          <p className="text-gray-600 mt-1">维护课程体系和课程信息</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardBody>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">课程分类</h2>
                <Button size="sm" onClick={() => {
                  setEditingCategory(null);
                  setCategoryForm({ name: '', description: '' });
                  setShowCategoryModal(true);
                }}>
                  <Plus size={16} />
                </Button>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => selectCategory(null)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                    !selectedCategoryId ? 'bg-primary-50 text-primary-700 border-2 border-primary-500' : 'hover:bg-gray-50'
                  }`}
                >
                  全部课程
                </button>

                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className={`group flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-all ${
                      selectedCategoryId === cat.id ? 'bg-primary-50 border-2 border-primary-500' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => selectCategory(cat.id)}
                  >
                    <div className="flex items-center gap-2">
                      <FolderTree size={18} className="text-gray-600" />
                      <span className="text-sm font-medium">{cat.name}</span>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCategory(cat);
                          setCategoryForm({ name: cat.name, description: cat.description || '' });
                          setShowCategoryModal(true);
                        }}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm({ show: true, type: 'category', id: cat.id });
                        }}
                        className="p-1 hover:bg-red-100 text-red-600 rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card>
            <CardBody>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">课程列表</h2>
                <div className="flex gap-3">
                  <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="搜索课程..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <Button onClick={() => {
                    setEditingCourse(null);
                    setCourseForm({ name: '', categoryId: selectedCategoryId || categories[0]?.id || '', classroomId: classrooms[0]?.id || '', duration: 45, weeklyClassCount: 2, status: 'active' });
                    setShowCourseModal(true);
                  }}>
                    <Plus size={18} />
                    <span className="ml-2">添加课程</span>
                  </Button>
                </div>
              </div>

              {filteredCourses.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">暂无课程</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredCourses.map((course) => {
                    const category = categories.find(c => c.id === course.categoryId);
                    return (
                      <div key={course.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold text-gray-900">{course.name}</h3>
                          <Badge variant={course.status === 'active' ? 'success' : 'danger'}>
                            {course.status === 'active' ? '启用' : '停用'}
                          </Badge>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          <p>分类: {category?.name || '未分类'}</p>
                          <p>教室: {classrooms.find(r => r.id === course.classroomId)?.name || '未设置'}</p>
                          <p>时长: {course.duration} 分钟 / 周{course.weeklyClassCount}节</p>
                          <p>章节: {getChaptersByCourse(course.id).length} 个</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingCourse(course);
                              setCourseForm({
                                name: course.name,
                                categoryId: course.categoryId,
                                classroomId: course.classroomId,
                                duration: course.duration,
                                weeklyClassCount: course.weeklyClassCount,
                                status: course.status,
                              });
                              setShowCourseModal(true);
                            }}
                          >
                            <Edit2 size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setChapterCourseId(course.id);
                              setEditingChapter(null);
                              setChapterForm({ name: '', sections: 4 });
                              setShowChapterModal(true);
                            }}
                          >
                            <ListOrdered size={16} className="text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirm({ show: true, type: 'course', id: course.id })}
                          >
                            <Trash2 size={16} className="text-red-600" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      <Modal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title={editingCategory ? '编辑分类' : '添加分类'}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowCategoryModal(false)}>取消</Button>
            <Button onClick={handleSaveCategory}>保存</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="分类名称"
            value={categoryForm.name}
            onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
            placeholder="请输入分类名称"
          />
          <Textarea
            label="分类描述"
            value={categoryForm.description}
            onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
            placeholder="请输入分类描述（可选）"
            rows={3}
          />
        </div>
      </Modal>

      <Modal
        isOpen={showCourseModal}
        onClose={() => setShowCourseModal(false)}
        title={editingCourse ? '编辑课程' : '添加课程'}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowCourseModal(false)}>取消</Button>
            <Button onClick={handleSaveCourse}>保存</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="课程名称"
            value={courseForm.name}
            onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
            placeholder="请输入课程名称"
          />
          <Select
            label="所属分类"
            value={courseForm.categoryId}
            onChange={(e) => setCourseForm({ ...courseForm, categoryId: e.target.value })}
            options={categories.map(c => ({ value: c.id, label: c.name }))}
          />
          <Select
            label="默认教室"
            value={courseForm.classroomId}
            onChange={(e) => setCourseForm({ ...courseForm, classroomId: e.target.value })}
            options={classrooms.map(r => ({ value: r.id, label: `${r.name}（容量${r.capacity}人）` }))}
          />
          <Input
            label="课程时长（分钟）"
            type="number"
            value={courseForm.duration}
            onChange={(e) => setCourseForm({ ...courseForm, duration: parseInt(e.target.value) })}
          />
          <Input
            label="每周课节数"
            type="number"
            min={1}
            max={10}
            value={courseForm.weeklyClassCount}
            onChange={(e) => setCourseForm({ ...courseForm, weeklyClassCount: parseInt(e.target.value) || 1 })}
          />
        </div>
      </Modal>

      <Modal
        isOpen={showChapterModal}
        onClose={() => setShowChapterModal(false)}
        title={editingChapter ? '编辑章节' : '管理章节'}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowChapterModal(false)}>关闭</Button>
            {!editingChapter && (
              <Button onClick={handleSaveChapter}>添加章节</Button>
            )}
            {editingChapter && (
              <Button onClick={handleSaveChapter}>保存</Button>
            )}
          </div>
        }
      >
        <div className="space-y-4">
          {chapterCourseId && !editingChapter && (
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700">已有章节</h3>
              </div>
              {getChaptersByCourse(chapterCourseId).length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">暂无章节</p>
              ) : (
                <div className="space-y-2">
                  {getChaptersByCourse(chapterCourseId).map((ch) => (
                    <div key={ch.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="text-sm font-medium">{ch.name}</span>
                        <span className="text-sm text-gray-500 ml-2">({ch.sections} 节)</span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditingChapter(ch);
                            setChapterForm({ name: ch.name, sections: ch.sections });
                          }}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ show: true, type: 'chapter', id: ch.id })}
                          className="p-1 hover:bg-red-100 text-red-600 rounded"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <hr className="my-4" />
            </div>
          )}
          <Input
            label="章节名称"
            value={chapterForm.name}
            onChange={(e) => setChapterForm({ ...chapterForm, name: e.target.value })}
            placeholder="例如：第一章、Unit 1"
          />
          <Input
            label="小节数量"
            type="number"
            min={1}
            value={chapterForm.sections}
            onChange={(e) => setChapterForm({ ...chapterForm, sections: parseInt(e.target.value) || 1 })}
          />
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, type: 'category', id: '' })}
        onConfirm={handleDelete}
        title="确认删除"
        message={deleteConfirm.type === 'category' ? '确定要删除这个分类吗？该操作将同时删除该分类下的所有课程。' : '确定要删除这门课程吗？'}
      />

      {toast.show && <Toast type={toast.type} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />}
    </div>
  );
};

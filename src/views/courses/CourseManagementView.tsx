import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Award, 
  Clock, 
  User, 
  Tag, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  X, 
  GraduationCap, 
  Briefcase, 
  Sparkles, 
  FileCheck2,
  Users,
  LayoutGrid,
  List,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Organisation, Course, Candidate, Credential } from '../../types';

interface CourseManagementViewProps {
  currentOrg: Organisation;
  courses: Course[];
  candidates?: Candidate[];
  credentials?: Credential[];
  onAddCourse: (course: Course) => void;
  onUpdateCourse?: (course: Course) => void;
  onDeleteCourse?: (courseId: string) => void;
  onNavigateTab: (tab: any, params?: any) => void;
  onIssueForCourse?: (courseId: string) => void;
}

export const CourseManagementView: React.FC<CourseManagementViewProps> = ({
  currentOrg,
  courses,
  candidates = [],
  credentials = [],
  onAddCourse,
  onUpdateCourse,
  onDeleteCourse,
  onNavigateTab,
  onIssueForCourse
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    duration: '90 Hours',
    category: 'Academic',
    instructor: '',
    skills: ''
  });

  const orgCourses = courses.filter(c => c.organisationId === currentOrg.id);

  const categories = ['All', 'Academic', 'Professional', 'Certification', 'Executive'];

  const filteredCourses = orgCourses.filter(course => {
    const matchesSearch = 
      course.name.toLowerCase().includes(search.toLowerCase()) ||
      course.code.toLowerCase().includes(search.toLowerCase()) ||
      course.instructor.toLowerCase().includes(search.toLowerCase()) ||
      (course.skills && course.skills.some(s => s.toLowerCase().includes(search.toLowerCase())));
    
    const matchesCategory = selectedCategory === 'All' || course.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  // Calculate stats
  const totalCourses = orgCourses.length;
  const academicCount = orgCourses.filter(c => c.category.toLowerCase() === 'academic').length;
  const proCount = orgCourses.filter(c => c.category.toLowerCase() === 'professional' || c.category.toLowerCase() === 'certification').length;
  const orgCredsCount = credentials.filter(c => c.organisationId === currentOrg.id).length;

  const handleOpenAddModal = () => {
    setEditingCourse(null);
    setFormData({
      name: '',
      code: `${currentOrg.code}-${Math.floor(100 + Math.random() * 900)}`,
      duration: '90 Hours',
      category: 'Academic',
      instructor: currentOrg.signatories[0]?.name || 'Dean & Academic Chair',
      skills: 'Curriculum Mastery, Foundational Theory'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      code: course.code,
      duration: course.duration,
      category: course.category,
      instructor: course.instructor,
      skills: (course.skills || []).join(', ')
    });
    setIsModalOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) return;

    const skillList = formData.skills
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    if (editingCourse) {
      const updated: Course = {
        ...editingCourse,
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        duration: formData.duration.trim(),
        category: formData.category,
        instructor: formData.instructor.trim() || 'Academic Chair',
        skills: skillList.length > 0 ? skillList : ['Accredited Program']
      };
      if (onUpdateCourse) {
        onUpdateCourse(updated);
      } else {
        // Fallback update in list
        onAddCourse(updated);
      }
    } else {
      const newCourse: Course = {
        id: `CRS_${Date.now().toString().slice(-4)}_${Math.floor(100 + Math.random() * 900)}`,
        organisationId: currentOrg.id,
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        duration: formData.duration.trim(),
        category: formData.category,
        instructor: formData.instructor.trim() || 'Academic Chair',
        skills: skillList.length > 0 ? skillList : ['Degree Major', 'Accredited']
      };
      onAddCourse(newCourse);
    }

    setIsModalOpen(false);
  };

  const handleQuickSeed = (template: { name: string; code: string; duration: string; category: string; instructor: string; skills: string[] }) => {
    const newCourse: Course = {
      id: `CRS_${Date.now().toString().slice(-4)}_${Math.floor(100 + Math.random() * 900)}`,
      organisationId: currentOrg.id,
      name: template.name,
      code: `${currentOrg.code}-${template.code}`,
      duration: template.duration,
      category: template.category,
      instructor: template.instructor,
      skills: template.skills
    };
    onAddCourse(newCourse);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner & Header */}
      <div className="icx-card p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-[#1877e0] border border-sky-100 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-sora tracking-tight text-[#0c1a30]">
                Active Programs & Courses
              </h1>
              <span className="text-xs text-[#66748c] font-medium mt-0.5 block">
                Manage academic degree curricula, diploma certifications, and executive modules for <strong className="text-[#0c1a30]">{currentOrg.name}</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            id="add-course-main-btn"
            onClick={handleOpenAddModal}
            className="btn-primary-gradient px-4 py-2.5 text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Program</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="icx-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#66748c] uppercase tracking-wider font-mono">Total Programs</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-[#1877e0] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-sora text-[#0c1a30] mt-2">{totalCourses}</div>
          <div className="text-[11px] text-[#66748c] mt-1 font-mono">Configured for issuance</div>
        </div>

        <div className="icx-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#66748c] uppercase tracking-wider font-mono">Academic Degrees</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-sora text-[#0c1a30] mt-2">{academicCount}</div>
          <div className="text-[11px] text-[#66748c] mt-1 font-mono">Degree & diploma tracks</div>
        </div>

        <div className="icx-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#66748c] uppercase tracking-wider font-mono">Certifications</span>
            <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-sora text-[#0c1a30] mt-2">{proCount}</div>
          <div className="text-[11px] text-[#66748c] mt-1 font-mono">Professional credentials</div>
        </div>

        <div className="icx-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#66748c] uppercase tracking-wider font-mono">Issued Credentials</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-sora text-[#0c1a30] mt-2">{orgCredsCount}</div>
          <div className="text-[11px] text-[#66748c] mt-1 font-mono">Anchored to SHA-256</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="icx-card p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="course-search-input"
            type="text"
            placeholder="Search programs by title, code, instructor, or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#f4f7fc] border border-[#e5ebf4] rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#2ea6ff] transition-all"
          />
        </div>

        {/* Category Filter Pills & View Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-[#f4f7fc] p-1 rounded-xl border border-[#e5ebf4]">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#0a1f44] text-[#2ea6ff] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-1 bg-[#f4f7fc] p-1 rounded-xl border border-[#e5ebf4]">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white shadow-xs text-[#1877e0]' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white shadow-xs text-[#1877e0]' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Empty State / Quick Templates */}
      {filteredCourses.length === 0 && (
        <div className="icx-card p-10 text-center rounded-3xl space-y-6">
          <div className="w-14 h-14 bg-sky-50 text-[#1877e0] rounded-3xl mx-auto flex items-center justify-center border border-sky-100">
            <BookOpen className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold font-sora text-[#0c1a30]">
              {search || selectedCategory !== 'All' ? 'No Matching Programs Found' : 'No Academic Programs Registered Yet'}
            </h3>
            <p className="text-xs text-[#66748c] mt-1.5">
              {search || selectedCategory !== 'All'
                ? 'Try adjusting your search query or switching the category filter.'
                : 'Define your institution’s degrees, executive certifications, or specialized courses to issue verifiable credentials.'}
            </p>
          </div>

          {!search && selectedCategory === 'All' && (
            <div className="pt-4 border-t border-[#e5ebf4]">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider block mb-4">
                Or Quick-Add a Starter Academic Track:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
                {[
                  {
                    name: 'Computer Science & Engineering',
                    code: 'CSE-101',
                    duration: '4 Years / 8 Sem',
                    category: 'Academic',
                    instructor: 'Prof. Alex Mercer',
                    skills: ['Data Structures', 'Distributed Systems', 'Cryptography']
                  },
                  {
                    name: 'Artificial Intelligence & Data Science',
                    code: 'AIDS-202',
                    duration: '120 Hours',
                    category: 'Professional',
                    instructor: 'Dr. Sarah Chen',
                    skills: ['Deep Learning', 'PyTorch', 'LLM Architectures']
                  },
                  {
                    name: 'Executive Leadership & Strategy',
                    code: 'ELS-500',
                    duration: '60 Hours',
                    category: 'Executive',
                    instructor: 'Dean & Provost',
                    skills: ['Corporate Governance', 'Financial Strategy']
                  },
                  {
                    name: 'Cloud Architecture & DevOps',
                    code: 'CAD-301',
                    duration: '90 Hours',
                    category: 'Certification',
                    instructor: 'Prof. Michael Brown',
                    skills: ['Kubernetes', 'AWS Solutions', 'CI/CD Pipelines']
                  }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleQuickSeed(item)}
                    className="p-3.5 bg-[#f4f7fc] hover:bg-sky-50 border border-[#e5ebf4] hover:border-[#2ea6ff] rounded-2xl cursor-pointer transition-all group"
                  >
                    <div className="font-bold text-xs text-[#0c1a30] group-hover:text-[#1877e0] truncate">
                      {item.name}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 mt-1 flex items-center justify-between">
                      <span>{item.code}</span>
                      <span className="px-1.5 py-0.5 bg-white border rounded font-semibold text-[#1877e0]">{item.category}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                      <Plus className="w-3 h-3 text-[#1877e0]" />
                      <span>Click to add program</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Grid Mode View */}
      {viewMode === 'grid' && filteredCourses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((course) => {
            const courseCredsCount = credentials.filter(
              c => c.organisationId === currentOrg.id && (c.title?.toLowerCase().includes(course.name.toLowerCase()) || c.title?.toLowerCase().includes(course.code.toLowerCase()))
            ).length;

            return (
              <div
                key={course.id}
                className="icx-card p-6 rounded-3xl hover:border-[#2ea6ff]/50 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
              >
                <div>
                  {/* Top Row: Category & Code */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-xs font-bold text-[#1877e0] bg-sky-50 border border-sky-100 px-2.5 py-0.5 rounded-lg">
                      {course.code}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                      course.category?.toLowerCase() === 'academic'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : course.category?.toLowerCase() === 'executive'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : 'bg-sky-50 text-[#1877e0] border-sky-200'
                    }`}>
                      {course.category || 'Academic'}
                    </span>
                  </div>

                  {/* Course Title */}
                  <h3 className="font-sora font-bold text-sm text-[#0c1a30] group-hover:text-[#1877e0] transition-colors line-clamp-2 leading-snug">
                    {course.name}
                  </h3>

                  {/* Instructor & Duration */}
                  <div className="mt-3.5 space-y-1.5 text-xs text-[#66748c]">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">Instructor: <strong className="text-[#0c1a30]">{course.instructor}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Duration: <strong className="text-[#0c1a30]">{course.duration}</strong></span>
                    </div>
                  </div>

                  {/* Skills / Tags */}
                  {course.skills && course.skills.length > 0 && (
                    <div className="mt-4 pt-3.5 border-t border-[#e5ebf4]">
                      <div className="flex flex-wrap gap-1.5">
                        {course.skills.slice(0, 3).map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2 py-0.5 bg-[#f4f7fc] text-[#42506a] border border-[#e5ebf4] rounded-md text-[10px] font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                        {course.skills.length > 3 && (
                          <span className="px-1.5 py-0.5 text-slate-400 text-[10px] font-mono">
                            +{course.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="mt-5 pt-4 border-t border-[#e5ebf4] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(course)}
                      className="p-1.5 text-slate-400 hover:text-[#1877e0] hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit Course Details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {onDeleteCourse && (
                      <button
                        onClick={() => onDeleteCourse(course.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Course"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (onIssueForCourse) {
                        onIssueForCourse(course.id);
                      } else {
                        onNavigateTab('generation');
                      }
                    }}
                    className="btn-pill-ghost px-3 py-1.5 text-xs font-bold text-[#1877e0] border-sky-200 hover:bg-sky-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Award className="w-3.5 h-3.5 text-[#2ea6ff]" />
                    <span>Issue Certificate</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table Mode View */}
      {viewMode === 'table' && filteredCourses.length > 0 && (
        <div className="icx-table-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#f4f7fc] border-b border-[#e5ebf4] text-[#42506a] font-mono font-bold uppercase text-[10px]">
                  <th className="p-4">Program Name & Code</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Lead Instructor</th>
                  <th className="p-4">Key Competencies</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5ebf4]">
                {filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-[#0c1a30] text-xs">{course.name}</div>
                      <div className="font-mono text-[10px] text-[#1877e0] font-bold mt-0.5">{course.code}</div>
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                        course.category?.toLowerCase() === 'academic'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-sky-50 text-[#1877e0] border-sky-200'
                      }`}>
                        {course.category || 'Academic'}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-slate-600 text-[11px]">{course.duration}</td>
                    <td className="p-4 text-[#0c1a30] font-medium">{course.instructor}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(course.skills || []).slice(0, 2).map((s, idx) => (
                          <span key={idx} className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[10px]">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(course)}
                          className="p-1.5 text-slate-400 hover:text-[#1877e0] rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onNavigateTab('generation')}
                          className="btn-pill-ghost px-3 py-1 text-xs font-bold text-[#1877e0] border-sky-200"
                        >
                          Issue
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white max-w-lg w-full border border-slate-200 shadow-2xl rounded-3xl p-6 sm:p-7 space-y-5 animate-scaleUp">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-100 text-[#1877e0] flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-sora font-bold text-base text-[#0c1a30]">
                    {editingCourse ? 'Edit Academic Program' : 'Register New Academic Program'}
                  </h3>
                  <p className="text-[11px] text-[#66748c] mt-0.5">
                    Configure curriculum parameters for cryptographic credential issuance.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-[#0c1a30] uppercase tracking-wider mb-1.5 font-mono">
                  Program / Course Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master of Computer Applications & Cloud Computing"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#f4f7fc] border border-[#e5ebf4] rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-[#2ea6ff] font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#0c1a30] uppercase tracking-wider mb-1.5 font-mono">
                    Course / Curriculum Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MCA-2026"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#f4f7fc] border border-[#e5ebf4] rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-[#2ea6ff] font-mono font-bold uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#0c1a30] uppercase tracking-wider mb-1.5 font-mono">
                    Program Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#f4f7fc] border border-[#e5ebf4] rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-[#2ea6ff] font-medium"
                  >
                    <option value="Academic">Academic Degree Track</option>
                    <option value="Professional">Professional Certification</option>
                    <option value="Executive">Executive Diploma</option>
                    <option value="Certification">Skill Certification</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#0c1a30] uppercase tracking-wider mb-1.5 font-mono">
                    Duration / Credit Hours
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 120 Hours or 4 Semesters"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#f4f7fc] border border-[#e5ebf4] rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-[#2ea6ff]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#0c1a30] uppercase tracking-wider mb-1.5 font-mono">
                    Lead Instructor / Chair
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Jennifer Widom"
                    value={formData.instructor}
                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#f4f7fc] border border-[#e5ebf4] rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-[#2ea6ff]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#0c1a30] uppercase tracking-wider mb-1.5 font-mono">
                  Competencies / Skill Tags (Comma Separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cryptography, Distributed Systems, Software Engineering"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#f4f7fc] border border-[#e5ebf4] rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-[#2ea6ff]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-[#e5ebf4]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-pill-ghost px-4 py-2 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-gradient px-5 py-2 font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{editingCourse ? 'Save Changes' : 'Create Program'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

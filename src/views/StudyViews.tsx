import React, { useState } from 'react';
import {
  BookOpen, Calendar, Activity, GraduationCap, Plus, Trash2,
  Save, Check, Droplets, HeartPulse, Scale, RefreshCw, AlertCircle
} from 'lucide-react';
import { StorageService } from '../services/storage';
import { NoteEntry, TimetableEntry } from '../types';

interface StudyViewsProps {
  onBack: () => void;
  showToast: (msg: string) => void;
}

// 1. Ruled Notebook / Clinical Notes
export const ClinicalNotesView: React.FC<StudyViewsProps> = ({ onBack, showToast }) => {
  const [notes, setNotes] = useState<NoteEntry[]>(StorageService.getNotes());
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'Clinical' | 'Academic' | 'Personal'>('Clinical');
  const [selectedNote, setSelectedNote] = useState<NoteEntry | null>(null);

  const saveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newNote: NoteEntry = {
      id: selectedNote ? selectedNote.id : Date.now().toString(),
      title,
      content,
      category,
      updatedAt: new Date().toISOString()
    };

    StorageService.saveNote(newNote);
    setNotes(StorageService.getNotes());
    setTitle('');
    setContent('');
    setSelectedNote(null);
    showToast('Clinical note preserved successfully!');
  };

  const deleteNote = (id: string) => {
    StorageService.deleteNote(id);
    setNotes(StorageService.getNotes());
    if (selectedNote?.id === id) {
      setSelectedNote(null);
      setTitle('');
      setContent('');
    }
    showToast('Note deleted.');
  };

  const editNote = (note: NoteEntry) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
    setCategory(note.category as any);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-600" />
            Clinical Notes & Ward Diary
          </h2>
          <p className="text-xs text-slate-500">Record ward rounds, patient management algorithms, and clinical pearls</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <form onSubmit={saveNote} className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Note Title / Diagnosis (e.g. Diabetic Ketoacidosis Protocol)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex-1 px-4 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-bold"
                required
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="Clinical">Clinical</option>
                <option value="Academic">Academic</option>
                <option value="Personal">Personal</option>
              </select>
            </div>

            {/* Ruled Notebook Paper effect */}
            <div className="relative border border-slate-300 dark:border-slate-700 rounded-2xl p-4 bg-amber-50/30 dark:bg-slate-950">
              <textarea
                rows={12}
                placeholder="Write your detailed clinical observations, medication dosages, investigation workup..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-transparent text-sm leading-relaxed text-slate-800 dark:text-slate-100 outline-none resize-none font-sans"
                required
              />
            </div>

            <div className="flex justify-between items-center">
              {selectedNote && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedNote(null);
                    setTitle('');
                    setContent('');
                  }}
                  className="text-xs text-slate-500 hover:text-slate-700 underline"
                >
                  Cancel Edit
                </button>
              )}
              <button
                type="submit"
                className="ml-auto flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition"
              >
                <Save className="w-4 h-4" />
                {selectedNote ? 'Update Note' : 'Save Note'}
              </button>
            </div>
          </form>
        </div>

        {/* Existing notes */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="font-bold text-slate-800 dark:text-white text-sm">Saved Records ({notes.length})</h3>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {notes.map((note) => (
              <div
                key={note.id}
                onClick={() => editNote(note)}
                className={`p-4 rounded-2xl border transition cursor-pointer ${
                  selectedNote?.id === note.id
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-black text-slate-800 dark:text-white truncate max-w-[200px]">{note.title}</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {note.category}
                  </span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-2">{note.content}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNote(note.id);
                    }}
                    className="text-red-500 hover:text-red-700 font-bold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. Weekly Timetable
export const WeeklyTimetableView: React.FC<StudyViewsProps> = ({ onBack, showToast }) => {
  const [timetable, setTimetable] = useState<TimetableEntry[]>(StorageService.getTimetable());
  const [day, setDay] = useState('Monday');
  const [time, setTime] = useState('08:00 AM - 10:00 AM');
  const [subject, setSubject] = useState('General Surgery OPD & Bedside Ward');
  const [location, setLocation] = useState('Surgical Ward, Cat-D Buner');

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const addEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: TimetableEntry = {
      id: Date.now().toString(),
      day,
      time,
      subject,
      location
    };
    StorageService.saveTimetableEntry(newEntry);
    setTimetable(StorageService.getTimetable());
    setSubject('');
    setLocation('');
    showToast('Timetable schedule updated!');
  };

  const removeEntry = (id: string) => {
    StorageService.deleteTimetableEntry(id);
    setTimetable(StorageService.getTimetable());
    showToast('Schedule removed.');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
          <Calendar className="w-6 h-6 text-emerald-600" />
          Weekly Class & Ward Timetable
        </h2>
        <p className="text-xs text-slate-500">Organize clinical postings, lecture halls, and emergency rota schedules</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form */}
        <form onSubmit={addEntry} className="lg:col-span-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-800 dark:text-white text-sm">Add New Lecture / Ward</h3>
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Day of Week</label>
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800"
            >
              {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Time Slot</label>
            <input
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Subject / Ward Name</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Room / Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition"
          >
            Add to Schedule
          </button>
        </form>

        {/* Schedule Grid */}
        <div className="lg:col-span-8 space-y-4">
          {daysOfWeek.map((d) => {
            const dayEntries = timetable.filter(item => item.day === d);
            if (dayEntries.length === 0) return null;
            return (
              <div key={d} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h4 className="font-bold text-emerald-700 dark:text-emerald-400 text-sm mb-3 border-b pb-1 border-slate-100 dark:border-slate-800">
                  {d}
                </h4>
                <div className="space-y-2">
                  {dayEntries.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{item.subject}</span>
                        <div className="text-[11px] text-slate-500">{item.time} • {item.location}</div>
                      </div>
                      <button
                        onClick={() => removeEntry(item.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-bold p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// 3. BMI & Daily Hydration
export const BmiHydrationView: React.FC<StudyViewsProps> = ({ onBack, showToast }) => {
  const [weightKg, setWeightKg] = useState('70');
  const [heightCm, setHeightCm] = useState('175');
  const [glasses, setGlasses] = useState(5);

  const weight = parseFloat(weightKg) || 0;
  const heightM = (parseFloat(heightCm) || 0) / 100;
  const bmi = heightM > 0 ? (weight / (heightM * heightM)).toFixed(1) : '0';

  const getBmiCategory = (val: number) => {
    if (val < 18.5) return { text: 'Underweight', color: 'text-amber-500' };
    if (val < 25) return { text: 'Normal Weight (Optimal)', color: 'text-emerald-500' };
    if (val < 30) return { text: 'Overweight', color: 'text-amber-600' };
    return { text: 'Obese (Grade I+)', color: 'text-red-600' };
  };

  const cat = getBmiCategory(parseFloat(bmi));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
          <Activity className="w-6 h-6 text-emerald-600" />
          BMI & Hydration Tracker
        </h2>
        <p className="text-xs text-slate-500">Calculate Body Mass Index and log your daily water intake during clinical rotations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* BMI Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
            <Scale className="w-4 h-4 text-emerald-600" /> Body Mass Index (BMI)
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">Weight (Kilograms)</label>
              <input
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">Height (Centimeters)</label>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          </div>

          <div className="pt-3 text-center bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl">
            <div className="text-3xl font-black font-mono text-emerald-700 dark:text-emerald-400">{bmi}</div>
            <div className={`text-xs font-bold mt-1 ${cat.color}`}>{cat.text}</div>
          </div>
        </div>

        {/* Hydration Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
            <Droplets className="w-4 h-4 text-blue-500" /> Daily Water Intake
          </h3>
          <p className="text-xs text-slate-500">Target: 8 glasses (2.0 Liters) per shift</p>

          <div className="py-6 text-center">
            <div className="text-4xl font-black text-blue-600">{glasses} / 8</div>
            <p className="text-xs text-slate-400 mt-1">{(glasses * 0.25).toFixed(2)} Liters consumed</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setGlasses(Math.max(0, glasses - 1));
              }}
              className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold"
            >
              - 1 Glass
            </button>
            <button
              onClick={() => {
                setGlasses(glasses + 1);
                showToast('Hydration logged: +250ml water');
              }}
              className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md"
            >
              + 1 Glass
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 4. GPA & CGPA Calculator
export const GpaCalculatorView: React.FC<StudyViewsProps> = ({ onBack, showToast }) => {
  const [courses, setCourses] = useState([
    { name: 'Gross Anatomy & Histology', creditHours: 4, grade: 'A' },
    { name: 'Physiology & Biophysics', creditHours: 4, grade: 'A-' },
    { name: 'Medical Biochemistry', creditHours: 3, grade: 'B+' },
    { name: 'Islamic & Pak Studies', creditHours: 2, grade: 'A' }
  ]);

  const gradePoints: Record<string, number> = {
    'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'D': 1.0, 'F': 0.0
  };

  const addCourse = () => {
    setCourses([...courses, { name: 'New Subject', creditHours: 3, grade: 'A' }]);
  };

  const removeCourse = (idx: number) => {
    setCourses(courses.filter((_, i) => i !== idx));
  };

  const totalCredits = courses.reduce((acc, c) => acc + c.creditHours, 0);
  const totalQualityPoints = courses.reduce((acc, c) => acc + c.creditHours * (gradePoints[c.grade] || 0), 0);
  const gpa = totalCredits > 0 ? (totalQualityPoints / totalCredits).toFixed(2) : '0.00';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-emerald-600" />
            KMU Medical GPA & CGPA Calculator
          </h2>
          <p className="text-xs text-slate-500">Khyber Medical University 4.0 GPA Grading Standard</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-bold text-xs text-slate-700 dark:text-slate-300">Semester Course Roster</span>
          <button onClick={addCourse} className="text-xs font-bold text-emerald-600 flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> Add Course
          </button>
        </div>

        <div className="space-y-2">
          {courses.map((course, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <input
                type="text"
                value={course.name}
                onChange={(e) => {
                  const updated = [...courses];
                  updated[idx].name = e.target.value;
                  setCourses(updated);
                }}
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800"
              />
              <select
                value={course.creditHours}
                onChange={(e) => {
                  const updated = [...courses];
                  updated[idx].creditHours = Number(e.target.value);
                  setCourses(updated);
                }}
                className="w-16 px-2 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800"
              >
                {[1, 2, 3, 4, 5, 6].map(ch => <option key={ch} value={ch}>{ch} Cr</option>)}
              </select>
              <select
                value={course.grade}
                onChange={(e) => {
                  const updated = [...courses];
                  updated[idx].grade = e.target.value;
                  setCourses(updated);
                }}
                className="w-16 px-2 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 font-bold"
              >
                {Object.keys(gradePoints).map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <button onClick={() => removeCourse(idx)} className="text-red-500 hover:text-red-700 p-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 block">Total Credit Hours</span>
            <span className="text-lg font-bold text-slate-800 dark:text-slate-200">{totalCredits}</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 block">Calculated Semester GPA</span>
            <span className="text-3xl font-black text-emerald-700 dark:text-emerald-400 font-mono">{gpa} / 4.00</span>
          </div>
        </div>
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { Student } from '../types';
import { Plus, Trash2, Users } from 'lucide-react';

interface Props {
  students: Student[];
  setStudents: (students: Student[]) => void;
}

const StudentManager: React.FC<Props> = ({ students, setStudents }) => {
  const [newName, setNewName] = useState('');

  const addStudent = () => {
    if (newName.trim()) {
      setStudents([...students, { id: Date.now().toString(), name: newName.trim() }]);
      setNewName('');
    }
  };

  const removeStudent = (id: string) => {
    setStudents(students.filter(s => s.id !== id));
  };

  const handleBulkAdd = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const names = e.target.value.split('\n').filter(n => n.trim());
    const newStudents = names.map(n => ({ id: Math.random().toString(), name: n.trim() }));
    setStudents(newStudents);
  };

  return (
    <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4 text-purple-300">
        <Users size={24} />
        <h2 className="text-xl font-bold">Danh sách lớp học</h2>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addStudent()}
          placeholder="Thêm tên học sinh..."
          className="flex-1 bg-white/5 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
        />
        <button 
          onClick={addStudent}
          className="p-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors"
        >
          <Plus />
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-xs text-white/50 mb-1 uppercase tracking-wider">Dán nhiều tên (mỗi dòng một tên)</label>
        <textarea
          onChange={handleBulkAdd}
          className="w-full h-24 bg-white/5 border border-white/20 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Học sinh A&#10;Học sinh B..."
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
        {students.map((student) => (
          <div key={student.id} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5 hover:border-purple-500/50 transition-all group">
            <span className="font-medium">{student.name}</span>
            <button 
              onClick={() => removeStudent(student.id)}
              className="text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-white/10 text-center text-sm text-white/60">
        Tổng số: <span className="text-purple-400 font-bold">{students.length}</span> học sinh
      </div>
    </div>
  );
};

export default StudentManager;

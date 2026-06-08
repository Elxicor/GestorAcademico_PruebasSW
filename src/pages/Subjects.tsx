import { useState, useEffect } from 'react';
import { Subject, StudySession } from '../types';
import SubjectManager from '../components/SubjectManager';
import { Book, Plus, Clock } from 'lucide-react';
import { startOfWeek, endOfWeek } from 'date-fns';
import toast from 'react-hot-toast';
import { getFromStorage, setToStorage } from '../utils/storage';

export default function Subjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [showManager, setShowManager] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar de Supabase
  useEffect(() => {
    async function loadData() {
      const dbSubjects = await getFromStorage<Subject[]>('subjects', []);
      const dbSessions = await getFromStorage<StudySession[]>('studyTime', []);
      setSubjects(dbSubjects);
      setStudySessions(dbSessions);
      setIsLoaded(true);
    }
    loadData();
  }, []);

  // Guardar en Supabase cada vez que subjects cambie, pero solo después de cargar
  useEffect(() => {
    if (isLoaded) {
      setToStorage('subjects', subjects).catch(console.error);
    }
  }, [subjects, isLoaded]);

  const getWeeklyProgress = (subjectName: string) => {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    
    const weeklyMinutes = studySessions
      .filter(session => {
        const sessionDate = new Date(session.date);
        return session.subject === subjectName &&
               sessionDate >= weekStart &&
               sessionDate <= weekEnd;
      })
      .reduce((acc, session) => acc + session.durationMinutes, 0);
    
    return weeklyMinutes / 60; // Convert to hours
  };

  const handleAddSubject = (subjectData: Omit<Subject, 'id'>) => {
    const newSubject: Subject = {
      ...subjectData,
      id: crypto.randomUUID(),
    };
    setSubjects([...subjects, newSubject]);
    toast.success('Materia añadida exitosamente');
  };

  const handleEditSubject = (id: string, subjectData: Omit<Subject, 'id'>) => {
    setSubjects(subjects.map(subject =>
      subject.id === id ? { ...subject, ...subjectData } : subject
    ));
    toast.success('Materia actualizada exitosamente');
  };

  const handleDeleteSubject = (id: string) => {
    setSubjects(subjects.filter(subject => subject.id !== id));
    toast.success('Materia eliminada exitosamente');
  };

  if (!isLoaded) return <div className="p-8 text-center">Cargando materias...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Book className="text-indigo-600" size={28} />
          <h1 className="text-2xl font-bold text-gray-900">Materias</h1>
        </div>
        <button
          onClick={() => setShowManager(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} />
          Gestionar Materias
        </button>
      </div>

      <div className="grid gap-4">
        {subjects.map(subject => {
          const weeklyHours = getWeeklyProgress(subject.name);
          const progress = (weeklyHours / subject.goalHoursPerWeek) * 100;
          
          return (
            <div
              key={subject.id}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: subject.color }}
                  />
                  <h3 className="font-semibold text-lg">{subject.name}</h3>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Clock size={16} />
                  <span className="text-sm">
                    {weeklyHours.toFixed(1)} / {subject.goalHoursPerWeek}h esta semana
                  </span>
                </div>
              </div>

              <div className="relative pt-1">
                <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-100">
                  <div
                    style={{
                      width: `${Math.min(100, progress)}%`,
                      backgroundColor: subject.color,
                      transition: 'width 0.5s ease-in-out',
                    }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center"
                  />
                </div>
              </div>
            </div>
          );
        })}

        {subjects.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <Book className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aún no hay materias</h3>
            <p className="text-gray-500 mb-4">
              Añade materias para seguir tu progreso de estudio
            </p>
            <button
              onClick={() => setShowManager(true)}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Añadir tu primera materia
            </button>
          </div>
        )}
      </div>

      {showManager && (
        <SubjectManager
          subjects={subjects}
          onAddSubject={handleAddSubject}
          onEditSubject={handleEditSubject}
          onDeleteSubject={handleDeleteSubject}
          onClose={() => setShowManager(false)}
        />
      )}
    </div>
  );
}
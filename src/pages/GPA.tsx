import { useState, useEffect } from 'react';
import { Grade, Subject } from '../types';
import { GraduationCap } from 'lucide-react';
import { getFromStorage } from '../utils/storage';

export default function GPA() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadData() {
      const dbGrades = await getFromStorage<Grade[]>('grades', []);
      const dbSubjects = await getFromStorage<Subject[]>('subjects', []);
      setGrades(dbGrades);
      setSubjects(dbSubjects);
      setIsLoaded(true);
    }
    loadData();
  }, []);

  const getSubjectAverage = (subjectName: string) => {
    const subjectGrades = grades.filter(g => g.subject === subjectName);
    if (subjectGrades.length === 0) return null;

    const totalWeight = subjectGrades.reduce((acc, g) => acc + g.weight, 0);
    if (totalWeight === 0) return null;

    const weightedSum = subjectGrades.reduce((acc, g) => {
      const normalized = (g.score / g.maxScore) * 10;
      return acc + normalized * g.weight;
    }, 0);

    return weightedSum / totalWeight;
  };

  const subjectsWithGrades = [...new Set(grades.map(g => g.subject))];

  const subjectSummaries = subjectsWithGrades.map(name => {
    const avg = getSubjectAverage(name) || 0;
    const gradeCount = grades.filter(g => g.subject === name).length;
    const subject = subjects.find(s => s.name === name);
    const credits = subject?.goalHoursPerWeek || 3; // using goalHoursPerWeek as proxy for credits
    return {
      name,
      average: avg,
      gradeCount,
      credits,
      status: avg >= 7 ? 'Aprobado' : avg >= 5 ? 'En Riesgo' : 'Reprobado',
      color: subject?.color || '#6366f1',
    };
  });

  const generalGPA = subjectSummaries.length > 0
    ? subjectSummaries.reduce((acc, s) => acc + s.average * s.credits, 0) /
      subjectSummaries.reduce((acc, s) => acc + s.credits, 0)
    : 0;

  const totalCredits = subjectSummaries.reduce((acc, s) => acc + s.credits, 0);
  const approvedCount = subjectSummaries.filter(s => s.status === 'Aprobado').length;
  const failedCount = subjectSummaries.filter(s => s.status === 'Reprobado').length;

  if (!isLoaded) return <div className="p-8 text-center">Calculando promedio...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center gap-3 mb-8">
        <GraduationCap className="text-indigo-600" size={28} />
        <h1 className="text-2xl font-bold text-gray-900">Promedio General (GPA)</h1>
      </div>

      {subjectSummaries.length > 0 ? (
        <>
          {/* GPA Card principal */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 rounded-2xl shadow-lg mb-8" data-cy="gpa-main-card">
            <div className="text-center">
              <p className="text-indigo-200 text-lg mb-2">Promedio General Ponderado</p>
              <div className="text-6xl font-bold mb-4" data-cy="gpa-value">
                {generalGPA.toFixed(2)}
              </div>
              <p className="text-indigo-200">sobre 10.00</p>
              <div className="mt-4 w-full bg-white/20 rounded-full h-3">
                <div
                  className="h-3 rounded-full bg-white"
                  style={{ width: `${Math.min(100, (generalGPA / 10) * 100)}%` }}
                />
              </div>
              <div className={`mt-4 inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                generalGPA >= 7 ? 'bg-green-400/30 text-green-100' :
                generalGPA >= 5 ? 'bg-yellow-400/30 text-yellow-100' :
                'bg-red-400/30 text-red-100'
              }`} data-cy="gpa-status">
                {generalGPA >= 7 ? '✓ Rendimiento Satisfactorio' :
                 generalGPA >= 5 ? '⚠ Rendimiento en Riesgo' :
                 '✗ Rendimiento Insuficiente'}
              </div>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-xl shadow-sm border text-center" data-cy="stat-total-subjects">
              <div className="text-3xl font-bold text-indigo-600">{subjectSummaries.length}</div>
              <div className="text-sm text-gray-500">Materias</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border text-center" data-cy="stat-total-credits">
              <div className="text-3xl font-bold text-indigo-600">{totalCredits}</div>
              <div className="text-sm text-gray-500">Créditos Totales</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border text-center" data-cy="stat-approved">
              <div className="text-3xl font-bold text-green-600">{approvedCount}</div>
              <div className="text-sm text-gray-500">Aprobadas</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border text-center" data-cy="stat-failed">
              <div className="text-3xl font-bold text-red-600">{failedCount}</div>
              <div className="text-sm text-gray-500">Reprobadas</div>
            </div>
          </div>

          {/* Detalle por materia */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h2 className="text-lg font-semibold">Detalle por Materia</h2>
            </div>
            <div className="divide-y divide-gray-100" data-cy="gpa-subject-list">
              {subjectSummaries
                .sort((a, b) => b.average - a.average)
                .map(summary => (
                <div key={summary.name} className="p-4 flex items-center gap-4" data-cy="gpa-subject-row">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: summary.color }}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">{summary.name}</span>
                      <span className={`text-sm font-semibold ${
                        summary.status === 'Aprobado' ? 'text-green-600' :
                        summary.status === 'En Riesgo' ? 'text-yellow-600' :
                        'text-red-600'
                      }`} data-cy="subject-status">
                        {summary.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            summary.average >= 7 ? 'bg-green-500' :
                            summary.average >= 5 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(100, (summary.average / 10) * 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-gray-700 w-12 text-right">
                        {summary.average.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex gap-4 mt-1 text-xs text-gray-400">
                      <span>{summary.gradeCount} calificación(es)</span>
                      <span>{summary.credits} créditos</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <GraduationCap className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sin datos para calcular GPA</h3>
          <p className="text-gray-500">
            Primero registra calificaciones en la sección de Calificaciones para ver tu promedio general
          </p>
        </div>
      )}
    </div>
  );
}

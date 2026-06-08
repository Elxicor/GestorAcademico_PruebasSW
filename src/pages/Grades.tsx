import { useState, useEffect } from 'react';
import { Grade, Subject } from '../types';
import { Award, Plus, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getFromStorage, setToStorage } from '../utils/storage';

export default function Grades() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    examName: '',
    score: '',
    maxScore: '10',
    weight: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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

  useEffect(() => {
    if (isLoaded) {
      setToStorage('grades', grades).catch(console.error);
    }
  }, [grades, isLoaded]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.subject.trim()) {
      errors.subject = 'La materia es obligatoria';
    }
    if (!formData.examName.trim()) {
      errors.examName = 'El nombre del examen es obligatorio';
    }
    const score = parseFloat(formData.score);
    const maxScore = parseFloat(formData.maxScore);
    if (isNaN(score) || score < 0 || score > maxScore) {
      errors.score = `La nota debe estar entre 0 y ${maxScore}`;
    }
    if (isNaN(maxScore) || maxScore <= 0) {
      errors.maxScore = 'La nota máxima debe ser mayor a 0';
    }
    const weight = parseFloat(formData.weight);
    if (isNaN(weight) || weight < 1 || weight > 100) {
      errors.weight = 'El peso debe estar entre 1 y 100';
    }
    if (!formData.date) {
      errors.date = 'La fecha es obligatoria';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Por favor corrige los errores del formulario');
      return;
    }

    const newGrade: Grade = {
      id: crypto.randomUUID(),
      subject: formData.subject,
      examName: formData.examName,
      score: parseFloat(formData.score),
      maxScore: parseFloat(formData.maxScore),
      weight: parseFloat(formData.weight),
      date: formData.date,
    };

    setGrades([...grades, newGrade]);
    setFormData({ subject: '', examName: '', score: '', maxScore: '10', weight: '', date: new Date().toISOString().split('T')[0] });
    setFormErrors({});
    setShowForm(false);
    toast.success('Calificación registrada exitosamente');
  };

  const handleDeleteGrade = (id: string) => {
    setGrades(grades.filter(g => g.id !== id));
    toast.success('Calificación eliminada');
  };

  const getSubjectAverage = (subjectName: string) => {
    const subjectGrades = grades.filter(g => g.subject === subjectName);
    if (subjectGrades.length === 0) return 0;

    const totalWeight = subjectGrades.reduce((acc, g) => acc + g.weight, 0);
    if (totalWeight === 0) return 0;

    const weightedSum = subjectGrades.reduce((acc, g) => {
      const normalized = (g.score / g.maxScore) * 10;
      return acc + normalized * g.weight;
    }, 0);

    return weightedSum / totalWeight;
  };

  const subjectsWithGrades = [...new Set(grades.map(g => g.subject))];

  if (!isLoaded) return <div className="p-8 text-center">Cargando calificaciones...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Award className="text-indigo-600" size={28} />
          <h1 className="text-2xl font-bold text-gray-900">Calificaciones</h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
          data-cy="btn-add-grade"
        >
          <Plus size={20} />
          Nueva Calificación
        </button>
      </div>

      {/* Resumen por materia */}
      {subjectsWithGrades.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {subjectsWithGrades.map(subject => {
            const avg = getSubjectAverage(subject);
            const subjectGrades = grades.filter(g => g.subject === subject);
            return (
              <div key={subject} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100" data-cy="subject-grade-card">
                <h3 className="font-semibold text-lg mb-2">{subject}</h3>
                <div className="flex items-end gap-2 mb-3">
                  <span className={`text-3xl font-bold ${avg >= 7 ? 'text-green-600' : avg >= 5 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {avg.toFixed(2)}
                  </span>
                  <span className="text-gray-500 text-sm mb-1">/10</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${avg >= 7 ? 'bg-green-500' : avg >= 5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(100, (avg / 10) * 100)}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">{subjectGrades.length} calificación(es)</p>
                <p className={`text-sm font-medium mt-1 ${avg >= 7 ? 'text-green-600' : avg >= 5 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {avg >= 7 ? 'Aprobado ✓' : avg >= 5 ? 'En riesgo ⚠' : 'Reprobado ✗'}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Tabla de calificaciones */}
      {grades.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full" data-cy="grades-table">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Materia</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Examen</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Nota</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Peso %</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Fecha</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {grades.map(grade => (
                <tr key={grade.id} data-cy="grade-row">
                  <td className="p-4">{grade.subject}</td>
                  <td className="p-4">{grade.examName}</td>
                  <td className="p-4">
                    <span className={`font-medium ${(grade.score / grade.maxScore) * 10 >= 7 ? 'text-green-600' : (grade.score / grade.maxScore) * 10 >= 5 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {grade.score}/{grade.maxScore}
                    </span>
                  </td>
                  <td className="p-4">{grade.weight}%</td>
                  <td className="p-4 text-gray-500">{grade.date}</td>
                  <td className="p-4">
                    <button
                      onClick={() => handleDeleteGrade(grade.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      data-cy="btn-delete-grade"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <Award className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aún no hay calificaciones</h3>
          <p className="text-gray-500">Registra tus notas para llevar un control de tu rendimiento académico</p>
        </div>
      )}

      {/* Modal de formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Nueva Calificación</h2>
              <button onClick={() => { setShowForm(false); setFormErrors({}); }} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4" data-cy="grade-form">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Materia *</label>
                <select
                  value={formData.subject}
                  onChange={e => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${formErrors.subject ? 'border-red-500' : ''}`}
                  data-cy="grade-subject"
                >
                  <option value="">Seleccionar materia</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
                {formErrors.subject && <p className="text-red-500 text-sm mt-1" data-cy="error-subject">{formErrors.subject}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Examen *</label>
                <input
                  type="text"
                  value={formData.examName}
                  onChange={e => setFormData(prev => ({ ...prev, examName: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${formErrors.examName ? 'border-red-500' : ''}`}
                  placeholder="Ej: Parcial 1"
                  data-cy="grade-exam-name"
                />
                {formErrors.examName && <p className="text-red-500 text-sm mt-1" data-cy="error-exam-name">{formErrors.examName}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nota Obtenida *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.score}
                    onChange={e => setFormData(prev => ({ ...prev, score: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${formErrors.score ? 'border-red-500' : ''}`}
                    placeholder="8.5"
                    data-cy="grade-score"
                  />
                  {formErrors.score && <p className="text-red-500 text-sm mt-1" data-cy="error-score">{formErrors.score}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nota Máxima *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.maxScore}
                    onChange={e => setFormData(prev => ({ ...prev, maxScore: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${formErrors.maxScore ? 'border-red-500' : ''}`}
                    placeholder="10"
                    data-cy="grade-max-score"
                  />
                  {formErrors.maxScore && <p className="text-red-500 text-sm mt-1" data-cy="error-max-score">{formErrors.maxScore}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Peso (%) *</label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={e => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${formErrors.weight ? 'border-red-500' : ''}`}
                    placeholder="30"
                    min="1"
                    max="100"
                    data-cy="grade-weight"
                  />
                  {formErrors.weight && <p className="text-red-500 text-sm mt-1" data-cy="error-weight">{formErrors.weight}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${formErrors.date ? 'border-red-500' : ''}`}
                    data-cy="grade-date"
                  />
                  {formErrors.date && <p className="text-red-500 text-sm mt-1" data-cy="error-date">{formErrors.date}</p>}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setFormErrors({}); }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                  data-cy="btn-submit-grade"
                >
                  Registrar Calificación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { ScheduleEntry, Subject } from '../types';
import { Calendar, Plus, Trash2, X, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getFromStorage, setToStorage } from '../utils/storage';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'] as const;
const HOURS = Array.from({ length: 14 }, (_, i) => {
  const hour = i + 7;
  return `${hour.toString().padStart(2, '0')}:00`;
});

export default function Schedule() {
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    day: 'Lunes' as ScheduleEntry['day'],
    startTime: '07:00',
    endTime: '08:00',
    classroom: '',
    teacher: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadData() {
      const dbEntries = await getFromStorage<ScheduleEntry[]>('schedule', []);
      const dbSubjects = await getFromStorage<Subject[]>('subjects', []);
      setEntries(dbEntries);
      setSubjects(dbSubjects);
      setIsLoaded(true);
    }
    loadData();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      setToStorage('schedule', entries).catch(console.error);
    }
  }, [entries, isLoaded]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.subject.trim()) {
      errors.subject = 'La materia es obligatoria';
    }
    if (!formData.classroom.trim()) {
      errors.classroom = 'El aula es obligatoria';
    }
    if (!formData.teacher.trim()) {
      errors.teacher = 'El docente es obligatorio';
    }
    if (formData.startTime >= formData.endTime) {
      errors.endTime = 'La hora fin debe ser posterior a la hora inicio';
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

    if (editingId) {
      setEntries(entries.map(entry =>
        entry.id === editingId
          ? { ...entry, ...formData }
          : entry
      ));
      setEditingId(null);
      toast.success('Clase actualizada exitosamente');
    } else {
      const newEntry: ScheduleEntry = {
        id: crypto.randomUUID(),
        ...formData,
      };
      setEntries([...entries, newEntry]);
      toast.success('Clase agregada al horario');
    }

    setFormData({ subject: '', day: 'Lunes', startTime: '07:00', endTime: '08:00', classroom: '', teacher: '' });
    setFormErrors({});
    setShowForm(false);
  };

  const handleEdit = (entry: ScheduleEntry) => {
    setEditingId(entry.id);
    setFormData({
      subject: entry.subject,
      day: entry.day,
      startTime: entry.startTime,
      endTime: entry.endTime,
      classroom: entry.classroom,
      teacher: entry.teacher,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
    toast.success('Clase eliminada del horario');
  };

  const getEntriesForDay = (day: string) => {
    return entries
      .filter(e => e.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const getSubjectColor = (subjectName: string) => {
    const subject = subjects.find(s => s.name === subjectName);
    return subject?.color || '#6366f1';
  };

  if (!isLoaded) return <div className="p-8 text-center">Cargando horario...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Calendar className="text-indigo-600" size={28} />
          <h1 className="text-2xl font-bold text-gray-900">Horario de Clases</h1>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ subject: '', day: 'Lunes', startTime: '07:00', endTime: '08:00', classroom: '', teacher: '' });
            setShowForm(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
          data-cy="btn-add-schedule"
        >
          <Plus size={20} />
          Agregar Clase
        </button>
      </div>

      {/* Vista de horario semanal */}
      {entries.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full min-w-[800px]" data-cy="schedule-table">
            <thead className="bg-gray-50">
              <tr>
                {DAYS.map(day => (
                  <th key={day} className="p-4 text-sm font-medium text-gray-600 text-center border-r last:border-r-0">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {DAYS.map(day => (
                  <td key={day} className="p-2 align-top border-r last:border-r-0 min-w-[160px]">
                    {getEntriesForDay(day).map(entry => (
                      <div
                        key={entry.id}
                        className="mb-2 p-3 rounded-lg text-white text-sm relative group"
                        style={{ backgroundColor: getSubjectColor(entry.subject) }}
                        data-cy="schedule-entry"
                      >
                        <div className="font-semibold">{entry.subject}</div>
                        <div className="opacity-90">{entry.startTime} - {entry.endTime}</div>
                        <div className="opacity-80 text-xs mt-1">📍 {entry.classroom}</div>
                        <div className="opacity-80 text-xs">👨‍🏫 {entry.teacher}</div>
                        <div className="absolute top-1 right-1 hidden group-hover:flex gap-1">
                          <button
                            onClick={() => handleEdit(entry)}
                            className="p-1 bg-white/30 rounded hover:bg-white/50"
                            data-cy="btn-edit-schedule"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="p-1 bg-white/30 rounded hover:bg-white/50"
                            data-cy="btn-delete-schedule"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {getEntriesForDay(day).length === 0 && (
                      <div className="text-center text-gray-400 text-sm py-4">Sin clases</div>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aún no hay clases en el horario</h3>
          <p className="text-gray-500">Agrega tus clases para organizar tu semana académica</p>
        </div>
      )}

      {/* Resumen rápido */}
      {entries.length > 0 && (
        <div className="mt-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-semibold text-lg mb-4">Resumen del Horario</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {DAYS.map(day => (
              <div key={day} className="text-center">
                <div className="text-sm text-gray-500">{day}</div>
                <div className="text-2xl font-bold text-indigo-600" data-cy="schedule-day-count">
                  {getEntriesForDay(day).length}
                </div>
                <div className="text-xs text-gray-400">clase(s)</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                {editingId ? 'Editar Clase' : 'Agregar Clase'}
              </h2>
              <button onClick={() => { setShowForm(false); setFormErrors({}); }} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4" data-cy="schedule-form">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Materia *</label>
                <select
                  value={formData.subject}
                  onChange={e => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${formErrors.subject ? 'border-red-500' : ''}`}
                  data-cy="schedule-subject"
                >
                  <option value="">Seleccionar materia</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
                {formErrors.subject && <p className="text-red-500 text-sm mt-1" data-cy="error-subject">{formErrors.subject}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Día *</label>
                <select
                  value={formData.day}
                  onChange={e => setFormData(prev => ({ ...prev, day: e.target.value as ScheduleEntry['day'] }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  data-cy="schedule-day"
                >
                  {DAYS.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora Inicio *</label>
                  <select
                    value={formData.startTime}
                    onChange={e => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    data-cy="schedule-start-time"
                  >
                    {HOURS.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora Fin *</label>
                  <select
                    value={formData.endTime}
                    onChange={e => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${formErrors.endTime ? 'border-red-500' : ''}`}
                    data-cy="schedule-end-time"
                  >
                    {HOURS.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                  {formErrors.endTime && <p className="text-red-500 text-sm mt-1" data-cy="error-end-time">{formErrors.endTime}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aula *</label>
                <input
                  type="text"
                  value={formData.classroom}
                  onChange={e => setFormData(prev => ({ ...prev, classroom: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${formErrors.classroom ? 'border-red-500' : ''}`}
                  placeholder="Ej: Aula 301"
                  data-cy="schedule-classroom"
                />
                {formErrors.classroom && <p className="text-red-500 text-sm mt-1" data-cy="error-classroom">{formErrors.classroom}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Docente *</label>
                <input
                  type="text"
                  value={formData.teacher}
                  onChange={e => setFormData(prev => ({ ...prev, teacher: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${formErrors.teacher ? 'border-red-500' : ''}`}
                  placeholder="Nombre del docente"
                  data-cy="schedule-teacher"
                />
                {formErrors.teacher && <p className="text-red-500 text-sm mt-1" data-cy="error-teacher">{formErrors.teacher}</p>}
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
                  data-cy="btn-submit-schedule"
                >
                  {editingId ? 'Actualizar Clase' : 'Agregar Clase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

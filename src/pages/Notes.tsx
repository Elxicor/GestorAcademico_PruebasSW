import { useState, useEffect } from 'react';
import { Note, Subject } from '../types';
import { FileText, Plus, Trash2, X, Edit2, Search, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { getFromStorage, setToStorage } from '../utils/storage';

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    subject: '',
    tags: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadData() {
      const dbNotes = await getFromStorage<Note[]>('notes', []);
      const dbSubjects = await getFromStorage<Subject[]>('subjects', []);
      setNotes(dbNotes);
      setSubjects(dbSubjects);
      setIsLoaded(true);
    }
    loadData();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      setToStorage('notes', notes).catch(console.error);
    }
  }, [notes, isLoaded]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) {
      errors.title = 'El título es obligatorio';
    }
    if (!formData.content.trim()) {
      errors.content = 'El contenido es obligatorio';
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

    const tags = formData.tags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    if (editingId) {
      setNotes(notes.map(note =>
        note.id === editingId
          ? {
              ...note,
              title: formData.title,
              content: formData.content,
              subject: formData.subject,
              tags,
              updatedAt: new Date().toISOString(),
            }
          : note
      ));
      setEditingId(null);
      toast.success('Apunte actualizado exitosamente');
    } else {
      const newNote: Note = {
        id: crypto.randomUUID(),
        title: formData.title,
        content: formData.content,
        subject: formData.subject || 'General',
        tags,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setNotes([newNote, ...notes]);
      toast.success('Apunte creado exitosamente');
    }

    setFormData({ title: '', content: '', subject: '', tags: '' });
    setFormErrors({});
    setShowForm(false);
  };

  const handleEdit = (note: Note) => {
    setEditingId(note.id);
    setFormData({
      title: note.title,
      content: note.content,
      subject: note.subject,
      tags: note.tags.join(', '),
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
    toast.success('Apunte eliminado');
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = searchQuery === '' ||
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = filterSubject === '' || note.subject === filterSubject;
    return matchesSearch && matchesSubject;
  });

  if (!isLoaded) return <div className="p-8 text-center">Cargando apuntes...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <FileText className="text-indigo-600" size={28} />
          <h1 className="text-2xl font-bold text-gray-900">Apuntes</h1>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ title: '', content: '', subject: '', tags: '' });
            setShowForm(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
          data-cy="btn-add-note"
        >
          <Plus size={20} />
          Nuevo Apunte
        </button>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar apuntes por título o contenido..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            data-cy="notes-search"
          />
        </div>
        <select
          value={filterSubject}
          onChange={e => setFilterSubject(e.target.value)}
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          data-cy="notes-filter-subject"
        >
          <option value="">Todas las materias</option>
          {subjects.map(s => (
            <option key={s.id} value={s.name}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Lista de apuntes */}
      {filteredNotes.length > 0 ? (
        <div className="grid gap-4" data-cy="notes-list">
          {filteredNotes.map(note => (
            <div
              key={note.id}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              data-cy="note-card"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg" data-cy="note-title">{note.title}</h3>
                  <span className="text-sm text-indigo-600 font-medium">{note.subject}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(note)}
                    className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                    data-cy="btn-edit-note"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    data-cy="btn-delete-note"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-3 line-clamp-3" data-cy="note-content">
                {note.content}
              </p>
              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {note.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs"
                      data-cy="note-tag"
                    >
                      <Tag size={10} />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="text-xs text-gray-400">
                Creado: {new Date(note.createdAt).toLocaleDateString('es-EC')}
                {note.updatedAt !== note.createdAt && (
                  <> · Editado: {new Date(note.updatedAt).toLocaleDateString('es-EC')}</>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <FileText className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || filterSubject ? 'No se encontraron apuntes' : 'Aún no hay apuntes'}
          </h3>
          <p className="text-gray-500">
            {searchQuery || filterSubject
              ? 'Intenta con otros términos de búsqueda'
              : 'Crea apuntes para organizar tus notas de clase'}
          </p>
        </div>
      )}

      {/* Contador de resultados */}
      {(searchQuery || filterSubject) && (
        <p className="text-sm text-gray-500 mt-4" data-cy="notes-count">
          {filteredNotes.length} resultado(s) encontrado(s)
        </p>
      )}

      {/* Modal de formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                {editingId ? 'Editar Apunte' : 'Nuevo Apunte'}
              </h2>
              <button onClick={() => { setShowForm(false); setFormErrors({}); }} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4" data-cy="note-form">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${formErrors.title ? 'border-red-500' : ''}`}
                  placeholder="Título del apunte"
                  data-cy="note-form-title"
                />
                {formErrors.title && <p className="text-red-500 text-sm mt-1" data-cy="error-title">{formErrors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Materia</label>
                <select
                  value={formData.subject}
                  onChange={e => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  data-cy="note-form-subject"
                >
                  <option value="">General</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contenido *</label>
                <textarea
                  value={formData.content}
                  onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${formErrors.content ? 'border-red-500' : ''}`}
                  rows={6}
                  placeholder="Escribe tu apunte aquí..."
                  data-cy="note-form-content"
                />
                {formErrors.content && <p className="text-red-500 text-sm mt-1" data-cy="error-content">{formErrors.content}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Etiquetas <span className="text-gray-400">(separadas por comas)</span>
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={e => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ej: parcial, resumen, fórmulas"
                  data-cy="note-form-tags"
                />
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
                  data-cy="btn-submit-note"
                >
                  {editingId ? 'Actualizar Apunte' : 'Crear Apunte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { supabase } from '../lib/supabase';

// Interfaces
export interface StudySession {
  id: string;
  user_id: string;
  title: string;
  content: string;
  transcription?: string;
  audio_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  due_date?: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  study_preferences: {
    daily_goal?: number;
    preferred_subjects?: string[];
    reminder_time?: string;
  };
  created_at: string;
  updated_at: string;
}

// Adaptador seguro para ignorar errores de TS por choque de versiones v1/v2
async function getUserId(): Promise<string | null> {
  try {
    // @ts-ignore
    if (typeof supabase.auth.getUser === 'function') {
      // @ts-ignore
      const { data } = await supabase.auth.getUser();
      return data?.user?.id || null;
    }
    // @ts-ignore
    return supabase.auth.user()?.id || null;
  } catch (error) {
    return null;
  }
}

// ==========================================
// REDIRECCIÓN HÍBRIDA (Compatibilidad UI)
// ==========================================
export async function getFromStorage<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const userId = await getUserId();
    if (!userId) return defaultValue;

    if (key === 'tasks') {
      const tasks = await getTasks();
      return tasks as unknown as T;
    }
    if (key === 'studyTime') {
      const sessions = await getStudySessions();
      const mappedSessions = sessions.map(s => {
        const durationMatch = s.content.match(/Duration: (\d+)/);
        const subjectMatch = s.content.match(/Subject: (.+?)(?:\n|$)/);
        return {
          id: s.id,
          date: s.created_at,
          durationMinutes: durationMatch ? parseInt(durationMatch[1]) : 25,
          subject: subjectMatch ? subjectMatch[1].trim() : 'General'
        };
      });
      return mappedSessions as unknown as T;
    }
    if (key === 'streak') {
      const { data } = await supabase.from('streaks').select('*').eq('user_id', userId).maybeSingle();
      if (!data) return defaultValue;
      return {
        currentStreak: data.current_streak,
        bestStreak: data.best_streak,
        lastStudyDate: data.last_study_date
      } as unknown as T;
    }
    
    // Fallback general para settings (como Subjects o Perfil)
    const { data } = await supabase.from('user_settings').select('value').eq('user_id', userId).eq('key', key).maybeSingle();
    return data && data.value ? JSON.parse(data.value) : defaultValue;
  } catch (error) {
    console.error(`Error getFromStorage (${key}):`, error);
    return defaultValue;
  }
}

export async function setToStorage<T>(key: string, value: T): Promise<void> {
  try {
    const userId = await getUserId();
    if (!userId) throw new Error('User not authenticated');

    if (key === 'streak') {
      const streakVal = value as any;
      await supabase.from('streaks').upsert({
        user_id: userId,
        current_streak: streakVal.currentStreak || 0,
        best_streak: streakVal.bestStreak || 0,
        last_study_date: streakVal.lastStudyDate || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
      return;
    }

    if (key === 'studyTime') {
      const rawSessions = value as any[];
      if (rawSessions.length === 0) return;
      const lastSession = rawSessions[rawSessions.length - 1];
      
      const sessions = await getStudySessions();
      const isDuplicate = sessions.some(s => s.id === lastSession.id);
      
      if (!isDuplicate) {
        await supabase.from('study_sessions').insert({
          id: lastSession.id || crypto.randomUUID(),
          user_id: userId,
          title: `Sesión de ${lastSession.subject || 'Estudio'}`,
          content: `Duration: ${lastSession.durationMinutes || 25} minutes \n Subject: ${lastSession.subject || 'General'}`,
          created_at: lastSession.date || new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
      return;
    }

    // Default genérico
    await supabase.from('user_settings').upsert(
      { user_id: userId, key, value: JSON.stringify(value), updated_at: new Date().toISOString() },
      { onConflict: 'user_id,key' }
    );
  } catch (error) {
    console.error(`Error setToStorage (${key}):`, error);
  }
}

// ==========================================
// TABLA: study_sessions
// ==========================================
export async function getStudySessions(): Promise<StudySession[]> {
  const userId = await getUserId();
  if (!userId) return [];
  const { data } = await supabase.from('study_sessions').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  return data || [];
}

// ==========================================
// TABLA: tasks
// ==========================================
export async function createTask(title: string, description?: string, dueDate?: string): Promise<Task> {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthenticated');
  const { data, error } = await supabase.from('tasks').insert({
    user_id: userId, title, description, due_date: dueDate, completed: false
  }).select().single();
  if (error) throw error;
  return data;
}

export async function getTasks(): Promise<Task[]> {
  const userId = await getUserId();
  if (!userId) return [];
  const { data } = await supabase.from('tasks').select('*').eq('user_id', userId).order('due_date', { ascending: true });
  return data || [];
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthenticated');
  const { data, error } = await supabase.from('tasks').update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id).eq('user_id', userId).select().single();
  if (error) throw error;
  return data;
}

export async function deleteTask(id: string): Promise<void> {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthenticated');
  await supabase.from('tasks').delete().eq('id', id).eq('user_id', userId);
}
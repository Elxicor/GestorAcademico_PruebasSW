import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Settings, Volume2, VolumeX } from 'lucide-react';
import toast from 'react-hot-toast';
import { getFromStorage, setToStorage } from '../utils/storage';
import { StudentProfile } from '../types';

interface PomodoroTimerProps {
  onSessionComplete: (minutes: number) => void;
  onStart: () => void;
  onStop: () => void;
}

export default function PomodoroTimer({ onSessionComplete, onStart, onStop }: PomodoroTimerProps) {
  const [isActive, setIsActive] = useState(false);
  const [isWorkPeriod, setIsWorkPeriod] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [time, setTime] = useState(25 * 60);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [fullProfile, setFullProfile] = useState<StudentProfile | null>(null);
  
  const [settings, setSettings] = useState({
    workMinutes: 25,
    breakMinutes: 5,
    longBreakMinutes: 15,
    sessionsUntilLongBreak: 4
  });
  
  const [completedSessions, setCompletedSessions] = useState(0);

  // Inicializar cargando el perfil del storage para mantener consistencia
  useEffect(() => {
    async function loadInitialSettings() {
      try {
        const profile = await getFromStorage<StudentProfile | null>('profile', null);
        if (profile && profile.studyPreferences) {
          setFullProfile(profile);
          const workMins = profile.studyPreferences.focusSessionDuration || 25;
          const breakMins = profile.studyPreferences.breakDuration || 5;
          
          setSettings(prev => ({
            ...prev,
            workMinutes: workMins,
            breakMinutes: breakMins
          }));
          
          if (!isActive) {
            setTime(workMins * 60);
          }
          setSoundEnabled(profile.studyPreferences.soundEffects ?? true);
        }
      } catch (error) {
        console.error("Error al cargar configuración del timer:", error);
      }
    }
    loadInitialSettings();
  }, []);

  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  const playSound = async (soundName: string) => {
    if (!soundEnabled) return;
    
    const soundMap: Record<string, string> = {
      'timer-start': '/sounds/timer-start.mp3',
      'work-complete': 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
      'break-complete': 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'
    };

    const volumeMap: Record<string, number> = {
      'timer-start': 0.5,
      'work-complete': 0.4,
      'break-complete': 0.45
    };

    const soundPath = soundMap[soundName];
    if (!soundPath) return;

    try {
      const audio = new Audio();
      const loadPromise = new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', resolve, { once: true });
        audio.addEventListener('error', (e) => reject(new Error(`Failed to load sound: ${e.message}`)), { once: true });
        audio.src = soundPath;
      });

      await Promise.race([
        loadPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Sound loading timeout')), 5000))
      ]);

      audio.volume = volumeMap[soundName] || 0.5;
      await audio.play();
    } catch (error) {
      console.warn(`Sound playback error (${soundName}):`, error);
      if (soundName !== 'timer-start') {
        await fallbackBeep(soundName === 'work-complete' ? 800 : 600);
      }
    }
  };

  const fallbackBeep = async (frequency: number): Promise<void> => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) throw new Error('Web Audio API not supported');

      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gainNode.gain.value = 0.1;
      
      oscillator.start();
      gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.5);
      
      return new Promise((resolve) => {
        setTimeout(() => {
          oscillator.stop();
          audioContext.close();
          resolve();
        }, 500);
      });
    } catch (error) {
      toast.success('¡Temporizador completado!');
    }
  };

  const showNotification = (title: string, body: string) => {
    try {
      if ("Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification(title, { body, icon: '/favicon.ico', silent: true });
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission().then(permission => {
            if (permission === "granted") {
              showNotification(title, body);
            }
          });
        }
      }
    } catch (error) {
      toast.success(`${title} - ${body}`);
    }
  };

  const handlePeriodComplete = useCallback(() => {
    if (isWorkPeriod) {
      const newCompletedSessions = completedSessions + 1;
      setCompletedSessions(newCompletedSessions);
      onSessionComplete(settings.workMinutes);
      
      if (newCompletedSessions % settings.sessionsUntilLongBreak === 0) {
        setTime(settings.longBreakMinutes * 60);
        playSound('work-complete');
        showNotification('¡Hora de un Descanso Largo! 🎉', `¡Excelente trabajo! Has completado ${settings.sessionsUntilLongBreak} sesiones de trabajo.`);
        toast.success(
          <div>
            <p className="font-medium">¡Hora de un descanso largo!</p>
            <p className="text-sm">¡Te lo has ganado! 🎉</p>
          </div>
        );
      } else {
        setTime(settings.breakMinutes * 60);
        playSound('work-complete');
        showNotification('¡Hora del Descanso! ☕', '¡Bien hecho! Toma un descanso corto.');
        toast.success(
          <div>
            <p className="font-medium">¡Buen trabajo!</p>
            <p className="text-sm">Hora de un descanso corto ☕</p>
          </div>
        );
      }
    } else {
      setTime(settings.workMinutes * 60);
      playSound('break-complete');
      showNotification('¡De Vuelta al Trabajo! 💪', '¡El descanso terminó. Volvamos a ello!');
      toast.success(
        <div>
          <p className="font-medium">El descanso terminó</p>
          <p className="text-sm">¡Volvamos al trabajo! 💪</p>
        </div>
      );
    }
    
    setIsWorkPeriod(!isWorkPeriod);
  }, [isWorkPeriod, completedSessions, settings, onSessionComplete, soundEnabled]);

  const toggleTimer = () => {
    setIsActive(!isActive);
    if (!isActive) {
      playSound('timer-start');
      onStart();
    } else {
      onStop();
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsWorkPeriod(true);
    setTime(settings.workMinutes * 60);
    setCompletedSessions(0);
    onStop();
  };

  const handleSaveSettings = async () => {
    setShowSettings(false);
    
    // Al guardar, actualizamos el tiempo si no está activo
    if (!isActive) {
      setTime(settings.workMinutes * 60);
    }

    // Persistir a Supabase
    try {
      if (fullProfile) {
        const updatedProfile = {
          ...fullProfile,
          studyPreferences: {
            ...fullProfile.studyPreferences,
            focusSessionDuration: settings.workMinutes,
            breakDuration: settings.breakMinutes,
            soundEffects: soundEnabled
          }
        };
        setFullProfile(updatedProfile);
        await setToStorage('profile', updatedProfile);
        toast.success('¡Configuración guardada en el perfil!');
      }
    } catch (error) {
      console.error("Error saving timer settings", error);
      toast.error('Error al sincronizar la configuración');
    }
  };

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    let interval: number | undefined;

    if (isActive) {
      interval = window.setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 1) {
            handlePeriodComplete();
            return isWorkPeriod ? settings.breakMinutes * 60 : settings.workMinutes * 60;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        window.clearInterval(interval);
      }
    };
  }, [isActive, isWorkPeriod, settings, handlePeriodComplete]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">
          {isWorkPeriod ? 'Tiempo de Trabajo' : 'Tiempo de Descanso'}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              toast.success(`Sonido ${!soundEnabled ? 'activado' : 'desactivado'}`);
            }}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            aria-label={soundEnabled ? 'Desactivar sonido' : 'Activar sonido'}
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            aria-label={showSettings ? 'Ocultar configuración' : 'Mostrar configuración'}
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {showSettings ? (
        <div className="space-y-4">
          <div>
            <label htmlFor="workMinutes" className="block text-sm font-medium text-gray-700 mb-1">
              Duración del Trabajo (minutos)
            </label>
            <input
              id="workMinutes"
              type="number"
              value={settings.workMinutes}
              onChange={(e) => setSettings(prev => ({ 
                ...prev, 
                workMinutes: Math.max(1, Math.min(120, parseInt(e.target.value) || 1))
              }))}
              className="w-full px-3 py-2 border rounded-lg"
              min="1"
              max="120"
            />
          </div>
          <div>
            <label htmlFor="breakMinutes" className="block text-sm font-medium text-gray-700 mb-1">
              Duración del Descanso (minutos)
            </label>
            <input
              id="breakMinutes"
              type="number"
              value={settings.breakMinutes}
              onChange={(e) => setSettings(prev => ({ 
                ...prev, 
                breakMinutes: Math.max(1, Math.min(30, parseInt(e.target.value) || 1))
              }))}
              className="w-full px-3 py-2 border rounded-lg"
              min="1"
              max="30"
            />
          </div>
          <div>
            <label htmlFor="longBreakMinutes" className="block text-sm font-medium text-gray-700 mb-1">
              Descanso Largo (minutos)
            </label>
            <input
              id="longBreakMinutes"
              type="number"
              value={settings.longBreakMinutes}
              onChange={(e) => setSettings(prev => ({ 
                ...prev, 
                longBreakMinutes: Math.max(1, Math.min(60, parseInt(e.target.value) || 1))
              }))}
              className="w-full px-3 py-2 border rounded-lg"
              min="1"
              max="60"
            />
          </div>
          <button
            onClick={handleSaveSettings}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Guardar Configuración
          </button>
        </div>
      ) : (
        <>
          <div className="text-6xl font-bold text-center mb-8" role="timer" aria-label={`${formatTime(time)} remaining`}>
            {formatTime(time)}
          </div>
          
          <div className="flex justify-center gap-4">
            <button
              onClick={toggleTimer}
              className={`p-4 rounded-full ${
                isActive 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                  : 'bg-green-100 text-green-600 hover:bg-green-200'
              }`}
              aria-label={isActive ? 'Pausar temporizador' : 'Iniciar temporizador'}
            >
              {isActive ? <Pause size={24} /> : <Play size={24} />}
            </button>
            <button
              onClick={resetTimer}
              className="p-4 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
              aria-label="Reiniciar temporizador"
            >
              <RotateCcw size={24} />
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            Sesión {completedSessions % settings.sessionsUntilLongBreak + 1} de {settings.sessionsUntilLongBreak}
          </div>
        </>
      )}
    </div>
  );
}
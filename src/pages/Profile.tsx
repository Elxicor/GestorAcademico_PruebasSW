import { useState, useEffect } from 'react';
import { StudentProfile } from '../types';
import { Trophy, User, Bell, Volume2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { getFromStorage, setToStorage } from '../utils/storage';
import LoadingSpinner from '../components/LoadingSpinner';
import { supabase } from '../lib/supabase';

const defaultProfile: StudentProfile = {
  name: '',
  email: '',
  bio: '',
  studyPreferences: {
    preferredStudyTime: 'morning',
    focusSessionDuration: 25,
    breakDuration: 5,
    dailyGoalHours: 4,
    notifications: true,
    soundEffects: true,
  },
  achievements: [],
};

// Adaptador seguro para obtener el usuario ignorando errores de versión de TS
async function getCurrentUser() {
  try {
    // @ts-ignore
    if (typeof supabase.auth.getUser === 'function') {
      // @ts-ignore
      const { data } = await supabase.auth.getUser();
      return data?.user;
    }
    // @ts-ignore
    return supabase.auth.user();
  } catch (error) {
    return null;
  }
}

export default function Profile() {
  const [profile, setProfile] = useState<StudentProfile>(defaultProfile);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const loadedProfile = await getFromStorage<StudentProfile>('profile', defaultProfile);
        const user = await getCurrentUser();

        // Autocompletar datos del usuario si están vacíos
        if (user) {
          if (!loadedProfile.email) loadedProfile.email = user.email || '';
          if (!loadedProfile.name) loadedProfile.name = user.user_metadata?.name || 'Estudiante';
        }

        setProfile(loadedProfile);
      } catch (error) {
        console.error('Error loading profile:', error);
        setError('Failed to load profile. Please try refreshing the page.');
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({
          ...prev,
          avatar: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      await setToStorage('profile', profile);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Student Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center gap-6 mb-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden">
                  {profile.avatar ? (
                    <img 
                      src={profile.avatar} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <User size={32} />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-1 bg-indigo-600 rounded-full cursor-pointer text-white hover:bg-indigo-700">
                  <Trophy size={16} />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>

              <div className="flex-1">
                <input
                  type="text"
                  value={profile.name}
                  onChange={e => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Your Name"
                  className="w-full text-xl font-semibold mb-2 px-3 py-2 border rounded-lg"
                />
                <input
                  type="email"
                  value={profile.email}
                  onChange={e => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your.email@example.com"
                  className="w-full text-gray-600 px-3 py-2 border rounded-lg"
                  readOnly
                />
              </div>
            </div>

            <textarea
              value={profile.bio}
              onChange={e => setProfile(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell us about yourself..."
              className="w-full h-32 px-3 py-2 border rounded-lg resize-none"
            />
          </div>

          {/* Study Preferences */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-lg font-semibold mb-4">Study Preferences</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Study Time
                </label>
                <select
                  value={profile.studyPreferences?.preferredStudyTime || 'morning'}
                  onChange={e => setProfile(prev => ({
                    ...prev,
                    studyPreferences: {
                      ...prev.studyPreferences,
                      preferredStudyTime: e.target.value as StudentProfile['studyPreferences']['preferredStudyTime']
                    }
                  }))}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                  <option value="night">Night</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Focus Session (minutes)
                  </label>
                  <input
                    type="number"
                    value={profile.studyPreferences?.focusSessionDuration || 25}
                    onChange={e => setProfile(prev => ({
                      ...prev,
                      studyPreferences: {
                        ...prev.studyPreferences,
                        focusSessionDuration: parseInt(e.target.value) || 25
                      }
                    }))}
                    min="1"
                    max="120"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Break Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={profile.studyPreferences?.breakDuration || 5}
                    onChange={e => setProfile(prev => ({
                      ...prev,
                      studyPreferences: {
                        ...prev.studyPreferences,
                        breakDuration: parseInt(e.target.value) || 5
                      }
                    }))}
                    min="1"
                    max="30"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Daily Study Goal (hours)
                </label>
                <input
                  type="number"
                  value={profile.studyPreferences?.dailyGoalHours || 4}
                  onChange={e => setProfile(prev => ({
                    ...prev,
                    studyPreferences: {
                      ...prev.studyPreferences,
                      dailyGoalHours: parseInt(e.target.value) || 4
                    }
                  }))}
                  min="1"
                  max="24"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell size={20} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Notifications</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.studyPreferences?.notifications ?? true}
                    onChange={e => setProfile(prev => ({
                      ...prev,
                      studyPreferences: {
                        ...prev.studyPreferences,
                        notifications: e.target.checked
                      }
                    }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 size={20} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Sound Effects</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.studyPreferences?.soundEffects ?? true}
                    onChange={e => setProfile(prev => ({
                      ...prev,
                      studyPreferences: {
                        ...prev.studyPreferences,
                        soundEffects: e.target.checked
                      }
                    }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Save size={20} />
            Save Changes
          </button>
        </div>

        {/* Achievements */}
        <div className="bg-white p-6 rounded-xl shadow-sm border h-fit">
          <h2 className="text-lg font-semibold mb-4">Achievements</h2>
          <div className="space-y-4">
            {profile.achievements && profile.achievements.map((achievement, index) => (
              <div key={index} className="flex items-start gap-3">
                <Trophy className="text-indigo-600 flex-shrink-0" size={20} />
                <div>
                  <h3 className="font-medium text-gray-900">{achievement.title}</h3>
                  <p className="text-sm text-gray-500">{achievement.description}</p>
                </div>
              </div>
            ))}
            {(!profile.achievements || profile.achievements.length === 0) && (
              <p className="text-gray-500 text-sm">No achievements yet. Keep studying!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
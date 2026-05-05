import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/task.dart';
import '../utils/app_date_utils.dart';
import 'notification_service.dart';

class DatabaseService {
  static const String _tasksKey = 'student_tasks';
  static const String _coursesKey = 'student_courses';
  static const String _settingsKey = 'app_settings';

  static const String _defaultSubjectKey = 'default_subject';
  static const String _notificationEnabledKey = 'notifications_enabled';

  // ─────────────────────────────────────────────
  // SharedPreferences
  // ─────────────────────────────────────────────
  static Future<SharedPreferences> _prefs() async {
    return SharedPreferences.getInstance();
  }

  // ─────────────────────────────────────────────
  // TASKS
  // ─────────────────────────────────────────────

  static Future<List<Task>> getTasks() async {
    final prefs = await _prefs();
    final String? tasksString = prefs.getString(_tasksKey);

    if (tasksString == null) return [];

    try {
      final List decoded = jsonDecode(tasksString);
      return decoded
          .map((e) => Task.fromMap(Map<String, dynamic>.from(e)))
          .toList();
    } catch (_) {
      return [];
    }
  }

  static Future<void> saveTask(Task task) async {
    final tasks = await getTasks();
    final index = tasks.indexWhere((t) => t.id == task.id);

    if (index >= 0) {
      tasks[index] = task;
    } else {
      tasks.add(task);
    }

    await _saveTasks(tasks);

    // 🔔 Notification handling
    final bool notificationsEnabled = await areNotificationsEnabled();
    final int notificationId = task.id.hashCode;

    if (notificationsEnabled &&
        task.dueDate != null &&
        !task.isCompleted) {
      await NotificationService.scheduleNotification(
        id: notificationId,
        title: 'Task Reminder',
        body: task.title,
        scheduledDate: task.dueDate!,
      );
    } else {
      await NotificationService.cancelNotification(notificationId);
    }
  }

  static Future<void> deleteTask(String taskId) async {
    final tasks = await getTasks();
    tasks.removeWhere((task) => task.id == taskId);
    await _saveTasks(tasks);

    // 🔕 Cancel notification
    await NotificationService.cancelNotification(taskId.hashCode);
  }

  static Future<void> toggleTaskCompletion(String taskId) async {
    final tasks = await getTasks();
    final index = tasks.indexWhere((task) => task.id == taskId);

    if (index >= 0) {
      final updatedTask = tasks[index].copyWith(
        isCompleted: !tasks[index].isCompleted,
      );

      tasks[index] = updatedTask;
      await _saveTasks(tasks);

      // 🔕 Cancel notification when completed
      if (updatedTask.isCompleted) {
        await NotificationService.cancelNotification(taskId.hashCode);
      }
    }
  }

  static Future<void> _saveTasks(List<Task> tasks) async {
    final prefs = await _prefs();
    final encoded = tasks.map((task) => task.toMap()).toList();
    await prefs.setString(_tasksKey, jsonEncode(encoded));
  }

  // ─────────────────────────────────────────────
  // TASK HELPERS
  // ─────────────────────────────────────────────

  static Future<List<Task>> getTasksBySubject(String subject) async {
    final tasks = await getTasks();
    return tasks.where((task) => task.subject == subject).toList();
  }

  static Future<List<Task>> getOverdueTasks() async {
    final tasks = await getTasks();
    return tasks.where((task) {
      return !task.isCompleted &&
          task.dueDate != null &&
          AppDateUtils.isOverdue(task.dueDate);
    }).toList();
  }

  static Future<Map<String, int>> getTaskStatsBySubject() async {
    final tasks = await getTasks();
    final Map<String, int> stats = {};

    for (final task in tasks) {
      stats[task.subject] = (stats[task.subject] ?? 0) + 1;
    }

    return stats;
  }

  // ─────────────────────────────────────────────
  // COURSES (FUTURE)
  // ─────────────────────────────────────────────

  static Future<List<Map<String, dynamic>>> getCourses() async {
    final prefs = await _prefs();
    final String? coursesString = prefs.getString(_coursesKey);
    if (coursesString == null) return [];

    return List<Map<String, dynamic>>.from(
      jsonDecode(coursesString),
    );
  }

  static Future<void> saveCourses(
      List<Map<String, dynamic>> courses) async {
    final prefs = await _prefs();
    await prefs.setString(_coursesKey, jsonEncode(courses));
  }

  // ─────────────────────────────────────────────
  // SETTINGS
  // ─────────────────────────────────────────────

  static Future<Map<String, dynamic>> getSettings() async {
    final prefs = await _prefs();
    final String? settingsString = prefs.getString(_settingsKey);
    if (settingsString == null) return {};

    return Map<String, dynamic>.from(
      jsonDecode(settingsString),
    );
  }

  static Future<void> saveSettings(
      Map<String, dynamic> settings) async {
    final prefs = await _prefs();
    await prefs.setString(_settingsKey, jsonEncode(settings));
  }

  static Future<void> saveDefaultSubject(String subject) async {
    final prefs = await _prefs();
    await prefs.setString(_defaultSubjectKey, subject);
  }

  static Future<String?> getDefaultSubject() async {
    final prefs = await _prefs();
    return prefs.getString(_defaultSubjectKey);
  }

  static Future<void> setNotificationsEnabled(bool enabled) async {
    final prefs = await _prefs();
    await prefs.setBool(_notificationEnabledKey, enabled);
  }

  static Future<bool> areNotificationsEnabled() async {
    final prefs = await _prefs();
    return prefs.getBool(_notificationEnabledKey) ?? true;
  }
}

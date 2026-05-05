class AppDateUtils {
  /// Formats a date into a user-friendly string
  static String formatDate(DateTime date, {bool includeTime = true}) {
    final DateTime now = DateTime.now();
    final DateTime today = DateTime(now.year, now.month, now.day);
    final DateTime yesterday = today.subtract(const Duration(days: 1));
    final DateTime taskDay =
        DateTime(date.year, date.month, date.day);

    if (taskDay == today) {
      return includeTime
          ? 'Today at ${_formatTime(date)}'
          : 'Today';
    }

    if (taskDay == yesterday) {
      return includeTime
          ? 'Yesterday at ${_formatTime(date)}'
          : 'Yesterday';
    }

    final int difference = taskDay.difference(today).inDays;
    if (difference > 0 && difference <= 7) {
      return includeTime
          ? '${_getWeekday(date)} at ${_formatTime(date)}'
          : _getWeekday(date);
    }

    return includeTime
        ? '${_formatDateOnly(date)} ${_formatTime(date)}'
        : _formatDateOnly(date);
  }

  /// Formats time as HH:mm
  static String _formatTime(DateTime date) {
    final String hour = date.hour.toString().padLeft(2, '0');
    final String minute = date.minute.toString().padLeft(2, '0');
    return '$hour:$minute';
  }

  /// Formats date as DD/MM/YYYY
  static String _formatDateOnly(DateTime date) {
    final String day = date.day.toString().padLeft(2, '0');
    final String month = date.month.toString().padLeft(2, '0');
    return '$day/$month/${date.year}';
  }

  /// Returns weekday abbreviation
  static String _getWeekday(DateTime date) {
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return weekdays[date.weekday - 1];
  }

  /// Used for date picker button text
  static String formatDateForButton(DateTime? date) {
    if (date == null) return 'Set Due Date';
    return 'Due: ${formatDate(date, includeTime: false)}';
  }

  /// Checks if a task is overdue (day-based, not minute-based)
  static bool isOverdue(DateTime? dueDate) {
    if (dueDate == null) return false;

    final DateTime now = DateTime.now();
    final DateTime today = DateTime(now.year, now.month, now.day);
    final DateTime dueDay =
        DateTime(dueDate.year, dueDate.month, dueDate.day);

    return dueDay.isBefore(today);
  }
}

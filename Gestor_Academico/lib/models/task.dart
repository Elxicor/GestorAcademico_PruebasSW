enum Priority { low, medium, high }
enum TaskStatus { pending, inProgress, completed, overdue }

class Task {
  final String id;
  final String title;
  final String subject;
  final String subjectId;
  final DateTime? dueDate;
  final Priority priority;
  final TaskStatus status;
  final bool isCompleted;
  final String? notes;
  final int estimatedHours;
  final int actualHours;
  final DateTime createdAt;
  final DateTime? completedAt;

  Task({
    String? id,
    required this.title,
    required this.subject,
    required this.subjectId,
    this.dueDate,
    this.priority = Priority.medium,
    this.estimatedHours = 1,
    this.actualHours = 0,
    this.isCompleted = false,
    this.notes,
    DateTime? createdAt,
    DateTime? completedAt,
  })  : id = id ?? DateTime.now().millisecondsSinceEpoch.toString(),
        createdAt = createdAt ?? DateTime.now(),
        completedAt = isCompleted ? (completedAt ?? DateTime.now()) : null,
        status = _calculateStatus(dueDate, isCompleted);

  static TaskStatus _calculateStatus(DateTime? dueDate, bool isCompleted) {
    if (isCompleted) return TaskStatus.completed;
    if (dueDate == null) return TaskStatus.pending;
    if (dueDate.isBefore(DateTime.now())) return TaskStatus.overdue;
    return TaskStatus.pending;
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'title': title,
      'subject': subject,
      'subjectId': subjectId,
      'dueDate': dueDate?.toIso8601String(),
      'priority': priority.index,
      'status': status.index,
      'isCompleted': isCompleted,
      'notes': notes,
      'estimatedHours': estimatedHours,
      'actualHours': actualHours,
      'createdAt': createdAt.toIso8601String(),
      'completedAt': completedAt?.toIso8601String(),
    };
  }

  factory Task.fromMap(Map<String, dynamic> map) {
    final priorityIndex = map['priority'];
    final dueDate = map['dueDate'] != null ? DateTime.parse(map['dueDate']) : null;
    final isCompleted = map['isCompleted'] ?? false;
    
    return Task(
      id: map['id'],
      title: map['title'],
      subject: map['subject'],
      subjectId: map['subjectId'] ?? map['subject'],
      dueDate: dueDate,
      priority: (priorityIndex is int && priorityIndex < Priority.values.length)
          ? Priority.values[priorityIndex]
          : Priority.medium,
      estimatedHours: map['estimatedHours'] ?? 1,
      actualHours: map['actualHours'] ?? 0,
      isCompleted: isCompleted,
      notes: map['notes'],
      createdAt: DateTime.parse(map['createdAt']),
      completedAt: map['completedAt'] != null ? DateTime.parse(map['completedAt']) : null,
    );
  }

  Task copyWith({
    String? title,
    String? subject,
    String? subjectId,
    DateTime? dueDate,
    Priority? priority,
    bool? isCompleted,
    String? notes,
    int? estimatedHours,
    int? actualHours,
  }) {
    return Task(
      id: id,
      title: title ?? this.title,
      subject: subject ?? this.subject,
      subjectId: subjectId ?? this.subjectId,
      dueDate: dueDate ?? this.dueDate,
      priority: priority ?? this.priority,
      estimatedHours: estimatedHours ?? this.estimatedHours,
      actualHours: actualHours ?? this.actualHours,
      isCompleted: isCompleted ?? this.isCompleted,
      notes: notes ?? this.notes,
      createdAt: createdAt,
      completedAt: isCompleted == true ? DateTime.now() : completedAt,
    );
  }
}

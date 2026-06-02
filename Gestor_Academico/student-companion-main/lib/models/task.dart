enum Priority { low, medium, high }

class Task {
  final String id;
  final String title;
  final String subject;
  final DateTime? dueDate;
  final Priority priority;
  final bool isCompleted;
  final String? notes;
  final DateTime createdAt;
  final DateTime? completedAt;

  Task({
    String? id,
    required this.title,
    required this.subject,
    this.dueDate,
    this.priority = Priority.medium,
    this.isCompleted = false,
    this.notes,
    DateTime? createdAt,
    DateTime? completedAt,
  })  : id = id ?? DateTime.now().millisecondsSinceEpoch.toString(),
        createdAt = createdAt ?? DateTime.now(),
        completedAt = isCompleted ? (completedAt ?? DateTime.now()) : null;

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'title': title,
      'subject': subject,
      'dueDate': dueDate?.toIso8601String(),
      'priority': priority.index,
      'isCompleted': isCompleted,
      'notes': notes,
      'createdAt': createdAt.toIso8601String(),
      'completedAt': completedAt?.toIso8601String(),
    };
  }

  factory Task.fromMap(Map<String, dynamic> map) {
    final priorityIndex = map['priority'];
    return Task(
      id: map['id'],
      title: map['title'],
      subject: map['subject'],
      dueDate: map['dueDate'] != null
          ? DateTime.parse(map['dueDate'])
          : null,
      priority: (priorityIndex is int &&
              priorityIndex < Priority.values.length)
          ? Priority.values[priorityIndex]
          : Priority.medium,
      isCompleted: map['isCompleted'] ?? false,
      notes: map['notes'],
      createdAt: DateTime.parse(map['createdAt']),
      completedAt: map['completedAt'] != null
          ? DateTime.parse(map['completedAt'])
          : null,
    );
  }

  Task copyWith({
    String? title,
    String? subject,
    DateTime? dueDate,
    Priority? priority,
    bool? isCompleted,
    String? notes,
  }) {
    return Task(
      id: id,
      title: title ?? this.title,
      subject: subject ?? this.subject,
      dueDate: dueDate ?? this.dueDate,
      priority: priority ?? this.priority,
      isCompleted: isCompleted ?? this.isCompleted,
      notes: notes ?? this.notes,
      createdAt: createdAt,
      completedAt: isCompleted == true ? DateTime.now() : completedAt,
    );
  }
}

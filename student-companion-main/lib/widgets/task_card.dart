import 'package:flutter/material.dart';
import '../models/task.dart';
import '../utils/app_date_utils.dart';

class TaskCard extends StatelessWidget {
  final Task task;
  final VoidCallback onDelete;
  final VoidCallback onToggleComplete;
  final VoidCallback onEdit;

  const TaskCard({
    super.key,
    required this.task,
    required this.onDelete,
    required this.onToggleComplete,
    required this.onEdit,
  });

  Color _getPriorityColor() {
    switch (task.priority) {
      case Priority.high:
        return Colors.red.shade400;
      case Priority.medium:
        return Colors.orange.shade400;
      case Priority.low:
        return Colors.green.shade400;
    }
  }

  String _getPriorityText() {
    switch (task.priority) {
      case Priority.high:
        return 'High';
      case Priority.medium:
        return 'Medium';
      case Priority.low:
        return 'Low';
    }
  }

  @override
  Widget build(BuildContext context) {
    final bool isOverdue =
        task.dueDate != null &&
        AppDateUtils.isOverdue(task.dueDate) &&
        !task.isCompleted;

    return Semantics(
      label: 'Task: ${task.title}',
      child: Card(
        elevation: 3,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: onToggleComplete,
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ─── HEADER ──────────────────────────────
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Checkbox(
                      value: task.isCompleted,
                      onChanged: (_) => onToggleComplete(),
                      shape: const CircleBorder(),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            task.title,
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w600,
                              decoration: task.isCompleted
                                  ? TextDecoration.lineThrough
                                  : TextDecoration.none,
                              color: task.isCompleted
                                  ? Colors.grey
                                  : Theme.of(context)
                                      .colorScheme
                                      .onSurface,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Subject: ${task.subject}',
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.grey.shade600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 8),

                // ─── DUE DATE & NOTES ────────────────────
                Padding(
                  padding: const EdgeInsets.only(left: 40.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (task.dueDate != null)
                        Row(
                          children: [
                            Icon(
                              Icons.calendar_today,
                              size: 14,
                              color: isOverdue ? Colors.red : Colors.grey,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              AppDateUtils.formatDate(task.dueDate!),
                              style: TextStyle(
                                fontSize: 14,
                                color:
                                    isOverdue ? Colors.red : Colors.grey,
                                fontWeight: isOverdue
                                    ? FontWeight.bold
                                    : FontWeight.normal,
                              ),
                            ),
                            if (isOverdue)
                              Padding(
                                padding:
                                    const EdgeInsets.only(left: 8.0),
                                child: Container(
                                  padding:
                                      const EdgeInsets.symmetric(
                                    horizontal: 6,
                                    vertical: 2,
                                  ),
                                  decoration: BoxDecoration(
                                    color: Colors.red.shade100,
                                    borderRadius:
                                        BorderRadius.circular(4),
                                  ),
                                  child: const Text(
                                    'OVERDUE',
                                    style: TextStyle(
                                      fontSize: 10,
                                      color: Colors.red,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ),
                          ],
                        ),
                      if (task.notes != null &&
                          task.notes!.isNotEmpty)
                        Padding(
                          padding:
                              const EdgeInsets.only(top: 4.0),
                          child: Text(
                            task.notes!,
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.grey.shade600,
                              fontStyle: FontStyle.italic,
                            ),
                          ),
                        ),
                    ],
                  ),
                ),

                const SizedBox(height: 12),

                // ─── FOOTER ──────────────────────────────
                Row(
                  mainAxisAlignment:
                      MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding:
                          const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color:
                            _getPriorityColor().withOpacity(0.15),
                        borderRadius:
                            BorderRadius.circular(20),
                        border: Border.all(
                          color: _getPriorityColor(),
                        ),
                      ),
                      child: Text(
                        _getPriorityText(),
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          color: _getPriorityColor(),
                        ),
                      ),
                    ),
                    Row(
                      children: [
                        IconButton(
                          icon: const Icon(Icons.edit, size: 20),
                          onPressed: onEdit,
                          color: Colors.blue,
                        ),
                        IconButton(
                          icon:
                              const Icon(Icons.delete, size: 20),
                          onPressed: onDelete,
                          color: Colors.red,
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import '../models/task.dart';
import '../utils/database_service.dart';
import '../utils/app_date_utils.dart';
import '../widgets/task_card.dart';

class TasksScreen extends StatefulWidget {
  const TasksScreen({super.key});

  @override
  State<TasksScreen> createState() => _TasksScreenState();
}

class _TasksScreenState extends State<TasksScreen> {
  List<Task> _tasks = [];
  List<Task> _filteredTasks = [];
  String _selectedFilter = 'all';
  bool _isLoading = true;
  bool _searchMode = false;
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadTasks();
  }

  Future<void> _loadTasks() async {
    setState(() => _isLoading = true);
    final tasks = await DatabaseService.getTasks();
    setState(() {
      _tasks = tasks;
      _applyFilter();
      _isLoading = false;
    });
  }

  void _applyFilter() {
    List<Task> filtered = List.from(_tasks);

    // Search
    if (_searchController.text.isNotEmpty) {
      final query = _searchController.text.toLowerCase();
      filtered = filtered.where((task) {
        return task.title.toLowerCase().contains(query) ||
            task.subject.toLowerCase().contains(query) ||
            (task.notes?.toLowerCase().contains(query) ?? false);
      }).toList();
    }

    // Status / priority filters
    switch (_selectedFilter) {
      case 'pending':
        filtered = filtered.where((t) => !t.isCompleted).toList();
        break;
      case 'completed':
        filtered = filtered.where((t) => t.isCompleted).toList();
        break;
      case 'high':
        filtered = filtered.where((t) => t.priority == Priority.high).toList();
        break;
      case 'overdue':
        filtered = filtered.where((t) =>
            !t.isCompleted &&
            t.dueDate != null &&
            AppDateUtils.isOverdue(t.dueDate)).toList();
        break;
      default:
        break;
    }

    filtered.sort((a, b) {
      if (a.dueDate == null && b.dueDate == null) return 0;
      if (a.dueDate == null) return 1;
      if (b.dueDate == null) return -1;
      return a.dueDate!.compareTo(b.dueDate!);
    });

    setState(() {
      _filteredTasks = filtered;
    });
  }

  Future<void> _saveTask(Task task) async {
    await DatabaseService.saveTask(task);
    await _loadTasks();
  }

  Future<void> _deleteTask(String taskId) async {
    await DatabaseService.deleteTask(taskId);
    await _loadTasks();
  }

  Future<void> _toggleTaskCompletion(String taskId) async {
    await DatabaseService.toggleTaskCompletion(taskId);
    await _loadTasks();
  }

  void _showAddTaskDialog({Task? existingTask}) {
    final bool isEditing = existingTask != null;
    final titleController =
        TextEditingController(text: existingTask?.title ?? '');
    final subjectController =
        TextEditingController(text: existingTask?.subject ?? '');
    final notesController =
        TextEditingController(text: existingTask?.notes ?? '');

    DateTime? selectedDate = existingTask?.dueDate;
    Priority selectedPriority =
        existingTask?.priority ?? Priority.medium;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, modalSetState) {
            return Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom,
              ),
              child: Container(
                padding: const EdgeInsets.all(20),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      isEditing ? 'Edit Task' : 'Add New Task',
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Title
                    TextField(
                      controller: titleController,
                      decoration: const InputDecoration(
                        labelText: 'Task Title',
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Subject
                    TextField(
                      controller: subjectController,
                      decoration: const InputDecoration(
                        labelText: 'Subject',
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Notes
                    TextField(
                      controller: notesController,
                      maxLines: 3,
                      decoration: const InputDecoration(
                        labelText: 'Notes (optional)',
                        border: OutlineInputBorder(),
                        alignLabelWithHint: true,
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Date & Priority
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton.icon(
                            icon: const Icon(Icons.calendar_today),
                            label: Text(
                              AppDateUtils.formatDateForButton(selectedDate),
                            ),
                            onPressed: () async {
                              final date = await showDatePicker(
                                context: context,
                                initialDate:
                                    selectedDate ?? DateTime.now(),
                                firstDate: DateTime.now(),
                                lastDate: DateTime.now()
                                    .add(const Duration(days: 365)),
                              );

                              if (date != null) {
                                final time = await showTimePicker(
                                  context: context,
                                  initialTime: TimeOfDay.now(),
                                );

                                if (time != null) {
                                  modalSetState(() {
                                    selectedDate = DateTime(
                                      date.year,
                                      date.month,
                                      date.day,
                                      time.hour,
                                      time.minute,
                                    );
                                  });
                                }
                              }
                            },
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: DropdownButtonFormField<Priority>(
                            initialValue: selectedPriority,
                            decoration: const InputDecoration(
                              labelText: 'Priority',
                              border: OutlineInputBorder(),
                            ),
                            items: Priority.values.map((priority) {
                              return DropdownMenuItem(
                                value: priority,
                                child: Text(
                                  priority
                                      .toString()
                                      .split('.')
                                      .last
                                      .toUpperCase(),
                                ),
                              );
                            }).toList(),
                            onChanged: (value) {
                              if (value != null) {
                                modalSetState(() {
                                  selectedPriority = value;
                                });
                              }
                            },
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // Buttons
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () =>
                                Navigator.pop(context),
                            child: const Text('Cancel'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: ElevatedButton(
                            onPressed: () {
                              if (titleController.text.isNotEmpty &&
                                  subjectController.text.isNotEmpty) {
                                final task = Task(
                                  id: existingTask?.id,
                                  title: titleController.text,
                                  subject: subjectController.text,
                                  dueDate: selectedDate,
                                  priority: selectedPriority,
                                  notes: notesController.text.isEmpty
                                      ? null
                                      : notesController.text,
                                  createdAt:
                                      existingTask?.createdAt,
                                  isCompleted:
                                      existingTask?.isCompleted ??
                                          false,
                                );
                                _saveTask(task);
                                Navigator.pop(context);
                              }
                            },
                            child:
                                Text(isEditing ? 'Update' : 'Add'),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  AppBar _buildAppBar() {
    if (_searchMode) {
      return AppBar(
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () {
            setState(() {
              _searchMode = false;
              _searchController.clear();
              _applyFilter();
            });
          },
        ),
        title: TextField(
          controller: _searchController,
          autofocus: true,
          decoration: const InputDecoration(
            hintText: 'Search tasks...',
            border: InputBorder.none,
          ),
          onChanged: (_) => _applyFilter(),
        ),
      );
    }

    return AppBar(
      title: const Text('Tasks'),
      actions: [
        IconButton(
          icon: const Icon(Icons.search),
          onPressed: () {
            setState(() {
              _searchMode = true;
            });
          },
        ),
        PopupMenuButton<String>(
          onSelected: (value) {
            setState(() {
              _selectedFilter = value;
              _applyFilter();
            });
          },
          itemBuilder: (context) => const [
            PopupMenuItem(value: 'all', child: Text('All Tasks')),
            PopupMenuItem(value: 'pending', child: Text('Pending')),
            PopupMenuItem(value: 'completed', child: Text('Completed')),
            PopupMenuItem(value: 'high', child: Text('High Priority')),
            PopupMenuItem(value: 'overdue', child: Text('Overdue')),
          ],
          child: const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16),
            child: Icon(Icons.filter_list),
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: _buildAppBar(),
      body: RefreshIndicator(
        onRefresh: _loadTasks,
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : _filteredTasks.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment:
                          MainAxisAlignment.center,
                      children: const [
                        Icon(Icons.task,
                            size: 64, color: Colors.grey),
                        SizedBox(height: 16),
                        Text(
                          'No tasks yet 👀',
                          style: TextStyle(
                              fontSize: 18,
                              color: Colors.grey),
                        ),
                        SizedBox(height: 8),
                        Text(
                          'Tap + to add your first task',
                          style:
                              TextStyle(color: Colors.grey),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _filteredTasks.length,
                    itemBuilder: (context, index) {
                      final task = _filteredTasks[index];
                      return Padding(
                        padding:
                            const EdgeInsets.only(bottom: 12),
                        child: TaskCard(
                          task: task,
                          onDelete: () =>
                              _deleteTask(task.id),
                          onToggleComplete: () =>
                              _toggleTaskCompletion(task.id),
                          onEdit: () => _showAddTaskDialog(
                              existingTask: task),
                        ),
                      );
                    },
                  ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAddTaskDialog(),
        child: const Icon(Icons.add),
      ),
    );
  }
}

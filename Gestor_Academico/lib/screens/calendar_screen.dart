import 'package:flutter/material.dart';
import '../models/task.dart';
import '../utils/database_service.dart';
import '../utils/app_date_utils.dart';
import '../widgets/task_card.dart';

class CalendarScreen extends StatefulWidget {
  const CalendarScreen({super.key});

  @override
  State<CalendarScreen> createState() => _CalendarScreenState();
}

class _CalendarScreenState extends State<CalendarScreen> {
  late DateTime _selectedDate;
  String _viewType = 'month'; // 'day', 'week', 'month'
  List<Task> _tasks = [];

  @override
  void initState() {
    super.initState();
    _selectedDate = DateTime.now();
    _loadTasks();
  }

  Future<void> _loadTasks() async {
    final tasks = await DatabaseService.getTasks();
    setState(() {
      _tasks = tasks;
    });
  }

  List<Task> _getTasksForDate(DateTime date) {
    return _tasks.where((task) {
      if (task.dueDate == null) return false;
      return task.dueDate!.year == date.year &&
          task.dueDate!.month == date.month &&
          task.dueDate!.day == date.day;
    }).toList();
  }

  List<Task> _getTasksForMonth(DateTime date) {
    return _tasks.where((task) {
      if (task.dueDate == null) return false;
      return task.dueDate!.year == date.year &&
          task.dueDate!.month == date.month;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Calendario académico'),
        actions: [
          PopupMenuButton<String>(
            onSelected: (value) {
              setState(() {
                _viewType = value;
              });
            },
            itemBuilder: (context) => const [
              PopupMenuItem(
                value: 'day',
                child: Text('Vista diaria'),
              ),
              PopupMenuItem(
                value: 'week',
                child: Text('Vista semanal'),
              ),
              PopupMenuItem(
                value: 'month',
                child: Text('Vista mensual'),
              ),
            ],
            child: const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16),
              child: Icon(Icons.calendar_view_month),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          _buildDateSelector(),
          Expanded(
            child: _buildCalendarView(),
          ),
        ],
      ),
    );
  }

  Widget _buildDateSelector() {
    return Container(
      padding: const EdgeInsets.all(16),
      color: Colors.grey.shade100,
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              IconButton(
                icon: const Icon(Icons.chevron_left),
                onPressed: () {
                  setState(() {
                    _selectedDate = _viewType == 'day'
                        ? _selectedDate.subtract(const Duration(days: 1))
                        : _viewType == 'week'
                            ? _selectedDate.subtract(const Duration(days: 7))
                            : DateTime(_selectedDate.year, _selectedDate.month - 1);
                  });
                },
              ),
              Text(
                _viewType == 'day'
                    ? AppDateUtils.formatDate(_selectedDate)
                    : _viewType == 'week'
                        ? 'Semana del ${AppDateUtils.formatDate(_selectedDate.subtract(Duration(days: _selectedDate.weekday - 1)))}'
                        : '${_monthName(_selectedDate.month)} ${_selectedDate.year}',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              IconButton(
                icon: const Icon(Icons.chevron_right),
                onPressed: () {
                  setState(() {
                    _selectedDate = _viewType == 'day'
                        ? _selectedDate.add(const Duration(days: 1))
                        : _viewType == 'week'
                            ? _selectedDate.add(const Duration(days: 7))
                            : DateTime(_selectedDate.year, _selectedDate.month + 1);
                  });
                },
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCalendarView() {
    return RefreshIndicator(
      onRefresh: _loadTasks,
      child: _viewType == 'day'
          ? _buildDayView()
          : _viewType == 'week'
              ? _buildWeekView()
              : _buildMonthView(),
    );
  }

  Widget _buildDayView() {
    final tasksForDay = _getTasksForDate(_selectedDate);
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.green.shade100,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: Colors.green.shade400),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '✓ Marcar como completada:',
                style: TextStyle(fontWeight: FontWeight.bold, color: Colors.green.shade900),
              ),
              const SizedBox(height: 8),
              Text(
                '1. Toca el checkbox (☐) o la tarjeta completa',
                style: TextStyle(fontSize: 12, color: Colors.green.shade900),
              ),
              Text(
                '2. La tarea se marcará con una línea tachada',
                style: TextStyle(fontSize: 12, color: Colors.green.shade900),
              ),
              Text(
                '3. Toca nuevamente para desmarcar',
                style: TextStyle(fontSize: 12, color: Colors.green.shade900),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),
        if (tasksForDay.isEmpty)
          Center(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Column(
                children: [
                  Icon(
                    Icons.calendar_today,
                    size: 64,
                    color: Colors.grey.shade300,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Sin tareas para hoy',
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.grey.shade600,
                    ),
                  ),
                ],
              ),
            ),
          )
        else
          ...tasksForDay.map((task) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: TaskCard(
                  task: task,
                  onDelete: () {
                    DatabaseService.deleteTask(task.id);
                    _loadTasks();
                  },
                  onToggleComplete: () {
                    DatabaseService.toggleTaskCompletion(task.id);
                    _loadTasks();
                  },
                  onEdit: () {},
                ),
              )),
      ],
    );
  }

  Widget _buildWeekView() {
    final startOfWeek = _selectedDate.subtract(Duration(days: _selectedDate.weekday - 1));
    
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.blue.shade100,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: Colors.blue.shade400),
          ),
          child: Text(
            'Semana: Toca un día para ver más detalles',
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: Colors.blue.shade900),
          ),
        ),
        const SizedBox(height: 16),
        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: 7,
          itemBuilder: (context, index) {
            final date = startOfWeek.add(Duration(days: index));
            final tasksForDate = _getTasksForDate(date);
            final isToday = date.day == DateTime.now().day &&
                date.month == DateTime.now().month &&
                date.year == DateTime.now().year;
            
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                GestureDetector(
                  onTap: () {
                    setState(() {
                      _selectedDate = date;
                      _viewType = 'day';
                    });
                  },
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    margin: const EdgeInsets.only(bottom: 8),
                    decoration: BoxDecoration(
                      color: isToday ? Colors.blue.shade100 : Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: isToday ? Colors.blue : Colors.grey.shade300,
                        width: isToday ? 2 : 1,
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _dayName(date.weekday),
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                                color: isToday ? Colors.blue : Colors.black,
                              ),
                            ),
                            Text(
                              AppDateUtils.formatDate(date, includeTime: false),
                              style: const TextStyle(
                                fontSize: 12,
                                color: Colors.grey,
                              ),
                            ),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.blue.shade600,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            '${tasksForDate.length}',
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                if (tasksForDate.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(left: 16, bottom: 12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: tasksForDate.map((task) => _buildTaskChip(task)).toList(),
                    ),
                  ),
                const Divider(height: 16),
              ],
            );
          },
        ),
      ],
    );
  }

  Widget _buildMonthView() {
    final tasksForMonth = _getTasksForMonth(_selectedDate);
    final firstDayOfMonth = DateTime(_selectedDate.year, _selectedDate.month, 1);
    final lastDayOfMonth = DateTime(_selectedDate.year, _selectedDate.month + 1, 0);
    final daysInMonth = lastDayOfMonth.day;
    final firstWeekday = firstDayOfMonth.weekday;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Day names header
        GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: 7,
          childAspectRatio: 1.2,
          children: const [
            _DayNameCell('Lun'),
            _DayNameCell('Mar'),
            _DayNameCell('Mié'),
            _DayNameCell('Jue'),
            _DayNameCell('Vie'),
            _DayNameCell('Sab'),
            _DayNameCell('Dom'),
          ],
        ),
        
        // Calendar grid
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 7,
            childAspectRatio: 1,
          ),
          itemCount: firstWeekday - 1 + daysInMonth,
          itemBuilder: (context, index) {
            if (index < firstWeekday - 1) {
              return Container(
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey.shade200),
                  color: Colors.grey.shade50,
                ),
              );
            }
            
            final day = index - firstWeekday + 2;
            final date = DateTime(_selectedDate.year, _selectedDate.month, day);
            final tasksForDay = _getTasksForDate(date);
            final isToday = date.day == DateTime.now().day &&
                date.month == DateTime.now().month &&
                date.year == DateTime.now().year;
            
            return GestureDetector(
              onTap: () {
                setState(() {
                  _selectedDate = date;
                  _viewType = 'day';
                });
              },
              child: Container(
                decoration: BoxDecoration(
                  border: Border.all(
                    color: isToday ? Colors.blue : Colors.grey.shade300,
                    width: isToday ? 2 : 1,
                  ),
                  color: isToday 
                      ? Colors.blue.shade100 
                      : date.weekday == 7 
                          ? Colors.red.shade100 
                          : Colors.white,
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      '$day',
                      style: TextStyle(
                        fontWeight: isToday ? FontWeight.bold : FontWeight.normal,
                        fontSize: isToday ? 16 : 14,
                        color: isToday ? Colors.blue.shade900 : Colors.black,
                      ),
                    ),
                    if (tasksForDay.isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.only(top: 4),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.blue.shade600,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            '${tasksForDay.length}',
                            style: const TextStyle(
                              fontSize: 10,
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            );
          },
        ),
        const SizedBox(height: 24),
        
        // Legend
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.blue.shade100,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: Colors.blue.shade400),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Instrucciones:',
                style: TextStyle(fontWeight: FontWeight.bold, color: Colors.blue.shade900),
              ),
              const SizedBox(height: 8),
              Text(
                '• Toca un día para ver sus tareas',
                style: TextStyle(fontSize: 12, color: Colors.blue.shade900),
              ),
              Text(
                '• El número azul indica tareas ese día',
                style: TextStyle(fontSize: 12, color: Colors.blue.shade900),
              ),
              Text(
                '• Toca el checkbox o la tarjeta para marcar como completada',
                style: TextStyle(fontSize: 12, color: Colors.blue.shade900),
              ),
            ],
          ),
        ),
        
        const SizedBox(height: 24),
        
        // Tasks for selected month
        Text(
          'Tareas del mes (${tasksForMonth.length})',
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        if (tasksForMonth.isEmpty)
          Center(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Text(
                'Sin tareas este mes',
                style: TextStyle(color: Colors.grey.shade600),
              ),
            ),
          )
        else
          ...tasksForMonth.map((task) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: _buildTaskChip(task),
              )),
      ],
    );
  }

  Widget _buildTaskChip(Task task) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        border: Border(
          left: BorderSide(
            width: 4,
            color: _getPriorityColor(task.priority),
          ),
        ),
        color: Colors.grey.shade50,
        borderRadius: const BorderRadius.only(
          topRight: Radius.circular(8),
          bottomRight: Radius.circular(8),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  task.title,
                  style: TextStyle(
                    fontWeight: FontWeight.w500,
                    decoration: task.isCompleted
                        ? TextDecoration.lineThrough
                        : TextDecoration.none,
                  ),
                ),
                Text(
                  task.subject,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey.shade600,
                  ),
                ),
              ],
            ),
          ),
          if (task.dueDate != null)
            Text(
              AppDateUtils.formatDate(task.dueDate!),
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
              ),
            ),
        ],
      ),
    );
  }

  Color _getPriorityColor(Priority priority) {
    switch (priority) {
      case Priority.high:
        return Colors.red;
      case Priority.medium:
        return Colors.orange;
      case Priority.low:
        return Colors.green;
    }
  }

  String _monthName(int month) {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month - 1];
  }

  String _dayName(int weekday) {
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    return days[weekday - 1];
  }
}

class _DayNameCell extends StatelessWidget {
  final String name;

  const _DayNameCell(this.name);

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.blue.shade600,
        border: Border.all(color: Colors.blue.shade700),
      ),
      child: Center(
        child: Text(
          name,
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            color: Colors.white,
            fontSize: 12,
          ),
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'tasks_screen.dart';
import 'settings_screen.dart';
import 'calendar_screen.dart';
import 'progress_screen.dart';
import '../utils/database_service.dart';
import '../models/task.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;
  late PageController _pageController;
  List<Task> _upcomingTasks = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
    _loadUpcomingTasks();
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  Future<void> _loadUpcomingTasks() async {
    final allTasks = await DatabaseService.getTasks();
    final now = DateTime.now();

    setState(() {
      _upcomingTasks = allTasks
          .where(
            (task) =>
                !task.isCompleted &&
                (task.dueDate == null || task.dueDate!.isAfter(now)),
          )
          .take(5)
          .toList();
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Compañero Estudiantil'),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => const SettingsScreen(),
                ),
              );
            },
          ),
        ],
      ),
      body: PageView(
        controller: _pageController,
        onPageChanged: (index) {
          setState(() {
            _currentIndex = index;
          });
          // Reload tasks when navigating to Home (index 0)
          if (index == 0) {
            _loadUpcomingTasks();
          }
        },
        children: [
          _buildHomeContent(),
          const TasksScreen(),
          const CalendarScreen(),
          const ProgressScreen(),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        type: BottomNavigationBarType.fixed,
        onTap: (index) {
          _pageController.animateToPage(
            index,
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeInOut,
          );
        },
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Inicio',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.check_circle),
            label: 'Tareas',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.calendar_today),
            label: 'Calendario',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.bar_chart),
            label: 'Progreso',
          ),
        ],
      ),
    );
  }

  Widget _buildHomeContent() {
    return RefreshIndicator(
      onRefresh: _loadUpcomingTasks,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildWelcomeCard(),
            const SizedBox(height: 24),
            _buildUpcomingTasks(),
            const SizedBox(height: 24),
            _buildQuickStats(),
          ],
        ),
      ),
    );
  }

  Widget _buildWelcomeCard() {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              '¡Bienvenido de nuevo! 👋',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Rastrea tu vida de estudio y mantente organizado',
              style: TextStyle(
                fontSize: 16,
                color: Colors.grey.shade600,
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const TasksScreen(),
                  ),
                );
              },
              icon: const Icon(Icons.add),
              label: const Text('Agregar nueva tarea'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildUpcomingTasks() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Próximas tareas',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        if (_isLoading)
          const Center(child: CircularProgressIndicator())
        else if (_upcomingTasks.isEmpty)
          Card(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  const Icon(
                    Icons.event_available,
                    size: 48,
                    color: Colors.green,
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    '¡Todo hecho! 🎉',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Sin próximas tareas',
                    style: TextStyle(
                      color: Colors.grey.shade600,
                    ),
                  ),
                ],
              ),
            ),
          )
        else
          ..._upcomingTasks.map((task) {
            return Card(
              margin: const EdgeInsets.only(bottom: 12),
              child: ListTile(
                leading: Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color:
                        _getPriorityColor(task.priority).withOpacity(0.2),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    Icons.task,
                    color: _getPriorityColor(task.priority),
                  ),
                ),
                title: Text(task.title),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(task.subject),
                    if (task.dueDate != null)
                      Text(
                        'Vencimiento: ${_formatDate(task.dueDate!)}',
                        style: const TextStyle(fontSize: 12),
                      ),
                  ],
                ),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const TasksScreen(),
                    ),
                  );
                },
              ),
            );
          }),
      ],
    );
  }

  Widget _buildQuickStats() {
    return FutureBuilder<List<Task>>(
      future: DatabaseService.getTasks(),
      builder: (context, snapshot) {
        if (!snapshot.hasData) {
          return const Center(child: CircularProgressIndicator());
        }

        final tasks = snapshot.data!;
        final totalTasks = tasks.length;
        final completedTasks =
            tasks.where((t) => t.isCompleted).length;
        final pendingTasks = totalTasks - completedTasks;
        final highPriorityTasks = tasks
            .where((t) =>
                t.priority == Priority.high && !t.isCompleted)
            .length;
        final overdueTasks = tasks
            .where((t) =>
                !t.isCompleted &&
                t.dueDate != null &&
                t.dueDate!.isBefore(DateTime.now()))
            .length;

        return GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: 2,
          childAspectRatio: 1.3,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          children: [
            _buildStatCard(
              icon: Icons.task,
              title: 'Total de tareas',
              value: totalTasks.toString(),
              color: Colors.blue,
            ),
            _buildStatCard(
              icon: Icons.check_circle,
              title: 'Completado',
              value: completedTasks.toString(),
              color: Colors.green,
            ),
            _buildStatCard(
              icon: Icons.pending_actions,
              title: 'Pendiente',
              value: pendingTasks.toString(),
              color: Colors.orange,
            ),
            _buildStatCard(
              icon: Icons.priority_high,
              title: 'Alta prioridad',
              value: highPriorityTasks.toString(),
              color: Colors.red,
            ),
            _buildStatCard(
              icon: Icons.warning,
              title: 'Vencido',
              value: overdueTasks.toString(),
              color: Colors.red.shade700,
            ),
            _buildStatCard(
              icon: Icons.subject,
              title: 'Subjects',
              value: _getUniqueSubjects(tasks).toString(),
              color: Colors.purple,
            ),
          ],
        );
      },
    );
  }

  int _getUniqueSubjects(List<Task> tasks) {
    return tasks.map((task) => task.subject).toSet().length;
  }

  Widget _buildStatCard({
    required IconData icon,
    required String title,
    required String value,
    required Color color,
  }) {
    return Card(
      elevation: 3,
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: color, size: 20),
            ),
            const SizedBox(height: 8),
            Text(
              value,
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              title,
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey.shade600,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
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

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }
}

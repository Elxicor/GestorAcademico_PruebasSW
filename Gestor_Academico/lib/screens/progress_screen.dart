import 'package:flutter/material.dart';
import '../models/task.dart';
import '../utils/database_service.dart';

class ProgressScreen extends StatefulWidget {
  const ProgressScreen({super.key});

  @override
  State<ProgressScreen> createState() => _ProgressScreenState();
}

class _ProgressScreenState extends State<ProgressScreen> {
  late Future<List<Task>> _tasksFuture;

  @override
  void initState() {
    super.initState();
    _tasksFuture = DatabaseService.getTasks();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Panel de progreso'),
      ),
      body: FutureBuilder<List<Task>>(
        future: _tasksFuture,
        builder: (context, snapshot) {
          if (!snapshot.hasData) {
            return const Center(child: CircularProgressIndicator());
          }

          final tasks = snapshot.data!;
          return RefreshIndicator(
            onRefresh: () async {
              setState(() {
                _tasksFuture = DatabaseService.getTasks();
              });
            },
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                _buildOverallStats(tasks),
                const SizedBox(height: 24),
                _buildProgressChart(tasks),
                const SizedBox(height: 24),
                _buildStudyStats(tasks),
                const SizedBox(height: 24),
                _buildComplianceStats(tasks),
                const SizedBox(height: 24),
                _buildTasksByPriority(tasks),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildOverallStats(List<Task> tasks) {
    final totalTasks = tasks.length;
    final completedTasks = tasks.where((t) => t.isCompleted).length;
    final pendingTasks = totalTasks - completedTasks;
    final completionPercentage = totalTasks == 0 ? 0 : (completedTasks / totalTasks * 100).toStringAsFixed(1);

    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Estadísticas generales',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildStatItem(
                  icon: Icons.task,
                  label: 'Total',
                  value: totalTasks.toString(),
                  color: Colors.blue,
                ),
                _buildStatItem(
                  icon: Icons.check_circle,
                  label: 'Completado',
                  value: completedTasks.toString(),
                  color: Colors.green,
                ),
                _buildStatItem(
                  icon: Icons.pending_actions,
                  label: 'Pendiente',
                  value: pendingTasks.toString(),
                  color: Colors.orange,
                ),
              ],
            ),
            const SizedBox(height: 16),
            Divider(color: Colors.grey.shade300),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Porcentaje de completitud:',
                  style: TextStyle(fontWeight: FontWeight.w500),
                ),
                Text(
                  '$completionPercentage%',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.blue,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: LinearProgressIndicator(
                value: totalTasks == 0 ? 0 : completedTasks / totalTasks,
                minHeight: 12,
                backgroundColor: Colors.grey.shade300,
                valueColor: AlwaysStoppedAnimation(Colors.blue.shade600),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProgressChart(List<Task> tasks) {
    final completed = tasks.where((t) => t.isCompleted).length;
    final pending = tasks.where((t) => !t.isCompleted && t.status == TaskStatus.pending).length;
    final overdue = tasks.where((t) => t.status == TaskStatus.overdue).length;

    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Estado de tareas',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 20),
            _buildStatusRow(
              'Completado',
              completed,
              Colors.green,
              tasks.length,
            ),
            const SizedBox(height: 12),
            _buildStatusRow(
              'Pendiente',
              pending,
              Colors.orange,
              tasks.length,
            ),
            const SizedBox(height: 12),
            _buildStatusRow(
              'Vencido',
              overdue,
              Colors.red,
              tasks.length,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusRow(String label, int count, Color color, int total) {
    final percentage = total == 0 ? 0 : (count / total * 100).toStringAsFixed(0);
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              label,
              style: const TextStyle(fontWeight: FontWeight.w500),
            ),
            Text(
              '$count ($percentage%)',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: LinearProgressIndicator(
            value: total == 0 ? 0 : count / total,
            minHeight: 8,
            backgroundColor: Colors.grey.shade300,
            valueColor: AlwaysStoppedAnimation(color),
          ),
        ),
      ],
    );
  }

  Widget _buildStudyStats(List<Task> tasks) {
    final totalEstimatedHours = tasks.fold<int>(0, (sum, task) => sum + task.estimatedHours);
    final totalActualHours = tasks.fold<int>(0, (sum, task) => sum + task.actualHours);
    final completedTasks = tasks.where((t) => t.isCompleted).length;
    final averageTimePerTask = completedTasks == 0 ? 0 : (totalActualHours / completedTasks).toStringAsFixed(1);

    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Estadísticas de estudio',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            _buildStudyItem(
              'Horas estimadas totales:',
              '$totalEstimatedHours h',
              Colors.blue,
            ),
            const SizedBox(height: 12),
            _buildStudyItem(
              'Horas reales de estudio:',
              '$totalActualHours h',
              Colors.green,
            ),
            const SizedBox(height: 12),
            _buildStudyItem(
              'Promedio por tarea:',
              '$averageTimePerTask h',
              Colors.purple,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStudyItem(String label, String value, Color color) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(fontWeight: FontWeight.w500),
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: color),
          ),
          child: Text(
            value,
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildComplianceStats(List<Task> tasks) {
    final tasksWithDeadline = tasks.where((t) => t.dueDate != null).length;
    final completedOnTime = tasks.where((t) {
      if (!t.isCompleted || t.completedAt == null || t.dueDate == null) return false;
      return t.completedAt!.isBefore(t.dueDate!) || t.completedAt!.isAtSameMomentAs(t.dueDate!);
    }).length;
    
    final compliancePercentage = tasksWithDeadline == 0 
        ? 0 
        : (completedOnTime / tasksWithDeadline * 100).toStringAsFixed(1);

    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Cumplimiento de plazos',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Tareas a tiempo:',
                  style: TextStyle(fontWeight: FontWeight.w500),
                ),
                Text(
                  '$completedOnTime/$tasksWithDeadline',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Índice de cumplimiento:',
                  style: TextStyle(fontWeight: FontWeight.w500),
                ),
                Text(
                  '$compliancePercentage%',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: _getComplianceColor(compliancePercentage),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTasksByPriority(List<Task> tasks) {
    final highPriority = tasks.where((t) => t.priority == Priority.high && !t.isCompleted).length;
    final mediumPriority = tasks.where((t) => t.priority == Priority.medium && !t.isCompleted).length;
    final lowPriority = tasks.where((t) => t.priority == Priority.low && !t.isCompleted).length;

    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Tareas por prioridad',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            _buildPriorityItem(
              'Alta prioridad',
              highPriority,
              Colors.red,
            ),
            const SizedBox(height: 12),
            _buildPriorityItem(
              'Prioridad media',
              mediumPriority,
              Colors.orange,
            ),
            const SizedBox(height: 12),
            _buildPriorityItem(
              'Baja prioridad',
              lowPriority,
              Colors.green,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPriorityItem(String label, int count, Color color) {
    return Row(
      children: [
        Container(
          width: 12,
          height: 12,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: color,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Text(label, style: const TextStyle(fontWeight: FontWeight.w500)),
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Text(
            '$count',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildStatItem({
    required IconData icon,
    required String label,
    required String value,
    required Color color,
  }) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: color.withOpacity(0.1),
          ),
          child: Icon(icon, color: color, size: 28),
        ),
        const SizedBox(height: 8),
        Text(
          value,
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey.shade600,
          ),
        ),
      ],
    );
  }

  Color _getComplianceColor(dynamic percentage) {
    final value = double.tryParse(percentage.toString()) ?? 0;
    if (value >= 80) return Colors.green;
    if (value >= 50) return Colors.orange;
    return Colors.red;
  }
}

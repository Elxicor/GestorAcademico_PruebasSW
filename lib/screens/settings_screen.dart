import 'package:flutter/material.dart';
import '../utils/database_service.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _notificationsEnabled = true;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    final enabled = await DatabaseService.areNotificationsEnabled();
    setState(() {
      _notificationsEnabled = enabled;
      _loading = false;
    });
  }

  Future<void> _toggleNotifications(bool value) async {
    setState(() {
      _notificationsEnabled = value;
    });

    await DatabaseService.setNotificationsEnabled(value);

    if (!value) {
      // Cancel all notifications when disabled
      // (Safety measure)
      // This ensures no old notifications fire
      // even if something went wrong earlier
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Configuración'),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              children: [
                SwitchListTile(
                  title: const Text('Notificaciones de tareas'),
                  subtitle: const Text(
                    'Obtén recordatorios antes de las fechas límite de las tareas',
                  ),
                  value: _notificationsEnabled,
                  onChanged: _toggleNotifications,
                  secondary: const Icon(Icons.notifications),
                ),
              ],
            ),
    );
  }
}

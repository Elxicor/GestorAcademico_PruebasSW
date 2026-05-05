import 'package:flutter/material.dart';

class Subject {
  final String id;
  final String name;
  final String professor;
  final String classroom;
  final int credits;
  final Color color;
  final DateTime createdAt;

  Subject({
    String? id,
    required this.name,
    required this.professor,
    required this.classroom,
    required this.credits,
    Color? color,
    DateTime? createdAt,
  })  : id = id ?? DateTime.now().millisecondsSinceEpoch.toString(),
        color = color ?? _getRandomColor(),
        createdAt = createdAt ?? DateTime.now();

  static Color _getRandomColor() {
    final colors = [
      Colors.blue,
      Colors.indigo,
      Colors.purple,
      Colors.pink,
      Colors.red,
      Colors.orange,
      Colors.amber,
      Colors.green,
      Colors.teal,
      Colors.cyan,
    ];
    return colors[DateTime.now().microsecond % colors.length];
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'professor': professor,
      'classroom': classroom,
      'credits': credits,
      'color': color.value,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  factory Subject.fromMap(Map<String, dynamic> map) {
    return Subject(
      id: map['id'],
      name: map['name'],
      professor: map['professor'],
      classroom: map['classroom'],
      credits: map['credits'] ?? 0,
      color: Color(map['color'] ?? Colors.blue.value),
      createdAt: DateTime.parse(map['createdAt']),
    );
  }

  Subject copyWith({
    String? name,
    String? professor,
    String? classroom,
    int? credits,
    Color? color,
  }) {
    return Subject(
      id: id,
      name: name ?? this.name,
      professor: professor ?? this.professor,
      classroom: classroom ?? this.classroom,
      credits: credits ?? this.credits,
      color: color ?? this.color,
      createdAt: createdAt,
    );
  }
}

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem
} from '@angular/cdk/drag-drop';
import { TaskService } from './services/task.service';
import { Task, TaskPriority, TaskStatus, CreateTaskRequest } from './models/task.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  private taskService = inject(TaskService);

  readonly columns: { title: string; status: TaskStatus }[] = [
    { title: 'To Do', status: 'TODO' },
    { title: 'In Progress', status: 'IN_PROGRESS' },
    { title: 'In Review', status: 'IN_REVIEW' },
    { title: 'Done', status: 'DONE' }
  ];

  // Primary reactive state
  tasks = signal<Task[]>([]);

  // Derived column arrays for Drag & Drop lists
  todo = signal<Task[]>([]);
  inProgress = signal<Task[]>([]);
  inReview = signal<Task[]>([]);
  done = signal<Task[]>([]);

  newTask: CreateTaskRequest = {
    title: '',
    description: '',
    priority: 'MEDIUM'
  };

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.taskService.getTasks().subscribe({
      next: (data) => {
        this.tasks.set(data);
        this.distributeTasks();
      },
      error: (err) => console.error('Failed to load tasks', err)
    });
  }

  private distributeTasks(): void {
    const all = this.tasks();
    this.todo.set(all.filter((t) => t.status === 'TODO'));
    this.inProgress.set(all.filter((t) => t.status === 'IN_PROGRESS'));
    this.inReview.set(all.filter((t) => t.status === 'IN_REVIEW'));
    this.done.set(all.filter((t) => t.status === 'DONE'));
  }

  getListByStatus(status: TaskStatus): Task[] {
    switch (status) {
      case 'TODO': return this.todo();
      case 'IN_PROGRESS': return this.inProgress();
      case 'IN_REVIEW': return this.inReview();
      case 'DONE': return this.done();
    }
  }

  onDrop(event: CdkDragDrop<Task[]>, targetStatus: TaskStatus): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      const movedTask = event.container.data[event.currentIndex];
      movedTask.status = targetStatus;
      movedTask.orderIndex = event.currentIndex;

      this.taskService.updateTaskStatus(movedTask.id, {
        status: targetStatus,
        newOrderIndex: event.currentIndex
      }).subscribe({
        error: (err) => {
          console.error('Failed to update status on server, rolling back...', err);
          this.loadTasks();
        }
      });
    }
  }

  createTask(): void {
    if (!this.newTask.title.trim()) return;

    this.taskService.createTask(this.newTask).subscribe({
      next: (created) => {
        this.tasks.update((prev) => [...prev, created]);
        this.distributeTasks();
        this.newTask = { title: '', description: '', priority: 'MEDIUM' };
      },
      error: (err) => console.error('Failed to create task', err)
    });
  }

  deleteTask(id: number): void {
    this.taskService.deleteTask(id).subscribe({
      next: () => {
        this.tasks.update((prev) => prev.filter((t) => t.id !== id));
        this.distributeTasks();
      },
      error: (err) => console.error('Failed to delete task', err)
    });
  }
}
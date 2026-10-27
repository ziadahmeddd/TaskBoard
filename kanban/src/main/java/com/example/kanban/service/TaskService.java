package com.example.kanban.service;

import com.example.kanban.dto.TaskDto.*;
import com.example.kanban.model.Task;
import com.example.kanban.model.TaskStatus;
import com.example.kanban.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TaskService {
    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getAllTasks() {
        return taskRepository.findAllByOrderByOrderIndexAsc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public TaskResponse createTask(CreateTaskRequest request) {
        int nextIndex = taskRepository.getNextOrderIndexForStatus(TaskStatus.TODO);
        Task task = new Task(request.title(), request.description(), request.priority(), nextIndex);
        return mapToResponse(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse updateTaskStatus(Long taskId, UpdateTaskStatusRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found with ID: " + taskId));

        taskRepository.shiftOrderIndicesRight(request.status(), request.newOrderIndex());
        task.setStatus(request.status());
        task.setOrderIndex(request.newOrderIndex());

        return mapToResponse(taskRepository.save(task));
    }

    @Transactional
    public void deleteTask(Long taskId) {
        taskRepository.deleteById(taskId);
    }

    private TaskResponse mapToResponse(Task t) {
        return new TaskResponse(
            t.getId(),
            t.getTitle(),
            t.getDescription(),
            t.getStatus(),
            t.getPriority(),
            t.getOrderIndex(),
            t.getCreatedAt()
        );
    }
}
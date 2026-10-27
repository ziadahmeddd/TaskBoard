package com.example.kanban.dto;

import com.example.kanban.model.TaskPriority;
import com.example.kanban.model.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public class TaskDto {

    public record CreateTaskRequest(
        @NotBlank(message = "Title must not be empty")
        String title,
        String description,
        @NotNull(message = "Priority is required")
        TaskPriority priority
    ) {}

    public record UpdateTaskStatusRequest(
        @NotNull(message = "Status is required")
        TaskStatus status,
        @NotNull(message = "Order index is required")
        Integer newOrderIndex
    ) {}

    public record TaskResponse(
        Long id,
        String title,
        String description,
        TaskStatus status,
        TaskPriority priority,
        Integer orderIndex,
        Instant createdAt
    ) {}
}
package com.example.kanban.repository;

import com.example.kanban.model.Task;
import com.example.kanban.model.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findAllByOrderByOrderIndexAsc();

    @Query("SELECT COALESCE(MAX(t.orderIndex), -1) + 1 FROM Task t WHERE t.status = :status")
    Integer getNextOrderIndexForStatus(@Param("status") TaskStatus status);

    @Modifying
    @Query("UPDATE Task t SET t.orderIndex = t.orderIndex + 1 WHERE t.status = :status AND t.orderIndex >= :fromIndex")
    void shiftOrderIndicesRight(@Param("status") TaskStatus status, @Param("fromIndex") Integer fromIndex);
}
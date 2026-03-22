package com.taskflow.repository;

import com.taskflow.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByStatus(Task.Status status);
    List<Task> findByPriority(Task.Priority priority);
    List<Task> findByAssigneeContainingIgnoreCase(String assignee);
    List<Task> findByTitleContainingIgnoreCase(String keyword);
}

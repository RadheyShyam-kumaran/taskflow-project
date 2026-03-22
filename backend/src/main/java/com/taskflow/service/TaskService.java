package com.taskflow.service;

import com.taskflow.model.Task;
import com.taskflow.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;

    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    public Optional<Task> getTaskById(Long id) {
        return taskRepository.findById(id);
    }

    public Task createTask(Task task) {
        return taskRepository.save(task);
    }

    public Optional<Task> updateTask(Long id, Task updatedTask) {
        return taskRepository.findById(id).map(task -> {
            task.setTitle(updatedTask.getTitle());
            task.setDescription(updatedTask.getDescription());
            task.setStatus(updatedTask.getStatus());
            task.setPriority(updatedTask.getPriority());
            task.setAssignee(updatedTask.getAssignee());
            return taskRepository.save(task);
        });
    }

    public Optional<Task> updateStatus(Long id, Task.Status status) {
        return taskRepository.findById(id).map(task -> {
            task.setStatus(status);
            return taskRepository.save(task);
        });
    }

    public boolean deleteTask(Long id) {
        if (taskRepository.existsById(id)) {
            taskRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public List<Task> getTasksByStatus(Task.Status status) {
        return taskRepository.findByStatus(status);
    }

    public List<Task> searchTasks(String keyword) {
        return taskRepository.findByTitleContainingIgnoreCase(keyword);
    }

    public DashboardStats getDashboardStats() {
        long total = taskRepository.count();
        long todo = taskRepository.findByStatus(Task.Status.TODO).size();
        long inProgress = taskRepository.findByStatus(Task.Status.IN_PROGRESS).size();
        long inReview = taskRepository.findByStatus(Task.Status.IN_REVIEW).size();
        long done = taskRepository.findByStatus(Task.Status.DONE).size();
        return new DashboardStats(total, todo, inProgress, inReview, done);
    }

    public record DashboardStats(long total, long todo, long inProgress, long inReview, long done) {}
}

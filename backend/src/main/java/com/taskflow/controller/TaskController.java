package com.taskflow.controller;

import com.taskflow.model.Task;
import com.taskflow.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*") // In production, restrict to your frontend domain
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService ;

    // GET /api/tasks — list all (or filter by status)
    @GetMapping
    public ResponseEntity<List<Task>> getTasks(
            @RequestParam(required = false) Task.Status status,
            @RequestParam(required = false) String search) {

        if (status != null) {
            return ResponseEntity.ok(taskService.getTasksByStatus(status));
        }
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(taskService.searchTasks(search));
        }
        return ResponseEntity.ok(taskService.getAllTasks());
    }

    // GET /api/tasks/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Task> getTask(@PathVariable Long id) {
        return taskService.getTaskById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST /api/tasks
    @PostMapping
    public ResponseEntity<Task> createTask(@Valid @RequestBody Task task) {
        Task created = taskService.createTask(task);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // PUT /api/tasks/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable Long id,
                                           @Valid @RequestBody Task task) {
        return taskService.updateTask(id, task)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // PATCH /api/tasks/{id}/status
    @PatchMapping("/{id}/status")
    public ResponseEntity<Task> updateStatus(@PathVariable Long id,
                                             @RequestBody Map<String, String> body) {
        try {
            Task.Status status = Task.Status.valueOf(body.get("status"));
            return taskService.updateStatus(id, status)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // DELETE /api/tasks/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        if (taskService.deleteTask(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // GET /api/tasks/stats
    @GetMapping("/stats")
    public ResponseEntity<TaskService.DashboardStats> getStats() {
        return ResponseEntity.ok(taskService.getDashboardStats());
    }
}

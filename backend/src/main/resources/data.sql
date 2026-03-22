-- Sample tasks for development
INSERT INTO tasks (title, description, status, priority, assignee, created_at, updated_at)
VALUES
  ('Set up CI/CD pipeline', 'Configure GitHub Actions for automated build and deploy', 'IN_PROGRESS', 'HIGH', 'Alice', NOW(), NOW()),
  ('Design database schema', 'ERD and migration scripts for production database', 'DONE', 'HIGH', 'Bob', NOW(), NOW()),
  ('Write API documentation', 'Document all REST endpoints with Swagger/OpenAPI', 'TODO', 'MEDIUM', 'Alice', NOW(), NOW()),
  ('Add authentication', 'Implement JWT-based login and registration', 'TODO', 'CRITICAL', 'Charlie', NOW(), NOW()),
  ('Deploy to staging', 'Push latest build to staging environment and run smoke tests', 'IN_REVIEW', 'HIGH', 'Bob', NOW(), NOW()),
  ('Fix mobile layout bugs', 'Several responsive issues on screens < 768px', 'TODO', 'LOW', 'Alice', NOW(), NOW()),
  ('Performance optimization', 'Add caching layer and optimize slow queries', 'TODO', 'MEDIUM', 'Charlie', NOW(), NOW()),
  ('Write unit tests', 'Achieve 80% test coverage for service layer', 'IN_PROGRESS', 'MEDIUM', 'Bob', NOW(), NOW());

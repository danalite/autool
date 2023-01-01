## UI design
- Minimal: single control console to manage tasks; no built-in shopping window like other RPA tools; no built-in file explorer or editor 

- This also makes it light-weight and easier for us to migrate from electron infra later on (for better performance)


## Critical Components
### PC/MacOS
- Electron app: manage downloaded tasks (open, edit, delete, run, upgrade, or distribute etc.)
  
### Mobile-side
- Send commands to other workers (PC/MacOS, or any cloud server) to run the task

- Mobile side can receive notifications from other workers 

### Server-side
- Not managed by the user. It's a cloud service that runs the tasks remotely. 
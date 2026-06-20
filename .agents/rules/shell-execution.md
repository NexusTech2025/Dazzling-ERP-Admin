---
trigger: always_on
---

ENV: Windows
Always use 'cmd /c' for all shell executions to ensure the process terminates correctly and sends an EOF signal. 
Example: Use 'cmd /c git status' instead of just 'git status'. 
Avoid interactive shells. If a persistent session is needed, use 'cmd /k' but ensure the command is self-terminating.
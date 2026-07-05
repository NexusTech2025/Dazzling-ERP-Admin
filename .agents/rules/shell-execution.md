---
trigger: model_decision
description: Apply this rule when only the normal command unable to perform its task or the return error/warning codes are not received.
---

ENV: Windows
Always use 'cmd /c' for all shell executions to ensure the process terminates correctly and sends an EOF signal. 
Example: Use 'cmd /c git status' instead of just 'git status'. 
Avoid interactive shells. If a persistent session is needed, use 'cmd /k' but ensure the command is self-terminating.
# Project Instructions for Claude Code

## Design System & UI
- **Always use the 'design-system'** we created for every new build and UI component
- **Reuse existing components** like buttons, checkboxes, inputs, etc.
- **Design style:**
  - All boxes/rectangle containers: rounded corners, iOS-like smoothed
  - Use soft shadows
  - Do NOT overuse orange color (primary color) - aim for medium balance
- **Font:** Always use Manrope
- **Design references:** If design reference is provided, follow it BUT still try to reuse components from design system
- **Text handling:** NEVER force text to go to new line when it's too long. Instead, increase width of all containers, even if only 1 text among many components is long

## Internationalization (i18n)
- **Always use i18n approach** - avoid injecting static strings directly
- For complex/big features: implement only 1 language (RUS)
- For small/easy features: implement 2 languages (RUS, UZB)
- Keep in mind that all text will be translated later

## ClickUp Task Management
- **Workspace:** ONESIM
- **List:** BETA Release
- **Procedure:** After completing any modification or implementation:
  1. Check the "BETA Release" list → "TO DO" tasks
  2. Find the task that matches closest to what you did
  3. If you find a corresponding task → mark it as "Completed" in ClickUp

## Version Control & GitHub
- **After making changes or running any task on this project:**
  - Commit changes to GitHub with proper commit message
  - Always push to main branch
- **Change logging:** Before starting work, open relevant files and understand what has been changed and current state
  - Keep logs brief but informative enough to understand the context
  - Don't spend too many tokens on log entries

## API & Backend
- **Error handling:** When implementing fetching, posting, or any backend-related parts:
  - Include console logs
  - Implement better error logging so we know what went wrong if something fails
- **API Documentation:** If task requires access to eSIM Access API documentation:
  - Check file: `src/api-documentation/eSIM Access API.json`

## Task Clarification
- **If anything is unclear or not specified in the prompt/task → ASK for clarification before proceeding**
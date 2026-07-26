# Plan Refiner Pre-Flight Checklist

Before applying any chunk edit to an `implementation_plan.md`, verify the following:

- [ ] **No Full Overwrites**: Are you using `replace_file_content` instead of overwriting the full file?
- [ ] **UI Catalog Search**: If UI components are mentioned, did you search `.gemini/memory/ui_component/components.index.json`?
- [ ] **Pre-existing First**: Did you prioritize existing primitives (`Button`, `TextInput`, `KpiCard`, `Badge`, `Card`, `LowDensityCard`, `ConfirmModal`, `MoneyTransactionForm`)?
- [ ] **JSDoc Types**: Do new/updated methods include `@param` and `@returns` JSDoc annotations?
- [ ] **Line Anchors**: Have you verified exact `StartLine` and `EndLine` numbers in `implementation_plan.md`?
- [ ] **Preserved Sections**: Are completed milestones and untouched plan sections left unchanged?

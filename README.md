# Frontline — Warehouse Operations Dashboard

A self-contained, interactive web prototype exploring how warehouse supervisors can monitor pallet picking, quality assurance (QA), staging, and truck loading across multiple dock doors.

This concept was created as a response to a product design exercise. It focuses on making the loading sequence and QA-related bottlenecks visible at a glance.

> **Prototype notice:** This is an independent concept prototype using illustrative sample data. It is not an official TeamViewer product, is not connected to a live warehouse system, and should not be used for real operational decisions.

## The challenge

Warehouse workers pick items onto pallets assigned to delivery trucks. Completed pallets must be loaded in a specific sequence. If a pallet is not next in line, it waits in the staging area for its dock.

Some completed pallets are selected for quality assurance checks. If the next pallet in the loading sequence is waiting for QA, loading can be held up and downstream pallets remain in staging.

The dashboard is designed to help a warehouse supervisor answer three questions:

1. **What is happening?** — How are the dock doors and trucks progressing?
2. **What is blocking progress?** — Is the next pallet ready to load, or is it waiting for QA?
3. **What is the impact?** — Which downstream pallets are waiting behind the blocker?

## Product goals

- Provide a warehouse-wide view of activity across five dock doors.
- Make truck loading progress visible through loaded-versus-planned counts.
- Distinguish the four required pallet states: being picked, in QA, in staging, and loaded.
- Make the next pallet in the loading sequence easy to identify.
- Highlight QA blockers and show when they are preventing loading from progressing.
- Let supervisors move from an overview to dock, truck, QA, and pallet details without losing context.

## Prototype features

### Warehouse overview
- Summary metrics for active docks, pallets in progress, pallets awaiting QA, and blocked trucks.
- Status cards for all five dock doors.
- Loaded / planned pallet counts and progress indicators.
- A prioritised “Needs attention” area for loading exceptions.

### Dock and truck detail
- Truck loading positions displayed in two columns, representing two pallets side by side per row.
- A maximum capacity of 20 pallet positions per truck.
- Loaded positions and remaining pallets shown separately.
- Pallet IDs, delivery-stop context, status labels, and the next pallet in sequence.
- A contextual bottleneck panel when the next pallet is awaiting QA.

### QA queue
- A list of sample pallets awaiting inspection.
- Dock, truck, delivery stop, QA reason, and loading impact.
- A clear distinction between a QA item that blocks loading and one that does not currently block the sequence.

### Pallet detail
- Pallet ID, assigned dock and truck, delivery stop, status, and physical location.
- Loading eligibility context.
- QA reason and a simulated “Mark QA complete” action for supported sample pallets.

### Interactive behaviour
- Navigate between the overview, dock doors, dock/truck details, and QA queue.
- Filter dock cards by operational status.
- Open a pallet detail drawer from the dock view or QA queue.
- Complete QA for the sample blocker and see its QA state removed from the queue and the dock's blocked status cleared.

## The critical scenario: a QA bottleneck

The sample data includes a blocked truck at **Dock 02**:

1. Pallet `4821` is next in the loading sequence.
2. Pallet `4821` is awaiting a random quality audit.
3. Three downstream pallets are waiting in staging.
4. The dock is flagged as **Loading blocked**.
5. Opening the pallet reveals the QA reason and its effect on loading.
6. Selecting **Mark QA complete** removes the pallet from the awaiting-QA queue and clears the blocked status so loading can resume.

The prototype simulates the QA state transition. It does not simulate the physical loading of the pallet onto the truck.

## Operational model and assumptions

The dashboard separates a pallet's **displayed state** from its **loading eligibility**.

| Displayed state | Meaning |
|---|---|
| Being picked | Picking is still in progress |
| In QA | The pallet is awaiting inspection |
| In staging | The pallet is complete but waiting for its turn to load |
| Loaded | The pallet has been loaded onto the truck |

A pallet is eligible to load when it is next in the required sequence and any required QA has been completed.

### FILO interpretation

The exercise brief refers to the loading sequence as First In, Last Out (FILO). For this concept, the working interpretation is that pallets for later delivery stops are loaded before pallets for earlier stops, leaving earlier-stop pallets accessible for unloading.

This is an assumption based on the brief, not a confirmed warehouse operating rule. The actual sequence should be validated with warehouse operations in a real implementation.

### Sample data

All pallet IDs, truck IDs, counts, delivery stops, and QA reasons are illustrative. They exist to demonstrate interface states and the QA bottleneck scenario; they do not represent real warehouse activity.

## Run locally

No build step, package installation, or external dependency is required.

1. Clone or download this repository.
2. Open `teamviewer-frontline-dashboard.html` in a modern web browser.

Alternatively, run a local static server from the repository directory:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/teamviewer-frontline-dashboard.html
```

## Technology

- HTML
- CSS
- Vanilla JavaScript

The prototype is contained in a single HTML file. The sample operational data and interaction logic are defined in the page itself.

## Scope and limitations

This is a timeboxed design prototype, not a production-ready warehouse management system.

- No backend, database, authentication, or live warehouse integration.
- No real-time event stream or automatic data refresh; the displayed data is static sample data.
- QA completion is simulated in the browser.
- The prototype demonstrates clearing the QA blocker; it does not automatically load the pallet or update the loaded count.
- Failed QA, rework, damaged-goods resolution, and other exception paths are not fully modelled.
- Loading-sequence rules, route data, permissions, and the source of truth for operational events would need confirmation with the warehouse team.
- Sample values are intended for demonstration and may not represent a fully reconciled production dataset.

## Design process

The design approach follows this sequence:

1. **Understand the brief** — extract explicit requirements, constraints, and open questions.
2. **Model the workflow** — map picking, QA, staging, loading, and the impact of a sequence blocker.
3. **Define the information architecture** — organise the experience around warehouse overview, dock/truck detail, QA queue, and pallet context.
4. **Prioritise the critical scenario** — make the QA blocker and downstream impact visible.
5. **Design and prototype** — translate the workflow into dashboard views and simulate the key QA interaction.
6. **Review against requirements** — check coverage of dock doors, pallet states, truck capacity, progress counts, and bottleneck visibility.

See [`teamviewer-frontline-design-process.md`](teamviewer-frontline-design-process.md) for the supporting design documentation, if included in this repository.

## Potential next steps

For a real product discovery and delivery process, the next steps would be to:

- Validate the FILO interpretation and loading rules with warehouse supervisors.
- Confirm how pallet, truck, route, and QA data are generated and updated.
- Define failed-QA, rework, and exception-handling workflows.
- Test the dashboard with supervisors against realistic shift scenarios, including multiple simultaneous blockers.
- Validate the visual hierarchy and interaction patterns with the people who would use the dashboard.

---

**Design principle:** Show not only where each pallet is, but whether it can move next, what is blocking it, and which pallets are affected.

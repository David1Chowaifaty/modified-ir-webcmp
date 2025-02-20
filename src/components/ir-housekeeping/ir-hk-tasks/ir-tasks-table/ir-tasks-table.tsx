import { Component, Event, EventEmitter, Listen, Prop, State, h } from '@stencil/core';
import { Task } from '@/models/housekeeping';

@Component({
  tag: 'ir-tasks-table',
  styleUrl: 'ir-tasks-table.css',
  scoped: true,
})
export class IrTasksTable {
  @Prop({ mutable: true }) tasks: Task[] = [];

  /**
   * Tracks which task IDs are currently selected via checkboxes.
   */
  @State() selectedIds: Task['id'][] = [];

  /**
   * Controls whether the "Confirm Clean" modal is shown.
   */
  @State() showConfirmModal: boolean = false;

  /**
   * The key we are sorting by (e.g., "date", "unit", "status", "housekeeper").
   */
  @State() sortKey: string = 'date';

  /**
   * The sort direction: ASC or DESC.
   */
  @State() sortDirection: 'ASC' | 'DESC' = 'ASC';

  @Event({ bubbles: true, composed: true }) animateCleanedButton: EventEmitter<null>;
  @Event({ bubbles: true, composed: true }) rowSelectChange: EventEmitter<Task[]>;

  componentWillLoad() {
    this.sortTasks('date', 'ASC');
  }
  /**
   * Sorts the tasks by the given key. If no direction is provided,
   * it toggles between ascending and descending.
   */
  private handleSort(key: string) {
    let newDirection = this.sortDirection;
    // If we're clicking the same column, flip the direction. If a new column, default to ASC.
    if (this.sortKey === key) {
      newDirection = this.sortDirection === 'ASC' ? 'DESC' : 'ASC';
    } else {
      newDirection = 'ASC';
    }
    this.sortTasks(key, newDirection);
  }

  @Listen('clearSelectedHkTasks', { target: 'body' })
  handleClearSelectedHkTasks(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    this.selectedIds = [];
  }

  /**
   * Helper to sort tasks array in state.
   */
  /**
   * Sorts the tasks by the given key in ASC or DESC order.
   * If values for `key` are duplicates, it sorts by `date` ascending.
   * If `date` is also the same, it finally sorts by `unit.name` ascending.
   */
  private sortTasks(key: string, direction: 'ASC' | 'DESC') {
    const sorted = [...this.tasks].sort((a, b) => {
      // Primary comparison: a[key] vs b[key]
      let aPrimary = a[key];
      let bPrimary = b[key];
      if (key === 'status') {
        aPrimary = a[key].description;
        bPrimary = b[key].description;
      }

      if (aPrimary < bPrimary) {
        return direction === 'ASC' ? -1 : 1;
      }
      if (aPrimary > bPrimary) {
        return direction === 'ASC' ? 1 : -1;
      }

      // First tiebreaker: compare by date (always ascending)
      if (a.date < b.date) return -1;
      if (a.date > b.date) return 1;

      // Second tiebreaker: compare by unit.name (always ascending)
      if (a.unit?.name < b.unit?.name) return -1;
      if (a.unit?.name > b.unit?.name) return 1;

      return 0;
    });

    // Update component state
    this.tasks = sorted;
    this.sortKey = key;
    this.sortDirection = direction;
  }

  /**
   * Helper to toggle selection for a single row.
   */
  private toggleSelection(id: Task['id']) {
    if (this.selectedIds.includes(id)) {
      this.selectedIds = this.selectedIds.filter(item => item !== id);
    } else {
      this.selectedIds = [...this.selectedIds, id];
      this.animateCleanedButton.emit(null);
    }
    this.emitSelectedTasks();
  }

  private emitSelectedTasks() {
    if (this.tasks.length === 0) {
      return;
    }
    const filteredTasks = this.tasks.filter(t => this.selectedIds.includes(t.id));
    this.rowSelectChange.emit(filteredTasks);
  }

  /**
   * Checks if every row is selected.
   */
  private get allSelected(): boolean {
    return this.tasks.length > 0 && this.selectedIds.length === this.tasks.length;
  }

  /**
   * Toggles selection on all visible tasks at once.
   */
  private toggleSelectAll() {
    if (this.allSelected) {
      this.selectedIds = [];
    } else {
      this.selectedIds = this.tasks.map(task => task.id);
      this.animateCleanedButton.emit(null);
    }
    this.emitSelectedTasks();
    console.log('here');
  }

  render() {
    return (
      <div class="card h-100 p-1 m-0 table-responsive">
        <table class="table">
          <thead class="table-header">
            <tr>
              <th>
                <ir-checkbox checked={this.allSelected} onCheckChange={() => this.toggleSelectAll()}></ir-checkbox>
              </th>
              <th>Period</th>
              <th>
                {/* Unit {this.sortKey === 'unit' ? `(${this.sortDirection})` : ''} */}
                <span>Unit</span>
              </th>
              <th class={'sortable'} onClick={() => this.handleSort('status')}>
                <div class={'d-flex align-items-center'} style={{ gap: '0.5rem' }}>
                  <span>Status</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="lucide lucide-arrow-up-down"
                  >
                    <path d="m21 16-4 4-4-4" />
                    <path d="M17 20V4" />
                    <path d="m3 8 4-4 4 4" />
                    <path d="M7 4v16" />
                  </svg>
                </div>
              </th>
              <th>Hint</th>
              <th>A</th>
              <th>C</th>
              <th>I</th>
              <th style={{ textAlign: 'start' }} class={'sortable'} onClick={() => this.handleSort('housekeeper')}>
                <div class={'d-flex align-items-center'} style={{ gap: '0.5rem' }}>
                  <span>Housekeeper</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="lucide lucide-arrow-up-down"
                  >
                    <path d="m21 16-4 4-4-4" />
                    <path d="M17 20V4" />
                    <path d="m3 8 4-4 4 4" />
                    <path d="M7 4v16" />
                  </svg>
                </div>
              </th>
            </tr>
          </thead>

          <tbody>
            {this.tasks.length === 0 && (
              <tr>
                <td colSpan={9} class="text-center">
                  <div style={{ height: '300px' }} class="d-flex align-items-center justify-content-center">
                    <span> No Tasks Found</span>
                  </div>
                </td>
              </tr>
            )}
            {this.tasks.map(task => {
              const isSelected = this.selectedIds.includes(task.id);
              return (
                <tr style={{ cursor: 'pointer' }} onClick={() => this.toggleSelection(task.id)} class={{ 'selected': isSelected, 'task-table-row': true }} key={task.id}>
                  <td class="task-row">
                    <ir-checkbox checked={isSelected}></ir-checkbox>
                  </td>
                  <td class="task-row">{task.date}</td>
                  <td class="task-row">
                    <span class={{ 'highlighted-unit': task.is_highlight }}>{task.unit.name}</span>
                  </td>
                  <td class="task-row">{task.status.description}</td>
                  <td class="task-row">{task.hint}</td>
                  <td class="task-row">{task.adult}</td>
                  <td class="task-row">{task.child}</td>
                  <td class="task-row">{task.infant}</td>
                  <td class="w-50 task-row" style={{ textAlign: 'start' }}>
                    {task.housekeeper ?? 'Unassigned'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
}

import { Component, Event, EventEmitter, Prop, State, h } from '@stencil/core';
import { Task } from '../ir-hk-tasks';

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
  @State() selectedIds: number[] = [];

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

  /**
   * Helper to sort tasks array in state.
   */
  private sortTasks(key: string, direction: 'ASC' | 'DESC') {
    const sorted = [...this.tasks].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'ASC' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'ASC' ? 1 : -1;
      return 0;
    });
    this.tasks = sorted;
    this.sortKey = key;
    this.sortDirection = direction;
  }

  /**
   * Helper to toggle selection for a single row.
   */
  private toggleSelection(id: number) {
    if (this.selectedIds.includes(id)) {
      this.selectedIds = this.selectedIds.filter(item => item !== id);
    } else {
      this.selectedIds = [...this.selectedIds, id];
      this.animateCleanedButton.emit(null);
    }
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
    console.log('here');
  }

  render() {
    return (
      <div class="card h-100 p-1 m-0 table-responsive">
        <table class="table ">
          <thead>
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
            {this.tasks.map(task => {
              const isSelected = this.selectedIds.includes(task.id);
              console.log(isSelected);
              return (
                <tr style={{ cursor: 'pointer' }} onClick={() => this.toggleSelection(task.id)} class={{ 'selected': isSelected, 'task-table-row': true }} key={task.id}>
                  <td class="task-row">
                    <ir-checkbox checked={isSelected}></ir-checkbox>
                  </td>
                  <td class="task-row">{task.date}</td>
                  <td class="task-row">{task.unit}</td>
                  <td class="task-row">{task.status}</td>
                  <td class="task-row">{task.hint}</td>
                  <td class="task-row">{task.a}</td>
                  <td class="task-row">{task.c}</td>
                  <td class="task-row">{task.i}</td>
                  <td class="w-50 task-row" style={{ textAlign: 'start' }}>
                    {task.housekeeper}
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

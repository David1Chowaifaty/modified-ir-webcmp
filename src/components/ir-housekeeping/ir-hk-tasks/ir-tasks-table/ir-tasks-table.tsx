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
    }
    console.log('here');
    this.animateCleanedButton.emit(null);
  }

  render() {
    return (
      <div class="card h-100 p-1 m-0">
        <table class="">
          <thead>
            <tr>
              <th>
                <ir-checkbox checked={this.allSelected} onCheckChange={() => this.toggleSelectAll()}></ir-checkbox>
              </th>
              <th>Period</th>
              <th style={{ cursor: 'pointer' }} onClick={() => this.handleSort('unit')}>
                {/* Unit {this.sortKey === 'unit' ? `(${this.sortDirection})` : ''} */}
                Unit
              </th>
              <th style={{ cursor: 'pointer' }} onClick={() => this.handleSort('status')}>
                Status
              </th>
              <th>Hint</th>
              <th>A</th>
              <th>C</th>
              <th>I</th>
              <th style={{ cursor: 'pointer' }} onClick={() => this.handleSort('housekeeper')}>
                Housekeeper
              </th>
            </tr>
          </thead>
          <tbody>
            {this.tasks.map(task => {
              const isSelected = this.selectedIds.includes(task.id);
              return (
                <tr style={{ cursor: 'pointer' }} onClick={() => this.toggleSelection(task.id)} class={{ selected: isSelected }} key={task.id}>
                  <td>
                    <ir-checkbox checked={isSelected} onCheckChange={() => this.toggleSelection(task.id)}></ir-checkbox>
                  </td>
                  <td>{task.date}</td>
                  <td>{task.unit}</td>
                  <td>{task.status}</td>
                  <td>{task.hint}</td>
                  <td>{task.a}</td>
                  <td>{task.c}</td>
                  <td>{task.i}</td>
                  <td>{task.housekeeper}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
}

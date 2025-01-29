import { Component, Host, Prop, State, h } from '@stencil/core';
import { Task } from '../ir-hk-tasks';

@Component({
  tag: 'ir-tasks-table',
  styleUrl: 'ir-tasks-table.css',
  scoped: true,
})
export class IrTasksTable {
  @Prop() tasks: Task[] = [];

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
  }

  /**
   * Trigger showing the confirmation modal if there is at least one selected row.
   */
  private handleMarkClean() {
    if (this.selectedIds.length === 0) return;
    this.showConfirmModal = true;
  }

  /**
   * User confirms marking selected tasks as "clean."
   * Simulate archiving them and remove them from the table.
   */
  private confirmMarkClean() {
    // In a real app, you'd likely make an API call here to archive or update tasks.
    const remainingTasks = this.tasks.filter(t => !this.selectedIds.includes(t.id));
    this.tasks = remainingTasks;
    this.selectedIds = [];
    this.showConfirmModal = false;
  }

  /**
   * User cancels the confirmation dialog.
   */
  private cancelMarkClean() {
    this.showConfirmModal = false;
  }

  render() {
    return (
      <div class="container mt-4">
        <table class="table table-bordered table-hover">
          <thead class="thead-light">
            <tr>
              <th>
                <input type="checkbox" checked={this.allSelected} onChange={() => this.toggleSelectAll()} />
              </th>
              <th style={{ cursor: 'pointer' }} onClick={() => this.handleSort('date')}>
                Date {this.sortKey === 'date' ? `(${this.sortDirection})` : ''}
              </th>
              <th style={{ cursor: 'pointer' }} onClick={() => this.handleSort('unit')}>
                Unit {this.sortKey === 'unit' ? `(${this.sortDirection})` : ''}
              </th>
              <th style={{ cursor: 'pointer' }} onClick={() => this.handleSort('status')}>
                Status {this.sortKey === 'status' ? `(${this.sortDirection})` : ''}
              </th>
              <th>Hint</th>
              <th>A</th>
              <th>C</th>
              <th>I</th>
              <th style={{ cursor: 'pointer' }} onClick={() => this.handleSort('housekeeper')}>
                Housekeeper
                {this.sortKey === 'housekeeper' ? `(${this.sortDirection})` : ''}
              </th>
            </tr>
          </thead>
          <tbody>
            {this.tasks.map(task => {
              const isSelected = this.selectedIds.includes(task.id);
              return (
                <tr key={task.id}>
                  <td>
                    <input type="checkbox" checked={isSelected} onChange={() => this.toggleSelection(task.id)} />
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
        <button class="btn btn-primary" disabled={this.selectedIds.length === 0} onClick={() => this.handleMarkClean()}>
          Update selected unit(s) to Clean
        </button>
        {this.showConfirmModal && (
          <div class="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title">Confirm Update</h5>
                  <button type="button" class="close" onClick={() => this.cancelMarkClean()}>
                    <span>&times;</span>
                  </button>
                </div>
                <div class="modal-body">Update selected unit(s) to Clean?</div>
                <div class="modal-footer">
                  <button class="btn btn-secondary" onClick={() => this.cancelMarkClean()}>
                    No
                  </button>
                  <button class="btn btn-primary" onClick={() => this.confirmMarkClean()}>
                    Yes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

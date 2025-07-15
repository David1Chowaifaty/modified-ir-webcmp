import { Component, Event, EventEmitter, Host, Listen, Prop, Watch, h } from '@stencil/core';
import { Task } from '@/models/housekeeping';
import moment from 'moment';
import housekeeping_store from '@/stores/housekeeping.store';
import locales from '@/stores/locales.store';
import {
  hkTasksStore,
  toggleTaskSelection,
  selectAllTasks,
  clearSelectedTasks,
  getCheckableTasks,
  isAllTasksSelected,
  updateSorting,
  getPaginatedTasks,
  getMobileTasks,
} from '@/stores/hk-tasks.store';

@Component({
  tag: 'ir-tasks-table',
  styleUrls: ['ir-tasks-table.css', '../../../../common/table.css'],
  scoped: true,
})
export class IrTasksTable {
  @Prop({ mutable: true }) tasks: Task[] = [];

  @Event({ bubbles: true, composed: true }) animateCleanedButton: EventEmitter<null>;
  @Event({ bubbles: true, composed: true }) rowSelectChange: EventEmitter<Task[]>;
  @Event({ bubbles: true, composed: true }) sortingChanged: EventEmitter<{ field: string; direction: 'ASC' | 'DESC' }>;

  componentWillLoad() {
    if (this.tasks && this.tasks.length > 0) {
      updateSorting('date', 'ASC');
    }
  }

  /**
   * Sorts the tasks by the given key. If no direction is provided,
   * it toggles between ascending and descending.
   */
  private handleSort(key: string) {
    let newDirection = hkTasksStore.sorting.direction;
    // If we're clicking the same column, flip the direction. If a new column, default to ASC.
    if (hkTasksStore.sorting.field === key) {
      newDirection = hkTasksStore.sorting.direction === 'ASC' ? 'DESC' : 'ASC';
    } else {
      newDirection = 'ASC';
    }
    updateSorting(key, newDirection);
    this.sortingChanged.emit({ field: key, direction: newDirection });
  }

  @Listen('clearSelectedHkTasks', { target: 'body' })
  handleClearSelectedHkTasks(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    clearSelectedTasks();
  }

  @Watch('tasks')
  handleTasksChange(newTasks: Task[]) {
    if (newTasks?.length) {
      clearSelectedTasks();
    }
  }

  /**
   * Helper to toggle selection for a single row.
   */
  private toggleSelection(task: Task) {
    toggleTaskSelection(task);
    this.animateCleanedButton.emit(null);
    this.emitSelectedTasks();
  }

  private emitSelectedTasks() {
    this.rowSelectChange.emit(hkTasksStore.selectedTasks);
  }

  /**
   * Checks if every row is selected.
   */
  private get allSelected(): boolean {
    return isAllTasksSelected();
  }

  /**
   * Toggles selection on all visible tasks at once.
   */
  private toggleSelectAll() {
    if (this.allSelected) {
      clearSelectedTasks();
    } else {
      selectAllTasks(getCheckableTasks());
      this.animateCleanedButton.emit(null);
    }
    this.emitSelectedTasks();
  }

  /**
   * Determines if a task is checkable.
   *
   * A task is considered checkable if its date is today or any day before.
   * This prevents users from selecting tasks with future dates.
   *
   * @param {Task} task - The task to check.
   * @returns {boolean} - Returns `true` if the task's date is today or earlier, otherwise `false`.
   */
  private isCheckable(task: Task): boolean {
    return moment(task.date, 'YYYY-MM-DD').isSameOrBefore(moment(), 'days');
  }

  render() {
    const haveManyHousekeepers = housekeeping_store?.hk_criteria?.housekeepers?.length > 1;
    const tasks = getPaginatedTasks();
    const mobileTasks = getMobileTasks();
    return (
      <Host class="flex-fill">
        <section class="mobile-tasks-container flex-fill">
          <div class="card p-1 m-0">
            <ir-tasks-header></ir-tasks-header>
          </div>
          {mobileTasks.map(task => {
            const isCheckable = this.isCheckable(task);
            return <ir-tasks-card task={task} key={task.id} isCheckable={isCheckable}></ir-tasks-card>;
          })}
        </section>
        <div class="card table-container flex-fill p-1 m-0">
          <ir-tasks-header></ir-tasks-header>
          <div class={'table-responsive mb-auto'}>
            <table class="table" data-testid="hk_tasks_table">
              <thead class="table-header">
                <tr>
                  <th class={'task-row'}>
                    <ir-checkbox
                      indeterminate={hkTasksStore.selectedTasks.length > 0 && hkTasksStore.selectedTasks.length < getCheckableTasks().length}
                      checked={this.allSelected}
                      onCheckChange={() => this.toggleSelectAll()}
                    ></ir-checkbox>
                  </th>
                  <th class="extra-padding">{locales.entries.Lcz_Period}</th>
                  <th class="extra-padding">
                    {this.tasks.length > 1 && this.tasks.length + ' '}
                    {locales.entries.Lcz_Unit}
                  </th>
                  <th class={'sortable extra-padding'} onClick={() => this.handleSort('status')}>
                    <div class={'d-flex align-items-center'} style={{ gap: '0.5rem' }}>
                      <span>{locales.entries.Lcz_Status}</span>
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
                  <th class="extra-padding text-left">{locales.entries.Lcz_Hint}</th>
                  <th class="text-left">{locales.entries.Lcz_A}d</th>
                  <th class="text-left">{locales.entries.Lcz_C}h</th>
                  <th class="text-left text-left">{locales.entries.Lcz_I}n</th>
                  {haveManyHousekeepers && (
                    <th style={{ textAlign: 'start' }} class={'sortable extra-padding'} onClick={() => this.handleSort('housekeeper')}>
                      <div class={'d-flex align-items-center'} style={{ gap: '0.5rem' }}>
                        <span>{locales.entries.Lcz_Housekeeper}</span>
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
                  )}
                </tr>
              </thead>

              <tbody>
                {tasks.length === 0 && (
                  <tr class="ir-table-row">
                    <td colSpan={9} class="text-left">
                      <div style={{ height: '300px' }} class="d-flex align-items-center justify-content-center">
                        <span> {locales.entries.Lcz_NoTasksFound}</span>
                      </div>
                    </td>
                  </tr>
                )}
                {tasks?.map(task => {
                  const isSelected = hkTasksStore.selectedTasks.some(t => t.id === task.id);
                  const isCheckable = this.isCheckable(task);
                  return (
                    <tr
                      data-date={task.date}
                      data-testid={`hk_task_row`}
                      data-assigned={task.housekeeper ? 'true' : 'false'}
                      style={isCheckable && { cursor: 'pointer' }}
                      onClick={() => {
                        if (!isCheckable) {
                          return;
                        }
                        this.toggleSelection(task);
                      }}
                      class={{ 'selected': isSelected, 'task-table-row ir-table-row': true }}
                      key={task.id}
                    >
                      <td class="task-row ">{isCheckable && <ir-checkbox checked={isSelected}></ir-checkbox>}</td>
                      <td class="task-row extra-padding">{task.formatted_date}</td>
                      <td class="task-row extra-padding">
                        <span class={{ 'highlighted-unit': task.is_highlight }}>{task.unit.name}</span>
                      </td>
                      <td class="task-row extra-padding text-left">{task.status.description}</td>
                      <td class="task-row extra-padding text-left">{task.hint} aaa</td>
                      <td class="task-row text-left">{task.adult}</td>
                      <td class="task-row text-left">{task.child}</td>
                      <td class="task-row text-left">{task.infant}</td>
                      {haveManyHousekeepers && (
                        <td class=" task-row extra-padding" style={{ textAlign: 'start' }}>
                          {task.housekeeper ?? locales.entries.Lcz_Unassigned}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div class="mt-auto">
            <ir-tasks-table-pagination></ir-tasks-table-pagination>
          </div>
        </div>
      </Host>
    );
  }
}

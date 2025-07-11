import { Task, ArchivedTask } from '@/models/housekeeping';
import { createStore } from '@stencil/store';

export type TaskFilters = {
  cleaning_periods: { code: string };
  housekeepers: { id: number }[];
  cleaning_frequencies: { code: string };
  dusty_units: { code: string };
  highlight_check_ins: { code: string };
};

export type ArchiveFilters = {
  from_date: string;
  to_date: string;
  filtered_by_hkm?: number[];
  filtered_by_unit?: number[];
};

export type SortingState = {
  field: string;
  direction: 'ASC' | 'DESC';
};

export interface IHkTasksStore {
  searchField: string;
  tasks: Task[];
  filteredTasks: Task[];
  selectedTasks: Task[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
  filters: TaskFilters | null;
  isLoading: boolean;
  isFiltersLoading: boolean;
  isExportLoading: boolean;
  archiveOpen: boolean;
  archiveData: ArchivedTask[];
  archiveFilters: ArchiveFilters;
  archiveLoading: 'search' | 'excel' | null;
  sorting: SortingState;
  modalOpen: boolean;
  sidebarOpen: boolean;
}

const initialState: IHkTasksStore = {
  searchField: '',
  tasks: [],
  filteredTasks: [],
  selectedTasks: [],
  pagination: {
    currentPage: 1,
    pageSize: 10,
    totalPages: 0,
    totalItems: 0,
  },
  filters: null,
  isLoading: false,
  isFiltersLoading: false,
  isExportLoading: false,
  archiveOpen: false,
  archiveData: [],
  archiveFilters: {
    from_date: null,
    to_date: null,
    filtered_by_hkm: [],
    filtered_by_unit: [],
  },
  archiveLoading: null,
  sorting: {
    field: 'date',
    direction: 'ASC',
  },
  modalOpen: false,
  sidebarOpen: false,
};

export const { state: hkTasksStore, onChange } = createStore<IHkTasksStore>(initialState);

export function updateSearchField(searchField: string) {
  hkTasksStore.searchField = searchField;
  hkTasksStore.pagination.currentPage = 1;
  filterTasks();
}

export function updateTasks(tasks: Task[]) {
  hkTasksStore.tasks = tasks;
  filterTasks();
}

export function updatePageSize(pageSize: number) {
  hkTasksStore.pagination.pageSize = pageSize;
  hkTasksStore.pagination.currentPage = 1;
  updatePagination();
}

export function updateCurrentPage(page: number) {
  if (page >= 1 && page <= hkTasksStore.pagination.totalPages) {
    hkTasksStore.pagination.currentPage = page;
  }
}

function filterTasks() {
  const searchText = hkTasksStore?.searchField?.toLowerCase() ?? '';

  if (!searchText) {
    hkTasksStore.filteredTasks = [...hkTasksStore.tasks];
  } else {
    hkTasksStore.filteredTasks = hkTasksStore.tasks.filter(
      task =>
        task.unit?.name?.toLowerCase().includes(searchText) || task.status?.description?.toLowerCase().includes(searchText) || task.housekeeper?.toLowerCase().includes(searchText),
    );
  }

  updatePagination();
}

function updatePagination() {
  const totalItems = hkTasksStore.filteredTasks.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / hkTasksStore.pagination.pageSize));

  hkTasksStore.pagination = {
    ...hkTasksStore.pagination,
    totalItems,
    totalPages,
    currentPage: Math.min(hkTasksStore.pagination.currentPage, totalPages),
  };
}

export function getPaginatedTasks(): Task[] {
  const start = (hkTasksStore.pagination.currentPage - 1) * hkTasksStore.pagination.pageSize;
  const end = start + hkTasksStore.pagination.pageSize;
  return hkTasksStore.filteredTasks.slice(start, end);
}

export function resetHkTasksStore() {
  hkTasksStore.searchField = '';
  hkTasksStore.tasks = [];
  hkTasksStore.filteredTasks = [];
  hkTasksStore.selectedTasks = [];
  hkTasksStore.pagination = {
    currentPage: 1,
    pageSize: 10,
    totalPages: 0,
    totalItems: 0,
  };
  hkTasksStore.filters = null;
  hkTasksStore.isLoading = false;
  hkTasksStore.isFiltersLoading = false;
  hkTasksStore.isExportLoading = false;
  hkTasksStore.archiveOpen = false;
  hkTasksStore.archiveData = [];
  hkTasksStore.archiveFilters = {
    from_date: null,
    to_date: null,
    filtered_by_hkm: [],
    filtered_by_unit: [],
  };
  hkTasksStore.archiveLoading = null;
  hkTasksStore.sorting = {
    field: 'date',
    direction: 'ASC',
  };
  hkTasksStore.modalOpen = false;
  hkTasksStore.sidebarOpen = false;
}

// Task selection helpers
export function updateSelectedTasks(tasks: Task[]) {
  hkTasksStore.selectedTasks = tasks;
}

export function clearSelectedTasks() {
  hkTasksStore.selectedTasks = [];
}

export function toggleTaskSelection(task: Task) {
  const index = hkTasksStore.selectedTasks.findIndex(t => t.id === task.id);
  if (index > -1) {
    hkTasksStore.selectedTasks = hkTasksStore.selectedTasks.filter(t => t.id !== task.id);
  } else {
    hkTasksStore.selectedTasks = [...hkTasksStore.selectedTasks, task];
  }
}

export function selectAllTasks(tasks: Task[]) {
  hkTasksStore.selectedTasks = [...tasks];
}

// Filter helpers
export function updateFilters(filters: TaskFilters) {
  hkTasksStore.filters = filters;
}

export function clearFilters() {
  hkTasksStore.filters = null;
}

// Loading state helpers
export function setLoading(loading: boolean) {
  hkTasksStore.isLoading = loading;
}

export function setFiltersLoading(loading: boolean) {
  hkTasksStore.isFiltersLoading = loading;
}

export function setExportLoading(loading: boolean) {
  hkTasksStore.isExportLoading = loading;
}

// Sorting helpers
export function updateSorting(field: string, direction: 'ASC' | 'DESC') {
  hkTasksStore.sorting = { field, direction };
  updateTasks(getSortedTasks());
}

export function getSortedTasks(): Task[] {
  const { field, direction } = hkTasksStore.sorting;
  return [...hkTasksStore.filteredTasks].sort((a, b) => {
    let aValue = a[field];
    let bValue = b[field];

    if (field === 'status') {
      aValue = a.status?.description;
      bValue = b.status?.description;
    } else if (field === 'unit') {
      aValue = a.unit?.name;
      bValue = b.unit?.name;
    }

    if (aValue < bValue) return direction === 'ASC' ? -1 : 1;
    if (aValue > bValue) return direction === 'ASC' ? 1 : -1;

    // Fallback sorting by date then unit name
    if (a.date < b.date) return -1;
    if (a.date > b.date) return 1;
    if (a.unit?.name < b.unit?.name) return -1;
    if (a.unit?.name > b.unit?.name) return 1;

    return 0;
  });
}

// Archive helpers
export function setArchiveOpen(open: boolean) {
  hkTasksStore.archiveOpen = open;
}

export function updateArchiveData(data: ArchivedTask[]) {
  hkTasksStore.archiveData = data;
}

export function updateArchiveFilters(filters: Partial<ArchiveFilters>) {
  hkTasksStore.archiveFilters = { ...hkTasksStore.archiveFilters, ...filters };
}

export function setArchiveLoading(loading: 'search' | 'excel' | null) {
  hkTasksStore.archiveLoading = loading;
}

// Modal and sidebar helpers
export function setModalOpen(open: boolean) {
  hkTasksStore.modalOpen = open;
}

export function setSidebarOpen(open: boolean) {
  hkTasksStore.sidebarOpen = open;
}

// Computed getters
export function getCheckableTasks(): Task[] {
  return hkTasksStore.tasks.filter(task => {
    const taskDate = new Date(task.date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return taskDate <= today;
  });
}

export function getSelectedTasksCount(): number {
  return hkTasksStore.selectedTasks.length;
}

export function isAllTasksSelected(): boolean {
  const checkableTasks = getCheckableTasks();
  return checkableTasks.length > 0 && hkTasksStore.selectedTasks.length === checkableTasks.length;
}

export function getTasksByStatus(status: string): Task[] {
  return hkTasksStore.tasks.filter(task => task.status?.description === status);
}

export function getTasksByHousekeeper(housekeeperId: number): Task[] {
  return hkTasksStore.tasks.filter(task => task.hkm_id === housekeeperId);
}

export function getTasksByUnit(unitId: number): Task[] {
  return hkTasksStore.tasks.filter(task => task.unit?.id === unitId);
}

// Utility helpers
export function updateStoreProperty<K extends keyof IHkTasksStore>(key: K, value: IHkTasksStore[K]) {
  hkTasksStore[key] = value;
}

export function getStoreSnapshot(): IHkTasksStore {
  return { ...hkTasksStore };
}

export default hkTasksStore;

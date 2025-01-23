import { createStore } from '@stencil/store';
import { type RowData, type TableOptions, type TableOptionsResolved, createTable } from '@tanstack/table-core';

export const flexRender = <TProps extends object>(comp: any, props: TProps) => {
  if (typeof comp === 'function') {
    return comp(props);
  }
  return comp;
};

export const useTable = <TData extends RowData>(options: TableOptions<TData>) => {
  // Compose in the generic options to the user options
  const resolvedOptions: TableOptionsResolved<TData> = {
    state: {}, // Dummy state
    onStateChange: () => {}, // noop
    renderFallbackValue: null,
    ...options,
  };

  // Create a new table
  const table = createTable<TData>(resolvedOptions);

  // By default, manage table state here using the table's initial state
  const { state } = createStore(table.initialState);

  // Subscribe to state changes
  const setState = (updater: any) => {
    if (typeof updater === 'function') {
      const newState = updater(state);
      Object.assign(state, newState);
    } else {
      Object.assign(state, updater);
    }
    options.onStateChange?.(updater);
  };

  table.setOptions(prev => ({
    ...prev,
    ...options,
    state,
    onStateChange: setState,
  }));

  return table;
};

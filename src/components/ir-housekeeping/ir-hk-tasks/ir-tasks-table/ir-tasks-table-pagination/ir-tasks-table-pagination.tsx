import hkTasksStore, { loadMoreTasks, shouldLoadMore, updateCurrentPage, updatePageSize } from '@/stores/hk-tasks.store';
import { Component, h, Host } from '@stencil/core';

@Component({
  tag: 'ir-tasks-table-pagination',
  styleUrl: 'ir-tasks-table-pagination.css',
  scoped: true,
})
export class IrTasksTablePagination {
  render() {
    const { currentPage, pageSize, totalPages, mobileCurrentPage } = hkTasksStore.pagination;
    const totalTasks = hkTasksStore.tasks?.length ?? 0;
    const start = totalTasks === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalTasks);
    const pageSizes =
      hkTasksStore.pagination.tasksList[0] > totalTasks ? hkTasksStore.pagination.tasksList.slice(0, 1) : hkTasksStore.pagination.tasksList?.filter(t => t <= totalTasks);
    return (
      <Host>
        {shouldLoadMore() && <ir-button size="sm" class="tasks-load-more" text="Load more" onClickHandler={() => loadMoreTasks(mobileCurrentPage + 1)}></ir-button>}
        <ir-pagination
          showing={{
            from: start,
            to: end,
          }}
          class="tasks-pagination"
          total={totalTasks}
          pages={totalPages}
          pageSize={pageSize}
          currentPage={currentPage}
          pageSizes={pageSizes}
          onPageChange={e => updateCurrentPage(e.detail.currentPage)}
          onPageSizeChange={e => updatePageSize(e.detail.pageSize)}
          showTotalRecords={true}
          recordLabel="tasks"
        ></ir-pagination>
      </Host>
    );
  }
}

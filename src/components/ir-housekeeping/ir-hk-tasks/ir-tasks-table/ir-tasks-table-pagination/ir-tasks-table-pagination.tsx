import hkTasksStore, { updateCurrentPage, updatePageSize } from '@/stores/hk-tasks.store';
import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-tasks-table-pagination',
  styleUrl: 'ir-tasks-table-pagination.css',
  scoped: true,
})
export class IrTasksTablePagination {
  render() {
    return (
      <Host class="d-flex align-items-center mt-auto justify-content-between pagination-container" style={{ gap: '0.5rem' }}>
        {(() => {
          const { currentPage, pageSize } = hkTasksStore.pagination;
          const totalTasks = hkTasksStore.tasks?.length ?? 0;
          const start = totalTasks === 0 ? 0 : (currentPage - 1) * pageSize + 1;
          const end = Math.min(currentPage * pageSize, totalTasks);
          return <p class="p-0 m-0">{totalTasks === 0 ? 'No tasks to show' : `Showing ${start} - ${end} of ${totalTasks}`}</p>;
        })()}
        <div class="d-flex align-items-center mt-auto justify-content-end pagination-container" style={{ gap: '0.5rem' }}>
          <ir-select
            selectedValue={String(hkTasksStore.pagination.pageSize)}
            LabelAvailable={false}
            data={hkTasksStore.pagination.tasksList.map(size => ({
              text: `${size} tasks`,
              value: String(size),
            }))}
            showFirstOption={false}
            style={{ margin: '0 0.5rem' }}
            onSelectChange={e => updatePageSize(Number(e.detail))}
          ></ir-select>
          {hkTasksStore.pagination.totalPages > 1 && (
            <nav aria-label="Page navigation example" class="m-0">
              <ul class="pagination m-0">
                <li class={`page-item${hkTasksStore.pagination.currentPage === 1 ? ' disabled' : ''}`}>
                  <a
                    class="page-link"
                    href="#"
                    aria-label="Previous"
                    onClick={e => {
                      e.preventDefault();
                      updateCurrentPage(hkTasksStore.pagination.currentPage - 1);
                    }}
                  >
                    <span aria-hidden="true">&laquo;</span>
                    <span class="sr-only">Previous</span>
                  </a>
                </li>
                {Array.from({ length: hkTasksStore.pagination.totalPages }, (_, i) => i + 1).map(page => {
                  return (
                    <li class={`page-item ${hkTasksStore.pagination.currentPage === page ? 'active' : ''}`} key={`page-${page}`}>
                      <a
                        class="page-link"
                        href="#"
                        onClick={e => {
                          e.preventDefault();
                          updateCurrentPage(page);
                        }}
                      >
                        {page}
                      </a>
                    </li>
                  );
                })}
                <li class={`page-item${hkTasksStore.pagination.currentPage === hkTasksStore.pagination.totalPages ? ' disabled' : ''}`}>
                  <a
                    class="page-link"
                    href="#"
                    aria-label="Next"
                    onClick={e => {
                      e.preventDefault();
                      updateCurrentPage(hkTasksStore.pagination.currentPage + 1);
                    }}
                  >
                    <span aria-hidden="true">&raquo;</span>
                    <span class="sr-only">Next</span>
                  </a>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </Host>
    );
  }
}

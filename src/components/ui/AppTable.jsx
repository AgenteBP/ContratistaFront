import React from 'react';
import { DataTable } from 'primereact/datatable';

/**
 * AppTable Component
 * 
 * A wrapper around PrimeReact DataTable with standard project styling.
 * 
 * @param {object} props - Pass all standard DataTable props here.
 * @param {array} props.value - Data to display.
 * @param {ReactNode} props.header - Header content (e.g., search bars).
 * @param {ReactNode} props.children - Column components.
 */
const AppTable = (props) => {
    const {
        value,
        header,
        children,
        emptyMessage = "No se encontraron datos.",
        sortMode = "multiple",
        ...rest
    } = props;

    const handleRowClick = (e) => {
        // 1. Call user defined onRowClick if exists
        if (rest.onRowClick) {
            rest.onRowClick(e);
        }

        // 2. Mobile Tap-to-Expand Logic (Global)
        // Check if we have expansion capabilities props
        if (window.innerWidth < 768 && props.onRowToggle && props.expandedRows !== undefined) {
            // Avoid toggling if clicking on interactive elements
            if (e.originalEvent.target.closest('button') ||
                e.originalEvent.target.closest('a') ||
                e.originalEvent.target.closest('.p-checkbox') ||
                e.originalEvent.target.closest('.p-column-filter') ||
                e.originalEvent.target.closest('.p-row-toggler')) {
                return;
            }

            // SKIP if expandedRows is an Array (Row Grouping Mode uses Arrays, Mobile Expansion uses Object Map)
            if (Array.isArray(props.expandedRows)) {
                return;
            }

            const dataKey = props.dataKey || 'id';
            const rowId = e.data[dataKey]; // PrimeReact usually keys by ID or dataKey

            // Clone existing expanded state (PrimeReact uses object map { id: true })
            let _expandedRows = { ...(props.expandedRows || {}) };

            if (_expandedRows[rowId]) {
                delete _expandedRows[rowId];
            } else {
                _expandedRows[rowId] = true;
            }

            // Propagate change
            props.onRowToggle({ originalEvent: e.originalEvent, data: _expandedRows });
        }
    };

    return (
        <div className="bg-white border border-secondary/20 rounded-xl shadow-sm w-full overflow-hidden">
            {header}
            <DataTable
                value={value}
                paginator
                rows={5}
                rowsPerPageOptions={[5, 10, 25, 50]}
                emptyMessage={emptyMessage}
                sortMode={sortMode}
                removableSort
                size="small"
                stripedRows
                tableClassName="w-full text-sm text-left text-secondary"
                onRowClick={handleRowClick}
                pt={{
                    wrapper: { className: 'overflow-x-auto' }, // SCROLL ONLY DATA
                    thead: { className: 'text-xs text-secondary-dark uppercase bg-secondary-light border-b border-secondary/20' },
                    headerCell: { className: 'px-3 py-2.5 font-bold hover:bg-white transition-colors cursor-pointer focus:shadow-none align-top group' },
                    bodyRow: ({ context }) => ({ className: `border-b border-secondary/10 transition-colors cursor-pointer bg-white` }), // FORCE SOLID BG
                    bodyCell: { className: 'px-3 py-2.5 align-middle text-secondary-dark' },
                    paginator: {
                        root: { className: 'flex justify-between items-center p-2 border-t border-secondary/20 text-xs text-secondary' },
                        current: { className: 'h-8 leading-8' },
                        RPPDropdown: {
                            root: { className: 'h-7 text-xs flex items-center bg-white border border-secondary/30 rounded ml-2 focus:ring-2 focus:ring-primary/50' },
                            input: { className: 'p-1 text-xs font-medium text-secondary-dark' },
                            trigger: { className: 'w-6 flex items-center justify-center text-secondary' },
                            panel: { className: 'text-xs bg-white border border-secondary/20 shadow-lg rounded-md p-0' },
                            item: { className: 'p-1.5 hover:bg-secondary-light cursor-pointer text-xs text-secondary-dark' },
                            wrapper: { className: 'max-h-[200px]' }
                        }
                    }
                }}
                {...rest}
            >
                {children}
            </DataTable>
        </div>
    );
};

export default AppTable;

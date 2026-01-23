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

    return (
        <div className="bg-white border border-secondary/20 rounded-xl shadow-sm overflow-hidden w-full">
            <DataTable
                value={value}
                header={header}
                paginator
                rows={5}
                rowsPerPageOptions={[5, 10, 25, 50]}
                emptyMessage={emptyMessage}
                sortMode={sortMode}
                removableSort
                size="small"
                stripedRows
                tableClassName="w-full text-sm text-left text-secondary"
                pt={{
                    thead: { className: 'text-xs text-secondary-dark uppercase bg-secondary-light border-b border-secondary/20' },
                    headerCell: { className: 'px-3 py-2.5 font-bold hover:bg-white transition-colors cursor-pointer focus:shadow-none align-top group' },
                    bodyRow: ({ context }) => ({ className: `border-b border-secondary/10 transition-colors` }),
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

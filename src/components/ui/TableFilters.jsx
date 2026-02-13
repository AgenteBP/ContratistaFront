import React, { useState } from 'react';
import { Sidebar } from 'primereact/sidebar';
import { FilterMatchMode } from 'primereact/api';
import { InputText } from 'primereact/inputtext';
import Dropdown from './Dropdown';

const TableFilters = ({
    filters: propFilters = {},
    setFilters,
    globalFilterValue,
    onGlobalFilterChange,
    config = [], // { label, value (key in filters), options, placeholder }
    totalItems = 0,
    filteredItems = null,
    itemName = 'ÍTEMS',
    topRightContent = null
}) => {
    const [isFiltersVisible, setIsFiltersVisible] = useState(false);

    // Safeguard to ensure filters is always an object even if null is passed
    const filters = propFilters || {};

    // Helper to check if a specific filter is active (not null/empty)
    const isFilterActive = (key) => {
        const filter = filters[key];
        return filter && filter.value !== null && filter.value !== '' && filter.value !== undefined;
    };

    // Helper to clear a specific filter
    const clearFilter = (key) => {
        const _filters = { ...filters };
        if (_filters[key]) {
            _filters[key].value = null;
            setFilters(_filters);
        }
    };

    // Helper to check if ANY filter (except global) is active
    const areFiltersActive = () => {
        if (!config || config.length === 0) return false;
        return config.some(c => isFilterActive(c.value));
    };

    const clearAllFilters = () => {
        const _filters = { ...filters };
        config.forEach(c => {
            if (_filters[c.value]) {
                _filters[c.value].value = null;
            }
        });
        _filters['global'].value = '';
        if (onGlobalFilterChange) {
            onGlobalFilterChange({ target: { value: '' } });
        }
        setFilters(_filters);
    };

    // Standard styling for inputs/dropdowns from the project
    const dropdownPt = {
        root: { className: 'w-full md:w-48 bg-white border border-secondary/30 rounded-lg h-9 flex items-center focus-within:ring-2 focus-within:ring-primary/50 shadow-sm transition-all' },
        input: { className: 'text-xs px-3 text-secondary-dark font-medium uppercase' },
        trigger: { className: 'w-8 text-secondary flex items-center justify-center border-l border-secondary/10' },
        panel: { className: 'text-xs bg-white border border-secondary/10 shadow-xl rounded-lg mt-1' },
        item: { className: 'p-2.5 hover:bg-secondary-light text-secondary-dark transition-colors' },
        list: { className: 'p-1' }
    };

    const displayCount = filteredItems !== null && filteredItems !== undefined ? filteredItems : totalItems;

    return (
        <div className="bg-white border-b border-secondary/10 px-4 py-3 space-y-3 animate-fade-in relative z-20">
            {/* Top Row: Search and Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex items-center gap-2 w-full lg:w-auto">
                    <div className="flex-1 min-w-[300px] relative group/search">
                        <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-secondary/40 text-xs transition-colors group-focus-within/search:text-primary"></i>
                        <InputText
                            value={globalFilterValue}
                            onChange={onGlobalFilterChange}
                            className="bg-secondary-light/40 border border-secondary/20 text-secondary-dark text-xs rounded-lg focus:ring-1 focus:ring-primary/20 focus:border-primary/50 block w-full ps-9 pe-9 p-2 outline-none transition-all placeholder:text-secondary/40 h-9"
                            placeholder="Buscar..."
                        />
                        {globalFilterValue && (
                            <button
                                onClick={() => onGlobalFilterChange({ target: { value: '' } })}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-secondary/40 hover:text-danger transition-colors"
                                title="Limpiar búsqueda"
                            >
                                <i className="pi pi-times text-[10px]"></i>
                            </button>
                        )}
                    </div>

                    {/* Filtros Toggle Button (Visible only on < lg) - Opens Drawer */}
                    <button
                        onClick={() => setIsFiltersVisible(true)}
                        className={`lg:hidden h-9 px-4 rounded-lg border transition-all flex items-center justify-center gap-2 text-xs font-bold shadow-sm ${areFiltersActive()
                            ? 'bg-primary/10 text-primary border-primary/30'
                            : 'bg-white text-secondary-dark border-secondary/30 hover:bg-secondary-light/60 active:scale-95'
                            }`}
                        title="Abrir Filtros"
                    >
                        <i className={`pi pi-filter ${areFiltersActive() ? 'text-primary' : 'text-secondary'}`}></i>
                        <span className="hidden sm:inline uppercase tracking-wider">Filtros</span>
                        {areFiltersActive() && (
                            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse ml-0.5"></span>
                        )}
                    </button>
                </div>

                {/* Optional Top Right Content (Buttons etc) */}
                {topRightContent && (
                    <div className="flex items-center gap-2 self-end lg:self-auto">
                        {topRightContent}
                    </div>
                )}
            </div>

            {/* Desktop Filters (Hidden on Mobile) */}
            <div className="hidden lg:grid grid-cols-[80px_1fr_auto] border border-secondary/10 rounded-xl overflow-hidden mt-4 bg-white shadow-sm">
                {/* 1. Label Section - Centered unified vertical block */}
                <div className="bg-secondary-light/20 border-r border-secondary/10 flex flex-col items-center justify-center p-3 w-20">
                    <i className="pi pi-filter text-[12px] text-primary/60 mb-1.5"></i>
                    <span className="text-[9px] text-secondary/60 font-black uppercase tracking-[0.2em] leading-none text-center">Filtros</span>
                </div>

                {/* 2. Filters Grid (Ultra-Fluid Flex Layout - Aesthetic & Stable) */}
                <div className="flex flex-wrap items-stretch bg-white min-w-0 flex-1 border-r border-secondary/10">
                    {config.map((c) => (
                        <div key={c.value} className="flex-1 basis-1/3 min-w-[200px] p-3 border-r border-b border-secondary/10 group/filter relative hover:bg-secondary-light/10 transition-colors flex flex-col justify-center h-14">
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-[10px] text-secondary/40 font-bold uppercase tracking-wider leading-none">
                                    {c.label}
                                </label>
                                <div className="w-4 h-4 flex items-center justify-end -mr-1">
                                    {isFilterActive(c.value) && (
                                        <button
                                            className="text-primary hover:text-red-600 transition-all duration-200 p-0.5"
                                            onClick={() => clearFilter(c.value)}
                                            title={`Limpiar ${c.label}`}
                                        >
                                            <i className="pi pi-times text-[10px] font-bold"></i>
                                        </button>
                                    )}
                                </div>
                            </div>
                            <Dropdown
                                value={filters[c.value]?.value}
                                options={c.options}
                                onChange={(e) => {
                                    let _filters = { ...filters };
                                    if (!_filters[c.value]) {
                                        _filters[c.value] = { value: null, matchMode: FilterMatchMode.EQUALS };
                                    }
                                    _filters[c.value].value = e.value;
                                    setFilters(_filters);
                                }}
                                placeholder="Seleccionar"
                                pt={{
                                    ...dropdownPt,
                                    root: { className: 'w-full bg-transparent border-none h-6 flex items-center focus-within:ring-0 shadow-none' },
                                    input: {
                                        className: `text-[11px] px-0 uppercase leading-none transition-all duration-200 truncate ${isFilterActive(c.value)
                                            ? 'text-secondary-dark font-black underline decoration-primary/30 underline-offset-4'
                                            : 'text-secondary-dark/40 font-bold'}`
                                    },
                                    trigger: { className: 'w-4 text-secondary/40 flex items-center justify-center' },
                                    panel: { className: 'text-xs bg-white border border-secondary/10 shadow-2xl rounded-xl mt-1' }
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* 3. Global Actions Section - Integrated & Minimalist */}
                <div className="bg-secondary-light/5 flex items-center justify-center px-8 min-w-[150px] relative">
                    {/* Subtle left divider indicator */}
                    <div className="absolute left-0 top-3 bottom-3 w-px bg-secondary/10"></div>

                    <div className="flex flex-col items-center py-2">
                        <div className="flex flex-col items-center mb-1">
                            <span className="text-[15px] font-black text-secondary-dark tracking-widest leading-none">
                                {displayCount}
                            </span>
                            <span className="text-[8px] text-secondary/40 font-bold uppercase tracking-[0.2em] mt-1 whitespace-nowrap">
                                {itemName}
                            </span>
                        </div>

                        {(areFiltersActive() || globalFilterValue) && (
                            <button
                                onClick={clearAllFilters}
                                className="mt-1 pt-2 border-t border-secondary/10 w-full text-danger hover:text-red-700 font-bold transition-all flex items-center justify-center gap-1.5 uppercase text-[8px] tracking-[0.15em] group/clear active:scale-95"
                                title="Limpiar todos los filtros"
                            >
                                <i className="pi pi-filter-slash text-[9px]"></i>
                                <span className="hidden xl:inline">Limpiar Filtros</span>
                                <span className="xl:hidden">Limpiar</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Filter Sidebar (Top Position) - Using robust PrimeReact Sidebar */}
            <Sidebar
                visible={isFiltersVisible}
                onHide={() => setIsFiltersVisible(false)}
                position="top"
                header={(
                    <div className="flex items-center gap-2 text-primary tracking-[0.2em]">
                        <i className="pi pi-filter text-xs"></i>
                        <span className="text-[11px] font-black uppercase">Filtros</span>
                    </div>
                )}
                blockScroll={true}
                className="lg:hidden"
                style={{ height: 'auto', maxHeight: '85vh', borderBottomLeftRadius: '1.5rem', borderBottomRightRadius: '1.5rem' }}
                pt={{
                    root: { className: 'bg-white shadow-2xl border-b border-secondary/10 flex flex-col p-0 overflow-hidden rounded-b-3xl' },
                    header: { className: 'px-5 py-4 border-b border-secondary/5 bg-white text-primary flex items-center justify-between' },
                    closeButton: { className: 'text-primary hover:bg-primary/10 w-8 h-8 rounded-full transition-all' },
                    closeIcon: { className: 'text-xl font-bold' },
                    content: { className: 'p-0 flex flex-col flex-1 overflow-hidden' }
                }}
            >
                {/* Body - Scrollable with clearance for sticky footer */}
                <div className="flex-1 px-5 py-6 overflow-y-auto space-y-6 pb-28">
                    {config.map((c) => (
                        <div key={c.value}>
                            <label className="text-[10px] font-bold text-secondary/60 mb-1.5 block uppercase tracking-widest ml-1">
                                {c.label}
                            </label>
                            <Dropdown
                                value={filters[c.value]?.value}
                                options={c.options}
                                onChange={(e) => {
                                    let _filters = { ...filters };
                                    if (!_filters[c.value]) {
                                        _filters[c.value] = { value: null, matchMode: FilterMatchMode.EQUALS };
                                    }
                                    _filters[c.value].value = e.value;
                                    setFilters(_filters);
                                }}
                                placeholder={`Seleccionar`}
                                appendTo={document.body}
                                baseZIndex={6000}
                                panelStyle={{ zIndex: 6000 }}
                                pt={{
                                    root: { className: 'w-full bg-white border border-secondary/20 rounded-xl h-11 flex items-center focus-within:ring-2 focus-within:ring-primary/40 shadow-sm' },
                                    input: { className: 'text-sm px-4 text-secondary-dark font-medium uppercase' },
                                    item: { className: 'text-sm p-3.5 hover:bg-secondary-light text-secondary-dark transition-colors uppercase font-medium' },
                                    panel: { className: 'bg-white border border-secondary/10 shadow-2xl rounded-xl mt-1 overflow-hidden' }
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Footer - Actions (Fixed at Bottom) */}
                <div className="p-4 border-t border-secondary/10 bg-white flex gap-3 safe-area-bottom absolute bottom-0 left-0 right-0 z-30 rounded-b-3xl">
                    {(areFiltersActive() || globalFilterValue) && (
                        <button
                            onClick={clearAllFilters}
                            className="flex-1 py-3 px-4 rounded-xl border border-secondary/20 text-secondary-dark font-bold text-xs hover:bg-secondary-light transition-colors uppercase tracking-wide flex items-center justify-center gap-2"
                        >
                            <i className="pi pi-filter-slash text-xs"></i> Limpiar Filtros
                        </button>
                    )}
                    <button
                        onClick={() => setIsFiltersVisible(false)}
                        className="flex-1 py-3 px-4 rounded-xl bg-primary text-white font-bold text-xs shadow-md shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95 uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                        <span>Aplicar</span>
                        <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] min-w-[20px] text-center">
                            {displayCount}
                        </span>
                    </button>
                </div>
            </Sidebar>
        </div >
    );
};

export default TableFilters;

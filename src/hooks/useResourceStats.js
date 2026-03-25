import { useMemo } from 'react';
import { useEmployees } from './useEmployees';
import { useVehicles } from './useVehicles';
import { useMachinery } from './useMachinery';

const HABILITADO_STATUSES = ['COMPLETA', 'VIGENTE', 'APROBADO'];

const computeStats = (items) => {
    const total          = items.length;
    const habilitados    = items.filter(r => HABILITADO_STATUSES.includes(r.docStatus)).length;
    const enRevision     = items.filter(r => r.docStatus === 'EN_REVISION').length;
    const conObservacion = items.filter(r => r.docStatus === 'CON_OBSERVACION').length;
    const vencidos       = items.filter(r => r.docStatus === 'VENCIDO').length;
    const docPendiente   = total - habilitados - enRevision - conObservacion - vencidos;
    const pct            = total > 0 ? Math.round((habilitados / total) * 100) : 0;
    const providerCount  = new Set(items.map(r => r.proveedor).filter(Boolean)).size;
    return { total, habilitados, enRevision, conObservacion, vencidos, docPendiente, pct, providerCount };
};

export const useResourceStats = (explicitIdSupplier = null) => {
    const { employees, loading: loadingEmp } = useEmployees(explicitIdSupplier);
    const { vehicles,  loading: loadingVeh } = useVehicles(explicitIdSupplier);
    const { machinery, loading: loadingMac } = useMachinery(explicitIdSupplier);

    const loading = loadingEmp || loadingVeh || loadingMac;

    const stats = useMemo(() => ({
        employees: computeStats(employees),
        vehicles:  computeStats(vehicles),
        machinery: computeStats(machinery),
    }), [employees, vehicles, machinery]);

    const suppliersWithReview = useMemo(() => {
        const all = [...employees, ...vehicles, ...machinery];
        return new Set(
            all.filter(r => r.docStatus === 'EN_REVISION').map(r => r.proveedor).filter(Boolean)
        ).size;
    }, [employees, vehicles, machinery]);

    const totalProviders = useMemo(() => {
        const all = [...employees, ...vehicles, ...machinery];
        return new Set(all.map(r => r.proveedor).filter(Boolean)).size;
    }, [employees, vehicles, machinery]);

    return { stats, loading, suppliersWithReview, totalProviders };
};

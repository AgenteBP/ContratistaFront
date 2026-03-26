import { useMemo } from 'react';
import { useEmployees } from './useEmployees';
import { useVehicles } from './useVehicles';
import { useMachinery } from './useMachinery';

const HABILITADO_STATUSES = ['COMPLETA', 'VIGENTE', 'APROBADO', 'SIN_REQUISITOS', 'HABILITADO'];
const PENDIENTE_STATUSES = ['PENDIENTE', 'INCOMPLETA', 'FALTANTE', 'VENCIDO', 'CON_OBSERVACION', 'OBSERVADO', 'RECHAZADO', 'NO HABILITADO', 'NO_HABILITADO'];

const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);
const TEN_DAYS_FROM_NOW = new Date(TODAY);
TEN_DAYS_FROM_NOW.setDate(TEN_DAYS_FROM_NOW.getDate() + 10);

const parseExpirationDate = (raw) => {
    if (!raw) return null;
    try {
        const match = String(raw).match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (!match) return null;
        const d = new Date(+match[1], +match[2] - 1, +match[3]);
        d.setHours(0, 0, 0, 0);
        return d;
    } catch { return null; }
};

const computeStats = (items) => {
    const total          = items.length;
    const habilitados    = items.filter(r => HABILITADO_STATUSES.includes(r.docStatus)).length;
    const enRevision     = items.filter(r => r.docStatus === 'EN_REVISION').length;
    const conObservacion = items.filter(r => ['CON_OBSERVACION', 'OBSERVADO', 'RECHAZADO'].includes(r.docStatus)).length;
    const vencidos       = items.filter(r => r.docStatus === 'VENCIDO').length;
    const docPendiente   = items.filter(r => PENDIENTE_STATUSES.includes(r.docStatus)).length;
    const expiringSoon   = items.filter(r => {
        if (r.docStatus === 'VENCIDO') return false;
        const exp = parseExpirationDate(r.expirationDate);
        return exp !== null && exp >= TODAY && exp <= TEN_DAYS_FROM_NOW;
    }).length;
    const pct            = total > 0 ? Math.round((habilitados / total) * 100) : 0;
    const providerCount  = new Set(items.map(r => r.proveedor).filter(Boolean)).size;
    return { total, habilitados, enRevision, conObservacion, vencidos, docPendiente, expiringSoon, pct, providerCount };
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

import React, { createContext, useContext } from 'react';
import type { Tenant } from '../types/tenant';

interface TenantContextValue {
  tenant: Tenant | null;
}

const TenantContext = createContext<TenantContextValue>({ tenant: null });

export function TenantProvider({
  tenant,
  children,
}: {
  tenant: Tenant | null;
  children: React.ReactNode;
}) {
  // Apply primary color CSS variable from tenant theme_config
  React.useEffect(() => {
    if (tenant?.theme_config?.primary_color) {
      document.documentElement.style.setProperty(
        '--color-primary',
        tenant.theme_config.primary_color as string
      );
    }
    if (tenant?.theme_config?.font) {
      document.documentElement.style.setProperty(
        '--font-body',
        `${tenant.theme_config.font}, sans-serif`
      );
    }
  }, [tenant]);

  return (
    <TenantContext.Provider value={{ tenant }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  return useContext(TenantContext);
}

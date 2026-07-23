import { Receipt, AlertCircle, Settings } from "lucide-react";

export default function FacturacionConfigPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-white">Facturación electrónica</h1>
      <p className="mt-1 text-sm text-slate-400">
        Integración con proveedores de facturación CFDI.
      </p>

      <div className="mt-8 space-y-6">
        {/* Status */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-slate-800">
              <Receipt className="size-5 text-slate-500" />
            </div>
            <div>
              <h2 className="font-semibold text-white">Integración no configurada</h2>
              <p className="text-sm text-slate-400">
                La facturación electrónica requiere credenciales de un proveedor compatible.
              </p>
            </div>
          </div>
        </div>

        {/* Supported providers */}
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
            <Settings className="size-5 text-cyanx" />
            Proveedores compatibles
          </h2>
          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <h3 className="font-medium text-white">Factura.com</h3>
              <p className="mt-1 text-sm text-slate-400">Plataforma de facturación electrónica CFDI 4.0.</p>
              <p className="mt-2 text-xs text-slate-500">Variables: BILLING_PROVIDER=factura_com, BILLING_API_KEY, BILLING_API_SECRET</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <h3 className="font-medium text-white">Konta.com</h3>
              <p className="mt-1 text-sm text-slate-400">Servicio contable con emisión de CFDI.</p>
              <p className="mt-2 text-xs text-slate-500">Variables: BILLING_PROVIDER=konta, BILLING_API_KEY, BILLING_API_SECRET</p>
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-400" />
          <div>
            <h3 className="font-medium text-amber-200">Antes de habilitar</h3>
            <ul className="mt-2 space-y-1 text-sm text-amber-100/70">
              <li>1. Obtener credenciales del proveedor (API key/secret)</li>
              <li>2. Configurar ambiente sandbox para pruebas</li>
              <li>3. Verificar datos fiscales de la empresa (RFC, régimen)</li>
              <li>4. Confirmar estructura CFDI 4.0 requerida</li>
              <li>5. Configurar certificados CSD si el proveedor lo requiere</li>
              <li>6. Probar emisión en sandbox antes de producción</li>
            </ul>
          </div>
        </div>

        {/* Manual marking */}
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white">Mientras tanto</h2>
          <p className="mt-2 text-sm text-slate-400">
            Sin proveedor configurado, puedes marcar manualmente una cotización como facturada y
            capturar el folio fiscal externo desde la vista de cotización.
          </p>
        </div>
      </div>
    </div>
  );
}

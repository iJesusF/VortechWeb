import { Activity, ArrowRight, Building2, CheckCircle2, CircuitBoard, Cloud, Droplets, Gauge, ShieldCheck } from "lucide-react";
import { Header } from "@/components/header";
import { Reveal } from "@/components/motion";
import { TechnicalVisual } from "@/components/technical-visual";
import { siteConfig } from "@/lib/site-config";

const metrics = [
  { title: "Automatización integral", icon: CircuitBoard },
  { title: "Monitoreo en tiempo real", icon: Activity },
  { title: "Integración PLC + Cloud", icon: Cloud },
  { title: "Soluciones llave en mano", icon: ShieldCheck },
];

const services = [
  {
    title: "Automatización de edificios",
    text: "Control HVAC, iluminación, sensores, monitoreo energético, integración BMS y optimización operativa.",
    icon: Building2,
  },
  {
    title: "Programación PLC y fabricación de equipos integrales",
    text: "Desarrollo de lógica de control, tableros, integración HMI/SCADA, pruebas y puesta en marcha.",
    icon: CircuitBoard,
  },
  {
    title: "Tratamiento de agua",
    text: "Sistemas de ósmosis inversa, ultrafiltración, microfiltración, EDI, PTAR y soluciones para agua de proceso.",
    icon: Droplets,
  },
  {
    title: "Medición de utilities y nube",
    text: "Medición de agua, energía, aire comprimido, vapor u otros servicios críticos con publicación de datos en dashboards cloud.",
    icon: Gauge,
  },
];

const problems = [
  "Falta de visibilidad operativa",
  "Consumo elevado de energía o utilities",
  "Procesos manuales o poco confiables",
  "Equipos sin integración",
  "Datos aislados",
  "Fallas difíciles de diagnosticar",
];

const timeline = [
  "Diagnóstico técnico",
  "Ingeniería y selección de tecnología",
  "Programación / fabricación",
  "Instalación e integración",
  "Puesta en marcha",
  "Soporte y optimización",
];

const techTags = ["PLC", "HMI", "SCADA", "BMS", "IoT Industrial", "Cloud Dashboards", "Sensores", "Medidores", "RO", "UF", "MF", "EDI", "PTAR", "Data Logging", "Remote Monitoring"];

function SectionHeading({ eyebrow, title, copy }: { eyebrow: string; title: string; copy?: string }) {
  return (
    <Reveal>
      <span className="section-eyebrow">{eyebrow}</span>
      <h2 className="section-title">{title}</h2>
      {copy ? <p className="section-copy">{copy}</p> : null}
    </Reveal>
  );
}

export default function Home() {
  return (
    <>
      <Header />
      <main id="inicio" className="overflow-hidden">
        <section className="relative pt-32 sm:pt-40 lg:pt-44">
          <div className="absolute inset-x-0 top-20 h-px bg-gradient-to-r from-transparent via-cyanx/60 to-transparent" />
          <div className="container-shell grid items-center gap-12 pb-20 lg:grid-cols-[1.02fr_.98fr] lg:pb-28">
            <Reveal>
              <div className="max-w-3xl">
                <span className="section-eyebrow">Ingeniería · Control · Agua · Datos</span>
                <h1 className="text-4xl font-black leading-[1.02] tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl">
                  Automatización, control y tratamiento de agua para operaciones inteligentes
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                  Integramos sistemas de automatización, PLC, medición de utilities, tratamiento de agua y monitoreo en la nube para edificios, plantas e infraestructura crítica.
                </p>
                <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                  <a href="#contacto" className="cta-button bg-cyanx text-slate-950 shadow-glow hover:-translate-y-0.5 hover:bg-white">
                    Solicitar cotización <ArrowRight className="ml-2 size-4" aria-hidden="true" />
                  </a>
                  <a href="#servicios" className="cta-button border border-white/15 bg-white/5 text-white hover:-translate-y-0.5 hover:border-cyanx/70 hover:text-cyanx">
                    Ver servicios
                  </a>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.15}>
              <TechnicalVisual />
            </Reveal>
          </div>
        </section>

        <section aria-label="Métricas de confianza" className="container-shell pb-20">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <Reveal key={metric.title} delay={index * 0.06}>
                  <div className="glass-panel group rounded-3xl p-6 transition hover:-translate-y-1 hover:border-cyanx/40">
                    <Icon className="mb-5 size-7 text-cyanx" aria-hidden="true" />
                    <h3 className="text-lg font-bold text-white">{metric.title}</h3>
                    <div className="mt-5 h-1 w-full overflow-hidden rounded-full bg-white/10">
                      <div className="h-full w-2/3 origin-left animate-pulseLine rounded-full bg-cyanx" />
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        <section id="servicios" className="container-shell scroll-mt-28 py-20">
          <SectionHeading eyebrow="Servicios" title="Especialistas en sistemas críticos que conectan campo, control y datos." copy="Diseñamos soluciones robustas para instalaciones que requieren precisión, continuidad operativa y trazabilidad técnica." />
          <div className="mt-12 grid gap-5 lg:grid-cols-4">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Reveal key={service.title} delay={index * 0.08}>
                  <article className="glass-panel h-full rounded-[1.75rem] p-6 transition duration-300 hover:-translate-y-2 hover:border-cyanx/45 hover:shadow-glow">
                    <div className="mb-6 grid size-14 place-items-center rounded-2xl border border-cyanx/25 bg-cyanx/10">
                      <Icon className="size-7 text-cyanx" aria-hidden="true" />
                    </div>
                    <h3 className="text-xl font-bold text-white">{service.title}</h3>
                    <p className="mt-4 leading-7 text-slate-300">{service.text}</p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </section>

        <section className="container-shell py-20">
          <SectionHeading eyebrow="Problemas que resolvemos" title="Menos incertidumbre operativa. Más control, eficiencia y evidencia." />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {problems.map((problem, index) => (
              <Reveal key={problem} delay={index * 0.04}>
                <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <CheckCircle2 className="size-5 shrink-0 text-cyanx" aria-hidden="true" />
                  <span className="font-medium text-slate-100">{problem}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="soluciones" className="container-shell scroll-mt-28 py-20">
          <div className="grid gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-start">
            <SectionHeading eyebrow="Soluciones integrales" title="Diseñamos, fabricamos, programamos, instalamos y ponemos en marcha." copy="Acompañamos el ciclo completo del proyecto: desde el diagnóstico técnico y la selección de tecnología, hasta la integración en campo y la optimización posterior." />
            <div id="proceso" className="scroll-mt-28 space-y-4">
              {timeline.map((step, index) => (
                <Reveal key={step} delay={index * 0.05}>
                  <div className="glass-panel relative overflow-hidden rounded-2xl p-5">
                    <div className="absolute inset-y-0 left-0 w-1 bg-cyanx" />
                    <div className="flex items-center gap-5">
                      <span className="grid size-11 shrink-0 place-items-center rounded-full border border-cyanx/30 bg-cyanx/10 font-mono text-sm font-bold text-cyanx">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h3 className="font-semibold text-white">{step}</h3>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="tecnologia" className="container-shell scroll-mt-28 py-20">
          <div className="glass-panel overflow-hidden rounded-[2rem] p-8 sm:p-10">
            <SectionHeading eyebrow="Tecnología" title="Arquitecturas abiertas para control, datos y continuidad operativa." copy="Integramos tecnologías industriales y de tratamiento de agua con dashboards, medición y monitoreo remoto." />
            <div className="mt-10 flex flex-wrap gap-3">
              {techTags.map((tag) => (
                <span key={tag} className="rounded-full border border-cyanx/20 bg-cyanx/10 px-4 py-2 text-sm font-semibold text-cyan-100">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="container-shell py-16">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2rem] border border-cyanx/25 bg-gradient-to-br from-cyanx/20 via-white/[0.06] to-blue-900/20 p-8 shadow-glow sm:p-12 lg:flex lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-cyanx">Siguiente nivel operativo</p>
                <h2 className="mt-4 max-w-3xl text-3xl font-black tracking-[-0.04em] text-white sm:text-5xl">
                  Convierte tus instalaciones en sistemas inteligentes, medibles y automatizados
                </h2>
              </div>
              <a href="#contacto" className="cta-button mt-8 bg-white text-slate-950 hover:-translate-y-0.5 hover:bg-cyanx lg:mt-0">
                Hablemos de tu proyecto
              </a>
            </div>
          </Reveal>
        </section>

        <section id="contacto" className="container-shell scroll-mt-28 py-20">
          <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr]">
            <SectionHeading eyebrow="Contacto" title="Cuéntanos qué operación quieres automatizar, medir o mejorar." copy="El formulario queda listo para conectarse posteriormente con una API route, Resend, EmailJS o el servicio de email que prefieras." />
            <Reveal>
              <form className="glass-panel grid gap-5 rounded-[2rem] p-6 sm:grid-cols-2 sm:p-8" aria-label="Formulario de contacto">
                {[
                  ["Nombre", "name", "text"],
                  ["Empresa", "company", "text"],
                  ["Email", "email", "email"],
                  ["Teléfono", "phone", "tel"],
                ].map(([label, name, type]) => (
                  <label key={name} className="grid gap-2 text-sm font-medium text-slate-200">
                    {label}
                    <input className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyanx focus:ring-2 focus:ring-cyanx/20" name={name} type={type} placeholder={label} required={name === "name" || name === "email"} />
                  </label>
                ))}
                <label className="grid gap-2 text-sm font-medium text-slate-200 sm:col-span-2">
                  Tipo de proyecto
                  <select name="projectType" className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-cyanx focus:ring-2 focus:ring-cyanx/20" defaultValue="">
                    <option value="" disabled>Selecciona una opción</option>
                    <option>Automatización de edificios</option>
                    <option>PLC / tableros / SCADA</option>
                    <option>Tratamiento de agua</option>
                    <option>Medición de utilities y nube</option>
                    <option>Proyecto integral</option>
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-200 sm:col-span-2">
                  Mensaje
                  <textarea name="message" rows={5} className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyanx focus:ring-2 focus:ring-cyanx/20" placeholder="Describe tu necesidad, alcance o reto operativo." />
                </label>
                <div className="sm:col-span-2">
                  <button type="button" className="cta-button w-full bg-cyanx text-slate-950 shadow-glow hover:bg-white sm:w-auto">
                    Enviar solicitud
                  </button>
                  <p className="mt-4 text-sm text-slate-400">Próximo paso técnico: conectar este formulario a <code className="text-cyanx">/api/contact</code> o a un proveedor de email transaccional.</p>
                </div>
              </form>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-10">
        <div className="container-shell grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="text-lg font-black tracking-[0.22em] text-white">{siteConfig.shortName}</p>
            <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">{siteConfig.companyName} — automatización, control industrial, tratamiento de agua y medición inteligente de utilities.</p>
          </div>
          <div>
            <h3 className="font-bold text-white">Servicios</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li>Automatización BMS</li>
              <li>PLC, HMI y SCADA</li>
              <li>RO, UF, MF, EDI y PTAR</li>
              <li>Dashboards cloud</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-white">Contacto</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li>{siteConfig.email}</li>
              <li>{siteConfig.phone}</li>
              <li>{siteConfig.location}</li>
            </ul>
          </div>
        </div>
        <div className="container-shell mt-8 text-xs text-slate-500">© {new Date().getFullYear()} {siteConfig.companyName}. Todos los derechos reservados.</div>
      </footer>
    </>
  );
}

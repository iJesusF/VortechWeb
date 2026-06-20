import { Activity, ArrowRight, Building2, CheckCircle2, CircuitBoard, Cloud, Droplets, Gauge, Layers3, Network, ShieldCheck } from "lucide-react";
import { Header } from "@/components/header";
import { Reveal } from "@/components/motion";
import { TechnicalVisual } from "@/components/technical-visual";
import { siteConfig } from "@/lib/site-config";

const metrics = [
  { title: "Campo + PLC + nube", text: "Una sola arquitectura desde sensores y tableros hasta dashboards ejecutivos.", icon: Network },
  { title: "Control confiable", text: "Secuencias, alarmas, interlocks y datos listos para operar con evidencia.", icon: Activity },
  { title: "Agua y utilities", text: "RO, UF, MF, EDI, PTAR, energía, aire, vapor y consumos críticos medidos.", icon: Gauge },
  { title: "Llave en mano", text: "Ingeniería, fabricación, instalación, arranque y soporte en un mismo equipo.", icon: ShieldCheck },
];

const services = [
  {
    title: "Automatización de edificios",
    text: "Control HVAC, iluminación, sensores, monitoreo energético, integración BMS y optimización operativa para inmuebles modernos.",
    icon: Building2,
  },
  {
    title: "PLC, tableros, HMI y SCADA",
    text: "Programación de lógica de control, fabricación de tableros, pantallas, supervisión, pruebas FAT/SAT y puesta en marcha.",
    icon: CircuitBoard,
  },
  {
    title: "Tratamiento de agua",
    text: "Sistemas de ósmosis inversa, ultrafiltración, microfiltración, EDI, PTAR y agua de proceso integrados al control operativo.",
    icon: Droplets,
  },
  {
    title: "Medición de utilities y nube",
    text: "Medición de agua, energía, aire comprimido, vapor u otros servicios críticos con datos históricos y dashboards cloud.",
    icon: Cloud,
  },
];

const problems = [
  "No sabes qué está pasando en campo hasta que hay una falla",
  "Los equipos trabajan aislados y nadie ve el sistema completo",
  "Hay consumos altos sin medición confiable por área o proceso",
  "Los operadores dependen de rutinas manuales y bitácoras incompletas",
  "La información está en PLC, hojas de cálculo o pantallas separadas",
  "Diagnosticar una falla toma demasiado tiempo y detiene la operación",
];

const recentProjects = [
  "Integración de sistema HVAC para edificio corporativo.",
  "Automatización de planta de tratamiento de agua.",
  "Supervisión energética con dashboards cloud.",
  "Sistema de extracción y seguridad para cocina industrial.",
  "Migración PLC WECON → L5X.",
  "Integración de alarmas contraincendio.",
];

const architecture = [
  { title: "1. Capturamos", text: "Sensores, medidores, actuadores, válvulas, bombas, variadores y analizadores." },
  { title: "2. Controlamos", text: "PLC, BMS, lógica de proceso, alarmas, protecciones, HMI y SCADA." },
  { title: "3. Conectamos", text: "Protocolos industriales, gateways, historian local, dashboards y nube segura." },
  { title: "4. Optimizamos", text: "KPIs, tendencias, mantenimiento, eficiencia energética y mejora continua." },
];

const timeline = [
  "Diagnóstico técnico y alcance",
  "Arquitectura de control y selección de tecnología",
  "Ingeniería, programación y fabricación",
  "Instalación, integración y pruebas",
  "Puesta en marcha con capacitación",
  "Soporte, monitoreo y optimización",
];

const techTags = ["PLC", "HMI", "SCADA", "BMS", "IoT Industrial", "Modbus", "BACnet", "OPC UA", "MQTT", "Cloud Dashboards", "Sensores", "Medidores", "RO", "UF", "MF", "EDI", "PTAR", "Data Logging", "Remote Monitoring"];

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
          <div className="container-shell grid items-center gap-12 pb-16 lg:grid-cols-[1.02fr_.98fr] lg:pb-24">
            <Reveal>
              <div className="max-w-3xl">
                <span className="section-eyebrow">Integración mecánica · Automatización · Control</span>
                <h1 className="text-4xl font-black leading-[1.02] tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl">
                  Convertimos sistemas mecánicos en operaciones inteligentes, medibles y automatizadas
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                  Integramos HVAC, agua, utilities, tableros, PLC, HMI/SCADA y dashboards cloud para que tu planta o edificio opere con más control, menos incertidumbre y datos accionables.
                </p>
                <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                  <a href={`mailto:${siteConfig.email}`} className="cta-button bg-cyanx text-slate-950 shadow-glow hover:-translate-y-0.5 hover:bg-white">
                    Solicitar diagnóstico <ArrowRight className="ml-2 size-4" aria-hidden="true" />
                  </a>
                  <a href="#arquitectura" className="cta-button border border-white/15 bg-white/5 text-white hover:-translate-y-0.5 hover:border-cyanx/70 hover:text-cyanx">
                    Ver cómo integramos
                  </a>
                </div>
                <div className="mt-8 grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
                  <span className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">Diseño + fabricación</span>
                  <span className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">Arranque en campo</span>
                  <span className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">Datos para decidir</span>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.15}>
              <TechnicalVisual />
            </Reveal>
          </div>
        </section>

        <section aria-label="Capacidades clave" className="container-shell pb-16">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <Reveal key={metric.title} delay={index * 0.06}>
                  <div className="glass-panel group h-full rounded-3xl p-6 transition hover:-translate-y-1 hover:border-cyanx/40">
                    <Icon className="mb-5 size-7 text-cyanx" aria-hidden="true" />
                    <h3 className="text-lg font-bold text-white">{metric.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{metric.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        <section id="arquitectura" className="container-shell scroll-mt-28 py-20">
          <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
            <SectionHeading eyebrow="Arquitectura integrada" title="De la sala de máquinas al dashboard: todo conectado con una lógica clara." copy="La propuesta moderna no es solo automatizar un equipo; es unir sistemas mecánicos, eléctricos y digitales para que el cliente vea estado, consumo, alarmas, tendencias y oportunidades de ahorro." />
            <div className="grid gap-4 sm:grid-cols-2">
              {architecture.map((item, index) => (
                <Reveal key={item.title} delay={index * 0.06}>
                  <article className="glass-panel h-full rounded-[1.5rem] p-6">
                    <Layers3 className="mb-4 size-6 text-cyanx" aria-hidden="true" />
                    <h3 className="font-bold text-white">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{item.text}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="servicios" className="container-shell scroll-mt-28 py-20">
          <SectionHeading eyebrow="Servicios" title="Capacidad completa para sistemas mecánicos automatizados y controlados." copy="Presentamos la empresa como un integrador técnico: entiende el proceso, construye el control, conecta los datos y deja la operación lista para escalar." />
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
                <div className="flex h-full items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <CheckCircle2 className="mt-1 size-5 shrink-0 text-cyanx" aria-hidden="true" />
                  <span className="font-medium leading-7 text-slate-100">{problem}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="soluciones" className="container-shell scroll-mt-28 py-20">
          <div className="grid gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-start">
            <SectionHeading eyebrow="Soluciones llave en mano" title="Diseñamos, fabricamos, programamos, instalamos y ponemos en marcha." copy="Una página más chingona debe dejar claro que el prospecto no compra piezas aisladas: compra una solución completa, documentada y lista para operar." />
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
            <SectionHeading eyebrow="Tecnología" title="Arquitecturas abiertas para control, datos y continuidad operativa." copy="La web comunica que podemos convivir con equipos existentes y crear una capa moderna de operación sin encerrar al cliente en una sola marca." />
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
                  Hagamos que tus sistemas mecánicos se vean, se controlen y se optimicen como una operación de clase mundial
                </h2>
              </div>
              <a href={`mailto:${siteConfig.email}`} className="cta-button mt-8 bg-white text-slate-950 hover:-translate-y-0.5 hover:bg-cyanx lg:mt-0">
                Hablemos de tu proyecto
              </a>
            </div>
          </Reveal>
        </section>

        <section id="proyectos" className="container-shell scroll-mt-28 py-20">
          <SectionHeading eyebrow="Proyectos recientes" title="Experiencia real integrando sistemas mecánicos, control y datos." copy="En lugar de un formulario tradicional, mostramos capacidades aplicadas para que el prospecto identifique rápido si VORTECH puede resolver un reto similar." />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recentProjects.map((project, index) => (
              <Reveal key={project} delay={index * 0.05}>
                <article className="glass-panel group flex h-full min-h-40 flex-col justify-between overflow-hidden rounded-[1.75rem] p-6 transition duration-300 hover:-translate-y-2 hover:border-cyanx/45 hover:shadow-glow">
                  <div className="flex items-start justify-between gap-4">
                    <span className="grid size-11 shrink-0 place-items-center rounded-full border border-cyanx/30 bg-cyanx/10 font-mono text-sm font-bold text-cyanx">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="h-px flex-1 translate-y-5 bg-gradient-to-r from-cyanx/50 to-transparent" />
                  </div>
                  <h3 className="mt-8 text-xl font-bold leading-8 text-white">{project}</h3>
                </article>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <div className="mt-10 flex flex-col items-start justify-between gap-5 rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 sm:flex-row sm:items-center">
              <p className="max-w-2xl text-sm leading-6 text-slate-300">
                ¿Tienes un proyecto parecido? Escríbenos directo y revisamos alcance, equipos existentes y siguiente paso técnico.
              </p>
              <a href={`mailto:${siteConfig.email}`} className="cta-button bg-cyanx text-slate-950 shadow-glow hover:bg-white">
                Contactar a VORTECH
              </a>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-white/10 py-10">
        <div className="container-shell grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="text-lg font-black tracking-[0.22em] text-white">{siteConfig.shortName}</p>
            <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">{siteConfig.companyName} — integración de sistemas mecánicos, automatización, control industrial, tratamiento de agua y medición inteligente de utilities.</p>
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

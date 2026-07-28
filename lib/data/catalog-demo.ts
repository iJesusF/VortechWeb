/**
 * Demo catalog data for development.
 * In production, this data comes from Supabase.
 * This file allows the catalog to render without a database connection.
 */

export interface DemoCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface DemoProduct {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  sku: string | null;
  description: string;
  short_description: string;
  unit_price: number | null;
  currency: string;
  unit: string;
  image_url: string | null;
  images: string[];
  specifications: Record<string, string> | null;
  is_active: boolean;
  sort_order: number;
}

export const demoCategories: DemoCategory[] = [
  {
    id: "cat-001",
    name: "Automatización y Control",
    slug: "automatizacion-control",
    description: "PLC, HMI, SCADA y sistemas de control industrial para procesos y edificios.",
    image_url: null,
    sort_order: 1,
    is_active: true,
  },
  {
    id: "cat-002",
    name: "Tratamiento de Agua",
    slug: "tratamiento-agua",
    description: "Sistemas de ósmosis inversa, ultrafiltración, EDI y tratamiento de aguas residuales.",
    image_url: null,
    sort_order: 2,
    is_active: true,
  },
  {
    id: "cat-003",
    name: "Medición y Monitoreo",
    slug: "medicion-monitoreo",
    description: "Sensores, medidores, gateways IoT y plataformas de monitoreo cloud.",
    image_url: null,
    sort_order: 3,
    is_active: true,
  },
  {
    id: "cat-004",
    name: "Tableros y Gabinetes",
    slug: "tableros-gabinetes",
    description: "Tableros de control, centros de carga, gabinetes NEMA y ensambles a medida.",
    image_url: null,
    sort_order: 4,
    is_active: true,
  },
];

export const demoProducts: DemoProduct[] = [
  {
    id: "prod-001",
    category_id: "cat-001",
    name: "PLC Compacto Industrial",
    slug: "plc-compacto-industrial",
    sku: "VT-PLC-001",
    description: "Controlador lógico programable para aplicaciones de automatización de hasta 128 I/O. Comunicación Modbus TCP/RTU, EtherNet/IP. Programación ladder y texto estructurado.",
    short_description: "PLC compacto para automatización industrial con comunicación multi-protocolo.",
    unit_price: null,
    currency: "MXN",
    unit: "pieza",
    image_url: null,
    images: [],
    specifications: { "I/O": "128 puntos", "Comunicación": "Modbus TCP, EtherNet/IP", "Programación": "Ladder, ST" },
    is_active: true,
    sort_order: 1,
  },
  {
    id: "prod-002",
    category_id: "cat-001",
    name: "Pantalla HMI 10 pulgadas",
    slug: "pantalla-hmi-10",
    sku: "VT-HMI-010",
    description: "Pantalla táctil a color de 10.1 pulgadas para supervisión y control de procesos. Resolución 1024x600, comunicación serial y Ethernet.",
    short_description: "HMI táctil 10.1\" para supervisión de procesos industriales.",
    unit_price: 12500,
    currency: "MXN",
    unit: "pieza",
    image_url: null,
    images: [],
    specifications: { "Pantalla": "10.1\" TFT", "Resolución": "1024x600", "Comunicación": "RS232/485, Ethernet" },
    is_active: true,
    sort_order: 2,
  },
  {
    id: "prod-003",
    category_id: "cat-002",
    name: "Sistema de Ósmosis Inversa 500 LPH",
    slug: "osmosis-inversa-500lph",
    sku: "VT-RO-500",
    description: "Sistema de ósmosis inversa para producción de agua purificada a 500 litros por hora. Incluye pretratamiento, membranas, instrumentación y tablero de control.",
    short_description: "Planta RO 500 LPH con pretratamiento y control integrado.",
    unit_price: null,
    currency: "MXN",
    unit: "sistema",
    image_url: null,
    images: [],
    specifications: { "Capacidad": "500 LPH", "Rechazo": ">97%", "Membranas": "4040 x 3", "Control": "PLC integrado" },
    is_active: true,
    sort_order: 1,
  },
  {
    id: "prod-004",
    category_id: "cat-002",
    name: "Módulo de Ultrafiltración UF-200",
    slug: "modulo-ultrafiltracion-uf200",
    sku: "VT-UF-200",
    description: "Módulo de ultrafiltración de fibra hueca para pretratamiento de agua. Capacidad 200 LPH, retención de sólidos suspendidos y coloides.",
    short_description: "Módulo UF fibra hueca 200 LPH para pretratamiento.",
    unit_price: 45000,
    currency: "MXN",
    unit: "módulo",
    image_url: null,
    images: [],
    specifications: { "Capacidad": "200 LPH", "Tipo": "Fibra hueca", "Pore size": "0.01 μm" },
    is_active: true,
    sort_order: 2,
  },
  {
    id: "prod-005",
    category_id: "cat-003",
    name: "Medidor de Flujo Electromagnético DN50",
    slug: "medidor-flujo-electromagnetico-dn50",
    sku: "VT-FLW-050",
    description: "Medidor de flujo electromagnético para tuberías de 2 pulgadas. Salida 4-20mA, Modbus RTU. Precisión ±0.5%.",
    short_description: "Caudalímetro electromagnético DN50 con Modbus.",
    unit_price: 18700,
    currency: "MXN",
    unit: "pieza",
    image_url: null,
    images: [],
    specifications: { "Diámetro": "DN50 (2\")", "Precisión": "±0.5%", "Salida": "4-20mA, Modbus RTU" },
    is_active: true,
    sort_order: 1,
  },
  {
    id: "prod-006",
    category_id: "cat-003",
    name: "Gateway IoT Industrial",
    slug: "gateway-iot-industrial",
    sku: "VT-IOT-GW1",
    description: "Gateway IoT para conectar dispositivos industriales Modbus a plataformas cloud. Soporta MQTT, HTTP, almacenamiento local y 4G LTE.",
    short_description: "Gateway Modbus-Cloud con MQTT y conectividad 4G.",
    unit_price: 8900,
    currency: "MXN",
    unit: "pieza",
    image_url: null,
    images: [],
    specifications: { "Protocolos": "Modbus RTU/TCP, MQTT, HTTP", "Conectividad": "Ethernet, WiFi, 4G LTE", "Almacenamiento": "32GB local" },
    is_active: true,
    sort_order: 2,
  },
  {
    id: "prod-007",
    category_id: "cat-004",
    name: "Tablero de Control NEMA 4X",
    slug: "tablero-control-nema4x",
    sku: "VT-TAB-4X",
    description: "Gabinete NEMA 4X en acero inoxidable para ambientes corrosivos. Incluye montaje de componentes, cableado y pruebas FAT.",
    short_description: "Gabinete NEMA 4X inoxidable con ensamble a medida.",
    unit_price: null,
    currency: "MXN",
    unit: "tablero",
    image_url: null,
    images: [],
    specifications: { "Material": "Acero inoxidable 304", "Clasificación": "NEMA 4X", "Incluye": "Diseño, ensamble y FAT" },
    is_active: true,
    sort_order: 1,
  },
  {
    id: "prod-008",
    category_id: "cat-004",
    name: "Centro de Control de Motores",
    slug: "centro-control-motores",
    sku: "VT-CCM-01",
    description: "Centro de control de motores con arrancadores suaves o variadores de frecuencia. Diseño, fabricación, cableado, pruebas y documentación.",
    short_description: "CCM con VFD/arrancadores, diseño y fabricación completa.",
    unit_price: null,
    currency: "MXN",
    unit: "sistema",
    image_url: null,
    images: [],
    specifications: { "Tipo": "CCM extraíble", "Protección": "Coordinación tipo 2", "Incluye": "VFD, protecciones, PLC" },
    is_active: true,
    sort_order: 2,
  },
];

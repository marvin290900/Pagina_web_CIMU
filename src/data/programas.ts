// src/data/programas.ts
// Datos fijos de los programas de investigación del CIMU

export interface Programa {
  id: number;
  slug: string;
  nombre: string;
  descripcionCorta: string;
  descripcionExtendida: string;
  icono: string;
  color: string;
  coordinador: string | null;
  email: string | null;
  lineasInvestigacion: string[];
  metodologias: string;
  alianzas: string[];
  tags: string[];
}

export const programas: Programa[] = [
  {
    id: 1,
    slug: 'estudios-sociologicos',
    nombre: 'Programa de Estudios Sociológicos',
    descripcionCorta: 'Estudia estructuras, relaciones e instituciones sociales, abarcando fenómenos como violencia, equidad, salud, participación, etc.',
    descripcionExtendida: `Este programa se dedica al estudio riguroso de las estructuras sociales, las dinámicas de interacción entre individuos y grupos, y el funcionamiento de las instituciones que configuran nuestra sociedad. A través de investigaciones fundamentadas en teorías sociológicas contemporáneas, abordamos problemáticas complejas que afectan directamente a la población salvadoreña.
    
    Nuestro trabajo se centra en comprender la violencia en sus múltiples manifestaciones, desde la violencia estructural hasta la comunitaria; analizar las brechas de equidad social que perpetúan la desigualdad; estudiar los sistemas de salud comunitaria y su accesibilidad; y examinar los mecanismos de participación ciudadana que fortalecen o debilitan la democracia.
    
    Buscamos generar conocimiento científico que no solo contribuya al ámbito académico, sino que también pueda traducirse en recomendaciones prácticas para la formulación de políticas públicas más justas y efectivas.`,
    icono: '🔬',
    color: '#667eea',
    coordinador: null,
    email: null,
    lineasInvestigacion: [
      'Violencia y Seguridad Ciudadana',
      'Equidad y Justicia Social',
      'Salud Pública y Comunitaria',
      'Participación Ciudadana y Democracia',
      'Instituciones y Cambio Social',
      'Migración y Movilidad Social'
    ],
    metodologias: `Empleamos metodologías mixtas que combinan técnicas cualitativas (entrevistas en profundidad, grupos focales, etnografía, análisis de contenido) con métodos cuantitativos (encuestas, análisis estadístico, modelación). Nuestro enfoque es interdisciplinario y participativo, involucrando a las comunidades en el proceso de investigación para asegurar que los hallazgos sean relevantes y aplicables a sus realidades.`,
    alianzas: [],
    tags: ['Violencia', 'Equidad', 'Salud', 'Participación', 'Democracia']
  },
  {
    id: 2,
    slug: 'opinion-publica',
    nombre: 'Laboratorio de Opinión Pública',
    descripcionCorta: 'Se centra en medir percepciones ciudadanas sobre política, seguridad, educación, equidad y otros temas sociales relevantes.',
    descripcionExtendida: `El Laboratorio de Opinión Pública es un espacio especializado en la medición sistemática y científica de las percepciones, actitudes y opiniones de la ciudadanía salvadoreña sobre temas de relevancia nacional y regional. Utilizamos métodos rigurosos de recolección y análisis de datos para capturar la voz de diversos sectores de la población.
    
    Nuestro trabajo proporciona información valiosa sobre cómo la ciudadanía percibe aspectos cruciales como la gestión política, las condiciones de seguridad, la calidad de los servicios educativos, las brechas de equidad, y otros temas que afectan directamente su vida cotidiana. Estos datos son fundamentales para entender las dinámicas sociales y políticas del país.
    
    Los resultados de nuestras investigaciones contribuyen al debate público informado, apoyan la toma de decisiones basada en evidencia, y fortalecen la rendición de cuentas democrática al documentar las expectativas y evaluaciones ciudadanas sobre las instituciones y políticas públicas.`,
    icono: '📊',
    color: '#f093fb',
    coordinador: null,
    email: null,
    lineasInvestigacion: [
      'Percepción Política y Gobernanza',
      'Opinión sobre Seguridad Ciudadana',
      'Evaluación de Servicios Educativos',
      'Percepción de Equidad y Justicia',
      'Confianza Institucional',
      'Participación Electoral y Cívica'
    ],
    metodologias: `Utilizamos principalmente metodologías cuantitativas basadas en encuestas representativas a nivel nacional y regional. Aplicamos técnicas de muestreo probabilístico, diseño de cuestionarios validados, y análisis estadístico avanzado. Complementamos con grupos focales y entrevistas cualitativas para profundizar en las percepciones identificadas. Todos nuestros estudios siguen estándares internacionales de rigor metodológico y ética en la investigación.`,
    alianzas: [],
    tags: ['Política', 'Seguridad', 'Educación', 'Encuestas', 'Percepción']
  },
  {
    id: 3,
    slug: 'juridicos-politicos',
    nombre: 'Programa de Estudios Jurídicos y Políticos',
    descripcionCorta: 'Analiza las normas, instituciones y prácticas jurídicas y políticas, con enfoque en equidad, democracia, derechos y gobernabilidad.',
    descripcionExtendida: `Este programa desarrolla investigación crítica sobre el funcionamiento del sistema jurídico-político salvadoreño, examinando tanto el marco normativo como las prácticas institucionales y políticas que dan forma a la vida democrática del país. Nuestro enfoque integra perspectivas del derecho, la ciencia política y la sociología jurídica.
    
    Estudiamos cómo las normas jurídicas se diseñan, implementan y aplican en la práctica; analizamos el funcionamiento de las instituciones democráticas y sus mecanismos de rendición de cuentas; investigamos la protección y ejercicio efectivo de los derechos humanos; y evaluamos los procesos de gobernabilidad a nivel local, regional y nacional.
    
    Un eje transversal de nuestro trabajo es el análisis de las brechas entre el derecho formal y la justicia material, buscando identificar obstáculos estructurales que limitan el acceso a la justicia y el ejercicio pleno de derechos, especialmente para poblaciones en situación de vulnerabilidad. Nuestras investigaciones buscan aportar al fortalecimiento del Estado de derecho y la profundización democrática.`,
    icono: '⚖️',
    color: '#4facfe',
    coordinador: null,
    email: null,
    lineasInvestigacion: [
      'Acceso a la Justicia y Derechos Humanos',
      'Institucionalidad Democrática',
      'Derecho Constitucional y Garantías',
      'Gobernabilidad Local y Regional',
      'Política Pública y Marco Normativo',
      'Justicia Transicional y Memoria Histórica'
    ],
    metodologias: `Empleamos análisis documental y jurisprudencial, estudio de casos, entrevistas con actores clave del sistema de justicia y político, y análisis comparativo. Combinamos metodologías cualitativas para comprender procesos políticos y jurídicos complejos, con análisis cuantitativo de datos institucionales. Incorporamos perspectivas interdisciplinarias que enriquecen la comprensión de fenómenos jurídico-políticos.`,
    alianzas: [],
    tags: ['Democracia', 'Derechos', 'Gobernabilidad', 'Justicia', 'Política']
  },
  {
    id: 4,
    slug: 'tierra-medio-ambiente',
    nombre: 'Programa de Estudios de la Tierra y Medio Ambiente',
    descripcionCorta: 'Estudia el entorno natural y su interacción con las comunidades humanas, desde una perspectiva sustentable e interdisciplinaria.',
    descripcionExtendida: `Este programa aborda la relación compleja entre las sociedades humanas y su entorno natural, con especial énfasis en los desafíos ambientales que enfrenta El Salvador y la región centroamericana. Reconocemos que los problemas ambientales son también problemas sociales, económicos y políticos que requieren soluciones integrales.
    
    Investigamos temas como el cambio climático y sus impactos en comunidades vulnerables, la gestión sostenible de recursos naturales (agua, suelo, bosques), la degradación ambiental y sus consecuencias en la salud pública, los riesgos ambientales y la resiliencia comunitaria, y los conflictos socioambientales que emergen del uso y acceso a recursos.
    
    Nuestro enfoque es interdisciplinario, combinando ciencias naturales con ciencias sociales para comprender tanto los procesos biofísicos como las dimensiones humanas del cambio ambiental. Trabajamos estrechamente con comunidades locales, reconociendo sus conocimientos y prácticas tradicionales como valiosos para construir alternativas sustentables. Buscamos generar conocimiento que contribuya a la construcción de un desarrollo más equitativo y ambientalmente responsable.`,
    icono: '🌍',
    color: '#43e97b',
    coordinador: null,
    email: null,
    lineasInvestigacion: [
      'Cambio Climático y Adaptación',
      'Gestión de Recursos Hídricos',
      'Riesgos Ambientales y Resiliencia',
      'Conflictos Socioambientales',
      'Desarrollo Sustentable',
      'Conservación y Biodiversidad'
    ],
    metodologias: `Utilizamos metodologías mixtas que integran: monitoreo y análisis ambiental, sistemas de información geográfica (SIG), análisis de vulnerabilidad y riesgo, investigación participativa con comunidades, evaluación de impacto ambiental y social, y modelación de escenarios. Nuestro trabajo de campo incluye diagnósticos comunitarios, mapeos participativos y colaboración con actores locales para co-construir conocimiento aplicable.`,
    alianzas: [],
    tags: ['Sustentabilidad', 'Ecosistemas', 'Cambio Climático', 'Recursos Naturales']
  },
  {
    id: 5,
    slug: 'genero-inclusion',
    nombre: 'Programa de Estudios de Género e Inclusión',
    descripcionCorta: 'Aborda desigualdades de género y busca promover inclusión en todos los ámbitos sociales, educativos y de salud.',
    descripcionExtendida: `Este programa se centra en el análisis crítico de las desigualdades de género y otras formas de exclusión social, con el objetivo de contribuir a la construcción de una sociedad más justa e inclusiva. Utilizamos perspectivas feministas e interseccionales para comprender cómo el género se entrelaza con otras categorías como clase, etnia, edad, orientación sexual y discapacidad.
    
    Investigamos las múltiples formas de discriminación y violencia basadas en género, las brechas en el acceso a oportunidades educativas y laborales, las barreras en la atención de salud (especialmente salud sexual y reproductiva), y los obstáculos para la participación política y social de mujeres y grupos históricamente excluidos.
    
    Nuestro trabajo busca no solo documentar y explicar estas desigualdades, sino también identificar experiencias exitosas de resistencia, organización y transformación social. Colaboramos con movimientos sociales, organizaciones de mujeres y colectivos diversos para generar conocimiento comprometido con la justicia social. Entendemos la investigación como una herramienta para el cambio, que debe contribuir al empoderamiento de las personas y comunidades en situación de vulnerabilidad.`,
    icono: '🤝',
    color: '#fa709a',
    coordinador: null,
    email: null,
    lineasInvestigacion: [
      'Violencias de Género',
      'Brechas en Educación y Empleo',
      'Salud Sexual y Reproductiva',
      'Participación Política de Mujeres',
      'Masculinidades y Género',
      'Diversidad Sexual e Identidades de Género',
      'Interseccionalidad y Exclusión Múltiple'
    ],
    metodologias: `Empleamos metodologías feministas que priorizan las voces y experiencias de las personas afectadas por las desigualdades. Utilizamos entrevistas en profundidad, historias de vida, grupos focales, etnografía feminista, y análisis de discurso. Complementamos con análisis cuantitativo de datos desagregados por sexo y otras variables. Nuestro enfoque es participativo, buscando que las personas investigadas sean co-creadoras de conocimiento, y reflexivo sobre las relaciones de poder en la investigación.`,
    alianzas: [],
    tags: ['Género', 'Inclusión', 'Equidad', 'Derechos', 'Diversidad']
  }
];

// Función helper para obtener un programa por slug
export function getProgramaBySlug(slug: string): Programa | undefined {
  return programas.find(p => p.slug === slug);
}

// Función helper para obtener todos los slugs (útil para getStaticPaths)
export function getAllProgramaSlugs(): string[] {
  return programas.map(p => p.slug);
}
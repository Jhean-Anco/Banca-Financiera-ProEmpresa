export const colors = {
  rojoCaja: '#E30613',
  rojoOscuro: '#B40012',
  rojoSuave: '#FDECEE',
  dorado: '#F2B705',
  doradoOscuro: '#C88D00',
  blanco: '#FFFFFF',
  grisClaro: '#F7F8FA',
  grisMedio: '#7A8494',
  grisOscuro: '#334155',
  negro: '#1B2430',
  premier: '#00876C',
  teal: '#0D9488',
  naranja: '#D96C06',
  morado: '#6D3BBF',
  rosa: '#C2185B',
  verde: '#0F8A5F',
};

export const navItems = [
  { id: 'inicio', label: 'Inicio', path: '/' },
  { id: 'cartera', label: 'Cartera', path: '/cartera' },
  { id: 'solicitudes', label: 'Solicitudes', path: '/solicitudes' },
  { id: 'evaluacion', label: 'Evaluación', path: '/evaluacion' },
  { id: 'cobranza', label: 'Cobranza', path: '/cobranza' },
  { id: 'reportes', label: 'Reportes', path: '/reportes' },
];

export const quickAccess = [
  {
    title: 'Cartera del día',
    desc: 'Clientes asignados para visitar hoy.',
    path: '/cartera',
    color: colors.rojoCaja,
    icon: 'briefcase',
  },
  {
    title: 'Nueva solicitud',
    desc: 'Registrar una solicitud de crédito.',
    path: '/solicitudes',
    color: colors.premier,
    icon: 'plus',
  },
  {
    title: 'Pre-evaluar / Buró',
    desc: 'Capacidad de pago y listas negras.',
    path: '/evaluacion',
    color: colors.rojoOscuro,
    icon: 'shield',
  },
  {
    title: 'Cobranza',
    desc: 'Gestión de mora del día.',
    path: '/cobranza',
    color: colors.doradoOscuro,
    icon: 'coins',
  },
  {
    title: 'Mis solicitudes',
    desc: 'Tablero de estado de expedientes.',
    path: '/solicitudes',
    color: colors.naranja,
    icon: 'file',
  },
  {
    title: 'Reportes',
    desc: 'Productividad del equipo.',
    path: '/reportes',
    color: colors.teal,
    icon: 'chart',
  },
];

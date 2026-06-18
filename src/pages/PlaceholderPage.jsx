export default function PlaceholderPage({ title, subtitle }) {
  return (
    <div className="page-header">
      <h2>{title}</h2>
      <p style={{ color: 'var(--bp-gris-medio)', marginTop: 4 }}>{subtitle}</p>
      <div
        style={{
          marginTop: 24,
          padding: 48,
          background: 'var(--bp-blanco)',
          borderRadius: 'var(--bp-radio)',
          boxShadow: 'var(--bp-sombra)',
          textAlign: 'center',
          color: 'var(--bp-gris-medio)',
        }}
      >
        Módulo en preparación — los datos se sincronizan desde la app Flutter vía Supabase
      </div>
    </div>
  );
}

export default function TerminosPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold mb-2">Términos y Condiciones</h1>
      <p className="text-sm text-muted mb-10">Última actualización: abril 2026</p>

      <div className="prose-custom">
        <h2>1. Aceptación de los términos</h2>
        <p>
          Al acceder y usar TuChefSoy, aceptas estos términos y condiciones en su totalidad.
          Si no estás de acuerdo con alguna parte, te pedimos que no utilices la plataforma.
        </p>

        <h2>2. Uso de la plataforma</h2>
        <p>
          TuChefSoy es una plataforma para descubrir, compartir y crear recetas de cocina.
          Te comprometes a usarla de manera responsable, respetuosa y conforme a la ley.
          No está permitido publicar contenido ofensivo, ilegal o que infrinja derechos de terceros.
        </p>

        <h2>3. Cuentas de usuario</h2>
        <p>
          Eres responsable de mantener la seguridad de tu cuenta y contraseña. No compartas
          tus credenciales con terceros. Nos reservamos el derecho de suspender cuentas que
          violen estos términos.
        </p>

        <h2>4. Contenido del usuario</h2>
        <p>
          Al publicar recetas, comentarios u otro contenido, mantienes la propiedad de tu
          material pero nos otorgas una licencia no exclusiva para mostrarlo en la plataforma.
          Eres responsable de que tu contenido sea original y no infrinja derechos de autor.
        </p>

        <h2>5. Propiedad intelectual</h2>
        <p>
          El diseño, logotipo, código y marca TuChefSoy son propiedad de sus creadores.
          No está permitido copiar, modificar o distribuir estos elementos sin autorización.
        </p>

        <h2>6. IA Chef</h2>
        <p>
          La función IA Chef ofrece sugerencias de recetas basadas en inteligencia artificial.
          Estas sugerencias son orientativas y no sustituyen el criterio propio. No nos hacemos
          responsables de alergias, intolerancias o reacciones derivadas de seguir las
          recomendaciones de la IA.
        </p>

        <h2>7. Limitación de responsabilidad</h2>
        <p>
          TuChefSoy se proporciona &quot;tal cual&quot;. No garantizamos la disponibilidad
          ininterrumpida del servicio ni la exactitud de todo el contenido publicado por los
          usuarios.
        </p>

        <h2>8. Modificaciones</h2>
        <p>
          Podemos modificar estos términos en cualquier momento. Los cambios entrarán en vigor
          al publicarse en esta página. El uso continuado de la plataforma implica la aceptación
          de los términos actualizados.
        </p>

        <h2>9. Contacto</h2>
        <p>
          Para dudas sobre estos términos, visita nuestra{' '}
          <a href="/contacto" className="text-brand hover:underline">página de contacto</a>.
        </p>
      </div>

      <style>{`
        .prose-custom h2 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #111;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
        }
        .prose-custom p {
          font-size: 0.9375rem;
          color: #555;
          line-height: 1.75;
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  )
}
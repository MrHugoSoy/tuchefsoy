export default function PrivacidadPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold mb-2">Política de Privacidad</h1>
      <p className="text-sm text-muted mb-10">Última actualización: abril 2026</p>

      <div className="prose-custom">
        <h2>1. Información que recopilamos</h2>
        <p>
          Cuando te registras en TuChefSoy, recopilamos tu nombre, dirección de correo electrónico
          y foto de perfil (si inicias sesión con Google). También almacenamos las recetas,
          comentarios y likes que publicas en la plataforma.
        </p>

        <h2>2. Cómo usamos tu información</h2>
        <p>
          Usamos tu información para proporcionarte acceso a la plataforma, personalizar tu
          experiencia, mostrarte recetas relevantes y permitirte interactuar con otros usuarios.
          Tu correo electrónico se usa únicamente para autenticación y comunicaciones esenciales
          del servicio.
        </p>

        <h2>3. Compartir información</h2>
        <p>
          No vendemos, comercializamos ni transferimos tu información personal a terceros. Tu
          perfil público (nombre de usuario, foto y recetas) es visible para otros usuarios de
          la plataforma.
        </p>

        <h2>4. Cookies y tecnologías similares</h2>
        <p>
          Utilizamos cookies esenciales para mantener tu sesión activa y recordar tus preferencias.
          No usamos cookies de seguimiento publicitario.
        </p>

        <h2>5. Seguridad</h2>
        <p>
          Protegemos tu información mediante cifrado y prácticas de seguridad estándar de la
          industria. Tus contraseñas se almacenan de forma segura y nunca son accesibles para
          nuestro equipo.
        </p>

        <h2>6. Tus derechos</h2>
        <p>
          Puedes acceder, modificar o eliminar tu información personal en cualquier momento desde
          tu perfil. Si deseas eliminar tu cuenta completamente, contáctanos y procesaremos tu
          solicitud.
        </p>

        <h2>7. Cambios a esta política</h2>
        <p>
          Nos reservamos el derecho de actualizar esta política de privacidad. Te notificaremos
          sobre cambios significativos a través de la plataforma o por correo electrónico.
        </p>

        <h2>8. Contacto</h2>
        <p>
          Si tienes preguntas sobre esta política de privacidad, puedes contactarnos a través de
          nuestra <a href="/contacto" className="text-brand hover:underline">página de contacto</a>.
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
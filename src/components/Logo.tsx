import logo from "@/assets/logo-inapem.png";

export function Logo({ className = "h-12 w-12" }: { className?: string }) {
  const src = typeof logo === "string" ? logo : logo.url;

  return (
    <img
      src={src}
      alt="INAPEM - Instituto Nacional de Educação Especial & Neuropsicopedagogia"
      className={`${className} rounded-full object-cover`}
    />
  );
}

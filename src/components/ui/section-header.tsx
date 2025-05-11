interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
}

export function SectionHeader({ title, subtitle, centered = false }: SectionHeaderProps) {
  return (
    <div className={`mb-12 ${centered ? 'text-center' : ''}`}>
      <h2 className="text-3xl font-bold tracking-tight text-secondary-900 md:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 max-w-3xl text-lg text-secondary-600">
          {subtitle}
        </p>
      )}
    </div>
  );
}
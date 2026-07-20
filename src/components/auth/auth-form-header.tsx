type AuthFormHeaderProps = {
  title: string;
  subtitle: string;
};

export function AuthFormHeader({ title, subtitle }: AuthFormHeaderProps) {
  return (
    <div className="mb-6 text-center">
      <h1 className="text-[34px] font-normal leading-10.5 tracking-[0.25px] text-foreground">
        {title}
      </h1>
      <p className="mt-6 text-base leading-6 tracking-[0.15px] text-foreground">
        {subtitle}
      </p>
    </div>
  );
}

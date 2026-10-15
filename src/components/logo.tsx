import Image from "next/image";

type LogoProps = {
  className?: string;
  priority?: boolean;
};

export function Logo({ className, priority }: LogoProps) {
  return (
    <Image
      src="/brand/edgefolio-logo-v3.png"
      alt="Edgefolio"
      width={766}
      height={153}
      priority={priority}
      className={className}
    />
  );
}

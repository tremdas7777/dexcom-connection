import { cn } from "@/lib/utils";

export type StoreImageVariant =
  | "banner"
  | "product-hero"
  | "product-thumb"
  | "section-banner"
  | "section-content"
  | "section-full";

const variantStyles: Record<
  StoreImageVariant,
  {
    frame: string;
    padding: string;
    fill?: boolean;
    contain?: boolean;
    intrinsic?: boolean;
    radius: string;
    alignStart?: boolean;
  }
> = {
  banner: {
    /* Desktop: altura 16:9 da largura da tela — combina com banner 1024×576 e evita faixas laterais */
    frame:
      "aspect-[4/5] w-full md:aspect-auto md:h-[56.25vw] md:min-h-[320px] md:max-h-[720px]",
    padding: "p-0",
    fill: true,
    radius: "",
  },
  "product-hero": {
    frame: "aspect-[3/2] w-full",
    padding: "p-0",
    contain: true,
    radius: "rounded-2xl",
  },
  "product-thumb": {
    frame: "h-full w-full aspect-square",
    padding: "p-0",
    contain: true,
    alignStart: true,
    radius: "rounded-xl",
  },
  "section-banner": {
    frame:
      "aspect-[4/5] w-full md:aspect-auto md:h-[56.25vw] md:min-h-[280px] md:max-h-[640px]",
    padding: "p-0",
    fill: true,
    radius: "",
  },
  "section-content": {
    frame: "aspect-video w-full md:aspect-[3/2]",
    padding: "p-0",
    radius: "rounded-2xl",
  },
  "section-full": {
    frame: "w-full",
    padding: "p-0",
    intrinsic: true,
    radius: "rounded-2xl",
  },
};

const imgContain = "max-h-full max-w-full object-contain object-center";
const imgIntrinsic = "w-full h-auto object-contain object-center";
const imgFill = "absolute inset-0 h-full w-full object-cover object-center";

type StoreImageProps = {
  src?: string;
  srcMobile?: string;
  srcDesktop?: string;
  alt: string;
  variant: StoreImageVariant;
  bg?: string;
  className?: string;
  frameClassName?: string;
  loading?: "lazy" | "eager";
  draggable?: boolean;
};

export function StoreImage({
  src,
  srcMobile,
  srcDesktop,
  alt,
  variant,
  bg,
  className,
  frameClassName,
  loading,
  draggable,
}: StoreImageProps) {
  const styles = variantStyles[variant];
  const hasPair = Boolean(srcMobile && srcDesktop);
  const fill = styles.fill ?? false;
  const contain = styles.contain ?? false;
  const intrinsic = styles.intrinsic ?? false;
  const radius = styles.radius;
  const imgClass = cn(
    fill ? imgFill : intrinsic ? imgIntrinsic : imgContain,
    radius,
  );
  const isProduct = variant === "product-hero" || variant === "product-thumb";

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden",
        (contain || (!fill && !intrinsic)) &&
          (styles.alignStart
            ? "flex items-start justify-center"
            : "flex items-center justify-center"),
        radius,
        styles.frame,
        styles.padding,
        frameClassName,
      )}
      style={{
        backgroundColor: bg ?? (isProduct ? "var(--paper)" : undefined),
      }}
    >
      {hasPair ? (
        <>
          <img
            src={srcMobile}
            alt={alt}
            loading={loading}
            decoding="async"
            fetchPriority={loading === "eager" ? "high" : "auto"}
            draggable={draggable}
            className={cn("md:hidden", imgClass, className)}
          />
          <img
            src={srcDesktop}
            alt={alt}
            loading={loading}
            decoding="async"
            fetchPriority={loading === "eager" ? "high" : "auto"}
            draggable={draggable}
            className={cn("hidden md:block", imgClass, className)}
          />
        </>
      ) : (
        <img
          src={src ?? srcMobile ?? srcDesktop}
          alt={alt}
          loading={loading}
          decoding="async"
          fetchPriority={loading === "eager" ? "high" : "auto"}
          draggable={draggable}
          className={cn(imgClass, className)}
        />
      )}
    </div>
  );
}

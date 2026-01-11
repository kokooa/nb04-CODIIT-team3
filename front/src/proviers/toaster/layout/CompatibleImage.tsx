import type { ImageProps } from "next/image";
import { useEffect, useState } from "react";

type CompatibleImage = React.ImgHTMLAttributes<HTMLImageElement> & {
  nextImageProps?: Partial<ImageProps>;
};

export default function CompatibleImage({ nextImageProps = {}, ...props }: CompatibleImage) {
  const [NextImage, setNextImage] = useState<React.ComponentType<ImageProps> | null>(null);

  useEffect(() => {
    // SSR
    if (typeof window === "undefined") {
      import("next/image").then((mod) => {
        setNextImage(() => mod.default);
      });
    }
  }, []);

  if (NextImage) {
    return (
      <NextImage
        {...(props as ImageProps)}
        {...nextImageProps}
      />
    );
  }

  // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
  return <img {...props} />;
}

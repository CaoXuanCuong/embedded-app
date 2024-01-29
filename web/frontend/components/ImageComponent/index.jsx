import Image from "next/image";
import styles from "./component.module.css";

export default function ImageComponent({
  loader,
  src,
  width,
  height,
  alt,
  title,
  loading = "lazy",
  priority = false,
}) {
  return (
    <div className={styles.image}>
      <Image
        loader={loader}
        src={src}
        width={width}
        height={height ?? 30}
        alt={alt ?? src}
        title={title ?? src}
        loading={loading}
        priority={priority ? true : false}
      />
    </div>
  );
}

import * as React from "react"

interface AvatarProps {
  src: string;
  alt: string;
  size?: number;
}

export const Avatar: React.FC<AvatarProps> = ({ src, alt, size = 50 }) => {
  return (
    <img
      src={src}
      alt={alt}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        objectFit: "cover",
      }}
    />
  );
};

interface AvatarFallbackProps {
  fallbackText: string;
  size?: number;
}

export const AvatarFallback: React.FC<AvatarFallbackProps> = ({ fallbackText, size = 50 }) => {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: "#ccc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size / 2,
        color: "#fff",
      }}
    >
      {fallbackText}
    </div>
  );
};

interface AvatarImageProps extends AvatarProps {}

export const AvatarImage: React.FC<AvatarImageProps> = ({ src, alt, size }) => {
  return <Avatar src={src} alt={alt} size={size} />;
};

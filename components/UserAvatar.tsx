interface Props {
  src: string | null;
  name: string | null;
  size?: number;
  className?: string;
}

export default function UserAvatar({ src, name, size = 32, className = "" }: Props) {
  const initials = (name || "?")[0].toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={name || ""}
        width={size}
        height={size}
        className={`rounded-full object-cover flex-shrink-0 ${className}`}
        style={{ width: size, height: size }}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div
      className={`rounded-full bg-teal/20 text-teal flex items-center justify-center font-sora font-bold flex-shrink-0 ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </div>
  );
}

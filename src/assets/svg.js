export const logo = (
  <svg
    width="160"
    height="40"
    viewBox="0 0 160 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    role="img"
  >
    <title>PetPortrait AI</title>
    {/* Paw icon — solid fills for WCAG contrast on header background */}
    <circle cx="12" cy="14" r="3.5" fill="var(--foreground)" />
    <circle cx="22" cy="10" r="3" fill="var(--foreground)" />
    <circle cx="4" cy="10" r="3" fill="var(--foreground)" />
    <circle cx="8" cy="4" r="2.5" fill="var(--foreground)" />
    <circle cx="18" cy="4" r="2.5" fill="var(--foreground)" />
    {/* Brand text */}
    <text
      x="30"
      y="18"
      fontFamily="system-ui, -apple-system, sans-serif"
      fontSize="16"
      fontWeight="700"
      letterSpacing="-0.02em"
      fill="var(--foreground)"
    >
      PetPortrait
    </text>
    <text
      x="130"
      y="18"
      fontFamily="system-ui, -apple-system, sans-serif"
      fontSize="16"
      fontWeight="400"
      fill="var(--muted-foreground)"
    >
      AI
    </text>
    <text
      x="30"
      y="32"
      fontFamily="system-ui, -apple-system, sans-serif"
      fontSize="9"
      fontWeight="500"
      letterSpacing="0.15em"
      fill="var(--muted-foreground)"
      style={{ textTransform: 'uppercase' }}
    >
      Custom AI Pet Portraits
    </text>
  </svg>
);

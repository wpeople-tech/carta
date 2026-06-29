export type TopoDividerVariant = 1 | 2 | 3 | 4 | 5;

export default function TopoDivider({
  v = 1,
}: {
  v?: TopoDividerVariant,
}) {
  const configs: Record<TopoDividerVariant, {
    paths: string[];
    stroke: string;
    opacity: number;
  }> = {
    1: {
      paths: [
        "M0,24 C120,10 240,38 360,24 C480,10 600,38 720,24 C840,10 960,38 1080,24 C1200,10 1320,38 1440,24",
        "M0,32 C120,18 240,46 360,32 C480,18 600,46 720,32 C840,18 960,46 1080,32 C1200,18 1320,46 1440,32",
        "M0,16 C120,4 240,28 360,16 C480,4 600,28 720,16 C840,4 960,28 1080,16 C1200,4 1320,28 1440,16",
      ],
      stroke: "#0F0F0D",
      opacity: 0.12,
    },
    2: {
      paths: [
        "M0,28 C180,14 360,42 540,28 C720,14 900,42 1080,28 C1260,14 1380,36 1440,28",
        "M0,20 C180,8 360,34 540,20 C720,8 900,34 1080,20 C1260,8 1380,28 1440,20",
      ],
      stroke: "#0F0F0D",
      opacity: 0.12,
    },
    3: {
      paths: [
        "M0,24 C200,8 400,40 600,24 C800,8 1000,40 1200,24 C1320,16 1400,32 1440,24",
        "M0,34 C200,18 400,48 600,34 C800,18 1000,48 1200,34 C1320,26 1400,42 1440,34",
      ],
      stroke: "#F5F4F0",
      opacity: 0.07,
    },
    4: {
      paths: [
        "M0,20 C160,36 320,8 480,24 C640,40 800,12 960,28 C1120,44 1280,16 1440,24",
        "M0,30 C160,46 320,18 480,34 C640,50 800,22 960,38 C1120,54 1280,26 1440,34",
        "M0,12 C160,26 320,2 480,16 C640,30 800,4 960,18 C1120,32 1280,8 1440,16",
      ],
      stroke: "#0F0F0D",
      opacity: 0.12,
    },
    5: {
      paths: [
        "M0,24 C120,10 240,38 360,24 C480,10 600,38 720,24 C840,10 960,38 1080,24 C1200,10 1320,38 1440,24",
        "M0,14 C120,2 240,26 360,14 C480,2 600,26 720,14 C840,2 960,26 1080,14 C1200,2 1320,26 1440,14",
      ],
      stroke: "#0F0F0D",
      opacity: 0.12,
    },
  };

  const { paths, stroke, opacity } = configs[v];
  return (
    <div
      style={{ opacity }}
      className="relative h-12 overflow-hidden z-1"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 48"
        preserveAspectRatio="none"
        className="w-full h-full"
        fill="none"
        stroke={stroke}
        strokeWidth="1"
      >
        {paths.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </svg>
    </div>
  );
}
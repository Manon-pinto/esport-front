export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
      <h1
        style={{
          fontFamily: "var(--font-orbitron)",
          background: "linear-gradient(135deg, #667EEA, #764BA2)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          fontSize: "3rem",
          fontWeight: 800,
          letterSpacing: "0.05em",}}
      >
        ⚡ ESPORT PRO
      </h1>
      <p style={{ color: "#a0aec0", fontSize: "1.1rem" }}>
        Bienvenue sur LA plateforme Esport Pro
      </p>
    </div>
  );
}
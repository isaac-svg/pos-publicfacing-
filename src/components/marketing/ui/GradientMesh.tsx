export default function GradientMesh() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] opacity-40"
        style={{
          background: 'radial-gradient(ellipse at 30% 50%, rgba(99,102,241,0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 30%, rgba(99,102,241,0.1) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(99,102,241,0.08) 0%, transparent 50%)',
          animation: 'meshFloat 20s ease-in-out infinite alternate',
        }}
      />
      <style>{`
        @keyframes meshFloat {
          0% { transform: translate(-50%, -50%) scale(1) rotate(0deg); }
          100% { transform: translate(-50%, -50%) scale(1.05) rotate(2deg); }
        }
      `}</style>
    </div>
  )
}

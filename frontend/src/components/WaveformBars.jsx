export default function WaveformBars({ active = true, bars = 7 }) {
  return (
    <div className="waveform" aria-label="Audio waveform animation">
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className={`waveform-bar${active ? '' : ' waveform-bar--paused'}`}
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );
}

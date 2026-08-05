interface Props {
  colors: string[]
  sizes: number[]
  activeColor: string
  activeSize: number
  onColor: (c: string) => void
  onSize: (s: number) => void
  onClear: () => void
}

export function BrushBar({
  colors,
  sizes,
  activeColor,
  activeSize,
  onColor,
  onSize,
  onClear,
}: Props) {
  return (
    <div className="brushbar">
      <div className="swatches">
        {colors.map((c) => (
          <button
            key={c}
            type="button"
            className={'swatch' + (c === activeColor ? ' swatch--active' : '')}
            style={{ background: c }}
            aria-label={`Colour ${c}`}
            aria-pressed={c === activeColor}
            onClick={() => onColor(c)}
          />
        ))}
      </div>

      <div className="brush-row">
        <div className="sizes">
          {sizes.map((s) => (
            <button
              key={s}
              type="button"
              className={'size' + (s === activeSize ? ' size--active' : '')}
              aria-label={`Brush size ${s}`}
              aria-pressed={s === activeSize}
              onClick={() => onSize(s)}
            >
              <span
                className="size-dot"
                style={{ width: s, height: s, background: activeColor }}
              />
            </button>
          ))}
        </div>

        <button type="button" className="clear-btn" onClick={onClear}>
          🗑 Clear
        </button>
      </div>
    </div>
  )
}

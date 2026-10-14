import React from "react"

// Lesson text with **bold** support (the only formatting lesson content uses)
const RichText = ({ text }: { text: string }) => (
  <>
    {text.split(/(\*\*[^*]+\*\*)/g).map((piece, i) =>
      piece.startsWith("**") && piece.endsWith("**")
        ? <strong key={i} className="font-semibold text-ink">{piece.slice(2, -2)}</strong>
        : <React.Fragment key={i}>{piece}</React.Fragment>
    )}
  </>
)

export default RichText

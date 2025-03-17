import React from 'react'

const pieceSymbols: Record<string, { w: string; b: string }> = {
    r: { w: "/wr.png", b: "/br.png" }, // Rook
    n: { w: "/wn.png", b: "/bn.png" }, // Knight
    b: { w: "/wb.png", b: "/bb.png" }, // Bishop
    q: { w: "/wq.png", b: "/bq.png" }, // Queen
    k: { w: "/wk.png", b: "/bk.png" }, // King
    p: { w: "/wp.png", b: "/bp.png" }, // Pawn
  };
  
export const PieceSymbols = () => {
  return (
    <div>pieceSymbols</div>
  )
}

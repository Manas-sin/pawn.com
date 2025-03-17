declare module "react-chessground" {
    import { ComponentType } from "react";
  
    export interface ChessgroundProps {
      fen?: string;
      onMove?: (from: string, to: string) => void;
      // Add other props as needed
    }
  
    export const Chessground: ComponentType<ChessgroundProps>;
  }
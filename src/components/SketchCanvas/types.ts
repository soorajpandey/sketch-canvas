import type { Color } from '@shopify/react-native-skia';
import type { StyleProp, ViewStyle } from 'react-native';
import type { CompletedPoints } from 'src/store';
import type PropTypes from 'prop-types';

export type StrokeStyle = 'stroke' | 'fill';

export interface SketchCanvasRef {
  reset: () => void;
  undo: () => void;
  toPath: () => CompletedPoints[];
  drawPath: (path: CompletedPoints[]) => void;
  withdraw: () => void;
  toPoints: () => Point[][];
  addPoints: (points: Point[][], style?: StyleOptions) => void;
}

export interface SketchCanvasProps {
  strokeWidth?: number;
  strokeColor?: Color;
  strokeStyle?: 'stroke' | 'fill';
  onEnd?: typeof PropTypes.func;
  containerStyle?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  topChildren?: React.ReactNode;
  bottomChildren?: React.ReactNode;
  eraser?: boolean;
}

export interface StyleOptions {
  strokeColor?: Color;
  strokeStyle?: 'stroke' | 'fill';
  strokeWidth?: number;
}

export type Point = [number, number];
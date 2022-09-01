import {
  Canvas,
  Path,
  TouchInfo,
  useCanvasRef,
  useTouchHandler,
} from '@shopify/react-native-skia';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
} from 'react';
import { drawingState, derivedPaths, CompletedPoints } from '../../store';
import { useSnapshot } from 'valtio';
import { createHistoryStack } from '../../utils';
import type {
  SketchCanvasRef,
  SketchCanvasProps,
  Point,
  StyleOptions,
} from './types';
import { STROKE_COLOR, STROKE_STYLE, STROKE_WIDTH } from './constants';

export const SketchCanvas = forwardRef<SketchCanvasRef, SketchCanvasProps> (
  (
    {
      strokeWidth = STROKE_WIDTH,
      strokeColor = STROKE_COLOR,
      strokeStyle = STROKE_STYLE,
      onEnd,
      containerStyle,
      children,
      topChildren,
      bottomChildren,
      eraser,
    },
    ref
  ) => {
    const pathsSnapshot = useSnapshot(derivedPaths);
    const canvasRef = useCanvasRef();
    const stack = useMemo(
      () =>
        createHistoryStack({
          currentPoints: drawingState.currentPoints,
          completedPoints: drawingState.completedPoints,
        }),
      []
    );

    const _eraser = eraser;
    const _onEnd = onEnd;

    useEffect(() => {
      drawingState.currentPoints.width = strokeWidth;
    }, [strokeWidth]);

    useImperativeHandle(ref, () => ({
      reset() {
        drawingState.currentPoints.points = null;
        drawingState.completedPoints = [];
        stack.push({
          currentPoints: drawingState.currentPoints,
          completedPoints: drawingState.completedPoints,
        });
      },
      undo() {
        const value = stack.undo();
        drawingState.currentPoints = value.currentPoints;
        drawingState.completedPoints = value.completedPoints;
      },
      toPath: () => {
        return drawingState.completedPoints;
      },
      drawPath: (path: CompletedPoints[]) => {
        drawingState.completedPoints = path;
      },
      withdraw: () => {
        drawingState.completedPoints = drawingState.completedPoints.slice(0, -1);
      },
      toPoints: () => {
        return drawingState.completedPoints.map((p) => p.points);
      },
      addPoints: (points: Point[][], style?: StyleOptions) => {
        const formatted = points.map((data) => ({
          id: Date.now(),
          points: data,
          color: style?.strokeColor ?? STROKE_COLOR,
          width: style?.strokeWidth ?? STROKE_WIDTH,
          style: style?.strokeStyle ?? STROKE_STYLE,
        }));
        drawingState.completedPoints = formatted;
      },
    }));

    const touchHandler = useTouchHandler(
      {
        onStart: (touchInfo: TouchInfo) => {
          drawingState.isDrawing = true;
          drawingState.currentPoints.points = [[touchInfo.x, touchInfo.y]];
        },
        onActive: (touchInfo: TouchInfo) => {
          if (!drawingState.isDrawing) {
            return;
          }

          drawingState.currentPoints.points = [
            ...(drawingState.currentPoints.points ?? []),
            [touchInfo.x, touchInfo.y],
          ];
        },
        onEnd: (touchInfo: TouchInfo) => {
          drawingState.isDrawing = false;
          if (!drawingState.currentPoints.points) {
            return;
          }
          if (_eraser) {
            const eraserPoints = [...drawingState.currentPoints.points];
            const maxX = eraserPoints.reduce((a, b) => a[0] > b[0] ? a : b)[0];

            const isCrossing = (a: number[], b: any[], c: number[], d: number[]) =>
              ((a[0] - b[0]) * (c[1] - a[1]) - (a[1] - b[1]) * (c[0] - a[0])) *
              ((a[0] - b[0]) * (d[1] - a[1]) - (a[1] - b[1]) * (d[0] - a[0])) <= 0 &&
              ((c[0] - d[0]) * (a[1] - c[1]) - (c[1] - d[1]) * (a[0] - c[0])) *
              ((c[0] - d[0]) * (b[1] - c[1]) - (c[1] - d[1]) * (b[0] - c[0])) <= 0;

            const isContained = (p1: any[]) => {
              // Winging Number Alghorithm
              const p2 = [maxX + 1, p1[1]];
              const len = eraserPoints.length;
              let counter = 0;
              for (let i = 0; i < len - 1; i++) {
                if (
                  isCrossing(
                    p1, p2,
                    eraserPoints[i],
                    eraserPoints[i + 1]
                  )
                ) {
                  if (eraserPoints[i][1] > eraserPoints[i + 1][1]) {
                    counter++;
                  }
                  else {
                    counter--;
                  }
                }
              }
              if (
                isCrossing(
                  p1, p2,
                  eraserPoints[len - 1],
                  eraserPoints[0]
                )
              ) {
                if (eraserPoints[len - 1][1] > eraserPoints[0][1]) {
                  counter++;
                }
                else {
                  counter--;
                }
              }
              console.log(p1, p2, counter);
              return counter != 0;
            };

            const isContained2 = (points: string | any[]) => {
              const len = points.length;
              for (let i = 0; i < len; i++) {
                if (!isContained(points[i])) {
                  console.log('false');
                  return false;
                }
              }
              console.log('true');
              return true;
            }

            drawingState.currentPoints.points = null;
            drawingState.completedPoints = drawingState.completedPoints.filter(obj => { return !isContained2(obj.points) });
            stack.push({
              currentPoints: drawingState.currentPoints,
              completedPoints: drawingState.completedPoints,
            });
          }
          else {
            drawingState.completedPoints = [
              ...drawingState.completedPoints,
              {
                id: touchInfo.timestamp,
                points: drawingState.currentPoints.points,
                width: drawingState.currentPoints.width,
                color: strokeColor,
                style: strokeStyle,
              },
            ];
            drawingState.currentPoints.points = null;
            stack.push({
              currentPoints: drawingState.currentPoints,
              completedPoints: drawingState.completedPoints,
            });
          }
          if (onEnd) {
            onEnd = _onEnd;
          }
        },
      },
      [strokeColor, strokeStyle]
    );

    return (
      <Canvas ref={canvasRef} onTouch={touchHandler} style={containerStyle}>
        {bottomChildren}
        {children}
        {pathsSnapshot.completed?.map((path) => (
          <Path
            path={path.path}
            key={path.id}
            style={path.style}
            color={path.color}
          />
        ))}
        {pathsSnapshot.current ? (
          <Path
            path={pathsSnapshot.current}
            color={strokeColor}
            style={strokeStyle}
          />
        ) : (
          <></>
        )}
        {topChildren}
      </Canvas>
    );
  }
);

# rn-perfect-sketch-canvas

A React Native component for drawing perfect pressure-sensitive freehand lines using [perfect-freehand](https://github.com/steveruizok/perfect-freehand) and [Skia renderer](https://shopify.github.io/react-native-skia/).

## Installation

```sh
npm install @shopify/react-native-skia rn-perfect-sketch-canvas
```

## Usage

```tsx
import React, { useRef } from 'react';
import { StyleSheet, SafeAreaView, Button } from 'react-native';
import { SketchCanvas, SketchCanvasRef } from 'rn-perfect-sketch-canvas';

export default function App() {
  const canvasRef = useRef<SketchCanvasRef>(null);

  return (
    <SafeAreaView style={styles.container}>
      <SketchCanvas
        ref={canvasRef}
        strokeColor={'black'}
        strokeWidth={8}
        containerStyle={styles.container}
      />
      <Button onPress={canvasRef.current?.reset} title="Reset" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

## Props

| Property           | Type     | Default | Description                                           |
| ------------------ | -------- | ------- | ----------------------------------------------------- |
| `containerStyle`   | object   | {}       | Styles to be applied on canvas component.            |
| `strokeColor`      | string   | black   | Color of stroke.                                      |
| `strokeWidth`      | number   | 8      | Size (diameter) of the stroke.                        |
| `topChildren`      | ReactNode   |      |        Node to be put on top of sketch                 |
| `bottomChildren`      | ReactNode   |      |     Node to be put on bottom of sketch (Background)                    |

## Methods

| Method           | Description|
| ------------------ | -------- |
| `undo()`      | Undo   |
| `toPath()`      | Get the array of point with {color, width, style, id} groups that got drawn in the canvas.    |
| `drawPath(path: points[])`      | Draws from an array of point with {color, width, style, id} groups.   |
| `toPoints()`      | Get the array of point groups that got drawn in the canvas.    |
| `addPoints(points: [x, y][][])`      | Draws from an array of point groups.   |

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## Inspired By

Please check out these previous works that helped inspire the creation of rn-perfect-sketch-canvas.

- [terrylinla/react-native-sketch-canvas](https://github.com/terrylinla/react-native-sketch-canvas) - A React Native component for drawing by touching on both iOS and Android.
- [uragirii/rn-skia-sketch-canvas](https://github.com/uragirii/rn-skia-sketch-canvas) - A React Native component for drawing using Skia renderer.

## License

MIT

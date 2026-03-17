import React from 'react';
import { View, StyleSheet } from 'react-native';

interface CornerAccentsProps {
  color?: string;
  size?: number;
  thickness?: number;
}

export default function CornerAccents({ 
  color = '#6366f1', 
  size = 12, 
  thickness = 2 
}: CornerAccentsProps) {
  const cornerStyle = {
    width: size,
    height: size,
    borderColor: color,
  };

  return (
    <>
      {/* Top Left */}
      <View style={[
        styles.corner,
        styles.cornerTL,
        cornerStyle,
        { borderTopWidth: thickness, borderLeftWidth: thickness }
      ]} />
      
      {/* Top Right */}
      <View style={[
        styles.corner,
        styles.cornerTR,
        cornerStyle,
        { borderTopWidth: thickness, borderRightWidth: thickness }
      ]} />
      
      {/* Bottom Left */}
      <View style={[
        styles.corner,
        styles.cornerBL,
        cornerStyle,
        { borderBottomWidth: thickness, borderLeftWidth: thickness }
      ]} />
      
      {/* Bottom Right */}
      <View style={[
        styles.corner,
        styles.cornerBR,
        cornerStyle,
        { borderBottomWidth: thickness, borderRightWidth: thickness }
      ]} />
    </>
  );
}

const styles = StyleSheet.create({
  corner: {
    position: 'absolute',
    zIndex: 10,
  },
  cornerTL: {
    top: 0,
    left: 0,
  },
  cornerTR: {
    top: 0,
    right: 0,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
  },
});

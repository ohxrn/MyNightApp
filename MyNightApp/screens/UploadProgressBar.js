import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle, Rect } from "react-native-svg";

function UploadProgressBar({ progress }) {
  const barWidth = 230;
  const progressWidth = (progress / 100) * barWidth;
  return (
    <View>
      <Svg width={barWidth} height={"7"}>
        <Rect
          width={barWidth}
          height={"100%"}
          fill={"#eee"}
          rx={3.5}
          ry={3.5}
        />
        <Rect
          width={progressWidth}
          height={"100%"}
          fill={"turquoise"}
          rx={3.5}
          ry={3.5}
        />
      </Svg>
    </View>
  );
}

export default UploadProgressBar;

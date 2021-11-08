// Color Fixer, Beta

// Functions ---------------------------------------------------------------------------------------
const rgbToHsl = ({ r, g, b }) => {
  let v = Math.max(r, g, b),
    c = v - Math.min(r, g, b),
    f = 1 - Math.abs(v + v - c - 1);
  let h =
    c && (v == r ? (g - b) / c : v == g ? 2 + (b - r) / c : 4 + (r - g) / c);
  return {
    h: Math.round(60 * (h < 0 ? h + 6 : h)),
    s: Math.round((f ? c / f : 0) * 100),
    l: Math.round(((v + v - c) / 2) * 100),
  };
};

const isSimilarColor = (color, themeColor, colorOpacity = 100, themeOpacity = 100): Boolean => {
  const { h: colorH, s: colorS, l: colorL } = rgbToHsl(color);
  const { h: themeH, s: themeS, l: themeL } = rgbToHsl(themeColor);
  const colorO = colorOpacity;
  const themeO = themeOpacity;

  const isSimilarHue = (colorHue, themeHue) => {
    const hueDifference = 5;

    if(colorHue === themeHue) return true;

    if(colorHue > themeHue && colorHue - themeHue <= hueDifference) {
      return true;
    } else if(colorHue < themeHue && themeHue - colorHue <= hueDifference) {
      return true;
    } else {
      return false;
    }
  }

  const isSimilarSaturation = (colorSaturation, themeSaturation) => {
    const saturationDifference = 5;

    if(colorSaturation === themeSaturation) return true;

    if(colorSaturation > themeSaturation && colorSaturation - themeSaturation <= saturationDifference) {
      return true;
    } else if(colorSaturation < themeSaturation && themeSaturation - colorSaturation <= saturationDifference) {
      return true;
    } else {
      return false;
    }
  }

  const isSimilarLight = (colorLight, themeLight) => {
    const colorDifference = 5;

    if(colorLight === themeLight) return true;

    if(colorLight > themeLight && colorLight - themeLight <= colorDifference) {
      return true;
    } else if(colorLight < themeLight && themeLight - colorLight <= colorDifference) {
      return true;
    } else {
      return false;
    }
  }

  const isSameOpacity = (colorOpacity, themeOpacity) => {
    return colorOpacity === themeOpacity;
  }

  return isSameOpacity(colorO, themeO) && isSimilarHue(colorH, themeH) && isSimilarSaturation(colorS, themeS) && isSimilarLight(colorL, themeL);
};

const isSimilarImages = (image, themeImage): Boolean => image === themeImage;

const fixColor = (node, themeStyles) => {
  if(node.fillStyleId === themeStyles.id || node.strokeStyleId === themeStyles.id) return;

  if (node.fills.length !== 1 && node.strokes.length !== 1) return;

  if (node.fills.length === 1 && node.fills[0].type === "SOLID") {
    if (isSimilarColor(node.fills[0].color, themeStyles.paints[0].color, node.fills[0].opacity, themeStyles.paints[0].opacity)){
      node.fillStyleId = themeStyles.id;
    }
  }

  if (node.strokes.length === 1 && node.strokes[0].type === "SOLID") {
    if (isSimilarColor(node.strokes[0].color, themeStyles.paints[0].color, node.strokes[0].opacity, themeStyles.paints[0].opacity)){
      node.strokeStyleId = themeStyles.id;
    }
  }
};

const fixImage = (node, themeStyles) => {
  if(node.fillStyleId === themeStyles.id || node.strokeStyleId === themeStyles.id) return;

  if (node.fills.length !== 1 && node.strokes.length !== 1) return;

  if(node.fills.length === 1 && node.fills[0].type === "IMAGE") {
    if(node.fills[0].imageHash === themeStyles.paints[0].imageHash) {
      node.fillStyleId = themeStyles.id;
    }
  };

  if(node.strokes.length === 1 && node.strokes[0].type === "IMAGE") {
    if(node.strokes[0].imageHash === themeStyles.paints[0].imageHash) {
      node.strokeStyleId = themeStyles.id;
    }
  };
}

const fixColors = (objectsArray, stylesArray) => {
  for (const element1 of objectsArray) {
    for (const element2 of stylesArray) {
      fixColor(element1, element2);
    }
  }
};

const fixImages = (objectsArray, stylesArray) => {
  for (const element1 of objectsArray) {
    for (const element2 of stylesArray) {
      fixImage(element1, element2);
    }
  }
};

const main = () => {
  const themeStyles = figma.getLocalPaintStyles();
  
  if (themeStyles.length === 0) {
    figma.notify("Layout with color styles is required");
    return
  };
  
  const themeColors = themeStyles.filter(item => item.paints[0].type === "SOLID") as Array<PaintStyle>;
  const themeImages = themeStyles.filter(item => item.paints[0].type === "IMAGE") as Array<PaintStyle>;
  const allOjectsOnPage = figma.currentPage.findAll((item) => item.type !== 'BOOLEAN_OPERATION' && item.type !== 'SLICE' && item.type !== "COMPONENT" && item.type !== "GROUP" && item.type !== "COMPONENT_SET" && item.type !== "FRAME" && item.type !== "INSTANCE" && item.type !== "STICKY" && item.type !== "STAMP" && item.type !== "WIDGET" && item.type !== "SHAPE_WITH_TEXT" && item.type !== "CONNECTOR");
  
  fixColors(allOjectsOnPage, themeColors);
  fixImages(allOjectsOnPage, themeImages);
};

// Work --------------------------------------------------------------------------------------------
main();
figma.closePlugin();
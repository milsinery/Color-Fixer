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

const isSameOpacity = (colorOpacity: number, themeOpacity: number) =>
  colorOpacity === themeOpacity;

const isSimilarHue = (colorHue, themeHue) => {
  if (colorHue === themeHue) return true;
  return (
    (colorHue > themeHue && colorHue - themeHue <= 5) ||
    (colorHue < themeHue && themeHue - colorHue <= 5)
  );
};

const isSimilarSaturation = (colorSaturation, themeSaturation) => {
  if (colorSaturation === themeSaturation) return true;
  return (
    (colorSaturation > themeSaturation &&
      colorSaturation - themeSaturation <= 5) ||
    (colorSaturation < themeSaturation &&
      themeSaturation - colorSaturation <= 5)
  );
};

const isSimilarLight = (colorLight, themeLight) => {
  if (colorLight === themeLight) return true;
  return (
    (colorLight > themeLight && colorLight - themeLight <= 5) ||
    (colorLight < themeLight && themeLight - colorLight <= 5)
  );
};

const isSimilarColor = (
  color: { r: number; g: number; b: number },
  themeColor: { r: number; g: number; b: number },
  colorOpacity: number,
  themeOpacity: number
): Boolean => {
  const { h: colorHue, s: colorSaturation, l: colorLight } = rgbToHsl(color);
  const {
    h: themeHue,
    s: themeSaturation,
    l: themeLight,
  } = rgbToHsl(themeColor);

  return (
    isSameOpacity(colorOpacity, themeOpacity) &&
    isSimilarHue(colorHue, themeHue) &&
    isSimilarSaturation(colorSaturation, themeSaturation) &&
    isSimilarLight(colorLight, themeLight)
  );
};

const isSimilarImages = (image, themeImage): Boolean => image === themeImage;

const isSameStyles = (colors, styles) => {
  if (colors.length !== styles.length) return;

  if(colors[0].type !== styles[0].type) return;

  let flag = colors.length;

  for (let index = 0; index < colors.length; index++) {
    if (colors[index].visible === false) return;

    if (
      colors[index].color !== undefined &&
      styles[index].color !== undefined
    ) {
      if (
        colors[index].type === 'SOLID' &&
        isSimilarColor(
          colors[index].color,
          styles[index].color,
          colors[index].opacity,
          styles[index].opacity
        )
      ) {
        flag--;
      }
    } else if (
      colors[index].type === 'IMAGE' &&
      isSimilarImages(colors[index].imageHash, styles[index].imageHash)
    ) {
      flag--;
    }
  }

  return flag === 0;
};

const fixColor = (node, themeStyles) => {
  if (
    node.fillStyleId === themeStyles.id ||
    node.strokeStyleId === themeStyles.id
  )
    return;
  if (isSameStyles(node.fills, themeStyles.paints))
    node.fillStyleId = themeStyles.id;
  if (isSameStyles(node.strokes, themeStyles.paints))
    node.strokeStyleId = themeStyles.id;
};

const fixColors = (objectsArray, stylesArray) => {
  for (const element1 of objectsArray) {
    for (const element2 of stylesArray) {
      fixColor(element1, element2);
    }
  }
};

const isInstanceOrParentInstance = (obj) => {
  if (obj.type === 'INSTANCE' || obj.parent.type === 'INSTANCE') return true;

  if (
    obj.type !== 'INSTANCE' &&
    obj.parent.type !== 'INSTANCE' &&
    obj.parent.type === 'PAGE'
  ) {
    return false;
  } else {
    if (
      obj.type !== 'INSTANCE' &&
      obj.parent.type !== 'INSTANCE' &&
      obj.parent.type !== 'PAGE'
    )
      return isInstanceOrParentInstance(obj.parent);
  }
};

const main = () => {
  const themeStyles = figma.getLocalPaintStyles();

  if (themeStyles.length === 0) {
    figma.notify('Layout with color styles is required');
    return;
  }

  const allObjectsOnPage = figma.currentPage.findAll(
    (item) =>
      item.type === 'LINE' ||
      item.type === 'ELLIPSE' ||
      item.type === 'POLYGON' ||
      item.type === 'VECTOR' ||
      item.type === 'STAR' ||
      item.type === 'RECTANGLE' ||
      item.type === 'FRAME' ||
      item.type === 'TEXT' ||
      item.type === 'COMPONENT'
  );
  const allFiltered = allObjectsOnPage.filter(
    (item) => item.visible && !isInstanceOrParentInstance(item)
  );

  if (allFiltered.length === 0) {
    figma.notify('There are no items to check on this page');
    return;
  }

  fixColors(allFiltered, themeStyles);
};

main();
figma.closePlugin();

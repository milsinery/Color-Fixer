// Color Fixer, Beta
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Functions ---------------------------------------------------------------------------------------
const rgbToHsl = ({ r, g, b }) => {
    let v = Math.max(r, g, b), c = v - Math.min(r, g, b), f = 1 - Math.abs(v + v - c - 1);
    let h = c && (v == r ? (g - b) / c : v == g ? 2 + (b - r) / c : 4 + (r - g) / c);
    return {
        h: Math.round(60 * (h < 0 ? h + 6 : h)),
        s: Math.round((f ? c / f : 0) * 100),
        l: Math.round(((v + v - c) / 2) * 100),
    };
};
const isSimilarColor = (color, themeColor, colorOpacity, themeOpacity) => {
    const { h: colorHue, s: colorSaturation, l: colorLight } = rgbToHsl(color);
    const { h: themeHue, s: themeSaturation, l: themeLight } = rgbToHsl(themeColor);
    const isSameOpacity = (colorOpacity, themeOpacity) => colorOpacity === themeOpacity;
    const isSimilarHue = (colorHue, themeHue) => {
        if (colorHue === themeHue)
            return true;
        return (colorHue > themeHue && colorHue - themeHue <= 5) || (colorHue < themeHue && themeHue - colorHue <= 5);
    };
    const isSimilarSaturation = (colorSaturation, themeSaturation) => {
        if (colorSaturation === themeSaturation)
            return true;
        return ((colorSaturation > themeSaturation && colorSaturation - themeSaturation <= 5) || (colorSaturation < themeSaturation && themeSaturation - colorSaturation <= 5));
    };
    const isSimilarLight = (colorLight, themeLight) => {
        if (colorLight === themeLight)
            return true;
        return ((colorLight > themeLight && colorLight - themeLight <= 5) || (colorLight < themeLight && themeLight - colorLight <= 5));
    };
    return isSameOpacity(colorOpacity, themeOpacity) && isSimilarHue(colorHue, themeHue) && isSimilarSaturation(colorSaturation, themeSaturation) && isSimilarLight(colorLight, themeLight);
};
const isSimilarImages = (image, themeImage) => image === themeImage;
const isSimilarGradient = (gradient, themeGradient) => {
    return false;
};
const isSameStyles = (colors, styles) => {
    if (colors.length !== styles.length)
        return;
    let flag = colors.length;
    for (let index = 0; index < colors.length; index++) {
        if (colors[index].color === undefined || styles[index].color === undefined)
            return;
        if (colors[index].visible === false)
            return;
        if (colors[index].type === "SOLID" && isSimilarColor(colors[index].color, styles[index].color, colors[index].opacity, styles[index].opacity)) {
            flag--;
        }
        ;
        if (colors[index].type === "IMAGE" && isSimilarImages(colors[index].imageHash, styles[index].imageHash)) {
            flag--;
        }
        ;
        if (colors[index].type === "GRADIENT_LINEAR" && isSimilarGradient(colors[index], styles[index])) {
            console.log("Gradient");
        }
        ;
    }
    return flag === 0;
};
const fixColor = (node, themeStyles) => __awaiter(this, void 0, void 0, function* () {
    if (node.fillStyleId === themeStyles.id || node.strokeStyleId === themeStyles.id)
        return;
    if (isSameStyles(node.fills, themeStyles.paints))
        node.fillStyleId = themeStyles.id;
    if (isSameStyles(node.strokes, themeStyles.paints))
        node.strokeStyleId = themeStyles.id;
});
const fixColors = (objectsArray, stylesArray) => {
    for (const element1 of objectsArray) {
        for (const element2 of stylesArray) {
            fixColor(element1, element2);
        }
    }
};
const main = () => {
    const themeStyles = figma.getLocalPaintStyles();
    if (themeStyles.length === 0) {
        figma.notify("Layout with color styles is required");
        return;
    }
    ;
    const allObjectsOnPage = figma.currentPage.findAll((item) => item.type !== 'BOOLEAN_OPERATION' && item.type !== 'SLICE' && item.type !== "GROUP" && item.type !== "COMPONENT_SET" && item.type !== "STICKY" && item.type !== "STAMP" && item.type !== "WIDGET" && item.type !== "SHAPE_WITH_TEXT" && item.type !== "CONNECTOR");
    if (allObjectsOnPage.length === 0) {
        figma.notify("There are no items to check on this page");
        return;
    }
    fixColors(allObjectsOnPage, themeStyles);
};
// Work --------------------------------------------------------------------------------------------
main();
figma.closePlugin();

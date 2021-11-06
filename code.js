// Color Fixer, Beta
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
const isSimilarColor = (color, themeColor) => rgbToHsl(color).h === rgbToHsl(themeColor).h;
const isSimilarImages = (image, themeImage) => image === themeImage;
const fixColors = (node, themeStyles) => {
    if (node.fillStyleId === themeStyles.id || node.strokeStyleId === themeStyles.id)
        return;
    if (node.fills.length !== 1 && node.strokes.length !== 1)
        return;
    if (node.fills.length === 1 && node.fills[0].type === "SOLID") {
        if (isSimilarColor(node.fills[0].color, themeStyles.paints[0].color)) {
            node.fillStyleId = themeStyles.id;
        }
    }
    if (node.strokes.length === 1 && node.strokes[0].type === "SOLID") {
        if (isSimilarColor(node.strokes[0].color, themeStyles.paints[0].color)) {
            node.strokeStyleId = themeStyles.id;
        }
    }
};
const fixImages = (node, themeStyles) => {
    if (node.fillStyleId === themeStyles.id || node.strokeStyleId === themeStyles.id)
        return;
    if (node.fills.length !== 1 && node.strokes.length !== 1)
        return;
    if (node.fills.length === 1 && node.fills[0].type === "IMAGE") {
        if (node.fills[0].imageHash === themeStyles.paints[0].imageHash) {
            node.fillStyleId = themeStyles.id;
        }
    }
    ;
    if (node.strokes.length === 1 && node.strokes[0].type === "IMAGE") {
        if (node.strokes[0].imageHash === themeStyles.paints[0].imageHash) {
            node.strokeStyleId = themeStyles.id;
        }
    }
    ;
};
const fixColorsOfGroups = (objectsArray, stylesArray) => {
    for (const element1 of objectsArray) {
        for (const element2 of stylesArray) {
            fixColors(element1, element2);
        }
    }
};
const fixImagesOfGroups = (objectsArray, stylesArray) => {
    for (const element1 of objectsArray) {
        for (const element2 of stylesArray) {
            fixImages(element1, element2);
        }
    }
};
const main = () => {
    const themeStyles = figma.getLocalPaintStyles();
    if (themeStyles.length === 0) {
        figma.notify("В этом файле нет стилей, а они как раз и нужны");
        return;
    }
    ;
    const themeColors = themeStyles.filter(item => item.paints[0].type === "SOLID");
    const themeImages = themeStyles.filter(item => item.paints[0].type === "IMAGE");
    const allOjectsOnPage = figma.currentPage.findAll((item) => item.type !== 'BOOLEAN_OPERATION' && item.type !== 'SLICE' && item.type !== "COMPONENT" && item.type !== "GROUP" && item.type !== "COMPONENT_SET" && item.type !== "FRAME" && item.type !== "INSTANCE" && item.type !== "STICKY" && item.type !== "STAMP" && item.type !== "WIDGET" && item.type !== "SHAPE_WITH_TEXT" && item.type !== "CONNECTOR");
    fixColorsOfGroups(allOjectsOnPage, themeColors);
    fixImagesOfGroups(allOjectsOnPage, themeImages);
};
// Work --------------------------------------------------------------------------------------------
main();
figma.closePlugin();

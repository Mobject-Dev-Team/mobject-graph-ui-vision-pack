import { UiDraw, UiTheme } from "mobject-graph-ui";

/**
 * Draws a selection box (with mask, border, labels, diagonal) using theme or overrides.
 */
export class UiVisionDraw {
  /**
   * Draws the full selection overlay.
   * @param {CanvasRenderingContext2D} ctx
   * @param {object} selectionStart - {canvasX, canvasY}
   * @param {object} selectionEnd - {canvasX, canvasY}
   * @param {object} drawArea - {x, y, width, height}
   * @param {object} imageInfo - {nWidth, nHeight}
   * @param {object} options - optional per-call overrides for style/theme
   */
  static drawSelectionBox(
    ctx,
    selectionStart,
    selectionEnd,
    drawArea,
    imageInfo,
    {
      // Defaults from theme, can be overridden per-call
      border = UiTheme.selection.border,
      borderWidth = UiTheme.selection.lineWidth,
      borderDash = UiTheme.selection.dashed,
      fill = UiTheme.selection.fill,
      labelFont = UiTheme.selection.labelFont || UiTheme.font.bold,
      labelText = UiTheme.selection.labelText,
      labelBg = UiTheme.selection.labelBg,
      labelPadding = UiTheme.selection.labelPadding ?? UiTheme.box.padding,
      diagonalDash = UiTheme.selection.dashed,
      diagonalWidth = UiTheme.selection.diagonalLineWidth,
    } = {}
  ) {
    if (!selectionStart || !selectionEnd) return;
    const { canvasX: x0, canvasY: y0 } = selectionStart;
    const { canvasX: x1, canvasY: y1 } = selectionEnd;

    // Draw the semi-transparent mask
    UiVisionDraw._drawSelectionOverlayMask(ctx, drawArea, x0, y0, x1, y1, fill);

    // Draw the dashed rectangle
    UiVisionDraw._drawSelectionDashedRect(
      ctx,
      x0,
      y0,
      x1,
      y1,
      border,
      borderWidth,
      borderDash
    );

    // Draw the corner/edge labels
    UiVisionDraw._drawSelectionCornerLabels(
      ctx,
      x0,
      y0,
      x1,
      y1,
      drawArea,
      imageInfo,
      labelFont,
      labelText,
      labelBg,
      labelPadding
    );

    // Draw the diagonal measurement
    UiVisionDraw._drawSelectionDiagonalMeasurement(
      ctx,
      x0,
      y0,
      x1,
      y1,
      drawArea,
      imageInfo,
      diagonalDash,
      diagonalWidth,
      border,
      labelFont,
      labelText,
      labelBg,
      labelPadding
    );
  }

  static _drawSelectionDashedRect(
    ctx,
    x0,
    y0,
    x1,
    y1,
    border,
    borderWidth,
    borderDash
  ) {
    ctx.save();
    ctx.strokeStyle = border;
    ctx.lineWidth = borderWidth;
    ctx.setLineDash(borderDash);
    ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
    ctx.restore();
  }

  static _drawSelectionOverlayMask(ctx, drawRect, x0, y0, x1, y1, fill) {
    ctx.save();
    ctx.fillStyle = fill;
    // The selection box, normalized
    const left = Math.min(x0, x1),
      right = Math.max(x0, x1);
    const top = Math.min(y0, y1),
      bottom = Math.max(y0, y1);

    // Top
    ctx.fillRect(drawRect.x, drawRect.y, drawRect.width, top - drawRect.y);
    // Bottom
    ctx.fillRect(
      drawRect.x,
      bottom,
      drawRect.width,
      drawRect.y + drawRect.height - bottom
    );
    // Left
    ctx.fillRect(drawRect.x, top, left - drawRect.x, bottom - top);
    // Right
    ctx.fillRect(right, top, drawRect.x + drawRect.width - right, bottom - top);
    ctx.restore();
  }

  static _drawSelectionCornerLabels(
    ctx,
    x0,
    y0,
    x1,
    y1,
    drawRect,
    imageInfo,
    font,
    fg,
    bg,
    padding
  ) {
    const { x, y, width, height } = drawRect;
    const nativeWidth = imageInfo.nWidth;
    const nativeHeight = imageInfo.nHeight;
    const scaleX = nativeWidth / width;
    const scaleY = nativeHeight / height;

    const toImageCoords = (cx, cy) => [
      Math.min(nativeWidth - 1, Math.floor((cx - x) * scaleX)),
      Math.min(nativeHeight - 1, Math.floor((cy - y) * scaleY)),
    ];

    const [imgX0, imgY0] = toImageCoords(x0, y0);
    const [imgX1, imgY1] = toImageCoords(x1, y1);

    // Label for initial point (top of the selection)
    UiDraw.drawTextBox(ctx, `(${imgX0}, ${imgY0})`, x0, y0 - 15, {
      font,
      fg,
      bg,
      padding,
    });

    // Label for final point (bottom of the selection)
    UiDraw.drawTextBox(ctx, `(${imgX1}, ${imgY1})`, x1, y1 + 15, {
      font,
      fg,
      bg,
      padding,
    });

    // Width label in image space
    const widthPx = Math.abs(imgX1 - imgX0) + 1;
    const midTopX = (x0 + x1) / 2;
    UiDraw.drawTextBox(ctx, `${widthPx}px`, midTopX, Math.min(y0, y1), {
      font,
      fg,
      bg,
      padding,
    });

    // Height label in image space
    const heightPx = Math.abs(imgY1 - imgY0) + 1;
    const midLeftY = (y0 + y1) / 2;
    UiDraw.drawTextBox(ctx, `${heightPx}px`, Math.max(x0, x1), midLeftY, {
      font,
      fg,
      bg,
      padding,
    });
  }

  static _drawSelectionDiagonalMeasurement(
    ctx,
    x0,
    y0,
    x1,
    y1,
    drawRect,
    imageInfo,
    dash,
    width,
    border,
    font,
    fg,
    bg,
    padding
  ) {
    const { x, y, w, h } = drawRect;
    const nativeWidth = imageInfo.nWidth;
    const nativeHeight = imageInfo.nHeight;
    const scaleX = nativeWidth / drawRect.width;
    const scaleY = nativeHeight / drawRect.height;

    const toImageCoords = (cx, cy) => [
      Math.min(nativeWidth - 1, Math.floor((cx - x) * scaleX)),
      Math.min(nativeHeight - 1, Math.floor((cy - y) * scaleY)),
    ];

    const [imgX0, imgY0] = toImageCoords(x0, y0);
    const [imgX1, imgY1] = toImageCoords(x1, y1);

    const dx = Math.abs(imgX1 - imgX0) + 1;
    const dy = Math.abs(imgY1 - imgY0) + 1;
    const length = Math.sqrt(dx * dx + dy * dy).toFixed(2);

    const mx = (x0 + x1) / 2;
    const my = (y0 + y1) / 2;

    ctx.save();
    ctx.strokeStyle = border;
    ctx.lineWidth = width;
    ctx.setLineDash(dash);
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1.0;

    UiDraw.drawTextBox(ctx, `${length}px`, mx, my, {
      font,
      fg,
      bg,
      padding,
    });
    ctx.restore();
  }

  static drawCheckerboardBackground(
    ctx,
    x,
    y,
    width,
    height,
    {
      blockSize = UiTheme.checkerboard.size,
      dark = UiTheme.checkerboard.dark,
      light = UiTheme.checkerboard.light,
    } = {}
  ) {
    ctx.fillStyle = dark;
    ctx.fillRect(x, y, width, height);

    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.clip();

    const blocksY = Math.ceil(height / blockSize);
    const blocksX = Math.ceil(width / blockSize);

    for (let i = 0; i < blocksY; ++i) {
      for (let j = 0; j < blocksX; ++j) {
        if ((i + j) % 2 === 0) {
          const bx = x + j * blockSize;
          const by = y + i * blockSize;
          const w = Math.min(blockSize, width - (bx - x));
          const h = Math.min(blockSize, height - (by - y));
          ctx.fillStyle = light;
          ctx.fillRect(bx, by, w, h);
        }
      }
    }
    ctx.restore();
  }

  static drawImageBorder(
    ctx,
    x,
    y,
    width,
    height,
    { color = UiTheme.box.border, borderWidth = 1 } = {}
  ) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = borderWidth;
    ctx.strokeRect(x, y, width, height);
    ctx.restore();
  }

  static drawPlaceholderText(
    ctx,
    text,
    x,
    y,
    width,
    height,
    {
      font = UiTheme.font.italic || "italic 10pt Sans-serif",
      color = UiTheme.text.disabled,
    } = {}
  ) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.fillText(text, x + width * 0.5, y + height * 0.5);
    ctx.restore();
  }

  static drawImagePanel(
    ctx,
    image,
    x,
    y,
    width,
    height,
    {
      theme = UiTheme,
      placeholderText = "No image",
      borderColor = theme.box.border,
      borderWidth = 1,
      checkerDark = theme.checkerboard.dark,
      checkerLight = theme.checkerboard.light,
      checkerSize = theme.checkerboard.size,
      placeholderFont = theme.font.italic || "italic 12px sans-serif",
      placeholderColor = theme.text.disabled,
    } = {}
  ) {
    // Checkerboard background
    UiVisionDraw.drawCheckerboardBackground(ctx, x, y, width, height, {
      dark: checkerDark,
      light: checkerLight,
      blockSize: checkerSize,
    });

    // Border
    UiVisionDraw.drawImageBorder(ctx, x, y, width, height, {
      color: borderColor,
      borderWidth,
    });

    // Placeholder (if no image)
    if (!image || !image.src) {
      UiVisionDraw.drawPlaceholderText(
        ctx,
        placeholderText,
        x,
        y,
        width,
        height,
        {
          font: placeholderFont,
          color: placeholderColor,
        }
      );
      return false; // No image drawn
    }

    // Draw the actual image
    ctx.drawImage(image, x, y, width, height);
    return true; // Image drawn
  }

  static drawMetaInfoBox(
    ctx,
    metaLines,
    x,
    y,
    maxWidth,
    {
      font = UiTheme.font.normal,
      color = UiTheme.text.color,
      lineHeight = 16,
    } = {}
  ) {
    ctx.save();
    ctx.font = font;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillStyle = color;

    ctx.beginPath();
    ctx.rect(x, y, maxWidth, metaLines.length * lineHeight);
    ctx.clip();

    metaLines.forEach((line, i) => {
      const fittedText = this._truncateToWidth(ctx, line, maxWidth);
      ctx.fillText(fittedText, x, y + i * lineHeight);
    });

    ctx.restore();
  }

  static _truncateToWidth(ctx, text, maxWidth) {
    if (ctx.measureText(text).width <= maxWidth) return text;

    const ellipsis = "…";
    let low = 0;
    let high = text.length;

    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      const substr = text.slice(0, mid) + ellipsis;
      if (ctx.measureText(substr).width <= maxWidth) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }

    return text.slice(0, low - 1) + ellipsis;
  }
}

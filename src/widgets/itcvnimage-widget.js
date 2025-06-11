import { DisplayWidget, ControlWidget } from "mobject-graph-ui";

import { jpegUrlToITcVnImage } from "../utils/image-converters/jpeg-conversion.js";
import { pngUrlToITcVnImage } from "../utils/image-converters/png-conversion.js";
import { bmpUrlToITcVnImage } from "../utils/image-converters/bmp-conversion.js";
import { tiffUrlToITcVnImage } from "../utils/image-converters/tiff-conversion.js";
import { ImageDisplayComponent } from "../components/image-display-component.js";

export class ITcVnImageDisplayWidget extends DisplayWidget {
  constructor(name, parent, options) {
    super(name, parent, options);
    this.imageDisplay = new ImageDisplayComponent({});
    this.on("valueChanged", async (newValue, oldValue) => {
      await this.imageDisplay.setImageData(newValue);
    });
  }

  computeSize() {
    return this.imageDisplay.computeSize(100, 100);
  }

  onMouseOver(event, pos, node) {
    this.imageDisplay.onMouseOver(event, pos, node, this.value);
    this.parent?.graph?.setDirtyCanvas(true, false);
  }

  draw(ctx, node, widget_width, y, H) {
    this.imageDisplay.draw(ctx, node, widget_width, y, H, {
      showEmptyText: "No image",
      outline_color: "#000",
    });
  }
}

export class ITcVnImageControlWidget extends ControlWidget {
  static DEFAULT_SIZE = new Float32Array([100, 100]);
  static OUTLINE_COLOR = "#000";
  static BACKGROUND_COLOR = "#303030";
  static TEXT_COLOR = "#FFF";

  constructor(name, property, parameter, content) {
    super(name, property, parameter, content);
    this.imageDisplay = new ImageDisplayComponent({});
    this.droppedImageSize = ITcVnImageControlWidget.DEFAULT_SIZE;

    this.FILE_HANDLERS = {
      "image/jpeg": (url) => jpegUrlToITcVnImage(url),
      "image/png": (url) => pngUrlToITcVnImage(url),
      "image/bmp": (url) => bmpUrlToITcVnImage(url),
      "image/tiff": (url) => tiffUrlToITcVnImage(url),
    };

    this.on("valueChanged", async (newValue, oldValue) => {
      await this.imageDisplay.setImageData(newValue);
      this.parent.setDirtyCanvas(true, true);
    });
  }

  computeSize() {
    return this.imageDisplay.computeSize(
      this.droppedImageSize[0],
      this.droppedImageSize[1]
    );
  }

  onMouseOver(event, pos, node) {
    this.imageDisplay.onMouseOver(event, pos, node, this.value);
    this.parent?.graph?.setDirtyCanvas(true, false);
  }

  draw(ctx, node, widget_width, y, H) {
    this.imageDisplay.draw(ctx, node, widget_width, y, H, {
      showEmptyText: "Drag image here",
      outline_color: ITcVnImageControlWidget.OUTLINE_COLOR,
    });
  }

  async onDropFile(file) {
    const fileType = file.type;
    if (this.FILE_HANDLERS[fileType]) {
      try {
        const itcVnImageData = await this.FILE_HANDLERS[fileType](file);
        this.value = itcVnImageData;
        await this.imageDisplay.setImageData(itcVnImageData);
        this.updateDroppedImageSize(this.imageDisplay.widgetDisplayImage);
      } catch (error) {
        console.error(`Error processing the file: ${error}`);
      }
      return true;
    } else {
      console.error(`Unsupported file type: ${fileType}`);
      return false;
    }
  }

  updateDroppedImageSize(image) {
    let originalWidth = image.width;
    let originalHeight = image.height;
    let newHeight = 200;
    let aspectRatio = originalWidth / originalHeight;
    let newWidth = newHeight * aspectRatio;
    this.droppedImageSize = new Float32Array([newWidth, newHeight]);
    this.triggerParentResetSize?.();
  }
}

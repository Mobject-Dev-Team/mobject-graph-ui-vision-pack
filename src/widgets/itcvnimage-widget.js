import { DisplayWidget, ControlWidget } from "mobject-graph-ui";
import { jpegUrlToITcVnImage } from "../utils/image-converters/jpeg-conversion.js";
import { pngUrlToITcVnImage } from "../utils/image-converters/png-conversion.js";
import { bmpUrlToITcVnImage } from "../utils/image-converters/bmp-conversion.js";
import { tiffUrlToITcVnImage } from "../utils/image-converters/tiff-conversion.js";
import { ImageDisplayComponent } from "../components/image-display-component.js";

export class ITcVnImageDisplayWidget extends DisplayWidget {
  static DEFAULT_SIZE = new Float32Array([300, 300]);

  constructor(name, parent, options) {
    super(name, parent, options);
    this.label = "Image Display";
    this.imageDisplay = new ImageDisplayComponent({});
    this.on("valueChanged", async (newValue, oldValue) => {
      await this.imageDisplay.setImageData(newValue);
    });
  }

  computeSize() {
    return this.imageDisplay.computeSize(
      ITcVnImageDisplayWidget.DEFAULT_SIZE[0],
      ITcVnImageDisplayWidget.DEFAULT_SIZE[1]
    );
  }

  mouse(event, pos, parentNode) {
    this.imageDisplay.onMouse(event, pos, parentNode, this.value);
  }

  onMouseOver(event, pos, parentNode) {
    this.imageDisplay.onMouseOver(event, pos, parentNode, this.value);
    this.parent?.graph?.setDirtyCanvas(true, false);
  }

  draw(ctx, parentNode, availableWidth, startY, suggestedHeight) {
    this.imageDisplay.draw(
      ctx,
      parentNode,
      availableWidth,
      startY,
      suggestedHeight,
      {
        placeholderText: "No image",
      }
    );
  }

  getContextMenuOptions(event, localMouse, node) {
    return this.imageDisplay.getContextMenuOptions(event, localMouse, node);
  }
}

export class ITcVnImageControlWidget extends ControlWidget {
  static DEFAULT_SIZE = new Float32Array([300, 300]);

  constructor(name, property, parameter, content) {
    super(name, property, parameter, content);
    this.label = "Image Control";
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

  mouse(event, pos, node) {
    this.imageDisplay.onMouse(event, pos, node, this.value);
  }

  onMouseOver(event, pos, node) {
    this.imageDisplay.onMouseOver(event, pos, node, this.value);
    this.parent?.graph?.setDirtyCanvas(true, false);
  }

  draw(ctx, parentNode, availableWidth, startY, suggestedHeight) {
    this.imageDisplay.draw(
      ctx,
      parentNode,
      availableWidth,
      startY,
      suggestedHeight,
      {
        placeholderText: "Drag image here",
      }
    );
  }

  async onDropFile(file) {
    const fileType = file.type;
    if (this.FILE_HANDLERS[fileType]) {
      try {
        const itcVnImageData = await this.FILE_HANDLERS[fileType](file);
        this.value = itcVnImageData;
        await this.imageDisplay.setImageData(itcVnImageData);
        this.updateDroppedImageSize(this.imageDisplay.displayImage);
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

  getContextMenuOptions(event, localMouse, node) {
    return this.imageDisplay.getContextMenuOptions(event, localMouse, node);
  }
}

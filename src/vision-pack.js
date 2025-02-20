import { GraphFramework } from "mobject-graph-ui";

import {
  ITcVnImageControlWidget,
  ITcVnImageDisplayWidget,
} from "./widgets/itcvnimage-widget.js";

export class VisionPack {
  install(graphFramework = new GraphFramework(), options) {
    this.registerWidgets(graphFramework, options);
    this.registerFileAssociation(graphFramework, options);
  }

  registerWidgets(graphFramework, options = {}) {
    graphFramework.registerWidgetType(
      ITcVnImageControlWidget,
      "INTERFACE",
      "ITcVnImage"
    );
    graphFramework.registerWidgetType(
      ITcVnImageDisplayWidget,
      "INTERFACE",
      "ITcVnImage"
    );
  }

  registerFileAssociation(graphFramework, options = {}) {
    graphFramework.registerFileAssociation(
      ["jpg", "png", "bmp", "tiff", "tif"],
      "Literal/ITcVnImage",
      "value"
    );
  }
}

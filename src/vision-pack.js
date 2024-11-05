import { GraphFramework } from "mobject-graph-ui";

import {
  ITcVnImageControlWidget,
  ITcVnImageDisplayWidget,
} from "./widgets/itcvnimage-widget.js";

export class VisionPack {
  static install(graphFramework = new GraphFramework()) {
    this.registerWidgets(graphFramework);
    this.registerFileAssociation(graphFramework);
  }

  static registerWidgets(graphFramework) {
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

  static registerFileAssociation(graphFramework) {
    graphFramework.registerFileAssociation(
      ["jpg", "png", "bmp"],
      "Literal/ITcVnImage",
      "value"
    );
  }
}

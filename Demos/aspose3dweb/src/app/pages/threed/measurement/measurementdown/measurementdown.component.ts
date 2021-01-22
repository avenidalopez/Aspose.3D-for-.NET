import { Component, Inject, Input, OnInit, Renderer2 } from '@angular/core';
import { API_CONFIG } from 'src/app/services/services.module';
import { FileService } from 'src/app/services/file.service';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-measurementdown',
  templateUrl: './measurementdown.component.html',
  styleUrls: ['./measurementdown.component.scss']
})
export class MeasurementdownComponent implements OnInit {

  @Input() fileName: any;
  @Input() sessionId: any;

  constructor(
    @Inject(DOCUMENT) private _document: Document,
    private renderer2: Renderer2,
    @Inject(API_CONFIG) private uri: string,
    private fileService: FileService) { }

  ngOnInit(): void {
    window.onpopstate = function () {
      window.open("/", "_self");
    };
    this.rendererReady();
  }

  async rendererReady() {
    try {
      let uploadResult: any = await this.fileService.judgeA3dw('api/measurement/verify/', this.sessionId);
      if (uploadResult.data.state == "Success") {
        const s = this.renderer2.createElement('script');
        s.onload = this.rendererLoaded.bind(this);
        s.type = 'text/javascript';
        s.src = '/3d/assets/js/aspose.3d-2.0.js';  // Defines someGlobalObject
        this.renderer2.appendChild(this._document.body, s);
        this.testOnRenderer();
      }
    } catch (error) {

    }
  }

  testOnRenderer(): void {
    var canvas = document.getElementById("canvas")
    /*
    The difference between the rendererReady event and the rendererLoaded event：
    The function rendererLoaded is executed after aspose.3d.js is loaded, because wasm is loaded asynchronously,
    At this time, the web Renderer is not loaded completely.

    When the web Renderer is loaded, the initialization queue recorded by the aspose3d function is executed,
    Initialize GPU resource and load scene asynchronously,
    When everything is ready, a rendererReady event will be triggered for the corresponding canvas. The event type is CustomEvent,
    In the detail object of this event, you can obtain the corresponding render objects through the render, render window, and camera,
    The most common method for rendering window objects and camera objects is renderer,
    The communication between the underlying resource creation and each module is completed through this.
    */
    canvas.addEventListener("rendererReady", function (e: CustomEvent) {
      var renderer: Aspose3D.Renderer = e.detail.renderer;
      var cmdMgr = renderer.getCommandManager();

      //Create a LineSet object
      var ls = new Aspose3D.LineSet()
      //Create a scene node for the LineSet object so that it can be rendered correctly
      var lsNode = renderer.scene.rootNode.createChildNode(ls)
      //Create a default material for the node
      var mt = renderer.createMaterial(Aspose3D.ShadingModel.Phong);
      mt.setRenderState("depthTest", false);
      lsNode.addMaterial(mt)

      var documentValue;
      var calculatedValue = 0;
      var ScaleFactor = renderer.scene.getMetaData().unitScaleFactor;
      switch (ScaleFactor) {
        case 0.1:
          documentValue = 1;
          break;
        case 1:
          documentValue = 0;
          break;
        case 100:
          documentValue = 2;
          break;
        case 100000:
          documentValue = 3;
          break;
        case 2.54:
          documentValue = 4;
          break;
        case 30.48:
          documentValue = 5;
          break;
        case 91.44:
          documentValue = 6;
          break;
        case 160934.4:
          documentValue = 7;
          break;
      }
      var pts = [];
      var pt3d;
      var distance;
      var xdistance;
      var ydistance;
      var zdistance;
      //use renderer.addEventListener To listen to mouse events instead of canvass because the events in canvass are lower level,
      //Events that would cause a GPu-rendered UI on the Canvas are also intercepted
      //Listening for events using renderer ensures that events are always generated by operations on the 3D scene
      var ui = new Aspose3D.WidgetController({
        du: { type: 'int', value: documentValue },
        cu: { type: 'int', value: documentValue }
      }, {
        type: 'Window',
        text: 'Distance UI',
        size: [300, 300],
        children: [{
          type: 'Text',
          text: 'Document Unit'
        }, {
          type: 'ComboBox',
          id: 'du',
          items: ['Centimeters', 'Millimeters', 'Meters', 'Kilometers', 'Inches', 'Feet', 'Yards', 'Miles']
        }, {
          type: 'Text',
          text: "\nCalculated Unit"
        }, {
          type: 'ComboBox',
          id: 'cu',
          items: ['Centimeters', 'Millimeters', 'Meters', 'Kilometers', 'Inches', 'Feet', 'Yards', 'Miles']
        }, {
          type: 'Text',
          id: 'dis',
          text: "\nLength:0\n" + "\n" + "Length in X-Axis:0" + "\n" + "Length in Y-Axis:0" + "\n" + "Length in Z-Axis:0"
        }
        ]
      }, {
        du: function (controller) {
          documentValue = controller.get("du");
          var ArrValue = [documentValue, controller.get("cu")];
          var ArrUnit = [];
          var initValue;
          var unit;
          var ArrResult = [];
          for (var i = 0; i < 2; i++) {
            switch (ArrValue[i]) {
              case 2:
                initValue = 100;
                unit = "m"
                break;
              case 0:
                initValue = 1;
                unit = "cm"
                break;
              case 1:
                initValue = 0.1;
                unit = "mm";
                break;
              case 3:
                initValue = 100000;
                unit = "km";
                break;
              case 4:
                initValue = 2.54;
                unit = "inch";
                break;
              case 5:
                initValue = 30.48;
                unit = "foot";
                break;
              case 6:
                initValue = 91.44;
                unit = "yard";
                break;
              case 7:
                initValue = 160934.4;
                unit = "mile";
                break;
            }
            ArrResult.push(initValue);
            ArrUnit.push(unit);
          }
          var scale = ArrResult[0] / ArrResult[1];
          ui.setWidgetProperty("dis", "text", "\nLength:" + (distance * scale).toFixed(3) + " " + ArrUnit[1] + "\n\n" + "Length in X-Axis:" + (xdistance * scale).toFixed(3) + " " + ArrUnit[1] + "\n" + "Length in Y-Axis:" + (ydistance * scale).toFixed(3) + " " + ArrUnit[1] + "\n" + "Length in Z-Axis:" + (zdistance * scale).toFixed(3) + " " + ArrUnit[1]);
        },
        cu: function (controller) {
          calculatedValue = controller.get("cu");
          var ArrValue = [documentValue, controller.get("cu")];
          var ArrUnit = [];
          var initValue;
          var unit;
          var ArrResult = [];
          for (var i = 0; i < 2; i++) {
            switch (ArrValue[i]) {
              case 2:
                initValue = 100;
                unit = "m"
                break;
              case 0:
                initValue = 1;
                unit = "cm"
                break;
              case 1:
                initValue = 0.1;
                unit = "mm";
                break;
              case 3:
                initValue = 100000;
                unit = "km";
                break;
              case 4:
                initValue = 2.54;
                unit = "inch";
                break;
              case 5:
                initValue = 30.48;
                unit = "foot";
                break;
              case 6:
                initValue = 91.44;
                unit = "yard";
                break;
              case 7:
                initValue = 160934.4;
                unit = "mile";
                break;
            }
            ArrResult.push(initValue);
            ArrUnit.push(unit);
          }
          var scale = ArrResult[0] / ArrResult[1];
          ui.setWidgetProperty("dis", "text", "\nLength:" + (distance * scale).toFixed(3) + " " + ArrUnit[1] + "\n\n" + "Length in X-Axis:" + (xdistance * scale).toFixed(3) + " " + ArrUnit[1] + "\n" + "Length in Y-Axis:" + (ydistance * scale).toFixed(3) + " " + ArrUnit[1] + "\n" + "Length in Z-Axis:" + (zdistance * scale).toFixed(3) + " " + ArrUnit[1]);
        }
      });
      //Register the widgetcontroller to the renderer, so that the UI can be uniformly scheduled by the renderer
      renderer.registerUI(ui);

      renderer.addEventListener("mouseup", function (e) {
        //pick The 0 to 1 coordinate system is used,
        //Because the canvas size does not necessarily equal its size in the GPU when factors such as scaling are taken into account
        //Using coordinates 0 to 1 can avoid this problem
        let x = e.clientX / canvas.clientWidth;
        let y = e.clientY / canvas.clientHeight;
        pt3d = renderer.pick(x, y);
        //This returns the [x, y, z] world coordinate coordinates of the selected point if it is a valid 3D point

        if (pt3d) {
          //Use PTS to record clicked coordinates
          pts.push(pt3d);
          if (pts.length == 2) {  //The LineSet object is prepared in a striped topology layout
            var Arr1 = pts[0];
            var Arr2 = pts[1];
            ls.clear();
            ls.line(Arr1, Arr2);
            pts.shift();
            var cunit;
            var sqrt = Math.sqrt(Math.pow(Arr1[0] - Arr2[0], 2) + Math.pow(Arr1[1] - Arr2[1], 2) + Math.pow(Arr1[2] - Arr2[2], 2));
            distance = (Math.abs(sqrt)).toFixed(3);
            xdistance = (Math.abs(Arr1[0] - Arr2[0])).toFixed(3);
            ydistance = (Math.abs(Arr1[1] - Arr2[1])).toFixed(3);
            zdistance = (Math.abs(Arr1[2] - Arr2[2])).toFixed(3);
            switch (documentValue) {
              case 2:
                cunit = "m"
                break;
              case 0:
                cunit = "cm"
                break;
              case 1:
                cunit = "mm";
                break;
              case 3:
                cunit = "km";
                break;
              case 4:
                cunit = "inch";
                break;
              case 5:
                cunit = "foot";
                break;
              case 6:
                cunit = "yard";
                break;
              case 7:
                cunit = "mile";
                break;
            }
            ui.setWidgetProperty("dis", "text", "\nLength:" + distance + " " + cunit + "\n\n" + "Length in X-Axis:" + xdistance + " " + cunit + "\n" + "Length in Y-Axis:" + ydistance + " " + cunit + "\n" + "Length in Z-Axis:" + zdistance + " " + cunit);
          }
        }
      });
    });
  }

  rendererLoaded(): void {
    window.aspose3d({
      canvas: "canvas",
      features: ["menu", "selection", "grid"],
      movement: 'orbital',
      ruler: true,
      orientationBox: true,
      centerModel: true,
      url: this.uri + "api/measurement/review/" + this.sessionId
    });

  }

  async downfile() {
    await this.fileService.downloadconversion('api/measurement/download', this.sessionId);
  }
}
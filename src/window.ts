import { GuestMass, GUEST_MAX_WEIGHT, setAllGuestsMass } from "./guests";


const CLASSIFICATION = "guest-weight-manager";


class SpinnerController {
  widgetName: string;

  // this callback gets the value from the model.
  valueGetter: () => number;

  // this callback sets the value from the model.
  valueSetter: (_: number) => void;

  constructor(widgetName: string, valueGetter: () => number, valueSetter: (_: number) => void) {
    this.widgetName = widgetName;
    this.valueGetter = valueGetter;
    this.valueSetter = valueSetter;
  }

  get value(): number {
    return this.valueGetter();
  }

  set value(v: number | string) {
    if (typeof v === "string") {
      v = parseFloat(v);
    }
    this.valueSetter(v);
    this.updateWidgetText();
  }

  increment() {
    this.value += 1;
  }

  decrement() {
    this.value -= 1;
  }

  updateWidgetText() {
    const window = ui.getWindow(CLASSIFICATION);
    const widget: SpinnerWidget = window.findWidget(this.widgetName);
    widget.text = this.value.toString();
  }
}

class WidgetBuilder {
  static numWidgets = 0;
  _x?: number;
  _y?: number;
  _width?: number;
  _height?: number;
  name: string;
  _tooltip?: string;
  _isDisabled: boolean = false;
  _isVisible: boolean = true;

  constructor(name?: string) {
    if (name === undefined) {
      this.name = `widget_${Spinner.numWidgets++}`;
    } else {
      this.name = name;
    }
  }

  public x(x: number) {
    this._x = x;
    return this;
  }
  public y(y: number) {
    this._y = y;
    return this;
  }
  public width(width: number) {
    this._width = width;
    return this;
  }

  public height(height: number) {
    this._height = height;
    return this;
  }

  public tooltip(tooltip: string) {
    this._tooltip = tooltip;
    return this;
  }

  public isDisabled(isDisabled: boolean) {
    this._isDisabled = isDisabled;
    return this;
  }

  public isVisible(isVisible: boolean) {
    this._isVisible = isVisible;
    return this;
  }

  public toDesc(): WidgetBaseDesc {
    if (this._x === undefined
      || this._y === undefined
      || this._width === undefined
      || this._height === undefined) {

      throw new Error("WidgetBaseDesc requires x, y, width, and height");
    }
    return {
      // this field will need to be overridden by other implementers of this
      // class.
      // We have to do it this way because of TS's type checker.
      type: "custom",

      x: this._x,
      y: this._y,
      width: this._width,
      height: this._height,
      name: this.name,
      tooltip: this._tooltip,
      isDisabled: this._isDisabled,
      isVisible: this._isVisible,
    };
  }
}

class Spinner extends WidgetBuilder {
  // this callback gets the value from the model.
  _valueGetter?: () => number;

  // this callback sets the value from the model.
  _valueSetter?: (_: number) => void;

  constructor(name?: string) {
    super(name);
  }

  public valueGetter(valueGetter: () => number): Spinner{
    this._valueGetter = valueGetter;
    return this;
  }

  public valueSetter(valueSetter: (_: number) => void): Spinner {
    this._valueSetter = valueSetter;
    return this;
  }

  public override toDesc(): SpinnerDesc {
    if (this._valueGetter === undefined || this._valueSetter === undefined) {
      throw new Error("Spinner must have both valueGetter and valueSetter");
    }

    const spinnerCtrl = new SpinnerController(this.name, this._valueGetter, this._valueSetter);

    const onIncrement = () => {
      spinnerCtrl.increment();
    };
    const onDecrement = () => {
      spinnerCtrl.decrement();
    };
    const onClick = () => {
      ui.showTextInput({
        title: "New Weight",
        description: "Enter new weight.",
        initialValue: spinnerCtrl.value.toString(),
        callback: (v) => { spinnerCtrl.value = v; }
      });
    };

    return {
      ...super.toDesc(),
      type: "spinner",
      text: spinnerCtrl.value.toString(),
      onIncrement: onIncrement,
      onDecrement: onDecrement,
      onClick: onClick
    };
  }
}

class Button extends WidgetBuilder {
  _text?: string;
  _onClick?: () => void;

  constructor(name?: string) {
    super(name);
  }

  public text(text: string) {
    this._text = text;
    return this;
  }

  public onClick(onClick: () => void) {
    this._onClick = onClick;
    return this;
  }

  public override toDesc(): ButtonDesc {
    return {
      ...super.toDesc(),
      type: "button",
      text: this._text,
      onClick: this._onClick,
    }
  }
}

class WindowBuilder {
  classification: string = CLASSIFICATION;
  _width?: number;
  _height?: number;
  _title?: string;
  widgets?: WidgetBuilder[];
  tabs?: TabBuilder[];

  // AutoLayout
  padTop: number = 0;
  defaultHeight?: number = undefined;

  public constructor() {
  }

  public width(width: number): WindowBuilder {
    this._width = width;
    return this;
  }

  public height(height: number): WindowBuilder {
    this._height = height;
    return this;
  }

  public title(title: string): WindowBuilder {
    this._title = title;
    return this;
  }

  public widget(w: WidgetBuilder): WindowBuilder {
    if (this.widgets === undefined) {
      this.widgets = [];
    }
    this.widgets.push(w);
    return this;
  }

  public tab(t: TabBuilder): WindowBuilder {
    if (this.tabs === undefined) {
      this.tabs = [];
    }
    this.tabs.push(t);
    return this
  }

  public toDesc(): WindowDesc {
    if (this._width === undefined || this._height === undefined || this._title === undefined) {
      throw new Error("WindowBuilder must have a width, height and title");
    }

    return {
      classification: this.classification,
      width: this._width,
      height: this._height,
      title: this._title,
      widgets: this.widgets?.map((w) => w.toDesc()),
      tabs: this.tabs?.map((t) => t.toDesc())
    }
  }
}

class TabBuilder {
  _image: IconName = "question";
  widgets: WidgetBuilder[];

  constructor() {
    this.widgets = [];
  }

  image(img: IconName): TabBuilder {
    this._image = img;
    return this;
  }

  widget(w: WidgetBuilder): TabBuilder {
    this.widgets.push(w);
    return this;
  }

  toDesc(): WindowTabDesc {
    return {
      image: this._image,
      widgets: this.widgets.map((w) => w.toDesc())
    }
  }
}

export function createWeightWindowDesc(): WindowDesc {
  const tabContentStartY = 50;  // Height copied from admission tab of game
  const spinnerHeight = 20;

  let guestMass = new GuestMass(GUEST_MAX_WEIGHT);

  const x = 6;
  let y = tabContentStartY;
  let spinnerTemplate = new Spinner()
    .x(x)
    .y(y)
    .width(200)
    .height(15)
    .valueGetter(() => { return guestMass.value; })
    .valueSetter((v) => { guestMass.value = v; });
  let button = new Button()
    .x(x)
    .y(y += spinnerHeight)
    .width(200)
    .height(15)
    .text("Update All Guests")
    .onClick(() => { setAllGuestsMass(guestMass.value); });

  return new WindowBuilder()
    .width(400)
    .height(200)
    .title("Guest Weight Manager")
    .tab(
      new TabBuilder()
        .image("guests")
        .widget(spinnerTemplate)
        .widget(button)
    )
    .tab(
      new TabBuilder()
        .image("paintbrush")
  )
    .toDesc();
}

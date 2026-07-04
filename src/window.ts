
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

class Spinner {
  static numSpinners = 0;
  name: string;

  // this callback gets the value from the model.
  _valueGetter?: () => number;

  // this callback sets the value from the model.
  _valueSetter?: (_: number) => void;

  constructor(name?: string) {
    if (name === undefined) {
      this.name = `spinner_${Spinner.numSpinners++}`;
    } else {
      this.name = name;
    }
  }

  public valueGetter(valueGetter: () => number): Spinner{
    this._valueGetter = valueGetter;
    return this;
  }

  public valueSetter(valueSetter: (_: number) => void): Spinner {
    this._valueSetter = valueSetter;
    return this;
  }

  public toDesc(): SpinnerDesc {
    if (!this._valueGetter || !this._valueSetter) {
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
      type: "spinner",
      name: this.name,
      x: 10,
      y: 20,
      width: 200,
      height: 15,
      text: spinnerCtrl.value.toString(),
      isDisabled: false,
      isVisible: true,
      onIncrement: onIncrement,
      onDecrement: onDecrement,
      onClick: onClick
    };
  }
}

let spinnerValue = 15;

let spinnerTemplate = new Spinner()
  .valueGetter(() => { return spinnerValue; })
  .valueSetter((v: number) => { spinnerValue = Math.min(Math.max(v, 10), 20); });


export class WeightWindowDesc implements WindowDesc {
  classification = CLASSIFICATION;
  width = 400;
  height = 200;
  title = "Guest Weight Manager";
  widgets = [
    spinnerTemplate.toDesc()
  ]
};

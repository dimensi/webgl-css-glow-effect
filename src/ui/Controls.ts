/**
 * UI Controls for adjusting glow parameters
 */

export class Controls {
  private radiusSlider: HTMLInputElement;
  private opacitySlider: HTMLInputElement;
  private colorPicker: HTMLInputElement;
  private container: HTMLDivElement;
  private radiusDisplay: HTMLSpanElement;
  private opacityDisplay: HTMLSpanElement;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'controls';
    
    // Create title
    const title = document.createElement('h3');
    title.textContent = 'Glow Controls';
    this.container.appendChild(title);
    
    // Radius slider
    this.radiusSlider = this.createSlider('Glow Radius', 10, 300, 70);
    this.radiusDisplay = this.createValueDisplay('70px');
    this.container.appendChild(this.radiusDisplay);
    
    // Opacity slider
    this.opacitySlider = this.createSlider('Glow Opacity', 0, 1, 0.8, 0.01);
    this.opacityDisplay = this.createValueDisplay('80%');
    this.container.appendChild(this.opacityDisplay);
    
    // Color picker
    this.colorPicker = this.createColorPicker('Glow Color', '#ffffff');
    
    document.body.appendChild(this.container);
    
    // Setup event listeners for value display updates
    this.setupValueDisplays();
  }

  private createSlider(
    label: string, 
    min: number, 
    max: number, 
    value: number, 
    step = 1
  ): HTMLInputElement {
    const labelEl = document.createElement('label');
    labelEl.textContent = label;
    labelEl.setAttribute('for', `slider-${label.toLowerCase().replace(/\s+/g, '-')}`);
    
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.id = `slider-${label.toLowerCase().replace(/\s+/g, '-')}`;
    slider.min = String(min);
    slider.max = String(max);
    slider.value = String(value);
    slider.step = String(step);
    
    this.container.appendChild(labelEl);
    this.container.appendChild(slider);
    
    return slider;
  }

  private createColorPicker(label: string, value: string): HTMLInputElement {
    const labelEl = document.createElement('label');
    labelEl.textContent = label;
    labelEl.setAttribute('for', 'color-picker');
    
    const colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.id = 'color-picker';
    colorPicker.value = value;
    
    this.container.appendChild(labelEl);
    this.container.appendChild(colorPicker);
    
    return colorPicker;
  }

  private createValueDisplay(initialValue: string): HTMLSpanElement {
    const display = document.createElement('span');
    display.className = 'value-display';
    display.textContent = initialValue;
    return display;
  }

  private setupValueDisplays(): void {
    this.radiusSlider.addEventListener('input', () => {
      const value = parseFloat(this.radiusSlider.value);
      this.radiusDisplay.textContent = `${Math.round(value)}px`;
    });

    this.opacitySlider.addEventListener('input', () => {
      const value = parseFloat(this.opacitySlider.value);
      this.opacityDisplay.textContent = `${Math.round(value * 100)}%`;
    });
  }

  onRadiusChange(callback: (value: number) => void): void {
    this.radiusSlider.addEventListener('input', () => {
      callback(parseFloat(this.radiusSlider.value));
    });
  }

  onOpacityChange(callback: (value: number) => void): void {
    this.opacitySlider.addEventListener('input', () => {
      callback(parseFloat(this.opacitySlider.value));
    });
  }

  onColorChange(callback: (value: string) => void): void {
    this.colorPicker.addEventListener('input', () => {
      callback(this.colorPicker.value);
    });
  }

  setRadius(value: number): void {
    this.radiusSlider.value = String(value);
    this.radiusDisplay.textContent = `${Math.round(value)}px`;
  }

  setOpacity(value: number): void {
    this.opacitySlider.value = String(value);
    this.opacityDisplay.textContent = `${Math.round(value * 100)}%`;
  }

  setColor(value: string): void {
    this.colorPicker.value = value;
  }

  getRadius(): number {
    return parseFloat(this.radiusSlider.value);
  }

  getOpacity(): number {
    return parseFloat(this.opacitySlider.value);
  }

  getColor(): string {
    return this.colorPicker.value;
  }
}

import { createEffect, createSignal, Show } from 'solid-js';
import styles from './ToggleButton.module.css';

interface ToggleButtonProps {
  initialState?: boolean;
  onChange?: (isOn: boolean) => void;
  disabled?: boolean;
}

const ToggleButton = (props: ToggleButtonProps) => {
  const [isOn, setIsOn] = createSignal(props.initialState || false);

  createEffect(() => {
    if (props.initialState !== undefined) {
      setIsOn(props.initialState);
    }
  });

  const toggle = () => {
    if (props.disabled) return;
    
    const newState = !isOn();
    setIsOn(newState);
    props.onChange?.(newState);
  };

  return (
    <button 
      class={`${styles.toggleButton} ${props.disabled ? styles.disabled : ''}`} 
      onClick={toggle}
      disabled={props.disabled}
    >
      <div class={`${styles.slider} ${isOn() ? styles.on : ''}`}>
        <div class={styles.knob}></div>
      </div>
    </button>
  );
};

export default ToggleButton;
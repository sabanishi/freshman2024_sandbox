import { JSX, ParentComponent } from 'solid-js';

type FlexAlignment = 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
type FlexJustification = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';

interface StackProps {
  width?: string;
  height?: string;
  gap?: string;
  alignItems?: FlexAlignment;
  justify?: FlexJustification;
  padding?: string;
  margin?: string;
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
}

export const HStack: ParentComponent<StackProps> = (props) => {
  return (
    <div
      style={{
        display: 'flex',
        "flex-direction": 'row',
        width: props.width,
        height: props.height,
        gap: props.gap,
        "align-items": props.alignItems,
        "justify-content": props.justify,
        padding: props.padding,
        margin: props.margin,
        "flex-wrap": props.wrap,
      }}
    >
      {props.children}
    </div>
  );
};

export const VStack: ParentComponent<StackProps> = (props) => {
  return (
    <div
      style={{
        display: 'flex',
        "flex-direction": 'column',
        width: props.width,
        height: props.height,
        gap: props.gap,
        "align-items": props.alignItems,
        "justify-content": props.justify,
        padding: props.padding,
        margin: props.margin,
        "flex-wrap": props.wrap,
      }}
    >
      {props.children}
    </div>
  );
};


interface CardProps {
  width?: string;
  height?: string;
  padding?: string;
  margin?: string;
  backgroundColor?: string;
  borderRadius?: string;
  boxShadow?: string;
  onClick?: () => void;
}

export const Card: ParentComponent<CardProps> = (props) => {
  return (
    <div
      style={{
        width: props.width || 'auto',
        height: props.height || 'auto',
        padding: props.padding || '16px',
        margin: props.margin || '0',
        "background-color": props.backgroundColor || 'white',
        "border-radius": props.borderRadius || '8px',
        "box-shadow": props.boxShadow || '0 4px 6px rgba(0, 0, 0, 0.1)',
        cursor: props.onClick ? 'pointer' : 'default',
      }}
      onClick={props.onClick}
    >
      {props.children}
    </div>
  );
};


// This file is used for modules that don't have type definitions.
// You can add more modules here as needed.
declare module 'lucide-react' {
  import { SVGProps } from 'react';

  // Define a generic type for Lucide icons.
  // This allows any string to be used as an icon name, which is a common
  // practice when dealing with icon libraries that have many components.
  type LucideIcon = (props: SVGProps<SVGSVGElement>) => JSX.Element;

  // Since we don't know all the icon names, we use a string index signature.
  // This tells TypeScript that any property access on this module
  // (e.g., icons.Menu) will return a LucideIcon.
  const icons: {
    [key: string]: LucideIcon;
  };

  export = icons;
}

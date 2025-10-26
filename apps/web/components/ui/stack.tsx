import clsx from 'clsx';
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

const gapScale = {
  none: 'gap-0',
  xs: 'gap-2',
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
} as const;

type Gap = keyof typeof gapScale;

export interface StackProps<T extends ElementType = 'div'> {
  as?: T;
  gap?: Gap;
  className?: string;
  children: ReactNode;
}

export function Stack<T extends ElementType = 'div'>({
  as,
  gap = 'md',
  className,
  children,
  ...rest
}: StackProps<T> & Omit<ComponentPropsWithoutRef<T>, keyof StackProps<T>>) {
  const Component = (as || 'div') as ElementType;
  return (
    <Component className={clsx('flex flex-col', gapScale[gap], className)} {...rest}>
      {children}
    </Component>
  );
}

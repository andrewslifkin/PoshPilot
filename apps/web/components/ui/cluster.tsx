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

type Direction = 'row' | 'column';

export interface ClusterProps<T extends ElementType = 'div'> {
  as?: T;
  direction?: Direction;
  gap?: Gap;
  className?: string;
  children: ReactNode;
}

export function Cluster<T extends ElementType = 'div'>({
  as,
  direction = 'row',
  gap = 'sm',
  className,
  children,
  ...rest
}: ClusterProps<T> & Omit<ComponentPropsWithoutRef<T>, keyof ClusterProps<T>>) {
  const Component = (as || 'div') as ElementType;
  return (
    <Component
      className={clsx(
        'flex',
        direction === 'column' ? 'flex-col' : 'flex-row flex-wrap items-center',
        gapScale[gap],
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}

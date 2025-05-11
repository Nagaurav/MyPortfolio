import { List, AutoSizer, ListRowProps } from 'react-virtualized';

interface VirtualizedListProps<T> {
  items: T[];
  rowHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscanRowCount?: number;
}

export function VirtualizedList<T>({
  items,
  rowHeight,
  renderItem,
  className = '',
  overscanRowCount = 3,
}: VirtualizedListProps<T>) {
  const rowRenderer = ({ index, key, style }: ListRowProps) => (
    <div key={key} style={style}>
      {renderItem(items[index], index)}
    </div>
  );

  return (
    <div className={`w-full ${className}`} style={{ height: '100%' }}>
      <AutoSizer>
        {({ width, height }) => (
          <List
            width={width}
            height={height}
            rowCount={items.length}
            rowHeight={rowHeight}
            rowRenderer={rowRenderer}
            overscanRowCount={overscanRowCount}
          />
        )}
      </AutoSizer>
    </div>
  );
}
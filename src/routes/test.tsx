import type { Range } from "@tanstack/react-virtual";
import { defaultRangeExtractor, useVirtualizer } from "@tanstack/react-virtual";
import { findIndex, groupBy } from "lodash";
import * as React from "react";

const groupedNames = groupBy(
  Array.from({ length: 500 }).map(
    (_, i, a) => `v1.2.0-beta.${a.length - i}`,
  )
    .sort(),
  (name) => name[0],
);
const groups = Object.keys(groupedNames);
const rows = groups.reduce<Array<string>>(
  (acc, k) => [...acc, k, ...groupedNames[k]],
  [],
);

export function Component() {
  return (
    <div className="container mx-auto">
      <ExampleStiky />
      <br />
      <hr />
      <ExampleFixed />
    </div>
  );
}

function ExampleStiky() {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const activeStickyIndexRef = React.useRef(0);

  const stickyIndexes = React.useMemo(
    () => groups.map((gn) => findIndex(rows, (n) => n === gn)),
    [],
  );

  const isSticky = (index: number) => stickyIndexes.includes(index);

  const isActiveSticky = (index: number) =>
    activeStickyIndexRef.current === index;

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => 50,
    getScrollElement: () => parentRef.current,
    rangeExtractor: React.useCallback(
      (range: Range) => {
        activeStickyIndexRef.current = [...stickyIndexes]
          .reverse()
          .find((index) => range.startIndex >= index) ?? 0;

        const next = new Set([
          activeStickyIndexRef.current,
          ...defaultRangeExtractor(range),
        ]);

        return [...next].sort((a, b) => a - b);
      },
      [stickyIndexes],
    ),
  });

  return (
    <div>
      <div
        ref={parentRef}
        className="border"
        style={{
          height: `300px`,
          width: `400px`,
          overflow: "auto",
        }}
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => (
            <div
              key={virtualRow.index}
              className={"flex items-center justify-center"}
              style={{
                ...(isSticky(virtualRow.index)
                  ? {
                    background: "#fff",
                    borderBottom: "1px solid #ddd",
                    zIndex: 1,
                  }
                  : {}),
                ...(isActiveSticky(virtualRow.index)
                  ? {
                    position: "sticky",
                  }
                  : {
                    position: "absolute",
                    transform: `translateY(${virtualRow.start}px)`,
                  }),
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
              }}
            >
              {rows[virtualRow.index]}
            </div>
          ))}
        </div>
      </div>
      {process.env.NODE_ENV === "development"
        ? (
          <p>
            <strong>Notice:</strong>{" "}
            You are currently running React in development mode. Rendering
            performance will be slightly degraded until this application is
            build for production.
          </p>
        )
        : null}
    </div>
  );
}

function ExampleFixed() {
  return (
    <div>
      <p>
        These components are using <strong>fixed</strong>{" "}
        sizes. This means that every element's dimensions are hard-coded to the
        same value and never change.
      </p>
      <br />
      <br />

      <h3>Rows</h3>
      <RowVirtualizerFixed />
      <br />
      <br />
      <h3>Columns</h3>
      <ColumnVirtualizerFixed />
      <br />
      <br />
      <h3>Grid</h3>
      <GridVirtualizerFixed />
      <br />
      <br />
      {process.env.NODE_ENV === "development"
        ? (
          <p>
            <strong>Notice:</strong>{" "}
            You are currently running React in development mode. Rendering
            performance will be slightly degraded until this application is
            build for production.
          </p>
        )
        : null}
    </div>
  );
}

function RowVirtualizerFixed() {
  const parentRef = React.useRef(null);

  const rowVirtualizer = useVirtualizer({
    count: 10000,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
    overscan: 5,
  });

  return (
    <>
      <div
        ref={parentRef}
        className="List"
        style={{
          height: `200px`,
          width: `400px`,
          overflow: "auto",
        }}
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => (
            <div
              key={virtualRow.index}
              className={virtualRow.index % 2 ? "ListItemOdd" : "ListItemEven"}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              Row {virtualRow.index}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function ColumnVirtualizerFixed() {
  const parentRef = React.useRef(null);

  const columnVirtualizer = useVirtualizer({
    horizontal: true,
    count: 10000,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 5,
  });

  return (
    <>
      <div
        ref={parentRef}
        className="List"
        style={{
          width: `400px`,
          height: `100px`,
          overflow: "auto",
        }}
      >
        <div
          style={{
            width: `${columnVirtualizer.getTotalSize()}px`,
            height: "100%",
            position: "relative",
          }}
        >
          {columnVirtualizer.getVirtualItems().map((virtualColumn) => (
            <div
              key={virtualColumn.index}
              className={virtualColumn.index % 2
                ? "ListItemOdd"
                : "ListItemEven"}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                height: "100%",
                width: `${virtualColumn.size}px`,
                transform: `translateX(${virtualColumn.start}px)`,
              }}
            >
              Column {virtualColumn.index}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function GridVirtualizerFixed() {
  const parentRef = React.useRef(null);

  const rowVirtualizer = useVirtualizer({
    count: 10000,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
    overscan: 5,
  });

  const columnVirtualizer = useVirtualizer({
    horizontal: true,
    count: 10000,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 5,
  });

  return (
    <>
      <div
        ref={parentRef}
        className="List"
        style={{
          height: `500px`,
          width: `500px`,
          overflow: "auto",
        }}
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: `${columnVirtualizer.getTotalSize()}px`,
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => (
            <React.Fragment key={virtualRow.key}>
              {columnVirtualizer.getVirtualItems().map((virtualColumn) => (
                <div
                  key={virtualColumn.key}
                  className={virtualColumn.index % 2
                    ? virtualRow.index % 2 === 0
                      ? "ListItemOdd"
                      : "ListItemEven"
                    : virtualRow.index % 2
                    ? "ListItemOdd"
                    : "ListItemEven"}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: `${virtualColumn.size}px`,
                    height: `${virtualRow.size}px`,
                    transform:
                      `translateX(${virtualColumn.start}px) translateY(${virtualRow.start}px)`,
                  }}
                >
                  Cell {virtualRow.index}, {virtualColumn.index}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  );
}

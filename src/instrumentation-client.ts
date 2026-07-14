// Dev-only workaround: React 19.2's development-build performance
// instrumentation sometimes passes its internal sentinel timestamps (-1.1)
// straight to performance.measure(). Chrome tolerates negative values but
// Firefox throws "Given attribute end cannot be negative" on every render.
// Clamp the values here — this file runs before any other client code.
// Remove once React ships a fix (still present as of react-dom 19.2.7).
if (process.env.NODE_ENV === 'development') {
  const originalMeasure = performance.measure.bind(performance)

  performance.measure = ((
    name: string,
    startOrOptions?: string | PerformanceMeasureOptions,
    endMark?: string,
  ) => {
    if (typeof startOrOptions === 'object' && startOrOptions !== null) {
      const options = { ...startOrOptions }
      if (typeof options.start === 'number' && options.start < 0) {
        options.start = 0
      }
      if (typeof options.end === 'number' && options.end < 0) {
        options.end = 0
      }
      // Firefox also rejects end < start, which clamping can produce.
      if (
        typeof options.start === 'number' &&
        typeof options.end === 'number' &&
        options.end < options.start
      ) {
        options.start = options.end
      }
      return originalMeasure(name, options)
    }
    return endMark === undefined
      ? originalMeasure(name, startOrOptions)
      : originalMeasure(name, startOrOptions, endMark)
  }) as typeof performance.measure
}

export {}

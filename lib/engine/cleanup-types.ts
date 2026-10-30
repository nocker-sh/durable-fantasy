export type Disposable = { dispose(): void }

export type CleanupOutcome<T> = Readonly<{ isSuccess: true; value: T }> | Readonly<{ isSuccess: false; error: unknown }>

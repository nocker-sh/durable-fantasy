export type Vector3Tuple = [number, number, number]
export type Vector3 = Readonly<Vector3Tuple>
/** Columns are the frame's right, up and forward axes. */
export type Matrix3 = [Vector3Tuple, Vector3Tuple, Vector3Tuple]
export type ReadonlyMatrix3 = readonly [Vector3, Vector3, Vector3]

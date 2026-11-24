// Role identities are stable across areas/saves. Counts are asset-specific,
// never a requirement that every person clone the technician's topology.
export interface CharacterSpec {identity:string;asset:string;meshes:number;joints:number;height:number}
export const characterCast={
  technician:{identity:'technician-andre-tee',asset:'technician.glb',meshes:5,joints:80,height:1.78},
  supervisor:{identity:'supervisor-marcus-formal',asset:'supervisor.glb',meshes:4,joints:80,height:1.84},
} as const;
